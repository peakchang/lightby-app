<script>
    import { afterNavigate, beforeNavigate, goto } from "$app/navigation";
    import moment from "moment-timezone";

    import { raiseViewCount } from "$lib/lib.js";
    import { browser } from "$app/environment";
    import { onMount } from "svelte";

    import {
        prev,
        user_info,
        nonMemberViewLimitNum,
        viewLimitAlertModal,
        scrollY,
        scrollVal,
        pageScrollStatus,
    } from "$lib/stores/stores.js";

    let { data } = $props();
    let boardList = $state([]);
    boardList = data.boardList;

    // 하단 메인 메뉴 내 페이지들 끼리는 무조건 최상단에 위치! ($scrollVal 을 0으로 초기화)
    afterNavigate((e) => {
        if (e.from && e.from.route.id.includes("(app)")) {
            if (!e.from.route.id.includes("showfee")) {
                $scrollVal = 0;
            }
        }
    });

    onMount((e) => {
        $pageScrollStatus = true; // 페이지 진입시 저장된 스크롤로 이동
    });

    $effect(() => {
        if ($scrollY) {
            $scrollVal = $scrollY; // 현재 스크롤 위치 저장 (페이지 벗어 날 때 까지 유지)
        }
    });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore event_directive_deprecated -->
<div class=" pt-10 pb-32 px-3">
    {#each boardList as boardData}
        <div
            class="border-b py-5 px-3 border-gray-300 cursor-pointer"
            on:click={() => {
                // 비회원 조회수 제한!!
                if (!$user_info.idx) {
                    if ($nonMemberViewLimitNum > 3) {
                        $viewLimitAlertModal = true;
                        return;
                    }
                    $nonMemberViewLimitNum = $nonMemberViewLimitNum + 1;
                }

                raiseViewCount("board_fee", boardData.idx);
                $prev = "/showfee";
                goto(`/showfee/${boardData.idx}`);
            }}
        >
            <div class="mt-1 font-semibold">
                {boardData.subject}
            </div>
            <div class="mt-1 ellipsis whitespace-pre-wrap">
                {boardData.content}
            </div>
            <div class=" mt-3 flex justify-end flex-wrap items-center">
                <span class="text-xs md:text-sm">{boardData.nickname}</span>
                <span class="mx-1.5">|</span>
                <span class="flex items-center gap-1 text-sm">
                    <i class="fa fa-heart-o" aria-hidden="true"></i>
                    <span
                        class="px-1.5 py-0.5 rounded-full text-[10px] md:text-xs"
                    >
                        {boardData.post_likes}
                    </span>
                </span>
                <span class="mx-1">|</span>

                <span class="flex items-center gap-1 text-sm">
                    <i class="fa fa-commenting text-gray-500" aria-hidden="true"
                    ></i>
                    <span
                        class="px-2 py-0.5 rounded-full text-[10px] md:text-xs"
                    >
                        {boardData.reply_count}
                    </span>
                </span>

                <span class="mx-1">|</span>

                <span class="text-xs md:text-sm">
                    {moment(boardData.created_at).format("YY/MM/DD HH:mm")}
                </span>
            </div>
        </div>
    {/each}
</div>

<style>
    .ellipsis {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
