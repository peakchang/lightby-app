import { back_api } from "$lib/const.js";
import { user_info } from "$lib/stores/stores.js";
import axios from "axios";

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {
    let userIdx = '';
    let userInfo = {}
    user_info.subscribe((v) => {
        userIdx = v.idx;
    })
    if (userIdx) {
        const res = await axios.post(`${back_api}/load_user_info`, { userIdx })
        userInfo = res.data.userInfo
    }

    return { userInfo }
}