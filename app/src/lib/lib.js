import imageCompression from "browser-image-compression";
import axios from "axios";
import { loadingStore } from "$lib/stores/stores.js";
import Cookies from "js-cookie";
import { back_api } from "$lib/const";
import moment from "moment-timezone";
import { goto } from "$app/navigation";


export function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function generateRandomNumber() {
    return Math.floor(100000 + Math.random() * 900000); // 100000~999999 사이의 숫자
}

// 정규식을 사용하여 영어 대소문자와 숫자로만 이루어져 있는지 확인
export function isAlphanumeric(str) {
    return /^[A-Za-z0-9]+$/.test(str);
}

// 특수문자 / 공백 전부 제거
export function removeSpecialCharactersAndSpaces(str) {
    // 정규 표현식: 알파벳, 숫자를 제외한 모든 문자 제거 (공백 포함)
    return str.replace(/[^0-9]/g, '');
}


export function getCookieValue(name) {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
        const [key, value] = cookie.trim().split("=");
        if (key === name) {
            return value;
        }
    }
    return null;
}

// axios 요청 시 살짝 지연을 주기위해 setTimeout 에 들어갈 랜덤값 구하는 함수!
export function getRandBet(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}



export function formatPhoneNum(phone) {
    const clean = phone.replace(/\D/g, '');

    if (clean.length == 11) {
        return clean.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (clean.length === 10) {
        return clean.replace(/(\d{2,3})(\d{3,4})(\d{4})/, '$1-$2-$3');
    } else {
        return phone
    }
}

// 10일이 안지났으면 (광고 중이면) true 지났으면 (광고 끝났으면) false
// 방식 변경함!! 안씀!!!
export function isWithin10Days(dateString) {
    const inputDate = moment(dateString);
    const now = moment();

    const diffInDays = now.diff(inputDate, 'days'); // 경과 일수
    const daysLeft = 10 - diffInDays;

    return {
        status: diffInDays < 10,
        daysLeft
    };
}

// // 광고 종료일 기준으로 남은날 리턴! 지났으면 0 리턴!
// export function getRemainingDaysPlusOne(dateStr) {
//     // 입력이 'YYYY-MM-DD' 형식이면 time을 붙여서 Date로 변환
//     const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
//     const targetDate = isDateOnly
//         ? new Date(`${dateStr}T00:00:00`)
//         : new Date(dateStr);

//     const now = new Date();

//     // 시차 보정: 현재 날짜와 타겟 날짜를 자정 기준으로 맞춤
//     const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const startOfTarget = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

//     const diffTime = startOfTarget - startOfToday;
//     const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//     return diffDays < 0 ? 0 : diffDays + 1;
// }

// 광고 종료일 기준으로 남은날 리턴! 지났으면 0 리턴! moment 로!!!
export function getRemainingDaysPlusOne(dateStr) {
    const momentDate = moment(dateStr, moment.ISO_8601, true);
    if (!momentDate.isValid()) return 0;

    const today = moment().startOf('day');
    const target = momentDate.startOf('day');

    const diffDays = target.diff(today, 'days');

    return diffDays < 0 ? 0 : diffDays + 1;
}




// 랜덤 값 구하기! (isInteger 가 true 면 정수 / false면 실수 (0.0))
export function getRandomBetween(min, max, isInteger = true) {
    if (isInteger) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        return Math.random() * (max - min) + min;
    }
}

// 메인 / 수수료인증 게시판에서 클릭시 조회수 증가 시키는 함수!
export async function raiseViewCount(table, idx) {
    try {
        const res = await axios.post(`${back_api}/raise_view_count`, { table, idx });
    } catch (err) {
        console.error(err.message);
    }
}


// 어드민 검색용~~~~~~!!!!! 주소이 쿼리 값 조절!!
export function setParams(params, clear = false) {
    const currentUrl = new URL(window.location.href);
    const searchParams = new URLSearchParams(clear ? '' : currentUrl.search); // clear가 true면 초기화

    // 새로운 파라미터 추가
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) {
            searchParams.delete(key); // null 또는 undefined는 삭제
        } else {
            searchParams.set(key, value.toString()); // 값 추가
        }
    }

    // URL 갱신
    currentUrl.search = searchParams.toString();
    console.log('Updated URL:', currentUrl.toString()); // 디버깅용

    // URL 변경
    goto(currentUrl.pathname + currentUrl.search, { replaceState: true, invalidateAll: true });
}


// 페이지 네이션 구하기!! (현재 페이지 / 전체 페이지)
export function getPageList(currentPage, maxPage, displayCount = 7) {
    let pageList = [];

    let startPage = 0
    let endPage = 0
    let displayHalf = Number(displayCount / 2)

    if (maxPage <= displayCount) {
        startPage = 1
        endPage = maxPage
    } else if (Number(currentPage) <= Math.round(displayCount / 2)) {
        startPage = 1
        endPage = displayCount
    } else if (currentPage > maxPage - displayHalf) {
        startPage = maxPage - (displayCount - 1)
        endPage = maxPage
    } else {
        startPage = Number(currentPage) - Math.floor(displayCount / 2)
        endPage = Number(currentPage) + Math.floor(displayCount / 2)
    }

    pageList = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return pageList;
}


/**
 * 이미지 업로드 액션 생성 함수
 *
 * @param {string} back_api - 백엔드 API 주소
 * @param {function} callback - 업로드 후 처리할 콜백 함수 (err, result) => {}
 * @param {object} options - 추가 옵션: { folder: "폴더명", maxWidth: 숫자 }
 * @returns {function} - 업로드 실행 함수
 */
const uploadImageAct = (back_api_url, options = {}, callback) => {


    const folder = options.folder || "testfolder2";
    // const maxWidthOrHeight = options.maxWidth || 1200;

    const input = document.createElement("input");

    input.setAttribute("type", "file");
    input.setAttribute("accept", ".png,.jpg,.jpeg,.webp,.gif");
    input.click();

    input.onchange = async (e) => {
        loadingStore.set(true)

        const imageFile = e.target.files[0];

        console.log(imageFile);



        const options = {
            maxSizeMB: 1, // 최대 파일 크기 (MB)
            // maxWidthOrHeight: 1024, // 최대 너비 또는 높이
            useWebWorker: true, // 웹 워커 사용
        };

        try {

            let compressedFile = {}
            const maxSize = 1 * 1024 * 1024; // 1MB

            if (imageFile.name.split('.')[1] == 'gif') {
                if (imageFile.size >= maxSize) {
                    throw new Error("파일 용량이 1MB 이상입니다.");
                }
                compressedFile = imageFile
            } else {
                compressedFile = await imageCompression(
                    imageFile,
                    options,
                );
            }




            let imgForm = new FormData();
            const timestamp = new Date().getTime();
            const fileName = `${timestamp}${Math.random()
                .toString(36)
                .substring(2, 11)}.${compressedFile.name.split(".")[1]}`;


            imgForm.append("folder", folder);
            imgForm.append("onimg", compressedFile, fileName);

            // FormData의 key 값과 value값 찾기
            let keys = imgForm.keys();
            for (const pair of keys) {
                console.log(`name : ${pair}`);
            }

            let values = imgForm.values();
            for (const pair of values) {
                console.log(`value : ${pair}`);
            }

            const res = await axios.post(
                back_api_url,
                imgForm,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                },
            );
            console.log('!!!!!!')

            loadingStore.set(false)
            if (typeof callback === "function") {
                callback(null, res.data);
            }
        } catch (err) {

            loadingStore.set(true)
            const m = err.response?.data?.message;
            if (typeof callback === "function") {
                callback(err, null);
            }
        }
    };


}

export default uploadImageAct;






// 팻치를 화려하게 쓰려고 했지만 실패 ㅠ 안씀!!
export async function fetchRequest(method, url, data = {}, headers = {}) {
    const returnObj = { status: true };

    try {
        const isGet = method.toUpperCase() === 'GET';

        const options = {
            method: method.toUpperCase(),
            headers: {
                ...headers,
            },
        };

        if (!(data instanceof FormData)) {
            options.headers['Content-Type'] = 'application/json';
        }

        if (!isGet) {
            options.body = data instanceof FormData ? data : JSON.stringify(data);
        }

        const res = await fetch(url, options);

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || '서버 오류');
        }

        const result = await res.json();
        returnObj.data = result;
        return returnObj;

    } catch (err) {
        console.error(`Fetch ${method.toUpperCase()} Error:`, err);
        returnObj.status = false;
        returnObj.message = err.message || '서버와의 통신에 실패했습니다.';

        return returnObj;
    }
}