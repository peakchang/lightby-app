import { back_api, public_img_bucket } from "$lib/const.js";
import { user_info } from "$lib/stores/stores.js";
import { main_location, search_val } from "$lib/stores/stores.js";
import axios from "axios";
import { browser } from "$app/environment";

// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {


    let todayCount = 0
    let newSiteCount = 0
    let baseEnv = {} // 배너 리스트 불러오기 위해서!
    try {
        const res = await axios.get(`${back_api}/load_main_count`)
        todayCount = res.data.todayCount
        newSiteCount = res.data.newSiteCount
        baseEnv = res.data.baseEnv

    } catch (error) {

    }


    return { todayCount, newSiteCount, baseEnv }
}
