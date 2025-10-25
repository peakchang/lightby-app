import { TokenManager } from "$lib/token_manager";

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {
    console.log('asldjflajsdfijalsidjf');

    const tokens = new TokenManager();

    const access = await tokens.getToken('access_token')
    const refresh = await tokens.getToken('refresh_token');

    console.log(access);
    console.log(refresh);








    return { access, refresh }
}
