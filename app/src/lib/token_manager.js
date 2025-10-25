// TokenManager.js
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export class TokenManager {
    // constructor(options = {}) {
    //     this.refreshKey = options.refreshKey ?? 'refresh_token';
    //     this.accessKey = options.accessKey ?? 'access_token';
    //     this.refreshTtlMs = options.refreshTtlMs ?? 1000 * 60 * 60 * 24 * 14; // 14일
    //     // this.accessTtlMs = options.accessTtlMs ?? 1000 * 60 * 15;           // 15분
    //     this.accessTtlMs = options.accessTtlMs ?? 1000 * 5
    // }

    // 기간만료 14일(기본)짜리 토큰 셋팅
    async setToken(key, token, expiresAt) {
        const payload = {
            token,
            expiresAt: expiresAt
        };
        

        await SecureStoragePlugin.set({
            key: key,
            value: JSON.stringify(payload),
        });

    }

    // 토큰 얻어오기: 없거나 만료면 삭제 후 null 리턴
    async getToken(key) {
        try {
            const { value } = await SecureStoragePlugin.get({ key: key });
            if (!value) return null;

            const parsed = JSON.parse(value);
            
            if (!parsed?.token || !parsed?.expiresAt) {
                await this.removeToken(key);
                return null;
            }

            if (this.isExpired(parsed.expiresAt)) {
                await this.removeToken(key);
                return null;
            }

            return parsed.token;
        } catch {
            // 키 없음/플러그인 에러 등
            return null;
        }
    }

    // 토큰 삭제
    async removeToken(key) {
        try {
            await SecureStoragePlugin.remove({ key: key });
        } catch {
            // 없는 키 삭제 시 에러 무시 (idempotent)
        }
    }


    isExpired(expiresAt) {
        return Date.now() >= expiresAt;
    }

}
