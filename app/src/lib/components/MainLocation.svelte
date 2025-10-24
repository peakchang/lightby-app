<script>
    import { main_location, loadingStore } from "$lib/stores/stores.js";
    import { goto, invalidateAll } from "$app/navigation";
    import { onMount } from "svelte";
    import { regions } from "$lib/const";

    let scrollBool = $state(false);
    let startX = $state(0);
    let scrollLeft = $state(0);
    let scrollElement;

    onMount(() => {
        scrollToTab($main_location);
    });

    $effect(() => {
        if (scrollElement) {
            checkInitialPosition();
        }
    });

    // 특정 탭으로 스크롤 이동
    function scrollToTab(targetTab) {
        if (!scrollElement) return;

        const targetIndex = regions.findIndex(
            (location) => location === targetTab,
        );
        if (targetIndex === -1) {
            return;
        }

        // 각 탭의 너비가 80px이므로 해당 인덱스 * 80으로 위치 계산
        const tabWidth = 80;
        const targetPosition = targetIndex * tabWidth;

        // 탭을 중앙에 위치시키기 위해 컨테이너 너비의 절반만큼 뺌
        const containerWidth = scrollElement.clientWidth;
        const centeredPosition =
            targetPosition - containerWidth / 2 + tabWidth / 2;

        // 스크롤 범위 내로 제한
        const maxScrollLeft =
            scrollElement.scrollWidth - scrollElement.clientWidth;
        const finalPosition = Math.max(
            0,
            Math.min(maxScrollLeft, centeredPosition),
        );

        scrollElement.scrollTo({
            left: finalPosition,
        });
    }

    // 드래그 스크롤 처리 함수
    function handleDragScroll(clientX) {
        if (scrollBool && scrollElement) {
            const walk = (clientX - startX) * 2; // 스크롤 속도 조절 (2배)
            scrollElement.scrollLeft = scrollLeft - walk;
        }
    }

    // 초기 위치 체크 함수
    function checkInitialPosition() {
        if (!scrollElement) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollElement;

        const isAtLeft = scrollLeft <= 1;
        const isAtRight = scrollLeft + clientWidth >= scrollWidth - 1;

        if (isAtLeft && isAtRight) {
        } else if (isAtLeft) {
        } else if (isAtRight) {
        } else {
        }
    }

    // 스크롤 끝 감지 함수
    function checkScrollEnd() {
        if (!scrollElement) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollElement;

        const isAtLeft = scrollLeft <= 1;
        const isAtRight = scrollLeft + clientWidth >= scrollWidth - 1;

        // 왼쪽 끝 도달 (scrollLeft가 0에 가까움)
        if (isAtLeft) {
        }
        // 오른쪽 끝 도달 (scrollLeft + clientWidth >= scrollWidth)
        else if (isAtRight) {
        }
        // 중간 위치
        else {
        }
    }

    // 화살표 클릭으로 스크롤 이동
    function scrollToDirection(direction, distance = 100) {
        if (!scrollElement) return;

        const currentScrollLeft = scrollElement.scrollLeft;
        let targetScrollLeft;

        if (direction === "left") {
            targetScrollLeft = Math.max(0, currentScrollLeft - distance);
        } else if (direction === "right") {
            const maxScrollLeft =
                scrollElement.scrollWidth - scrollElement.clientWidth;
            targetScrollLeft = Math.min(
                maxScrollLeft,
                currentScrollLeft + distance,
            );
        }

        // 부드러운 스크롤
        scrollElement.scrollTo({
            left: targetScrollLeft,
            behavior: "smooth",
        });
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore event_directive_deprecated -->
<div class="wrap max-w-5xl border-y relative">
    <div
        bind:this={scrollElement}
        class="scroll__wrap"
        on:scroll={() => {
            checkScrollEnd();
        }}
        on:mousedown={(e) => {
            scrollBool = true;
            startX = e.clientX;
            scrollLeft = scrollElement.scrollLeft;
            e.preventDefault(); // 텍스트 선택 방지
        }}
        on:mouseup={() => {
            scrollBool = false;
        }}
        on:mouseleave={() => {
            scrollBool = false; // 마우스가 요소를 벗어나면 드래그 종료
        }}
        on:touchstart={(e) => {
            scrollBool = true;
            startX = e.touches[0].clientX;
            scrollLeft = scrollElement.scrollLeft;
        }}
        on:touchend={() => {
            scrollBool = false;
        }}
        on:click={(e) => {
            // 드래그 후에는 클릭 이벤트 방지
            if (Math.abs(e.clientX - startX) > 5) {
                e.preventDefault();
                e.stopPropagation();
            }
        }}
        on:mousemove={(e) => {
            e.preventDefault();
            handleDragScroll(e.clientX);
        }}
        on:touchmove={(e) => {
            e.preventDefault();
            handleDragScroll(e.touches[0].clientX);
        }}
    >
        {#each regions as location}
            <div
                class="inline-block w-[80px] text-center text-sm md:text-base cursor-pointer"
                data-location={location}
                class:font-bold={$main_location == location}
                class:font-light={$main_location != location}
                class:text-blue-500={$main_location == location}
                on:click={(e) => {
                    $main_location = e.target.dataset.location;
                    sessionStorage.setItem("location", $main_location);
                    invalidateAll();
                    $loadingStore = true;
                }}
            >
                {location}
            </div>
        {/each}
    </div>

    <div class="absolute left-0 top-0 h-full z-20 bg-white">
        <div class="flex items-center h-full justify-center">
            <div
                class="px-3 py-5"
                on:click={() => {
                    scrollToDirection("left", 100);
                }}
            >
                <i class="fa fa-caret-left" aria-hidden="true"></i>
            </div>
        </div>
    </div>

    <div class="absolute right-0 top-0 h-full z-20 bg-white">
        <div class="flex items-center h-full justify-center">
            <div
                class="px-3 py-5"
                on:click={() => {
                    scrollToDirection("right", 100);
                }}
            >
                <i class="fa fa-caret-right" aria-hidden="true"></i>
            </div>
        </div>
    </div>
</div>

<style>
    .scroll__wrap {
        display: flex;
        gap: 20px;
        overflow-x: auto;
        white-space: nowrap;
        padding: 10px 30px;
        position: relative;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
</style>
