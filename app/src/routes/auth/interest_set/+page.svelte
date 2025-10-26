<script>
    import CustomModal from "$lib/components/CustomModal.svelte";
    import { user_info, toastStore, joinStatus } from "$lib/stores/stores";
    import {
        regions,
        businessCategorys,
        jobCategorys,
        back_api,
    } from "$lib/const.js";
    import axios from "axios";
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { browser } from "$app/environment";

    import { SsgoiTransition } from "@ssgoi/svelte";

    // 관심 정보
    let location = $state([]);
    let business = $state([]);
    let occupation = $state([]);

    let alertModal = $state(false);
    let alertMessage = $state("");

    let modalLoading = $state(false);

    // let siteWrab = $state({});
    // if (browser) {
    //     siteWrab = document.querySelector(".site-wrab");
    // }

    onMount(() => {
        // 스크롤 이벤트 추가
        // if (browser) {
        // siteWrab.scrollTo(0, 0);
        // }

        if ($joinStatus["type"] == undefined) {
            goto("/");
        }
    });

    async function setInterest() {
        if (location.length == 0) {
            alertModal = true;
            alertMessage = "관심 지역을 한가지 이상 선택 해 주세요.";
            return;
        }

        if (business.length == 0) {
            alertModal = true;
            alertMessage = "관심 업종을 한가지 이상 선택 해 주세요.";
            return;
        }

        if (occupation.length == 0) {
            alertModal = true;
            alertMessage = "관심 직종을 한가지 이상 선택 해 주세요.";
            return;
        }
        console.log($joinStatus);

        const interestObj = {
            location,
            business,
            occupation,
        };

        const insertestStr = JSON.stringify(interestObj);

        console.log(insertestStr);

        try {
            if ($joinStatus["type"] == "general") {
                const res = await axios.post(`/auth/login`, {
                    id: $joinStatus["info"]["id"],
                    password: $joinStatus["info"]["password"],
                });
                $joinStatus["idx"] = res.data.userInfo.idx;
                $user_info["idx"] = res.data.userInfo.idx;
                $user_info["rate"] = res.data.userInfo.rate;
            }
            const res = await axios.post(`${back_api}/users/set_interesting`, {
                user_id: $joinStatus.idx,
                insertestStr,
            });
        } catch (error) {
        } finally {
            goto("/mytalent");

            // successMessage = "가입 완료! 번개분양을 시작합니다!";
            // successModal = true;
            // modalLoading = true;
            // setTimeout(() => {
            //     successModal = false;
            //     modalLoading = false;
            //     goto("/");
            // }, 1800);
        }
    }
</script>

<CustomModal bind:visible={alertModal} closeBtn={false}>
    <div class="text-center">
        <div class=" text-red-500 text-3xl mb-2">
            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
        </div>
        <div>{alertMessage}</div>
        {#if modalLoading}
            <div class="mt-2">
                <span class="loading loading-ring loading-xl"></span>
            </div>
        {/if}
    </div>
</CustomModal>

<SsgoiTransition id="/auth/interest_set">
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <!-- svelte-ignore event_directive_deprecated -->
    <div class="pt-10 pb-10 px-10 paperlogy">
        <div class="text-center mt-5 mb-10 text-lg font-bold">
            <p>아래 정보를 선택하시고</p>
            <p>회원님만을 위한 맞춤 알림을 받아보세요✨</p>
            <p>새로운 현장이나 조건이 바뀌면,</p>
            <p>가장 먼저 알려드릴게요!</p>
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
                class="btn btn-lg btn-success w-1/2 text-white"
                on:click={setInterest}
            >
                다음
                <i class="fa fa-arrow-right" aria-hidden="true"></i>
            </button>
        </div>
    </div>
</SsgoiTransition>

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
