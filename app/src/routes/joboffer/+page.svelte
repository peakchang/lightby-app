<script>
    import axios from "axios";
    import Cookies from "js-cookie";
    import moment from "moment-timezone";

    import PageHeader from "$lib/components/PageHeader.svelte";
    import QuestionItem from "$lib/components/QuestionItem.svelte";
    import SortableImg from "$lib/components/SortableImg.svelte";
    import KakaoMap from "$lib/components/kakaoMap.svelte";
    import CustomModal from "$lib/components/CustomModal.svelte";

    import { onDestroy, onMount, tick } from "svelte";
    import { goto, beforeNavigate } from "$app/navigation";
    import { browser } from "$app/environment";

    import { formatPhoneNum, removeSpecialCharactersAndSpaces } from "$lib/lib";

    import {
        user_info,
        all_data,
        paymentActRegistered,
        loadingStore,
        prev,
        toastStore,
        pageScrollStatus,
    } from "$lib/stores/stores";

    import {
        back_api,
        regions,
        businessCategorys,
        jobCategorys,
    } from "$lib/const";

    let { data } = $props();

    let feeBases = $derived(["본부", "팀", "직원", "상담시"]);

    let iconList = $derived([
        { name: "조건변경", id: "change" },
        { name: "할인", id: "discount" },
        { name: "수수료UP", id: "feeup" },
        { name: "설거지", id: "guzi" },
        { name: "급구", id: "hurry" },
        { name: "소수인원", id: "minority" },
        { name: "신규", id: "new" },
        { name: "한방", id: "once" },
    ]);

    let businessArr = $state([]); // 업종분류 변수 담을 임시 배열
    let occupationArr = $state([]); // 직종분류 변수 담을 임시 배열
    let imgModifyList = $state("");

    // 로그인 체크 모달
    let notLoginChkModal = $state(false);

    // 이전 게시물 열어보기 모달
    let prevPostListModal = $state(false);
    let prevPostList = $state([]);
    let prevPostChkModal = $state(false);
    let setPrevPostIdx = $state(0); // 이전 게시물 불러오는데 만약 입력된 값들이 있을 경우 대비해서 아이디 값만 저장!

    // 등록 전 결제 및 물어보는거 모달
    let submitPrevModal = $state(false); // 모달 변수
    let paymentStatus = $state(false); // 업로드시에 결제 완료 여부 체크 변수!! (true 면 상품 등록 진행, free 는 임의로 true로, 기타 유료는 결제 완료시 true로 변경)
    let popup = $state();
    let popupCheckInterval = $state(); // 팝업이 닫혔을때 감지!!

    // 모달 내 계산기 관련
    let productInfo = $state({ name: "일반", price: 0 }); // 상품 정보가 담김!
    let iconNames = $state([]); // 아이콘 이름이 한글로 담김!
    let icons = $state([]); // 아이콘 이름이 영어로 담김!
    let iconSum = $state(0); // 아이콘 갯수에 따른 가격 합계
    let iconsShow = $state(false);

    // 글 작성중 뒤로가기 또는 새로고침시 필요한 변수 (이미지 삭제 관련)
    let escapePageModal = $state(false);
    let delImgList = $state([]);
    let toPage = $state("");
    let blockBack = $state(true); // 뒤로가기시 nav 에 막혀서 안움직일시 임시 변수

    // 토스트 관련 변수
    let toastShow = $state(0);
    let toastMessage = $state("토스트 메세지!!");

    // alert modal 변수!!
    let alertModalShow = $state(false);
    let alertModalMessage = $state("");

    // 상태값 변경 임시변수
    let prevItem = $state("");

    // effct 함수 내에서 무한루프가 되는거 방지! (반복되는 코드 부분 상태값 변경으로 한번만 실행되게 함)
    let loopPrevent = $state(true);

    // 최종 업로드 체크체크
    let successPrevModal = $state(false);
    let successPrevModalMessage = $state("");

    // 첫 글 무료 셋팅 변수!
    let freebies = $state(true);

    const chkBoolList = [
        // { var: "imgs", label: "현장 이미지" },
        { var: "subject", label: "공고 제목(현장명)" },
        { var: "point", label: "현장 한마디" },
        { var: "res_addr", label: "근무지 주소" },
        { var: "location", label: "지역 선택" },
        { var: "agency", label: "분양대행사명" },
        { var: "name", label: "담당자 성함" },
        { var: "phone", label: "담당자 연락처" },
        { var: "business", label: "업종분류선택" },
        { var: "occupation", label: "직종분류선택" },
        // { var: "career", label: "경력 입력" },
        // { var: "number_people", label: "인원 입력" },
        { var: "fee_type", label: "수수료 타입" },
        { var: "fee", label: "수수료 입력" },
    ];

    // 시작 셋팅
    onMount(async () => {
        $pageScrollStatus = false; // 페이지 시작시 최상위

        await tick();

        if (data.modifyIdx) {
            $all_data = data.modifyContent;
        } else {
            if (data.userInfo) {
                $all_data["name"] = formatPhoneNum(data.userInfo.name);
                $all_data["phone"] = formatPhoneNum(data.userInfo.phone);
                freebies = data.userInfo.freebies;
                console.log(`freebies : ${freebies}`);
            }
        }

        // 삭제할 이미지 있으면 쿠키에서 값 가져와서 삭제하기! (글쓰는 페이지 적용!!)
        const refreshFlag = Cookies.get("del_img_list");
        if (refreshFlag) {
            try {
                const res = await axios.post(`${back_api}/img/delete_many`, {
                    delImgList: refreshFlag.split(","),
                });
                Cookies.remove("del_img_list");
            } catch (err) {
                Cookies.remove("del_img_list");
                console.error(err);
            }
        }

        $all_data["user_id"] = $user_info.idx;

        if (!$all_data["user_id"] && loopPrevent) {
            // 유저 정보 없을경우 뒤로 돌아가기
            blockBack = false;
            window.history.back();
            loopPrevent = false;
            return;
        }

        if ($all_data["product"] != "free") {
            if ($all_data["product"] == "premium") {
                productInfo.name = "프리미엄";
                productInfo.price = 66000;
            } else if ($all_data["product"] == "top") {
                productInfo.name = "지역 탑";
                productInfo.price = 49500;
            }
        }

        if ($all_data["icons"]) {
            icons = $all_data["icons"].split(",");
            iconNames = icons
                .map((id) => iconList.find((icon) => icon.id === id)?.name)
                .filter((name) => name !== undefined);
        }

        // 주소 있을경우 주소값 입력하기 (카카오 맵 적용)
        if ($all_data["res_addr"]) {
            getAddress = $all_data["res_addr"];
        }

        // 업종분류 값 있을경우 businessArr 에 값 넣기
        if ($all_data["business"]) {
            businessArr = $all_data["business"].split(",");
        }

        // 직종분류 값 있을경우 occupationArr 에 값 넣기
        if ($all_data["occupation"]) {
            occupationArr = $all_data["occupation"].split(",");
        }
    });

    // 페이지 나갈때 버리거나 셋팅
    onDestroy(() => {});

    // 페이지 값 변경시 체크 사항
    beforeNavigate((nav) => {
        let hasData = false;
        if (delImgList && delImgList.length > 0) {
            hasData = true;
        }

        hasData = chkBoolList.some((item) => $all_data[item.var]);

        if (blockBack && hasData) {
            toPage = nav.to.url.pathname;
            escapePageModal = true;
            nav.cancel();
        }
    });

    // 변화 감지
    $effect(() => {
        // 모종의 이유로 모달이 닫힐때
        if (!$user_info.idx) {
            notLoginChkModal = true;
        } else if (!$user_info.idx && notLoginChkModal == false) {
            goto("/");
        }
        // delImgList 에 리스트 담기!! (글쓰는 페이지!)

        if (delImgList.length > 0) {
            const delImgListStr = delImgList.join(",");
            Cookies.set("del_img_list", delImgListStr, {
                path: "/joboffer",
                expires: 7,
                sameSite: "Lax",
            });
        } else {
            Cookies.remove("del_img_list", { path: "/" });
        }
    });

    function handleFeeInput(event) {
        let value = event.target.value;
        let numVal = value.replace(/[^0-9]/g, "");
        let commaVal = numVal.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        $all_data["fee"] = commaVal;
    }

    async function useChkPrevPost() {
        setPrevPostIdx = this.dataset.idx;
        const hasData = chkBoolList.some((item) => $all_data[item.var]);
        if (hasData) {
            prevPostChkModal = true;
        } else {
            usePrevPost();
        }
        prevPostListModal = false;
    }

    async function usePrevPost() {
        if (delImgList && delImgList.length > 0) {
            try {
                const res = await axios.post(`${back_api}/img/delete_many`, {
                    delImgList,
                });
            } catch (err) {
                console.error(err);
            }
        }

        try {
            const res = await axios.post(`${back_api}/regist/load_prev_post`, {
                postIdx: setPrevPostIdx,
            });
            $all_data = res.data.prevPost;
            imgModifyList = $all_data["imgs"];

            $all_data["product"] = "free";
            $all_data["icons"] = "";

            $all_data["phone"] = formatPhoneNum($all_data["phone"]);
            getAddress = $all_data["addr"];
            delete $all_data.created_at;
            delete $all_data.updated_at;
            delete $all_data.sum;
            delete $all_data.idx;

            delete $all_data.ad_end_date;
            delete $all_data.ad_start_date;
            delete $all_data.icons;

            businessArr = $all_data["business"].split(",");
            occupationArr = $all_data["occupation"].split(",");
        } catch (error) {}
    }

    // '이전 등록한 공고 불러오기' 버튼 클릭하면, 모달 열면서 기존 공고 불러오기
    async function loadPreviousPostList() {
        try {
            const res = await axios.post(`${back_api}/regist/load_prev_list`, {
                user_idx: $user_info.idx,
            });

            prevPostList = res.data.prevPostList;
            prevPostListModal = true;
        } catch (error) {}
    }

    // 결제 성공시 action! on:message 에 등록~
    async function paymentSuccess(e) {
        if (e.data.status) {
            $loadingStore = false;
            $all_data["payment_key"] = e.data.paymentInfo.payment_key;
            $all_data["order_id"] = e.data.paymentInfo.order_id;
            const today = moment().format("YYYY-MM-DD");
            const tenDaysLater = moment().add(10, "days").format("YYYY-MM-DD");
            $all_data["ad_start_date"] = today;
            $all_data["ad_end_date"] = tenDaysLater;
            paymentStatus = true;

            try {
                const res = await axios.post(`${back_api}/regist/upload`, {
                    allData: $all_data,
                });
                blockBack = false;
                successPrevModal = true;
                successPrevModalMessage = "업로드가 완료 되었습니다.";
                setTimeout(() => {
                    successPrevModal = false;
                    $all_data = {};
                    goto("/");
                }, 3500);
            } catch (err) {
                // 결제가 에러 나는 경우 결제 취소 해주자!!!

                popup = undefined;

                alertModalShow = true;
                alertModalMessage = "결제에러! 다시 시도해주세요!";

                const m = err.response.data.message;
                console.error(`에러남!!!!`);
            }
        }
    }

    // 상품 업로드 함수!!!
    async function uploadRegist() {
        if (icons.length > 1) {
            icons = icons.slice(0, 1);
        }

        $all_data["icons"] = icons.join(",");
        $all_data["phone"] = removeSpecialCharactersAndSpaces(
            $all_data["phone"],
        );

        $all_data["fee"] = removeSpecialCharactersAndSpaces($all_data["fee"]);

        // 첫글 무료시!! freebies 가 true 면 값 지정을 해준다! false 면 유료로 등록 해야함!!!
        if (freebies) {
            paymentStatus = true;
            if ($all_data["product"] == "premium") {
                const today = moment().format("YYYY-MM-DD");
                const tenDaysLater = moment()
                    .add(10, "days")
                    .format("YYYY-MM-DD");
                $all_data["ad_start_date"] = today;
                $all_data["ad_end_date"] = tenDaysLater;
            }
        }

        console.log(paymentStatus);
        console.log($all_data["product"]);
        console.log($user_info);

        // 유료 상품이면 팝업 열고 리턴 처리!!

        // 등급이 서브관리자 (3 이상) 이상이면 패스, 이하면 들어와서 체크
        if (!$user_info.rate || Number($user_info.rate) < 3) {
            if ($all_data["product"] != "free" && paymentStatus == false) {
                const payProductName = `${productInfo.name} + 아이콘${iconNames.length}`;
                popup = window.open(
                    `/payments?user_id=${$user_info.idx}&order_name=${payProductName}&amount=${$all_data["sum"]}`,
                    "popup",
                    "width=550,height=670",
                );

                popupCheckInterval = setInterval(() => {
                    if (popup && popup.closed) {
                        clearInterval(popupCheckInterval);
                        popupCheckInterval = null;

                        if (!paymentStatus) {
                            $loadingStore = false;
                            alertModalShow = true;
                            alertModalMessage =
                                "결제가 취소되었습니다. 다시 시도해주세요.";
                            popup = null;
                        }

                        // 여기에 닫힌 후 실행할 코드 추가
                    }
                }, 500); // 0.5초마다 감지

                $loadingStore = true;
                return;
            }
        }

        // const allData = $all_data
        // allData['amount'] = $all_data["sum"]

        if (Number($user_info.rate) >= 3) {
            // 레벨이 3(서브관리자) 이상이면 광고 기간 등록 해주기!
            const today = moment().format("YYYY-MM-DD");
            const tenDaysLater = moment().add(10, "days").format("YYYY-MM-DD");
            $all_data["ad_start_date"] = today;
            $all_data["ad_end_date"] = tenDaysLater;
        }

        // 상품 업로드!!
        try {
            const res = await axios.post(`${back_api}/regist/upload`, {
                allData: $all_data,
                freebies,
            });
            blockBack = false;
            successPrevModal = true;
            successPrevModalMessage = "업로드가 완료 되었습니다.";
            setTimeout(() => {
                successPrevModal = false;
                $all_data = {};
                goto("/");
            }, 2500);
        } catch (err) {
            const m = err.response.data.message;
            console.error(`에러남!!!!`);
        }
    }

    // 상품 업데이트 (수정) 함수!!!
    async function updateRegist() {
        $all_data["business"] = businessArr.join(",");
        $all_data["occupation"] = occupationArr.join(",");

        // 먼저 값들 다 제대로 들어갔는지 체크!
        const chkBool = chkEssentialValue(chkBoolList);
        if (!chkBool) {
            return;
        }

        try {
            const res = await axios.post(`${back_api}/regist/update`, {
                allData: $all_data,
            });
        } catch (error) {}

        blockBack = false;
        successPrevModal = true;
        successPrevModalMessage = "업데이트가 완료 되었습니다.";

        setTimeout(() => {
            successPrevModal = false;
            $all_data = {};

            if ($prev) {
                goto($prev);
            } else {
                goto("/manage_board");
            }
        }, 2500);
    }

    // 최종 업로드 (결제 및 아이콘 선택하는 모달) 모달 열기! / 결제 창 떠있는지도
    function uploadChkRegist(e) {
        if (popup) {
            alertModalShow = true;
            alertModalMessage = "현재 결제창이 열려 있습니다.";
            return;
        }

        $all_data["business"] = businessArr.join(",");
        $all_data["occupation"] = occupationArr.join(",");

        const chkBool = chkEssentialValue(chkBoolList);

        if (!chkBool) {
            return;
        }

        // 상품 값 없을경우 기본값 free // 먄약 첫 글일 경우 premium
        if (freebies) {
            $all_data["product"] = "premium";
            $all_data["sum"] = 66000;

            productInfo.name = "프리미엄";
            productInfo.price = 66000;
            iconsShow = true;
        } else if (!$all_data["product"]) {
            $all_data["product"] = "free";
        }

        submitPrevModal = true;
    }

    // uploadChkRegist 함수 실행 시 필수 항목 체크하는 함수!
    function chkEssentialValue(objArr) {
        for (let i = 0; i < objArr.length; i++) {
            const e = objArr[i];
            if (!$all_data[e.var]) {
                alertModalMessage = `${e.label}(은)는 필수 입력입니다.`;
                alertModalShow = true;
                return false;
            }
            // if (!e.var) {
            //     alert(`${e.label}(은)는 필수 입력입니다.`);
            //     return false;
            // }
        }
        return true;
    }

    // 추가 함수!!!!!!!!!!!!!

    /*
        아이콘 선택 변경시 함수
        아이콘 선택시 무료 등록이면 전부 해제 & 선택 불가
        프리미엄, 탑 선택시 2개 초과 선택 못하게 +
    */
    function iconsChange() {
        if ($all_data["product"] == "free") {
            icons = [];
            this.checked = false;
            toastStore.set({
                show: true,
                message: "아이콘 선택은 유료 상품에서만 가능합니다.",
                color: "#3DB7CC",
            });
            return;
        }
        if (this.checked && icons.length > 1) {
            this.checked = false;

            toastStore.set({
                show: true,
                message: "아이콘 선택은 1개만 가능합니다.",
                color: "#3DB7CC",
            });
            return;
        }

        const iconsTemp = icons;
        iconNames = icons
            .map((id) => iconList.find((icon) => icon.id === id)?.name)
            .filter((name) => name !== undefined);
        iconSum = icons.length * 2200;

        $all_data["sum"] = productInfo.price + iconSum;
    }

    // 상품 변경시 처리 함수
    function itemRateChange() {
        if (this.value == "premium") {
            productInfo.name = "프리미엄";
            productInfo.price = 66000;
            iconsShow = true;
        } else if (this.value == "top") {
            productInfo.name = "지역 탑";
            productInfo.price = 49500;
            iconsShow = true;
        } else if (this.value == "free") {
            productInfo.name = "일반";
            productInfo.price = 0;
            iconsShow = false;
            if (icons && icons.length > 0) {
                icons = [];
                iconNames = [];

                toastStore.set({
                    show: true,
                    message: "아이콘 선택은 유료 상품에서만 가능합니다.",
                    color: "#3DB7CC",
                });
                iconSum = 0;
            }
        }

        $all_data["sum"] = productInfo.price + iconSum;
    }

    // 페이지 벗어나기(뒤로가기) 하면 나오는 모달에서 뒤로가기 승낙 했을때 뜨는 창!!
    async function goToBackAndArrangeImg() {
        if (delImgList.length > 0) {
            try {
                const res = await axios.post(`${back_api}/img/delete_many`, {
                    delImgList,
                });
            } catch (err) {
                console.error(err.meesage);
            }
        }
        blockBack = false;
        $all_data = {};
        goto(toPage);
    }

    // SoartImg 컴포넌트 에서 이미지 업로드 후 처리 함수!
    function updateImg(e) {
        // 새로고침 또는 뒤로가기 시에 삭제할 이미지 리스트 정하기
        if (e["type"]) {
            if (e.type == "add") {
                delImgList.push(e.url);
            } else {
                const tempArr = delImgList.filter((item) => item !== e.url);
                delImgList = tempArr;
            }
        }

        // 정상적으로 업로드 될 이미지 리스트 셋
        const imgArr = e.imgArr;

        let imgStr = "";
        for (let i = 0; i < imgArr.length; i++) {
            const con = imgArr[i];
            imgStr += con.href + ",";
        }
        $all_data["imgs"] = imgStr.slice(0, -1);
    }

    // 주소 영역

    // ---------------------------------------------------

    // 주소 입력 창 영역
    let postWrap = $state();

    // 모달 열고 닫기
    let modalCloseBtn = $state();

    // KakaoMap 컴포넌트에 전달할 변수
    let getAddress = $state();

    function tudeAct(e) {
        $all_data["latitude"] = e.coords.Ma;
        $all_data["longtitude"] = e.coords.La;
    }

    function foldDaumPostcode() {
        // iframe을 넣은 element를 안보이게 한다.
        postWrap.style.display = "none";
        modalCloseBtn.click();
    }

    // 다음 주소
    function addressInput() {
        new daum.Postcode({
            oncomplete: function (data) {
                // 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

                // 각 주소의 노출 규칙에 따라 주소를 조합한다.
                // 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
                var extraAddr = ""; // 참고항목 변수

                //사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
                if (data.userSelectedType === "R") {
                    // 사용자가 도로명 주소를 선택했을 경우
                    $all_data["addr"] = data.roadAddress;
                } else {
                    // 사용자가 지번 주소를 선택했을 경우(J)
                    $all_data["addr"] = data.jibunAddress;
                }

                // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
                if (data.userSelectedType === "R") {
                    // 법정동명이 있을 경우 추가한다. (법정리는 제외)
                    // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
                    if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
                        extraAddr += data.bname;
                    }
                    // 건물명이 있고, 공동주택일 경우 추가한다.
                    if (data.buildingName !== "" && data.apartment === "Y") {
                        extraAddr +=
                            extraAddr !== ""
                                ? ", " + data.buildingName
                                : data.buildingName;
                    }
                    // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
                    if (extraAddr !== "") {
                        extraAddr = " (" + extraAddr + ")";
                    }
                } else {
                }

                getAddress = $all_data["addr"];
                let selRegionIdx = null;
                for (let i = 0; i < regions.length; i++) {
                    const region = regions[i];
                    const regex = new RegExp(`^${region}`);
                    if ($all_data["addr"].match(regex)) {
                        selRegionIdx = i; // 매치되면 선택된 지역으로 저장
                        $all_data["location"] = regions[selRegionIdx];
                        break; // 매치된 경우 더 이상 순회하지 않음
                    }
                }

                $all_data["res_addr"] =
                    `(${data.zonecode}) ${$all_data["addr"]} ${extraAddr}`;

                // detailAddrArea.focus();

                // iframe을 넣은 element를 안보이게 한다.
                // (autoClose:false 기능을 이용한다면, 아래 코드를 제거해야 화면에서 사라지지 않는다.)
                postWrap.style.display = "none";
                modalCloseBtn.click();
            },
            // 우편번호 찾기 화면 크기가 조정되었을때 실행할 코드를 작성하는 부분. iframe을 넣은 element의 높이값을 조정한다.
            onresize: function (size) {
                postWrap.style.height = size.height + "px";
            },
            width: "100%",
            height: "100%",
        }).embed(postWrap);

        // iframe을 넣은 element를 보이게 한다.
        postWrap.style.display = "block";
        my_modal_1.showModal();
    }

    // 전화번호 업로드시 숫자만 남기기
    function formatPhoneNumber(event) {
        let value = event.target.value.replace(/\D/g, ""); // 숫자만 남기기

        if (value.length === 8) {
            // 8자리: 국번 없는 대표번호 → 1661-4545
            value = value.replace(/(\d{4})(\d{4})/, "$1-$2");
        } else if (value.length === 9) {
            // 9자리: 지역번호(2자리)+번호(7자리) → 02-123-4567
            value = value.replace(/(\d{2})(\d{3})(\d{4})/, "$1-$2-$3");
        } else if (value.length === 10) {
            // 10자리: 지역번호(3자리)+번호(7자리) → 032-655-8844
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
        } else if (value.length === 11) {
            // 11자리: 휴대폰 → 010-5454-6464
            value = value.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
        } else if (value.length > 3 && value.length < 8) {
            // 임시 처리: 4~7자리 입력 → 010-1234 같은 형태
            value = value.replace(/(\d{3})(\d+)/, "$1-$2");
        }

        $all_data["phone"] = value;
    }
</script>

<svelte:head>
    <script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
    ></script>

    <script
        type="text/javascript"
        defer
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=72689d54e68abd94260d9284c64d7545&libraries=services&autoload=false`}
    ></script>
</svelte:head>

<svelte:window on:message={paymentSuccess} />

<!-- 경고창 모달 -->
<!-- svelte-ignore event_directive_deprecated -->
<CustomModal
    bind:visible={notLoginChkModal}
    closeOnBackground={false}
    closeBtn={false}
    xBtn={false}
>
    <div class="text-center">
        <div class=" text-red-500 text-3xl mb-5">
            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
        </div>
        <div class="mb-5">구인 등록을 원하시면 로그인이 필요합니다.</div>
        <div class="flex justify-center items-center gap-3">
            <a href="/auth/login" class="btn btn-active w-1/3">
                <button
                    on:click={() => {
                        goto("/auth/login");
                    }}
                >
                    로그인 바로가기
                </button>
            </a>

            <a href="/" class="btn btn-active w-1/3">
                <button
                    on:click={() => {
                        goto("/");
                    }}
                >
                    취소
                </button>
            </a>
        </div>
    </div>
</CustomModal>

<!-- svelte-ignore event_directive_deprecated -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- 이전 공고 불러오기 리스트 모달 -->
<CustomModal bind:visible={prevPostListModal}>
    <div class="mb-5 font-bold">이전 등록 공고 불러오기</div>

    <div>
        {#each prevPostList as post}
            <div
                class="mb-2 text-sm border border-gray-200 bg-gray-200 p-3 rounded-md hover:bg-white cursor-pointer flex justify-between items-center"
                data-idx={post.idx}
                on:click={useChkPrevPost}
            >
                <span>{post.subject}</span>
                <button
                    type="button"
                    class="btn btn-outline btn-info btn-sm hover:text-white"
                >
                    적용
                </button>
            </div>
        {/each}
    </div>
</CustomModal>

<!-- 이전 공고 선택시 기존 데이터 있으면 확인하는 모달 -->
<!-- svelte-ignore event_directive_deprecated -->
<CustomModal bind:visible={prevPostChkModal} closeBtn={false}>
    <div class="text-center">
        <div class=" text-blue-500 text-3xl mb-5">
            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
        </div>
        <div class="mb-5">
            <p>현재 작성중인 공고가 있습니다.</p>
            <p>현재 내용을 삭제하고 불러오기를 진행 하겠습니까?</p>
        </div>
        <div class="flex justify-center items-center gap-3">
            <button
                class="btn btn-info w-1/3 text-white"
                on:click={usePrevPost}
            >
                불러오기
            </button>
            <button class="btn btn-soft w-1/3">취소</button>
        </div>
    </div>
</CustomModal>

<!-- 결제 완료 후 뜨는 모달 -->
<!-- svelte-ignore event_directive_deprecated -->
<CustomModal bind:visible={successPrevModal} closeBtn={false}>
    <div class="text-center">
        <div class=" text-green-700 text-5xl mb-5">
            <i class="fa fa-smile-o" aria-hidden="true"></i>
        </div>
        <div class="mb-2 text-xl">
            {successPrevModalMessage}
        </div>
        <div class="mb-5 text-sm">잠시 후 이전 페이지로 돌아갑니다.</div>
        <div>
            <span class="loading loading-ring loading-xl"></span>
        </div>
    </div>
</CustomModal>

<!-- 경고창 모달 -->
<!-- svelte-ignore event_directive_deprecated -->
<CustomModal bind:visible={alertModalShow} closeBtn={false}>
    <div class="text-center">
        <div class=" text-red-500 text-3xl mb-5">
            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
        </div>
        <div class="mb-5">
            {alertModalMessage}
        </div>
        <div class="flex justify-center items-center gap-3">
            <button class="btn btn-active w-1/3">닫기</button>
        </div>
    </div>
</CustomModal>

<!-- 페이지 벗어나려고 할 시 보이는 모달 -->
<!-- svelte-ignore event_directive_deprecated -->
<CustomModal bind:visible={escapePageModal} closeBtn={false}>
    <div class="text-center">
        <div class=" text-red-500 text-3xl mb-5">
            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
        </div>
        <div class="mb-5">
            페이지에서 벗어날시 등록중인 내용은 삭제됩니다. 진행하시겠습니까?
        </div>
        <div class="flex justify-center items-center gap-3">
            <button
                class="btn btn-active btn-info text-white w-1/3"
                on:click={goToBackAndArrangeImg}
            >
                뒤로가기
            </button>
            <button class="btn btn-active w-1/3">취소</button>
        </div>
    </div>
</CustomModal>

<!-- 상품 선택 및 결제 모달 -->
<CustomModal bind:visible={submitPrevModal} closeBtn={false}>
    <!-- svelte-ignore event_directive_deprecated -->
    <div class="text-center">
        <div>
            <div class=" text-green-700 text-3xl mb-2">
                <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
            </div>

            <div class="mb-5">
                {#if freebies}
                    <p class="md:text-lg">첫글 작성자 혜택!</p>
                    <p>구인글 최초 1회 프리미엄 무료등록</p>
                {:else}
                    <p class="md:text-lg">상품을 선택하세요</p>
                {/if}
            </div>

            <label>
                <input
                    type="radio"
                    value="premium"
                    class="hidden peer"
                    bind:group={$all_data["product"]}
                    on:change={itemRateChange}
                />

                <div
                    class="mb-5 border-2 peer-checked:border-blue-500 border-gray-200 p-2 mx-auto rounded-lg"
                >
                    {#if freebies}
                        <p class="line-through text-gray-500">
                            프리미엄 등록 특가 132,000 -> 66,000원
                        </p>
                        <p>첫글 등록시 프리미엄 무료!</p>
                    {:else}
                        <p class="text-sm md:text-base mb-2">
                            프리미엄 등록 특가
                            <span class="line-through text-gray-500">
                                132,000원
                            </span>
                            ->
                            <span class="font-bold">66,000원</span>
                        </p>
                    {/if}

                    <p class="text-xs md:text-sm">
                        시작페이지 / 지역페이지 모든 지면
                    </p>
                    <p class="text-xs md:text-sm">상단 10일 랜덤 노출</p>
                    <p class="text-xs md:text-sm">
                        등록된 내용은 마이페이지에서 수정 가능
                    </p>
                </div>
            </label>

            <label>
                <input
                    type="radio"
                    value="top"
                    class="hidden peer"
                    bind:group={$all_data["product"]}
                    on:change={itemRateChange}
                />

                <div
                    class="mb-5 border-2 peer-checked:border-blue-500 border-gray-200 p-2 mx-auto rounded-lg"
                >
                    <p class="text-sm md:text-base mb-2">
                        지역 탑 등록 특가
                        <span class="line-through text-gray-500">
                            99,000원
                        </span>
                        ->
                        <span class="font-bold">49,500원</span>
                    </p>
                    <p class="text-xs md:text-sm">
                        지역페이지 상단 10일 랜덤 노출
                    </p>
                    <p class="text-xs md:text-sm">
                        등록된 내용은 마이페이지에서 수정 가능
                    </p>
                </div>
            </label>

            <label>
                <input
                    type="radio"
                    value="free"
                    class="hidden peer"
                    bind:group={$all_data["product"]}
                    on:change={itemRateChange}
                />

                <div
                    class="mb-5 border-2 peer-checked:border-blue-500 border-gray-200 p-2 mx-auto rounded-lg"
                >
                    <p class="text-sm md:text-base mb-2">
                        - 바로 등록 (무료 등록)
                    </p>
                    <p class="text-xs md:text-sm">
                        일 2회 무료 등록이 가능합니다.
                    </p>
                </div>
            </label>
        </div>

        {#if iconsShow}
            <div class="">
                <div class="">※ 아이콘 선택 (개당 2,200원)</div>
                <div class="mt-1 mb-4 text-xs leading-relaxed">
                    <p>아이콘은 1개 선택 가능하며,</p>
                    <p>선택하신 아이콘은 메인페이지 우측 하단에 표시됩니다.</p>
                </div>
                <div class="grid grid-cols-4 md:gap-x-2 gap-y-2">
                    {#each iconList as icon}
                        <label>
                            <input
                                type="checkbox"
                                class="hidden peer"
                                value={icon.id}
                                bind:group={icons}
                                on:change={iconsChange}
                            />
                            <div
                                class="border-2 peer-checked:border-blue-500 border-gray-200 w-5/6 md:w-4/5 p-2 mx-auto rounded-lg"
                            >
                                <img
                                    src="/icons/icon-{icon.id}.png"
                                    alt=""
                                    class="w-full"
                                />
                            </div>
                        </label>
                    {/each}
                </div>
            </div>
        {:else}
            아이콘 선택은 프리미엄 또는 지역탑 등록시 선택 가능합니다.
        {/if}

        <div class="w-2/3 md:w-1/2 ml-auto my-4 text-lg font-semibold">
            <div
                class="flex justify-between items-center mb-2 border-b border-gray-100 text-sm"
            >
                <span class="text-gray-600">{productInfo.name}</span>
                <span class="font-medium">
                    {productInfo.price.toLocaleString()}원
                </span>
            </div>

            {#each iconNames as iconName}
                <div
                    class="flex justify-between items-center mb-2 border-b border-gray-100 text-sm"
                >
                    <span class="text-gray-600">{iconName}</span>
                    <span class="font-medium"> 2,200 원 </span>
                </div>
            {/each}

            <hr class="border-gray-300" />
            <div
                class="flex justify-between items-center py-2 border-b border-gray-100"
            >
                <span class="text-gray-600">합계</span>

                {#if freebies}
                    <span class="font-medium">
                        <span class="line-through text-gray-400">
                            {$all_data["sum"]
                                ? $all_data["sum"].toLocaleString()
                                : 0}
                        </span>
                        >>
                        <span>0</span>
                        원
                    </span>
                {:else}
                    <span class="font-medium">
                        {$all_data["sum"]
                            ? $all_data["sum"].toLocaleString()
                            : 0}원
                    </span>
                {/if}
            </div>
        </div>

        <div class="text-right">
            <button class="btn btn-success text-white" on:click={uploadRegist}>
                결제 및 등록
            </button>
        </div>
    </div>
</CustomModal>

<!-- svelte-ignore event_directive_deprecated -->
<dialog id="my_modal_1" class="modal">
    <div class="modal-box">
        <h3 class="text-lg font-bold">주소를 입력하세요</h3>
        <div
            bind:this={postWrap}
            style="display:none;border:1px solid;width:100%;height:300px;margin:5px 0;position:relative"
        >
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <img
                src="//t1.daumcdn.net/postcode/resource/images/close.png"
                id="btnFoldWrap"
                style="cursor:pointer;position:absolute;right:0px;top:-1px;z-index:1"
                on:click={foldDaumPostcode}
                alt="접기 버튼"
            />
        </div>
        <div class="modal-action">
            <form method="dialog">
                <!-- if there is a button in form, it will close the modal -->
                <button class="btn" bind:this={modalCloseBtn}>Close</button>
            </form>
        </div>
    </div>
</dialog>

<PageHeader />

<!-- svelte-ignore event_directive_deprecated -->
<div class="bg-white relative min-h-screen suit-font">
    <div class="max-w-[530px] mx-auto pt-14 pb-24">
        <!-- <button on:click={testFunc}> testBtn </button> -->
        {#if freebies}
            <div class="text-right text-blue-700">
                <i class="fa fa-hand-pointer-o" aria-hidden="true"></i>
                <span>첫번째 구인공고 작성시 프리미엄 무료!</span>
            </div>
        {/if}
        <div
            class=" bg-white p-3 flex justify-between items-center border-b border-gray-300"
        >
            {#if !data.modifyIdx}
                <div class="text-center font-semibold text-2xl">
                    구인글 등록

                    <span
                        class="text-xs"
                        on:click={() => {
                            console.log($all_data);
                        }}
                    >
                        lll
                    </span>
                </div>

                <div
                    class="border border-gray-300 px-3 py-1.5 rounded-lg flex justify-center items-center cursor-pointer"
                >
                    <span class=" text-blue-700 text-lg mr-2">
                        <i class="fa fa-file-text-o" aria-hidden="true"></i>
                    </span>
                    <button
                        class="text-xs bg-blue-400 text-white px-3 py-1.5 rounded-lg"
                        on:click={loadPreviousPostList}
                    >
                        이전 등록한 공고 불러오기
                    </button>
                </div>
            {:else}
                <div class="text-center font-semibold text-2xl">
                    구인글 수정
                </div>
            {/if}
        </div>

        <div class="mt-2 bg-white p-5">
            <div class="font-semibold text-lg">이미지 등록</div>
            <div class="text-xs">
                이미지는 최대 10장, 슬라이드 형태로 표시됩니다.
            </div>
            <div class="my-3">
                <SortableImg
                    {updateImg}
                    folder={"job-offer"}
                    imgModifyList={$all_data["imgs"]
                        ? $all_data["imgs"].split(",")
                        : ""}
                    maxImgCount={10}
                ></SortableImg>
            </div>

            <div class="font-semibold text-lg">공고제목 (현장명)*</div>
            <div class="mt-1.5">
                <input
                    type="text"
                    placeholder="공고 제목(현장명을 입력하세요)(필수)"
                    bind:value={$all_data["subject"]}
                    class="input input-bordered input-info w-full bg-white"
                />
            </div>

            <div class="mt-3 font-semibold text-lg">현장 한마디*</div>
            <div class="mt-1.5">
                <input
                    type="text"
                    class="input input-bordered input-info w-full bg-white"
                    placeholder="현장 한마디를 입력해주세요(필수)"
                    bind:value={$all_data["point"]}
                />
            </div>

            <div class="mt-3 font-semibold text-lg">근무지*</div>

            <div class="mt-1.5 flex w-full items-center gap-1">
                <input
                    type="text"
                    class="input input-bordered input-info input-sm w-full bg-white"
                    bind:value={$all_data["addr"]}
                />
                <!-- {#if $all_data["res_addr"]}
                    <div
                        class="border w-full py-1.5 px-2 text-sm border-sky-400 rounded-md"
                    >
                        {$all_data["res_addr"]}
                    </div>
                {:else}


                    <div
                        class="border w-full py-1.5 px-2 text-sm border-sky-400 rounded-md text-gray-400"
                    >


                        우측 주소 입력을 클릭해 주소를 입력해주세요
                    </div>
                {/if} -->

                <button
                    class="btn btn-outline btn-info btn-sm"
                    type="button"
                    on:click={addressInput}
                >
                    <span>주소 입력</span>
                </button>

                <button
                    class="btn btn-outline btn-info btn-sm"
                    type="button"
                    on:click={() => {
                        $all_data["res_addr"] = $all_data["addr"];
                        getAddress = $all_data["addr"];
                    }}
                >
                    <span>맵적용</span>
                </button>
            </div>

            <div class="mt-1 text-xs text-right leading-normal">
                <p>주소입력 클릭 후, 주소 검색 및 적용 하시면 됩니다.</p>
                <p>원하는 주소가 없을시 직접 입력 후 (맵적용)을 클릭해주세요</p>
            </div>

            <!-- <div class="my-2">
                    <input
                        type="text"
                        bind:value={detailAddr}
                        bind:this={detailAddrArea}
                        placeholder="상세 주소를 입력하세요"
                        class="border w-full py-1.5 px-2 text-sm border-sky-400 rounded-md focus:outline-none focus:border-2"
                    />
                </div> -->

            {#if getAddress}
                <div
                    class="mt-2 h-72 border w-full text-sm border-sky-400 rounded-md overflow-hidden"
                >
                    <KakaoMap
                        {getAddress}
                        phText="근무지"
                        height="300px"
                        {tudeAct}
                    />
                </div>
            {:else}
                <div
                    class="mt-2 h-24 border border-sky-400 rounded-md flex justify-center items-center bg-gray-200"
                >
                    <div class="">주소를 입력하면 지도가 표시됩니다.</div>
                </div>
            {/if}

            <div class="mt-5">
                <div class="mt-3 font-semibold text-lg">지역선택*</div>
                <div class="mt-3 grid grid-cols-2 gap-1">
                    {#each regions as region, idx}
                        <label class="button-checkbox">
                            <input
                                type="radio"
                                hidden
                                value={region}
                                bind:group={$all_data["location"]}
                            />
                            <div>{region}</div>
                        </label>
                    {/each}
                </div>
            </div>
        </div>

        <div class="mt-2 bg-white p-5">
            <div class="font-semibold text-lg">기본정보</div>

            <QuestionItem
                sbj="분양대행사 *"
                placeholder="필수입력"
                bind:iptVal={$all_data["agency"]}
            />
            <QuestionItem
                sbj="담당자 성함 *"
                placeholder="필수입력"
                bind:iptVal={$all_data["name"]}
            />

            <!-- <QuestionItem
                sbj="담당자 연락처 *"
                placeholder="필수입력"
                bind:iptVal={$all_data["phone"]}
            /> -->

            <div class="mt-5 flex w-full items-center">
                <div class="w-1/5 text-center text-sm">담당자 연락처 *</div>
                <div class="w-4/5">
                    <input
                        bind:value={$all_data["phone"]}
                        on:input={formatPhoneNumber}
                        type="text"
                        placeholder="ex) 010-1234-5678"
                        class="input input-bordered input-info w-full bg-white"
                    />
                </div>
            </div>

            <div class="mt-5">
                <div class="pl-3 text-left text-sm">
                    <span>업종분류 *</span>
                    <span class="text-xs">(여러개 선택 가능)</span>
                </div>
                <div class="mt-3 grid grid-cols-2 gap-1">
                    {#each businessCategorys as businessCategory, idx}
                        <label class="button-checkbox">
                            <input
                                type="checkbox"
                                value={businessCategory}
                                bind:group={businessArr}
                                hidden
                            />
                            <div>{businessCategory}</div>
                        </label>
                    {/each}
                </div>
            </div>

            <div class="mt-5">
                <div class="pl-3 text-left text-sm">
                    <span>직종분류 *</span>
                    <span class="text-xs">(여러개 선택 가능)</span>
                </div>
                <div class="mt-3 grid grid-cols-2 gap-1">
                    {#each jobCategorys as jobCategory, idx}
                        <label class="button-checkbox">
                            <input
                                type="checkbox"
                                value={jobCategory}
                                bind:group={occupationArr}
                                hidden
                            />
                            <div>{jobCategory}</div>
                        </label>
                    {/each}
                </div>
            </div>

            <QuestionItem
                sbj="경력 "
                placeholder="ex) 10년 / 초보"
                bind:iptVal={$all_data["career"]}
            />

            <QuestionItem
                sbj="인원 "
                placeholder="ex) 2명 / 00명"
                bind:iptVal={$all_data["number_people"]}
            />
        </div>

        <div class="mt-2 bg-white p-5">
            <div class="font-semibold text-lg">급여 및 영업지원</div>

            <div class="mt-2">
                <div class="flex w-full items-center">
                    <div class="w-1/5 text-center text-sm">수수료 *</div>
                    <div class="w-4/5 flex gap-1">
                        {#each feeBases as feeBase}
                            <label class="button-checkbox w-full">
                                <input
                                    type="radio"
                                    value={feeBase}
                                    hidden
                                    bind:group={$all_data["fee_type"]}
                                />
                                <div class="">{feeBase}</div>
                            </label>
                        {/each}
                    </div>
                </div>

                <div class="flex justify-end items-center gap-3 mt-2">
                    <div class="w-4/5 flex items-center gap-3">
                        <input
                            type="text"
                            bind:value={$all_data["fee"]}
                            on:input={handleFeeInput}
                            placeholder="숫자만 입력해주세요"
                            class="input input-bordered input-info w-full bg-white"
                        />
                        <div class=" w-12">원</div>
                    </div>
                </div>

                <div class="text-xs text-right mt-1 text-green-700">
                    <p>
                        수수료는 구인글 메인에 노출됩니다. 정확하게 입력해주시면
                    </p>
                    <p>더 많은 사람들이 회원님의 공고를 확인하게 됩니다.</p>
                </div>
            </div>
            <QuestionItem
                sbj="일비"
                placeholder="있을 경우만 입력 (ex, 월 100만원 / 일 3만원)"
                bind:iptVal={$all_data["daily_expense"]}
            />

            <QuestionItem
                sbj="숙소비"
                placeholder="있을 경우만 입력 (ex, 원룸 제공)"
                bind:iptVal={$all_data["sleep_expense"]}
            />

            <QuestionItem
                sbj="프로모션"
                placeholder="있을 경우만 입력 (ex, 5채 판매시 추가 100만)"
                bind:iptVal={$all_data["promotion"]}
            />

            <QuestionItem
                sbj="기본급여"
                placeholder="있을 경우만 입력 (ex, 기본급 200만)"
                bind:iptVal={$all_data["base_pay"]}
            />
        </div>

        <div class="mt-2 bg-white p-5">
            <div class="font-semibold">상세내용</div>
            <div class="mt-1.5">
                <textarea
                    class="textarea textarea-info w-full p-2 text-base bg-white"
                    placeholder="현장에 대한 상세 내용을 입력해주세요"
                    rows="8"
                    bind:value={$all_data["detail_content"]}
                ></textarea>
            </div>

            {#if data.modifyIdx}
                <div class="mt-1.5">
                    <button
                        class="btn btn-success w-full text-white"
                        on:click={updateRegist}
                    >
                        수정하기
                    </button>
                </div>
            {:else}
                <div class="mt-1.5">
                    <button
                        class="btn btn-success w-full text-white"
                        on:click={uploadChkRegist}
                    >
                        등록하기
                    </button>
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .button-checkbox div {
        display: block;
        background-color: #f0f0f0;
        color: #333;
        font-size: 14px;
        border: 1.5px solid #ccc;
        border-radius: 5px;
        padding: 8px 0;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
    }

    .button-checkbox input[type="checkbox"]:checked + div {
        background-color: #08b9ff;
        color: white;
        border-color: #0099ff;
    }

    .button-checkbox input[type="radio"]:checked + div {
        background-color: #08b9ff;
        color: white;
        border-color: #0099ff;
    }
</style>
