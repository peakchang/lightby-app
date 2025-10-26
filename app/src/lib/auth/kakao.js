// src/lib/auth/kakao.ts
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import axios from 'axios';
import { back_api } from '$lib/const';
import { TokenManager } from '$lib/token_manager';

const REST_API_KEY = import.meta.env.VITE_KAKAO_RESTAPI;
const REDIRECT_URI = encodeURIComponent('https://api.lightby.co.kr/api/v9/auth/kakao_app_bridge');

export async function loginWithKakao() {
    return new Promise(async (resolve) => {
        const state = randomState();

        const authorizeUrl =
            `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&state=${state}`;

        const sub = App.addListener('appUrlOpen', async (data) => {
            try {
                if (!data?.url?.startsWith('co.lightby.app://oauth/kakao')) return;

                await Browser.close();

                const u = new URL(data.url);
                const code = u.searchParams.get('code');
                const gotState = u.searchParams.get('state');

                if (!code || gotState !== state) {
                    sub.remove();
                    resolve('카카오 로그인 실패11111');
                    return;
                }


                // // ✅ 여기서 백엔드로 code 보내기
                const resp = await axios.post(`${back_api}/auth/kakao_app_callback`, { code });


                const getData = resp.data.data;

                if (getData.loginStatus) {
                    try {
                        const tokens = new TokenManager()

                        await tokens.setToken(
                            "refresh_token",
                            resp.data.refreshToken,
                            Date.now() + 1000 * 60 * 60 * 24 * 14,
                        );
                        await tokens.setToken(
                            "access_token",
                            resp.data.accessToken,
                            Date.now() + 1000 * 5,
                        );
                    } catch (error) {

                    }
                }





                // ✅ 토큰 저장
                // await TokenManager.saveTokens(resp.data.accessToken, resp.data.refreshToken, resp.data.accessExpiresInSec);



                sub.remove();
                resolve(getData);
            } catch (e) {
                sub.remove();
                resolve('카카오 로그인 오류');
            }
        });

        // ✅ 외부 브라우저 열기
        await Browser.open({ url: authorizeUrl, presentationStyle: 'fullscreen' });
    });
}


function randomState(n = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let out = '';
    for (let i = 0; i < n; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
}