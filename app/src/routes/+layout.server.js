import { back_api, back_api_origin } from '$lib/const.js';
import moment from 'moment-timezone';

import axios from 'axios';

// hooks.server.js 에서 받아온 유저 정보 +layout.js 로 넘기기 위한 중간 단계
export const load = async ({ locals, request, cookies }) => {

    const visitCookie = cookies.get('visit', { path: '/' })

    // 쿠키 설정이 안되어 있으면 작업 GO!!
    if (!visitCookie || visitCookie != 'true') {
        console.log('기존 DB 없으면 insert! 있으면 update! 가짜 카운트랑 진짜 카운트!');
        try {
            const res = await axios.get(`${back_api}/insert_n_update_app_count`)
        } catch (error) {

        }

        // 작업 후에는 쿠키 설정 해주기!
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0); // 자정 = 오늘 24:00:00.000
        cookies.set('visit', 'true', {
            expires: midnight,
            httpOnly: true,
            secure: true,
            path: '/',
        });
    } else {
        console.log('쿠키 설정 되어 있으면 fake_count 만 업데이트!!');
        try {
            const res = await axios.get(`${back_api}/update_app_count`)
        } catch (error) {
        }
    }

    console.log('+layout.server.js!!!');
    console.log(locals.userInfo);


    return {
        // 이건 회원 정보 넘겨주기!!
        user: locals.userInfo
    }
}