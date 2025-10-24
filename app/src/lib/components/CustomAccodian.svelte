<!-- Accordion.svelte -->
<script>
    import CustomModal from "$lib/components/CustomModal.svelte";
    import { slide } from "svelte/transition";

    // Props
    let { items = [], allowMultiple = true, answerStatus = false } = $props();

    console.log(items);

    // 상태 관리
    let openItems = $state(allowMultiple ? {} : null);

    let alertModal = $state(""); // 없는 질문 클릭 했을시

    // 토글 함수
    function toggleItem(id) {
        // 답변이 없으면 동작하지 않음
        const item = items.find((item) => item.idx === id);
        if (!item || !item.answer) {
            alertModal = true;
            return;
        }

        if (allowMultiple) {
            // 여러 개 열기 가능
            if (openItems[id]) {
                delete openItems[id];
            } else {
                openItems[id] = true;
            }
        } else {
            // 하나만 열기 가능 (전형적인 accordion)
            openItems = openItems === id ? null : id;
        }
    }

    // 열린 상태 체크 함수
    function isOpen(id) {
        return allowMultiple ? openItems[id] : openItems === id;
    }
</script>

<CustomModal bind:visible={alertModal}>
    <div class="text-center">
        <div class=" text-red-400 text-4xl mb-3">
            <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
        </div>
        <div>아직 답변이 등록 되지 않았습니다.</div>
    </div>
</CustomModal>

<div class="accordion-container">
    {#each items as item (item.idx)}
        <div
            class="bg-base-100 border border-gray-400 mb-2 rounded-lg overflow-hidden"
        >
            <!-- 질문 DIV (클릭 가능) -->
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <!-- svelte-ignore event_directive_deprecated -->
            <div
                class=" py-3 px-4 transition-colors flex justify-between items-center cursor-pointer bg-white"
                on:click={() => toggleItem(item.idx)}
            >
                <span class="font-semibold">{item.question}</span>
                {#if item.answer}
                    <div class="flex items-center gap-2">
                        {#if answerStatus}
                            <div class="badge badge-sm badge-soft badge-accent">
                                답변완료
                            </div>
                        {/if}
                        <span
                            class="text-lg transition-transform duration-200 {isOpen(
                                item.idx,
                            )
                                ? 'rotate-180'
                                : ''}"
                        >
                            <i class="fa fa-caret-down" aria-hidden="true"></i>
                        </span>
                    </div>
                {:else if answerStatus}
                    <div class="badge badge-sm badge-soft badge-error">
                        미답변
                    </div>
                {/if}
            </div>

            <!-- 답변 DIV (조건부 렌더링 + 슬라이드 애니메이션) -->
            {#if isOpen(item.idx) && item.answer}
                <div
                    class="text-sm px-4 pb-3 border-t border-gray-200 pt-3 bg-gray-50 whitespace-pre-wrap leading-relaxed"
                    transition:slide
                >
                    {item.answer}
                </div>
            {/if}
        </div>
    {/each}
</div>

<style>
    .accordion-container {
        /* 필요한 경우 추가 스타일링 */
    }
</style>
