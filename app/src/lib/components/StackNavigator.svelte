<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";
    import { fly } from "svelte/transition";
    import { quintOut } from "svelte/easing";
    import { pushState, replaceState, afterNavigate } from "$app/navigation";

    let stack: Array<{ id: number; screenType: string; props: any }> = [];
    let currentId = 0;
    let historyIndex = 0;
    let routerReady = false;

    function mergeState(extra: Record<string, any>) {
        const current = browser && history.state ? history.state : {};
        return { ...current, ...extra };
    }

    onMount(() => {
        if (!browser) return;

        // 라우터 초기화 완료 신호를 한 번 기다렸다가 실행
        afterNavigate(() => {
            routerReady = true;

            // 이제 안전하게 replaceState 호출 가능
            replaceState(location.href, {
                state: mergeState({ stackIndex: 0 }),
            });
        });

        window.addEventListener("popstate", handlePopState);
    });
    onDestroy(() => {
        if (!browser) return;
        window.removeEventListener("popstate", handlePopState);
    });

    function handlePopState(e: PopStateEvent) {
        if (!browser) return;
        const targetIndex = (e.state && e.state.stackIndex) ?? 0;

        if (targetIndex < historyIndex) {
            // 사용자 '뒤로' → 내부 스택을 그 차이만큼 pop
            const diff = historyIndex - targetIndex;
            for (let i = 0; i < diff; i++) {
                if (stack.length > 0) {
                    stack = stack.slice(0, -1);
                }
            }
            historyIndex = targetIndex;
            // URL은 그대로, 현재 상태만 일치시킴
            replaceState(location.href, {
                state: mergeState({ stackIndex: historyIndex }),
            });
        } else {
            // 사용자가 앞으로 가는 케이스 등은 여기서 특별 처리 없이 통과
            historyIndex = targetIndex;
        }

        document.body.style.overflow = stack.length > 0 ? "hidden" : "";
    }

    function hasStack(screenType: string) {
        return stack.some((it) => it.screenType === screenType);
    }

    export function push(screenType: string, props: any = {}) {
        if (hasStack(screenType)) {
            console.log(`Stack "${screenType}" is already open`);
            return;
        }
        const id = currentId++;
        stack = [...stack, { id, screenType, props }];

        if (browser) {
            historyIndex += 1;
            // URL 변경 없이 히스토리에 엔트리만 쌓음 (라우터와 동기화)
            pushState(location.href, {
                state: mergeState({ stackIndex: historyIndex }),
            });
            document.body.style.overflow = "hidden";
        }
    }

    export function pop() {
        if (stack.length === 0) return;

        // ❗ 히스토리를 실제로 '뒤로가기' 하지 않는다.
        stack = stack.slice(0, -1);

        if (browser) {
            if (historyIndex > 0) historyIndex -= 1;
            // 현재 URL 유지 + 상태만 교체해서 라우터와 일치
            replaceState(location.href, {
                state: mergeState({ stackIndex: historyIndex }),
            });
            if (stack.length === 0) document.body.style.overflow = "";
        }
    }

    export function clearStack() {
        stack = [];
        if (browser) {
            historyIndex = 0;
            replaceState(location.href, {
                state: mergeState({ stackIndex: 0 }),
            });
            document.body.style.overflow = "";
        }
    }
</script>

<div class="stack-root">
    <div class="stack-container">
        {#each stack as screen, index (screen.id)}
            <div
                class="screen"
                class:behind={index < stack.length - 1}
                in:fly={{ x: "100%", duration: 600, easing: quintOut }}
                out:fly={{ x: "100%", duration: 600, easing: quintOut }}
            >
                <slot
                    screenType={screen.screenType}
                    props={screen.props}
                    {pop}
                />
            </div>
        {/each}
    </div>
</div>

<style>
    .stack-root {
        position: fixed;
        inset: 0;
        z-index: 1000;
        width: 100%;
        pointer-events: none;
    }
    .stack-container {
        max-width: 1040px;
        height: 100%;
        margin: 0 auto;
        position: relative;
    }
    .screen {
        position: absolute;
        inset: 0;
        background: white;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
        pointer-events: auto;
    }
    .screen.behind {
        transform: translateX(-30%);
        filter: brightness(0.7);
        pointer-events: none;
    }
</style>
