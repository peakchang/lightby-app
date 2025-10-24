<script>
    import { afterNavigate } from "$app/navigation";
    import { onMount } from "svelte";
    import {
        scrollY,
        scrollVal,
        pageScrollStatus,
    } from "$lib/stores/stores.js";

    // 하단 메인 메뉴 내 페이지들 끼리는 무조건 최상단에 위치! ($scrollVal 을 0으로 초기화)
    afterNavigate((e) => {
        console.log(e);

        if (e.from && e.from.route.id.includes("(app)")) {
            $scrollVal = 0;
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

<div class="pt-20 pb-32 suit-font px-3">
    <div
        class="text-center text-lg md:text-xl font-bold bg-green-700 text-white w-[80%] md:w-[50%] mx-auto py-3 rounded-full mt-20"
    >
        준비중입니다.
    </div>

    <div class="mt-10 text-center text-sm md:text-base">
        <p>
            <span class=" text-blue-300">
                <i class="fa fa-users" aria-hidden="true"></i>
            </span>
            인재찾기 서비스는
        </p>
        <p>대행사 · 본부장 · 팀장을 한곳에 연결하는</p>
        <p>오직 단 하나의 플랫폼입니다.</p>
        <p><br /></p>
        <p>지금, 모두가 기다리는 기능!</p>
        <p>곧 당신의 팀에 가장 강력한 인재가 연결됩니다.</p>
        <p><br /></p>
        <p>⏳ 현재 빠르게 준비 중입니다.</p>
        <p>오픈과 동시에 알림받고 싶다면 지금 기대해주세요!</p>
    </div>
</div>
