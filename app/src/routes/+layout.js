export const ssr = false;
export const prerender = true;

import { user_info } from "$lib/stores/stores.js";
import { TokenManager } from '$lib/token_manager';
import axios from "axios";
import { back_api } from "$lib/const";

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {

    // user_info 전역 store 에 정보 설정

    const tokens = new TokenManager();

    const accessToken = await tokens.getToken('access_token')
    const refreshToken = await tokens.getToken("refresh_token");

    let userInfo = {}
    if (accessToken) {


        try {
            // 토큰 payload 를 풀기 위해서 백엔드에 전달!
            const res = await axios.post(`${back_api}/auth/access_hook_chk_app`, {}, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })

            // store 에 값 넣고 반환!
            user_info.set({ idx: res.data.userInfo.userId, rate: res.data.userInfo.rate })

        } catch (error) {
            console.error(error.message);

        }



    } else if (refreshToken) {

        try {
            let userInfoRow = {}
            /*
            1. 토큰 payload 해제
            2. 유저 정보 조회
            3. 유저 정보 얻은 뒤 새로운 액세스 토큰 생성
            4. 유저 정보 & 새로운 액세스 토큰 반환
            */
            const res = await axios.post(`${back_api}/auth/refresh_hook_chk_app`, {}, {
                headers: {
                    Authorization: `Bearer ${refreshToken}`
                }
            })

            // 새로운 액세스 토큰 및 리프레쉬 토큰 다시 저장 후 store 에 유저 정보 입력
            userInfoRow = res.data.userInfo
            await tokens.setToken('access_token', res.data.newAccessToken, Date.now() + 1000 * 5)
            await tokens.setToken('refresh_token', refreshToken, Date.now() + 1000 * 60 * 60 * 24 * 14)
            userInfo = { idx: userInfoRow.idx, rate: userInfoRow.rate };
            user_info.set({ idx: userInfo.idx, rate: userInfo.rate })

        } catch (error) {
            await tokens.removeToken('access_token')
            await tokens.removeToken('refresh_token')
            user_info.set({ idx: undefined, rate: 0 })
        }

    } else {
        await tokens.removeToken('access_token')
        await tokens.removeToken('refresh_token')
        user_info.set({ idx: undefined, rate: 0 })
    }

    return {}

}