<script>
    import axios from "axios";

    import KakaoMap from "$lib/components/kakaoMap.svelte";
    import DetailMenu from "$lib/components/DetailMenu.svelte";
    import CustomModal from "$lib/components/CustomModal.svelte";

    import { goto } from "$app/navigation";
    import { onDestroy, onMount } from "svelte";
    import { page } from "$app/stores";
    import { browser } from "$app/environment";

    import {
        favorateBool,
        user_info,
        toastStore,
        scrollY,
    } from "$lib/stores/stores.js";

    import { public_img_bucket, img_bucket, back_api } from "$lib/const";

    let { pop, item } = $props();

    let headerShowBool = $state(true); // 스크롤 내릴시 상단 메뉴 보이게 하기 위한 변수!
    let showBool = $state(true); // 처음 페이지 로딩시 위로 올라가는 잔상 없애기 위해!

    let detail = $state({});

    const detailContent = {};

    let mainImage = $state([]);
    let shareModal = $state(false);

    let imgSwiper = $state({});

    let alertModalBool = $state(false);

    onMount(() => {
        console.log(`onMounted???? // ${item}`);

        // $favorateBool = data.favorateBool;

        if (detailContent.imgs) {
            mainImage = detailContent.imgs.split(",");
        }

        // 스와이퍼 셋팅
        imgSwiper = new Swiper(".mySwiper", {
            loop: true,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            autoplay: {
                delay: 2500,
                disableOnInteraction: false,
            },
        });
    });

    $effect(() => {
        console.log($scrollY);
        if ($scrollY != 0) {
            // 스크롤 조금이라도 움직이면 hidden 해제!
            showBool = false;
        }
        // 스크롤이 250 이상으로 내려가면 애니메이션 적용!
        if ($scrollY > 250) {
            headerShowBool = false;
        } else {
            headerShowBool = true;
        }
    });

    function openShareModal(e) {
        shareModal = true;
    }

    // 포스트 삭제!!

    async function deletePost() {
        try {
            const res = await axios.post(`${back_api}/regist/delete`, {
                delImgs: detailContent.imgs,
                delThumbnail: detailContent.thumbnail,
                idx: detailContent.idx,
            });
        } catch (error) {
            console.error(error.message);
        }

        if ($page.url.searchParams.get("prev") == "my") {
            goto("/manage_board");
        } else {
            goto("/");
        }
    }
</script>

<!-- <svelte:window bind:scrollY={y} /> -->
<div
    class="fixed top-0 left-0 w-full z-50 slide-menu"
    class:hidden={showBool}
    class:show={!headerShowBool}
>
    <div class="max-w-[530px] mx-auto bg-white">
        <DetailMenu {openShareModal} />
    </div>
</div>
<!-- svelte-ignore event_directive_deprecated -->
<div class="fixed bottom-0 left-0 w-full z-20">
    <div class="max-w-5xl mx-auto">
        <div
            class="flex gap-2 justify-center bg-white pt-3 pb-3 border-t border-gray-200"
        >
            <a href="TEL:{detailContent.phone}" class="w-1/4">
                <button class="btn btn-info btn-sm w-full text-white">
                    <i class="fa fa-phone" aria-hidden="true"></i>
                    전화하기
                </button>
            </a>

            <a
                href="SMS:{detailContent.phone}?body=번개분양 보고 연락 드렸습니다."
                class="w-1/4"
            >
                <button class="btn btn-success btn-sm w-full text-white">
                    <i class="fa fa-envelope-o" aria-hidden="true"></i>
                    문자하기
                </button>
            </a>

            <button
                class="btn btn-warning btn-sm w-1/4 text-white"
                on:click={() => {
                    shareModal = true;
                }}
            >
                <i class="fa fa-envelope-o" aria-hidden="true"></i>
                공유하기
            </button>
        </div>

        <!-- 버튼들~~~ (전화하기 / 문자하기 / 공유하기)
        - 문자하기 버튼 클릭하면 양식 > 현장명 + 번개분양 보고 문의드립니다.
        - 공유하기는 카카오 공유 / 문자공유(문자로 링크 보내기) / 링크복사 2가지 -->
    </div>
</div>

<!-- svelte-ignore event_directive_deprecated -->
<CustomModal bind:visible={shareModal}>
    <div class="flex justify-center items-center gap-3">
        <button
            class="border border-gray-400 p-2 rounded-md text-gray-600 cursor-pointer"
            on:click={() => {
                navigator.clipboard
                    .writeText($page.url.href)
                    .then(() =>
                        toastStore.set({
                            show: true,
                            message: "주소가 복사되었습니다",
                            color: "#53C14B",
                        }),
                    )
                    .catch((err) =>
                        toastStore.set({
                            show: true,
                            message: "주소 복사에 실패 했습니다.",
                            color: "#53C14B",
                        }),
                    );
            }}
        >
            <div>
                <i class="fa fa-link" aria-hidden="true"></i>
            </div>
            <div class="text-xs md:text-sm">주소복사</div>
        </button>
    </div>
</CustomModal>
<!-- svelte-ignore event_directive_deprecated -->
<CustomModal bind:visible={alertModalBool}>
    <div class="text-center">
        <div class=" text-red-500 text-3xl mb-5">
            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
        </div>

        {#if detailContent.product == "free"}
            <div class="mb-5">
                <p>삭제되는 내용은 복구가 불가합니다.</p>
                <p>진행 하시겠습니까?</p>
            </div>
        {:else}
            <div class="mb-5">
                <p>삭제한 내용은 복구가 불가하며</p>
                <p>결제하신 내역까지 전부 사라지게 됩니다.</p>
                <p>진행 하시겠습니까?</p>
            </div>
        {/if}
        <div class="flex justify-center items-center gap-3">
            <button class="btn btn-error w-1/3 text-white" on:click={deletePost}
                >삭제</button
            >
            <button class="btn btn-active w-1/3">취소</button>
        </div>
    </div>
</CustomModal>

<DetailMenu {openShareModal} />

<!-- svelte-ignore event_directive_deprecated -->
<div class=" mb-8">
    {#if detailContent.user_id == $user_info.idx}
        <div class="text-right my-3">
            <button
                class="btn btn-info text-white btn-sm"
                on:click={() => {
                    goto(`/joboffer?modifyidx=${detailContent.idx}`);
                }}
            >
                내 글 수정
            </button>
            <button
                class="btn btn-error text-white btn-sm"
                on:click={() => {
                    alertModalBool = true;
                }}
            >
                내 글 삭제
            </button>
        </div>
    {/if}

    {#if mainImage.length == 0}
        <div></div>
    {:else if mainImage.length == 1}
        <div class="">
            <img src={`${public_img_bucket}${mainImage[0]}`} alt="" />
        </div>
    {:else}
        <div class="swiper mySwiper">
            <div class="swiper-wrapper items-center">
                {#each mainImage as img, idx}
                    <div class="swiper-slide">
                        <div class=" img-area">
                            <img src={`${public_img_bucket}${img}`} alt="" />
                        </div>
                    </div>
                {/each}
            </div>
            <div class="swiper-button-next"></div>
            <div class="swiper-button-prev"></div>
        </div>
    {/if}
</div>

<div class="bg-white rounded-lg detail-page">
    <div class="font-bold text-xl text-center">{detailContent.subject}</div>
    <div class="mt-3 px-3">
        <div>
            <span class="font-bold">현장 포인트&nbsp;:&nbsp;</span>
            {detailContent.point}
        </div>
        <div class="mt-3">
            <span class="font-bold"> 전화번호&nbsp;:&nbsp;</span>
            {detailContent.phone}
        </div>
        <div class="flex items-center gap-0.5 mt-5 text-sm">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 384 512"
                width="16"
                height="16"
                ><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path
                    d="M297.2 248.9C311.6 228.3 320 203.2 320 176c0-70.7-57.3-128-128-128S64 105.3 64 176c0 27.2 8.4 52.3 22.8 72.9c3.7 5.3 8.1 11.3 12.8 17.7c0 0 0 0 0 0c12.9 17.7 28.3 38.9 39.8 59.8c10.4 19 15.7 38.8 18.3 57.5L109 384c-2.2-12-5.9-23.7-11.8-34.5c-9.9-18-22.2-34.9-34.5-51.8c0 0 0 0 0 0s0 0 0 0c-5.2-7.1-10.4-14.2-15.4-21.4C27.6 247.9 16 213.3 16 176C16 78.8 94.8 0 192 0s176 78.8 176 176c0 37.3-11.6 71.9-31.4 100.3c-5 7.2-10.2 14.3-15.4 21.4c0 0 0 0 0 0s0 0 0 0c-12.3 16.8-24.6 33.7-34.5 51.8c-5.9 10.8-9.6 22.5-11.8 34.5l-48.6 0c2.6-18.7 7.9-38.6 18.3-57.5c11.5-20.9 26.9-42.1 39.8-59.8c0 0 0 0 0 0s0 0 0 0s0 0 0 0c4.7-6.4 9-12.4 12.7-17.7zM192 128c-26.5 0-48 21.5-48 48c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-44.2 35.8-80 80-80c8.8 0 16 7.2 16 16s-7.2 16-16 16zm0 384c-44.2 0-80-35.8-80-80l0-16 160 0 0 16c0 44.2-35.8 80-80 80z"
                /></svg
            >
            TIP : 번개분양을 보고 연락드렸다고 하시면 보다 상담이 쉬워집니다.
        </div>
        <!-- svelte-ignore event_directive_deprecated -->
        <!-- <div class="mt-4 flex gap-2 justify-center">
            <button
                class="btn btn-info btn-sm w-1/3 text-white"
                on:click={contactCall}
            >
                <i class="fa fa-phone" aria-hidden="true"></i>
                전화하기
            </button>
            <button
                class="btn btn-success btn-sm w-1/3 text-white"
                on:click={contactSms}
            >
                <i class="fa fa-envelope-o" aria-hidden="true"></i>
                문자하기
            </button>
        </div> -->
    </div>
</div>

<div class="mt-10 p-3 bg-white rounded-lg">
    <div class="text-lg">
        <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
        <span>채용정보</span>
    </div>

    <div class="my-3 font-semibold text-lg">기본정보</div>
    <div class="leading-loose">
        <p>대행사 : {detailContent.agency}</p>
        <p>담당자 성함 : {detailContent.name}</p>
        <p>
            모집 업종 : {detailContent.business
                ? detailContent.business.replace(",", " / ")
                : ""}
        </p>
        <p>
            모집 직종 : {detailContent.occupation
                ? detailContent.occupation.replace(",", " / ")
                : ""}
        </p>
        <p>경력 : {detailContent.career}</p>
        <p>인원 : {detailContent.number_people}</p>
    </div>

    <div class="my-3 font-semibold text-lg">급여 및 영업지원 정보</div>
    <div class="leading-loose">
        <p>수수료 : {detailContent.fee_type} {detailContent.fee}</p>
        <p>
            일비 : {detailContent.daily_expense
                ? detailContent.daily_expense
                : "없음"}
        </p>
        <p>
            숙소비 : {detailContent.sleep_expense
                ? detailContent.sleep_expense
                : "없음"}
        </p>
        <p>
            프로모션 : {detailContent.promotion
                ? detailContent.promotion
                : "없음"}
        </p>
        <p>
            기본급여 : {detailContent.base_pay
                ? detailContent.base_pay
                : "없음"}
        </p>
    </div>
</div>

<div class="mt-3 p-3 bg-white rounded-lg">
    <div class="text-lg">
        <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
        <span>상세정보</span>
    </div>
    <div class="leading-relaxed mt-3 whitespace-pre-wrap">
        {detailContent.detail_content ? detailContent.detail_content : "-"}
    </div>
</div>

<div class="mt-3 p-3 bg-white rounded-lg">
    <div class="text-lg">
        <i class="fa fa-pencil-square-o" aria-hidden="true"></i>
        <span>근무지역</span>
    </div>

    <div>
        {detailContent.res_addr}
    </div>

    <div
        class="mt-2 h-72 border w-full text-sm border-sky-400 rounded-md overflow-hidden"
    >
        <KakaoMap
            getAddress={detailContent.addr}
            phText="근무지"
            height="300px"
        />
    </div>
</div>

<!-- <div class="detail-page">
    <header>
        <button on:click={pop}>← 뒤로</button>
        <h1>상세{item}</h1>
        asdfasdfasdfasdf
    </header>
    <div class="content"></div>
</div> -->

<style>
    .detail-page {
        padding: var(--safe-top) 10px var(--safe-bottom) 10px;
    }
    .swiper {
        width: 100%;
        height: 100%;
    }

    .swiper-slide {
        text-align: center;
        font-size: 18px;
        background: white;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .swiper-slide img {
        display: block;
        width: 100%;
        /* height: 100%; */
        object-fit: cover;
    }

    .slide-menu {
        transform: translateY(-100%);
        transition: transform 0.3s ease;
    }

    .slide-menu.show {
        transform: translateY(0);
    }
</style>
