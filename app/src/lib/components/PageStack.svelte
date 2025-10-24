<script>
    import { pageStack } from "$lib/stores/pageStack.js";
    import { fly } from "svelte/transition";
    import { onMount } from "svelte";

    let { pageName, direction = "bottom" } = $props();
    // direction = right or bottom

    let visible = $state(false); // 처음엔 false로 시작해서, 한 프레임 후 true

    function closePage() {
        visible = false;
    }

    function afterLeave() {
        pageStack.update((stack) => stack.slice(0, -1));
    }

    // 컴포넌트 마운트 후 슬라이드 인을 트리거

    onMount(() => {
        setTimeout(() => {
            visible = true;
        }, 0);
    });

    let flyParams = $derived(
        direction === "bottom"
            ? { y: 300, duration: 300 }
            : { x: 300, duration: 300 },
    );
</script>

{#if visible}
    <!-- svelte-ignore event_directive_deprecated -->
    <div
        class="overlay"
        in:fly={flyParams}
        out:fly={flyParams}
        on:outroend={afterLeave}
    >
        <h2>예시 페이지</h2>
        <p>기존 페이지 위에 슬라이드로 올라온 화면입니다.</p>
        <button on:click={closePage}>닫기</button>
    </div>
{/if}

<style>
    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        z-index: 100;
        box-shadow: -4px 0 15px rgba(0, 0, 0, 0.2);
        padding: 2rem;
        box-sizing: border-box;
    }
</style>
