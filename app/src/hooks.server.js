import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';
import moment from 'moment-timezone';
import axios from 'axios';
import { back_api } from '$lib/const';

export async function handle({ event, resolve }) {

    if (event.url.pathname.startsWith('/.well-known/')) {
        return new Response(null, { status: 404 });
    }
    const accessToken = event.cookies.get('access_token');
    const refreshToken = event.cookies.get('refresh_token');

    console.log(accessToken);
    console.log(refreshToken);




    // 기본값 초기화
    let userInfo = {}

    if (accessToken) {

        try {
            const resUserInfo = await axios.post(`${back_api}/auth/access_hook_chk`, {
                accessToken
            })
            userInfo = { idx: resUserInfo.data.userId, rate: resUserInfo.data.rate }
        } catch (error) {

        }

        console.log('hook access toss info!!');
        console.log(userInfo);


        event.locals.userInfo = userInfo;
        const res = await resolve(event); // 요청 처리
        return res;

    } else if (refreshToken) {
        try {
            let userInfoRow = {}
            const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            const res = await axios.post(`${back_api}/auth/refresh_hook_chk`, {
                idx: payload.userId,
                refreshToken
            })
            userInfoRow = res.data.userInfoRow
            const newAccessToken = jwt.sign({ userId: userInfoRow.idx, rate: userInfoRow.rate }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });

            // 새로운 액세스 토큰 발급
            event.cookies.set('access_token', newAccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
                maxAge: 60 * 15
                // maxAge: 5
            });

            // 리프레쉬토큰 기존 그대로 기간 연장
            event.cookies.set('refresh_token', refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                path: '/',
                maxAge: 60 * 60 * 24 * 14
            });

            console.log('hook toss info!!');

            userInfo = { idx: userInfoRow.idx, rate: userInfoRow.rate };
            console.log(userInfo);

            event.locals.userInfo = userInfo;


        } catch (error) {
            console.log('위치는 여기?');

            console.error(error.message);

            if (error.message != "cookies is not defined") {
                event.cookies.delete('access_token', { path: '/' });
                event.cookies.delete('refresh_token', { path: '/' });

                event.locals.userInfo = {};
                return await resolve(event);
            }



        }
    }

    const res = await resolve(event); // 요청 처리

    return res;
}


/*
진입~
1. 먼저 액세스 토큰이 있는지 확인, 확인 후 액세스 토큰 있으면 바로 반환~ (페이로드의 userId > userInfo = {idx : 값})
2. 액세스 토큰이 없으면 refresh 토큰의 userId 값으로 DB 조회 / 결과 값으로 토큰 대조 후 정상이면 액세스토큰 재발급!
리턴~
*/