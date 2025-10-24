<script>
    import { untrack } from "svelte";
    import CustomModal from "$lib/components/CustomModal.svelte";
    import {
        afterNavigate,
        beforeNavigate,
        goto,
        invalidateAll,
    } from "$app/navigation";
    import { back_api, public_img_bucket } from "$lib/const.js";
    import PdButton from "$lib/components/PdButton.svelte";
    import MainLocation from "$lib/components/MainLocation.svelte";

    import { browser } from "$app/environment";
    import { navigating, page } from "$app/stores";
    import { onDestroy, onMount } from "svelte";
    import JobPostItem from "$lib/components/JobPostItem.svelte";
    import JobPostItemList from "$lib/components/JobPostItemList.svelte";

    import SeoMeta from "$lib/components/SeoMeta.svelte";

    // 스택 페이지
    import StackNavigator from "$lib/components/StackNavigator.svelte";
    import DetailPage from "$lib/components/pages/DetailPage.svelte";

    import {
        main_location,
        loadingStore,
        search_val,
        main_list,
        prev,
        scrollY,
        scrollVal,
        pageScrollStatus,
    } from "$lib/stores/stores.js";

    const seoVal = {
        title: "번개분양 - 분양현장 구인/구직",
        description:
            "가장 빠른 분양 구인·구직! 지금 바로 번개분양에서 확인하세요",
        icon: "/favicon.png",
        url: "https://lightby.co.kr",
        image: "/alt_image.jpg",
        date: "2025-04-27",
    };

    let { data } = $props();
    let searchModal = $state(false); // 검색 모달
    let mainSearchHistory = $state([]); // 메인 검색어 히스토리
    let searchInput; // 검색창 input 요소
    let searchFocus = $state(false); // 검색창 포커스 상태
    let bannerInterval; // 배너 interval 함수 적용 변수
    let nowBannerIdx = $state(0); // 현재 배너 인덱스

    let stackNav = $state([]); // 상세 페이지 스택 값!!

    const businessReplaceDict = $derived({
        도시형생활주택: "도생",
        지식산업센터: "지산",
        "상가/쇼핑몰": "상가",
    }); // 키워드 대체 사전

    const bannerList = $state(
        data.baseEnv.banners ? data.baseEnv.banners.split(",") : [],
    );

    const bannerLinkList = $state(
        data.baseEnv.banner_links ? data.baseEnv.banner_links.split(",") : [],
    );

    // 하단 메인 메뉴 내 페이지들 끼리는 무조건 최상단에 위치! ($scrollVal 을 0으로 초기화)
    // afterNavigate((e) => {
    //     if (e.from && e.from.route.id.includes("(app)")) {
    //         console.log('혹시?');

    //         $scrollVal = 0; // 페이지 진입시 스크롤 위치 초기화
    //     }
    // });
    onMount(() => {
        console.log($scrollVal);

        console.log($main_list["premium"]);

        $pageScrollStatus = true; // 페이지 진입시 저장된 스크롤로 이동

        if (bannerList.length > 0) {
            bannerInterval = setInterval(() => {
                nowBannerIdx++;
                if (nowBannerIdx >= bannerList.length) {
                    nowBannerIdx = 0;
                }
            }, 2500); // 예: 3초마다 변경
        }
    });

    $effect(() => {
        if ($scrollY) {
            $scrollVal = $scrollY; // 현재 스크롤 위치 저장 (페이지 벗어 날 때 까지 유지)
        }

        // 추후 스크롤 내리면서 로딩 시 적용 시키기!!!
        // if (data.currentStatus == "premium") {
        //     $main_list["premium"] = data.mainList;
        // } else if (data.currentStatus == "top") {
        //     $main_list["top"] = data.mainList;
        // } else if (data.currentStatus == "free") {
        //     const currentFreeList = untrack(() => $main_list["free"] || []);

        //     // id 기준으로 중복 체크 (실제 고유 필드명으로 변경하세요)
        //     const newUniqueItems = data.mainList.filter(
        //         (newItem) =>
        //             !currentFreeList.some(
        //                 (existing) => existing.idx === newItem.idx,
        //             ),
        //     );

        //     // 새로운 아이템이 있을 때만 업데이트
        //     if (newUniqueItems.length > 0) {
        //         $main_list["free"] = [...currentFreeList, ...newUniqueItems];
        //     }
        // }

        if ($loadingStore == true) {
            setTimeout(() => {
                $loadingStore = false;
            }, 500);
        }
    });

    onDestroy(() => {
        // 배너 자동 변경 interval 삭제
        clearInterval(bannerInterval);
    });

    function multiReplace(str, map) {
        const regex = new RegExp(Object.keys(map).join("|"), "g");
        return str.replace(regex, (match) => map[match]);
    }

    // -------------------------------------- 스크롤

    function searchFunc() {
        sessionStorage.setItem("search_val", $search_val);

        // 기존 검색어 리스트에 포함되어 있지 않거나 빈 값이 아니면 추가
        if (
            !mainSearchHistory.includes($search_val) &&
            $search_val.trim() !== ""
        ) {
            mainSearchHistory.unshift($search_val);
            if (mainSearchHistory.length > 5) {
                mainSearchHistory.pop(); // 뒤에서 삭제
            }
            const mainSearchHistoryStr = JSON.stringify(mainSearchHistory);
            localStorage.setItem("msh", mainSearchHistoryStr);
        }

        searchInput.blur();
        invalidateAll();
        $loadingStore = true;
    }

    function addWithLimit(arr, value, limit = 5) {
        arr.unshift(value); // 앞에 추가
        if (arr.length > limit) {
            arr.pop(); // 뒤에서 삭제
        }
        return arr;
    }

    // 스택 (상세 페이지) 열기!!
    // function openDetail(item) {
    //     console.log(item);

    //     stackNav.push("detail", { item });
    // }

    function goToDetail(e) {
        console.log(e);

        const item = e;

        stackNav.push("detail", { item });
    }
</script>

<svelte:head>
    <SeoMeta seoValue={seoVal}></SeoMeta>
</svelte:head>

<!-- 상세 페이지 스택 여기에!!! -->
<StackNavigator bind:this={stackNav} let:screenType let:props let:pop>
    <DetailPage item={props.item} {pop} />
</StackNavigator>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore event_directive_deprecated -->
<div class="pt-16 px-3 max-w-5xl mx-auto">
    <div class="mb-2 text-center relative">
        {#if searchFocus && mainSearchHistory.length > 0}
            <div class="absolute w-full z-20" style="top:38px">
                <div
                    class="w-[90%] search-list bg-white mx-auto border-b border-x border-gray-300 rounded-b-lg text-left text-sm p-2"
                >
                    {#each mainSearchHistory as val}
                        <div
                            class="py-2 hover:bg-gray-100 cursor-pointer"
                            data-keyword={val}
                            on:mousedown={(e) => {
                                $search_val = e.target.dataset.keyword;
                                sessionStorage.setItem(
                                    "search_val",
                                    $search_val,
                                );
                                invalidateAll();
                                $loadingStore = true;
                            }}
                            on:touchstart={(e) => {
                                $search_val = e.target.dataset.keyword;
                                sessionStorage.setItem(
                                    "search_val",
                                    $search_val,
                                );
                                invalidateAll();
                                $loadingStore = true;
                            }}
                        >
                            {val}
                        </div>
                    {/each}
                </div>
            </div>
        {/if}
        <form on:submit|preventDefault={searchFunc}>
            <label
                class="flex items-center border border-gray-500 w-[95%] px-3 rounded-full bg-gray-100 mx-auto"
                class:bg-white={searchFocus}
            >
                <input
                    type="text"
                    class="w-[95%] py-2 text-sm outline-none"
                    bind:value={$search_val}
                    bind:this={searchInput}
                    on:focusin={() => {
                        searchFocus = true;
                        mainSearchHistory = JSON.parse(
                            localStorage.getItem("msh") || "[]",
                        );
                    }}
                    on:focusout={() => {
                        searchFocus = false;
                    }}
                />
                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button class="cursor-pointer mr-1">
                    <svg
                        width="30px"
                        height="30px"
                        viewBox="0 -0.5 25 25"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M7.30524 15.7137C6.4404 14.8306 5.85381 13.7131 5.61824 12.4997C5.38072 11.2829 5.50269 10.0233 5.96924 8.87469C6.43181 7.73253 7.22153 6.75251 8.23924 6.05769C10.3041 4.64744 13.0224 4.64744 15.0872 6.05769C16.105 6.75251 16.8947 7.73253 17.3572 8.87469C17.8238 10.0233 17.9458 11.2829 17.7082 12.4997C17.4727 13.7131 16.8861 14.8306 16.0212 15.7137C14.8759 16.889 13.3044 17.5519 11.6632 17.5519C10.0221 17.5519 8.45059 16.889 7.30524 15.7137V15.7137Z"
                            stroke="#4F4F4F"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                        <path
                            d="M11.6702 7.20292C11.2583 7.24656 10.9598 7.61586 11.0034 8.02777C11.0471 8.43968 11.4164 8.73821 11.8283 8.69457L11.6702 7.20292ZM13.5216 9.69213C13.6831 10.0736 14.1232 10.2519 14.5047 10.0904C14.8861 9.92892 15.0644 9.4888 14.9029 9.10736L13.5216 9.69213ZM16.6421 15.0869C16.349 14.7943 15.8741 14.7947 15.5815 15.0879C15.2888 15.381 15.2893 15.8559 15.5824 16.1485L16.6421 15.0869ZM18.9704 19.5305C19.2636 19.8232 19.7384 19.8228 20.0311 19.5296C20.3237 19.2364 20.3233 18.7616 20.0301 18.4689L18.9704 19.5305ZM11.8283 8.69457C12.5508 8.61801 13.2384 9.02306 13.5216 9.69213L14.9029 9.10736C14.3622 7.83005 13.0496 7.05676 11.6702 7.20292L11.8283 8.69457ZM15.5824 16.1485L18.9704 19.5305L20.0301 18.4689L16.6421 15.0869L15.5824 16.1485Z"
                            fill="#4F4F4F"
                        />
                    </svg>
                </button>

                <!-- svelte-ignore a11y_consider_explicit_label -->
                <button
                    class="cursor-pointer"
                    type="button"
                    on:click={() => {
                        sessionStorage.removeItem("search_val");
                        invalidateAll();
                        $loadingStore = true;
                    }}
                >
                    <svg
                        fill="#4F4F4F"
                        width="25px"
                        height="25px"
                        viewBox="0 0 56 56"
                        xmlns="http://www.w3.org/2000/svg"
                        ><path
                            d="M 27.9999 51.9063 C 41.0546 51.9063 51.9063 41.0781 51.9063 28 C 51.9063 14.9453 41.0312 4.0937 27.9765 4.0937 C 14.8983 4.0937 4.0937 14.9453 4.0937 28 C 4.0937 41.0781 14.9218 51.9063 27.9999 51.9063 Z M 27.9999 47.9219 C 16.9374 47.9219 8.1014 39.0625 8.1014 28 C 8.1014 16.9609 16.9140 8.0781 27.9765 8.0781 C 39.0155 8.0781 47.8983 16.9609 47.9219 28 C 47.9454 39.0625 39.0390 47.9219 27.9999 47.9219 Z M 19.9843 37.9375 C 20.4999 37.9375 20.9687 37.7266 21.3202 37.3516 L 27.9765 30.6719 L 34.6327 37.3516 C 34.9843 37.7031 35.4530 37.9375 35.9921 37.9375 C 37.0234 37.9375 37.8671 37.0703 37.8671 36.0390 C 37.8671 35.5 37.6562 35.0547 37.3046 34.7031 L 30.6483 28.0469 L 37.3280 21.3437 C 37.7030 20.9453 37.8905 20.5469 37.8905 20.0312 C 37.8905 18.9766 37.0468 18.1563 36.0155 18.1563 C 35.5234 18.1563 35.1014 18.3203 34.7030 18.7188 L 27.9765 25.4219 L 21.2733 18.7422 C 20.9218 18.3672 20.4999 18.2031 19.9843 18.2031 C 18.9296 18.2031 18.1093 19 18.1093 20.0547 C 18.1093 20.5703 18.2968 21.0156 18.6718 21.3672 L 25.3280 28.0469 L 18.6718 34.7266 C 18.2968 35.0547 18.1093 35.5234 18.1093 36.0390 C 18.1093 37.0703 18.9296 37.9375 19.9843 37.9375 Z"
                        /></svg
                    >
                </button>
            </label>
        </form>
    </div>

    {#if bannerList.length > 0}
        <div class=" border border-gray-300 rounded-lg p-2">
            <!-- $page -->
            {#if bannerLinkList[nowBannerIdx].includes($page.url.hostname)}
                <a href={bannerLinkList[nowBannerIdx]}>
                    <img
                        class="mx-auto"
                        src={`${public_img_bucket}${bannerList[nowBannerIdx]}`}
                        alt=""
                    />
                </a>
            {:else}
                <a href={bannerLinkList[nowBannerIdx]} target="_blank">
                    <img
                        class="mx-auto"
                        src={`${public_img_bucket}${bannerList[nowBannerIdx]}`}
                        alt=""
                    />
                </a>
            {/if}
        </div>
    {/if}

    <MainLocation></MainLocation>

    <!-- 프리미엄 영역 -->
    {#if $main_list["premium"].length > 0}
        <div class="premium-area mt-5">
            <div
                class="mb-3 ml-6 text-lg font-bold text-cyan-700 flex items-center"
            >
                <span class="mr-2">
                    <i class="fa fa-bell" aria-hidden="true"></i>
                </span>
                <span class="mr-4">프리미엄</span>
                <div
                    class=" w-[50%] md:w-[40%] rounded-full"
                    style="height: 2px; background-color: #007595;"
                ></div>
            </div>
            <JobPostItemList type="premium" {goToDetail}></JobPostItemList>
        </div>
    {/if}

    {#if $main_list["top"].length > 0}
        <div class="top-area mt-5">
            <div
                class="mb-3 ml-6 text-lg font-bold text-cyan-700 flex items-center"
            >
                <span class="mr-2">
                    <i class="fa fa-bell" aria-hidden="true"></i>
                </span>
                <span class="mr-4">지역 TOP</span>
                <div
                    class=" w-[50%] md:w-[40%] rounded-full"
                    style="height: 2px; background-color: #007595;"
                ></div>
            </div>
            <JobPostItemList type="top" {goToDetail}></JobPostItemList>
        </div>
    {/if}

    {#if $main_list["free"].length > 0}
        <div class="free-area mt-5">
            <div
                class="mb-3 ml-6 text-lg font-bold text-cyan-700 flex items-center"
            >
                <span class="mr-2">
                    <i class="fa fa-bell" aria-hidden="true"></i>
                </span>
                <span class="mr-4">일반 공고</span>
                <div
                    class=" w-[50%] md:w-[40%] rounded-full"
                    style="height: 2px; background-color: #007595;"
                ></div>
            </div>

            <JobPostItemList type="free" {goToDetail}></JobPostItemList>
        </div>
    {/if}
</div>
