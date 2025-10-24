import { writable } from 'svelte/store';

export const user_info = writable({ idx: undefined });

// 메인 페이지 검색 및 지역
export const main_location = writable("");
export const search_val = writable("");
export const all_data = writable({});
export const toastStore = writable({ show: false, message: '', color: 'red' });
export const loadingStore = writable(false);
export const paymentActRegistered = writable(false);
export const paymentKey = writable("")
export const interestTabNum = writable(0)
export const manageBoardTabNum = writable(0)
export const favorateBool = writable(false)
export const prev = writable("/")



export const scrollY = writable(0);
export const pageScrollStatus = writable(false); // false 면 무조건 탑, 아니면 위치 기억
export const scrollVal = writable(0);



export const nonMemberViewLimitNum = writable(0);
export const viewLimitAlertModal = writable(false)


export const joinStatus = writable(
    {
        type: undefined,
        idx: undefined,
        info: { id: undefined, password: undefined }
    }
);


// 이 아래건 나중에 데이터 많아지면 쓰기!!
export const main_list = writable({ premium: [], top: [], free: [] });
export const free_start_num = writable(0);
export const site_load_status = writable("premium")
// 3개 다 빈 배열로 잡아놓고 맨 처음 premium 리스트 랜덤으로 채우기 (없으면 패스) / 스크롤 꽉 차면 top 부분 