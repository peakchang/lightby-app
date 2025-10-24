import { back_api } from "$lib/const.js";
import { user_info } from "$lib/stores/stores.js";
import { main_location } from "$lib/stores/stores.js";
import axios from "axios";
import { browser } from "$app/environment";

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {
    let userIdx = '';
    let userInfo = {}
    let postCount = 0
    user_info.subscribe((v) => {
        userIdx = v.idx;
    })

    if (userIdx) {
        const res = await axios.post(`${back_api}/load_user_info`, { userIdx })
        userInfo = res.data.userInfo
        postCount = res.data.postCount
    }

    return { userInfo, postCount }
}