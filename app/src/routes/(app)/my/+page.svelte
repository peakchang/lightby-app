<script>
    import CustomModal from "$lib/components/CustomModal.svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import { navigating, page } from "$app/stores";
    import { onMount } from "svelte";
    import axios from "axios";

    import {
        regions,
        businessCategorys,
        jobCategorys,
        back_api,
    } from "$lib/const.js";

    import {
        user_info,
        toastStore,
        pageScrollStatus,
    } from "$lib/stores/stores";

    let { data } = $props();

    console.log(data);

    let userInfo = $derived({});

    // 관심 정보
    let location = $state([]);
    let business = $state([]);
    let occupation = $state([]);

    // 마지막 하나 없애는걸 방지하기 위해서!
    let selectVal = $state("");
    let lastData = $state("");
    onMount(() => {
        $pageScrollStatus = false; // 최상위 고정

        userInfo = data.userInfo;
        if (userInfo.interest) {
            const interestJson = JSON.parse(userInfo.interest);
            location = interestJson.location;
            business = interestJson.business;
            occupation = interestJson.occupation;
        }
    });

    $effect(() => {});

    async function setInterest() {
        let jsonStr = "";
        if (
            location.length > 0 ||
            business.length > 0 ||
            occupation.length > 0
        ) {
            const setJson = { location, business, occupation };
            jsonStr = JSON.stringify(setJson);
        } else {
            jsonStr = "";
        }

        try {
            const res = await axios.post(`${back_api}/update_interest`, {
                idx: $user_info.idx,
                jsonStr,
            });

            toastStore.set({
                show: true,
                message: "관심 지역 설정이 완료 되었습니다.",
                color: "#4374D9",
            });

            invalidateAll();
        } catch (error) {
            alert("에러 발생! 관리자에게 문의하세요!");
        }
    }

    let interestModalBool = $state(false);
    let alertModalBool = $state(false);
</script>

<!-- 관심지역 설정 모달 -->
<CustomModal bind:visible={alertModalBool} closeBtn={false}>
    <div class="py-5 text-center">⏳ 현재 빠르게 준비 중입니다.</div>
</CustomModal>

<!-- 관심지역 설정 모달 -->
<CustomModal bind:visible={interestModalBool} closeBtn={false}>
    <!-- svelte-ignore event_directive_deprecated -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div class="">
        <div class="text-center mt-5 mb-3 text-sm">
            <p>회원님만을 위한 맞춤 알림을 받아보세요✨</p>
            <p>새로운 현장이나 조건이 바뀌면, 가장 먼저 알려드릴게요!</p>
        </div>
        <div class="my-3">
            <p>🌍 근무 가능한 지역은 어디인가요?</p>
            <p class="text-sm ml-7">내 주변 현장이 뜰 때 바로 알려드려요 💌</p>
        </div>

        <div></div>
        <div class="grid grid-cols-2 gap-1">
            {#each regions as region, idx}
                <label
                    class="button-checkbox"
                    class:disabled={location.length === 1 &&
                        location.includes(region)}
                    on:click={(e) => {
                        if (
                            location.length === 1 &&
                            location.includes(region)
                        ) {
                            toastStore.set({
                                show: true,
                                message:
                                    "근무지역은 최소 1개 이상 선택 되어야 합니다.",
                                color: "#CC3D3D",
                            });
                        }
                    }}
                >
                    <input
                        type="checkbox"
                        hidden
                        value={region}
                        on:change={() => {
                            selectVal = region;
                        }}
                        bind:group={location}
                        disabled={location.length === 1 &&
                            location.includes(region)}
                    />
                    <div>{region}</div>
                </label>
            {/each}
        </div>

        <div class="my-3">
            <p>🏢 관심있는 업종을 선택 해 주세요.</p>
            <p class="text-sm ml-7">
                내 취향에 맞는 현장만 쏙쏙 추천해 드릴게요 🎯
            </p>
        </div>
        <div class="grid grid-cols-2 gap-1">
            {#each businessCategorys as val, idx}
                <label
                    class="button-checkbox"
                    class:disabled={business.length === 1 &&
                        business.includes(val)}
                    on:click={(e) => {
                        if (business.length === 1 && business.includes(val)) {
                            toastStore.set({
                                show: true,
                                message:
                                    "관심업종은 최소 1개 이상 선택 되어야 합니다.",
                                color: "#CC3D3D",
                            });
                        }
                    }}
                >
                    <input
                        type="checkbox"
                        hidden
                        value={val}
                        on:change={() => {
                            selectVal = val;
                        }}
                        bind:group={business}
                        disabled={business.length === 1 &&
                            business.includes(val)}
                    />
                    <div>{val}</div>
                </label>
            {/each}
        </div>

        <div class="my-3">
            <p>💼 지금 회원님의 역할은 무엇인가요?</p>
            <p class="text-sm ml-7">
                한 단계 높은 직종까지 살짝 욕심내면, 더 많은 기회가 찾아올
                거예요🌱
            </p>
        </div>
        <div class="grid grid-cols-2 gap-1">
            {#each jobCategorys as job, idx}
                <label
                    class="button-checkbox"
                    class:disabled={occupation.length === 1 &&
                        occupation.includes(job)}
                    on:click={(e) => {
                        if (
                            occupation.length === 1 &&
                            occupation.includes(job)
                        ) {
                            toastStore.set({
                                show: true,
                                message:
                                    "관심직종은 최소 1개 이상 선택 되어야 합니다.",
                                color: "#CC3D3D",
                            });
                        }
                    }}
                >
                    <input
                        type="checkbox"
                        hidden
                        value={job}
                        on:change={() => {
                            selectVal = job;
                            console.log(selectVal);
                        }}
                        bind:group={occupation}
                        disabled={occupation.length === 1 &&
                            occupation.includes(job)}
                    />
                    <div>{job}</div>
                </label>
            {/each}
        </div>
        <div class="mt-5 text-center">
            <!-- svelte-ignore event_directive_deprecated -->
            <button
                class="btn btn-success w-1/2 text-white"
                on:click={setInterest}
            >
                등록하기
            </button>
        </div>
    </div>
</CustomModal>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore event_directive_deprecated -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<div class="z-50 suit-font" style="padding-bottom:70px">
    {#if $user_info.idx}
        <div class="bg-white p-5 rounded-lg pt-20">
            <div class="flex gap-7">
                <div class="w-20 h-20 relative">
                    <button
                        class="absolute bottom-[-10px] right-[-10px] w-7 h-7 border-2 rounded-full bg-white text-xs text-gray-500 cursor-pointer"
                        on:click={() => {
                            goto("/auth/manage");
                        }}
                    >
                        <i class="fa fa-camera" aria-hidden="true"></i>
                    </button>
                    <div
                        class="border-2 border-gray-300 rounded-xl overflow-hidden"
                    >
                        {#if userInfo.profile_thumbnail}
                            <img src={userInfo.profile_thumbnail} alt="" />
                        {:else}
                            <img src="/profile-base.png" alt="" />
                        {/if}
                    </div>
                </div>

                <div class="flex flex-col justify-center gap-1">
                    <span>
                        <span class="text-lg font-semibold"
                            >{userInfo.nickname}</span
                        >
                        <span>님</span>
                    </span>
                    <span
                        class="text-sm cursor-pointer"
                        on:click={() => {
                            goto("/auth/manage");
                        }}
                    >
                        회원정보 관리
                        <i class="fa fa-angle-right" aria-hidden="true"></i>
                    </span>
                </div>
            </div>

            <div
                class="mt-10 bg-yellow-400 p-3 rounded-lg grid grid-cols-2 gap-3"
            >
                <div
                    class="flex gap-2 items-center cursor-pointer"
                    on:click={() => {
                        interestModalBool = true;
                    }}
                >
                    <div
                        class="bg-white w-7 h-7 rounded-lg flex justify-center items-center"
                    >
                        <i class="fa fa-building-o" aria-hidden="true"></i>
                    </div>
                    <div class="text-sm font-semibold">관심 설정</div>
                </div>

                <div
                    class="flex gap-2 items-center cursor-pointer"
                    on:click={() => {
                        goto("/manage_board");
                    }}
                >
                    <div
                        class="bg-white w-7 h-7 rounded-lg flex justify-center items-center text-xs"
                    >
                        {data.postCount}
                    </div>
                    <div class="text-sm font-semibold">내 글 관리</div>
                </div>

                <div
                    class="flex gap-2 items-center cursor-pointer"
                    on:click={() => {
                        goto("/auth/manage");
                    }}
                >
                    <div
                        class="bg-white w-7 h-7 rounded-lg flex justify-center items-center"
                    >
                        <i class="fa fa-user-o" aria-hidden="true"></i>
                    </div>
                    <div class="text-sm font-semibold">회원정보 관리</div>
                </div>

                <div
                    class="flex gap-2 items-center cursor-pointer"
                    on:click={() => {
                        goto("/mytalent");
                    }}
                >
                    <div
                        class="bg-white w-7 h-7 rounded-lg flex justify-center items-center"
                    >
                        <i class="fa fa-file-text-o" aria-hidden="true"></i>
                    </div>
                    <div class="text-sm font-semibold">내 인재 글 관리</div>
                </div>
            </div>
        </div>

        <div class="mt-3 bg-white p-5 rounded-lg">
            <div class="flex gap-3">
                <button
                    class="btn btn-outline w-1/2 border-gray-500 text-gray-500"
                    >로그아웃</button
                >

                <a href="/faq" class="w-full">
                    <button
                        class="btn btn-outline w-full border-gray-500 text-gray-500"
                    >
                        고객센터
                    </button>
                </a>
            </div>
        </div>
    {:else}
        <div class="pt-40 text-center">
            <div class=" text-green-700 text-4xl">
                <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
            </div>
            <div class="text-xl font-bold mt-5">
                로그인이 필요한 페이지 입니다.
            </div>
            <div class="text-sm mt-5">
                <p>
                    로그인 후, 구인 글 관리 / 관심 지역 설정 / 회원 정보 관리 등
                </p>
                <p>내 정보 관리가 가능합니다.</p>
            </div>
            <div class="mt-5">
                <a
                    href="/auth/login"
                    on:click|preventDefault={() => {
                        goto(`/auth/login?path=${$page.url.pathname}`);
                    }}
                >
                    <button class="btn btn-info btn-lg w-1/3 text-white">
                        로그인하기
                    </button>
                </a>
            </div>
        </div>
    {/if}
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
