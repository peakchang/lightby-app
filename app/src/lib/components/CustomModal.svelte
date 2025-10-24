<script>
    import { fly } from "svelte/transition";
    import { createEventDispatcher, onMount } from "svelte";
    import PdButton from "./PdButton.svelte";

    export let width = 512;
    export let maxHeight = 500;
    export let closeOnBackground = true;
    export let closeBtn = false;
    export let xBtn = true;
    export let visible = false;
    export let positionTop = false;
    export let focusInput = false;

    let mainArea;

    $: mainArea, focusInp();

    function focusInp() {
        if (mainArea && focusInput) {
            const inputArea = mainArea.querySelector("input");
            inputArea.focus();
        }
    }

    function closeModal(e) {
        e.preventDefault();
        visible = false;
    }
</script>

{#if visible}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        class:pb-96={positionTop}
        on:click={() => {
            if (closeOnBackground) {
                visible = false;
            }
        }}
    >
        <!-- style="width: {width}px; max-width:90%;" -->
        <form
            on:submit={closeModal}
            class="mx-auto"
            style="max-width: 90%; width: {width}px"
        >
            <div
                class="bg-white rounded-lg p-6 shadow-lg relative suit-font h-1/2"
                class:pt-6={xBtn}
                class:pb-14={closeBtn}
                transition:fly={{ y: 20, duration: 200 }}
                on:click|stopPropagation
            >
                {#if xBtn}
                    <div class="absolute right-0 top-0 p-3">
                        <!-- svelte-ignore a11y_consider_explicit_label -->
                        <button
                            class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-base"
                        >
                            <i class="fa fa-times" aria-hidden="true"></i>
                        </button>
                    </div>
                {/if}

                <div
                    class="modal-content-area"
                    style="max-height: {maxHeight}px;"
                    bind:this={mainArea}
                >
                    <slot></slot>
                </div>

                {#if closeBtn}
                    <div class="absolute right-0 bottom-0 p-3">
                        <PdButton
                            classVal="text-white rounded-md text-sm px-4 py-1.5"
                        >
                            닫기
                        </PdButton>
                    </div>
                {/if}
            </div>
        </form>
    </div>
{/if}

<style>
    .modal-content-area {
        overflow-y: scroll; /* 세로 스크롤 유지 */
        scrollbar-width: none; /* Firefox 전용 */
        -ms-overflow-style: none; /* IE & Edge 구버전 */
    }
    .close {
        background-color: red;
        position: absolute;
        bottom: 0px;
        right: 0px;
    }
</style>
