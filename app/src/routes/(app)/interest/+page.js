import { back_api } from "$lib/const.js";
import { user_info, interestTabNum } from "$lib/stores/stores.js";
import axios from "axios";


// 사이트 접속시 user_info store 값에 user 정보 넣기
export const load = async ({ params, url, data }) => {


    // 받아올 값들
    let postList = []
    let interestStatus = false
    let statusMessage = ""



    let tabNum = 0;
    let type = ""
    let userId = ""
    interestTabNum.subscribe((v) => {
        tabNum = v
    })
    user_info.subscribe((v) => {
        userId = v.idx
    })

    if (tabNum == 0) {
        type = "interest"
    } else if (tabNum == 1) {
        type = "zzim"
    }

    if (tabNum != 2 && userId) {
        try {
            const res = await axios.post(`${back_api}/sitelist/get_interest_list`, { userId, type })

            console.log(res.data);

            interestStatus = res.data.interestStatus
            statusMessage = res.data.statusMessage
            postList = res.data.postList
            console.log(postList);


        } catch (error) {

        }
    }



    return { postList, interestStatus, statusMessage }
}