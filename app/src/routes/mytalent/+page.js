import { back_api } from "$lib/const.js";
import { user_info } from "$lib/stores/stores.js";
import axios from "axios";
import { browser } from "$app/environment";

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {

    let userIdx = undefined;
    let userInfo = {}

    user_info.subscribe((v) => {
        userIdx = v.idx;
    });

    console.log(userIdx);

    try {
        const res = await axios.post(`${back_api}/adm_etc/get_talent`, { userIdx })
        userInfo = res.data.userInfo
    } catch (error) {

    }

    return { userInfo }
}