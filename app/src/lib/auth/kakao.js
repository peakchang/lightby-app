// src/lib/auth/kakao.ts
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import axios from 'axios';

const REST_API_KEY = import.meta.env.VITE_KAKAO_RESTAPI;
const REDIRECT_URI = encodeURIComponent('https://api.lightby.co.kr/api/v9/auth/kakao_app_callback');

export async function loginWithKakao() {
    const state = Math.random().toString(36).slice(2);
    const authorizeUrl =
        `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&state=${state}`;

    // 딥링크 수신 리스너
    const sub = App.addListener('appUrlOpen', async (data) => {
        try {
            // 기대값: myapp://oauth/kakao?code=...&state=...
            if (!data?.url?.startsWith('myapp://oauth/kakao')) return;

            await Browser.close();

            const u = new URL(data.url);
            const code = u.searchParams.get('code');
            const gotState = u.searchParams.get('state');

            if (!code || gotState !== state) throw new Error('invalid state/code');

            // code를 우리 백엔드로 전달 → 토큰 교환
            const resp = await axios.post('https://api.lightby.co.kr/auth/kakao/callback', { code });

            // 토큰 저장(여기서는 console만; 실제로는 SecureStorage)
            console.log('TOKENS', resp.data);
        } finally {
            sub.remove();
        }
    });

    // 외부 브라우저 열기
    await Browser.open({ url: authorizeUrl, presentationStyle: 'fullscreen' });
}