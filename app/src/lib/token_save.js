import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

// 저장
export async function saveRefreshToken(token) {
    await SecureStoragePlugin.set({
        key: 'refresh_token', value: JSON.stringify({
            token,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 14 // 14일 유지
        })
    });
}

// 가져오기
export async function getRefreshToken() {
    const { value } = await SecureStoragePlugin.get({ key: 'refresh_token' });
    return value;
}

// 삭제
export async function removeRefreshToken() {
    await SecureStoragePlugin.remove({ key: 'refresh_token' });
}

export function setAccessToken(token) {
    sessionStorage.setItem('access_token', token);
}

export function getAccessToken() {
    return sessionStorage.getItem('access_token');
}

export function clearAccessToken() {
    sessionStorage.removeItem('access_token');
}
