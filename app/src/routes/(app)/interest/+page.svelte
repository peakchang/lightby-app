<script>
    import { user_info } from "$lib/stores/stores";
    import { goto, invalidateAll, afterNavigate } from "$app/navigation";
    import { navigating, page } from "$app/stores";
    import { onMount } from "svelte";
    import InterestPostItem from "$lib/components/InterestPostItem.svelte";

    import {
        interestTabNum,
        scrollY,
        scrollVal,
        pageScrollStatus,
    } from "$lib/stores/stores.js";

    let { data } = $props();

    let interestStatus = $state(false);
    let postList = $state([]);
    let statusMessage = $state("");

    // 하단 메인 메뉴 내 페이지들 끼리는 무조건 최상단에 위치! ($scrollVal 을 0으로 초기화)
    afterNavigate((e) => {
        if (e.from && e.from.route.id.includes("(app)")) {
            $scrollVal = 0; // 페이지 진입시 스크롤 위치 초기화
        }
    });

    onMount(() => {
        $pageScrollStatus = true; // 페이지 진입시 저장된 스크롤로 이동
    });

    $effect(() => {
        $scrollVal = $scrollY; // 현재 스크롤 위치 저장 (페이지 벗어 날 때 까지 유지)

        // 관심 지역, 찜한 목록 상태 초기화
        interestStatus = data.interestStatus;
        postList = data.postList;
        statusMessage = data.statusMessage;
    });

    let tabArea = $derived({});

    function changeTab(e) {
        $interestTabNum = e.target.dataset.num;

        for (const el of tabArea.children) {
            el.classList.remove("tab-active");
        }
        tabArea.children[e.target.dataset.num].classList.add("tab-active");

        invalidateAll();
    }
</script>

<!-- svelte-ignore event_directive_deprecated -->
<div class="pb-32 suit-font">
    {#if $user_info.idx}
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore event_directive_deprecated -->
        <div class="tab-area cursor-pointer pt-20" bind:this={tabArea}>
            <div
                class:tab-active={$interestTabNum == 0}
                data-num="0"
                on:click={changeTab}
            >
                관심 지역
            </div>
            <div
                data-num="1"
                class:tab-active={$interestTabNum == 1}
                on:click={changeTab}
            >
                찜한 목록
            </div>
            <!-- <div
                data-num="2"
                class:tab-active={$interestTabNum == 2}
                on:click={changeTab}
            >
                내 주변 현장
            </div> -->
        </div>

        <!-- svelte-ignore event_directive_deprecated -->

        {#if $interestTabNum == 0 || $interestTabNum == 1}
            {#if interestStatus}
                <div
                    class="z-50 suit-font px-3 mt-5"
                    style="padding-bottom:70px"
                >
                    {#each postList as post}
                        <InterestPostItem {post}></InterestPostItem>
                    {/each}
                </div>
            {:else if !interestStatus}
                <div class="text-center mt-20">
                    <div class=" text-6xl text-blue-500">
                        <i class="fa fa-frown-o" aria-hidden="true"></i>
                    </div>
                    <div class="mt-3 whitespace-pre-line">
                        {statusMessage}
                    </div>
                </div>
            {/if}
        {:else if $interestTabNum == 2}
            <div class="pt-10 pb-32 suit-font px-3">
                <div
                    class="text-center text-xl bg-green-700 text-white w-[80%] md:w-[50%] mx-auto py-3 rounded-full mt-20"
                >
                    준비중입니다.
                </div>

                <div class="mt-10 text-center">
                    <p>
                        인재찾기 서비스는 모ㅗㅁ를 위해 모모 하는 서비스 입니다.
                    </p>
                    <p>asdflijasldijfliasjilfjasildjfliasjfliajf</p>
                    <p>aslidfjalisdjflijasdlijfilasjdlfijasdf</p>
                </div>
            </div>
        {/if}
    {:else}
        <div class="pt-40 text-center">
            <div class=" text-green-700 text-4xl">
                <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
            </div>
            <div class="text-xl font-bold mt-5">
                로그인이 필요한 페이지 입니다.
            </div>
            <div class="text-sm mt-5">
                <p>관심현장은 로그인 후,</p>
                <p>마이페이지에서 지역 설정을 하시거나</p>
                <p>상세페이지에서 찜한 목록이 표시됩니다.</p>
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
    .tab-area {
        display: flex;
        justify-content: center;
        gap: 10%;
        color: #939393;
    }
    .tab-active {
        color: black;
        border-bottom: 3px solid black;
        padding-bottom: 5px;
    }
</style>
