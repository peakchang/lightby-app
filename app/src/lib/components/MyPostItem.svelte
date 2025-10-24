<script>
    import { goto, invalidateAll } from "$app/navigation";
    import moment from "moment-timezone";
    import { back_api, public_img_bucket } from "$lib/const.js";
    import { manageBoardTabNum } from "$lib/stores/stores";
    import { prev } from "$lib/stores/stores";

    let { value } = $props();

    let imgError = $state(false);
    let movePath = $state("");

    const productTypeMap = {
        premium: "프리미엄",
        top: "지역탑",
        free: "무료",
    };

    function getProductTypeLabel(key) {
        return productTypeMap[key] || "알 수 없음";
    }

    $effect(() => {
        if ($manageBoardTabNum == 0) {
            movePath = "detail";
        } else if ($manageBoardTabNum == 1) {
            movePath = "showfee";
        }
    });
</script>

<!-- svelte-ignore event_directive_deprecated -->
<!-- href="/{movePath}/{value.idx}?prev=/manage_board" -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
    on:click|preventDefault={() => {
        $prev = "/manage_board";
        goto(`/${movePath}/${value.idx}`);
    }}
>
    <div
        class="border border-gray-300 rounded-lg p-2 mb-3 shadow-sm cursor-pointer relative"
    >
        <div
            class="flex gap-3 justify-between md:gap-5 items-center border-b-gray-300"
        >
            {#if imgError}
                <div
                    class=" w-28 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden flex-shrink-0"
                >
                    <img
                        src="/alt_image.jpg"
                        alt=""
                        class="w-full h-full object-cover"
                    />
                </div>
            {:else if value.thumbnail}
                <div
                    class=" w-28 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden flex-shrink-0"
                >
                    <img
                        src={public_img_bucket + value.thumbnail}
                        alt=""
                        on:error={() => {
                            imgError = true;
                        }}
                        class="w-full h-full object-cover"
                    />
                </div>
            {:else if value.imgs}
                <div
                    class=" w-28 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden flex-shrink-0"
                >
                    <img
                        src={public_img_bucket + value.imgs.split(",")[0]}
                        alt=""
                        on:error={() => {
                            imgError = true;
                        }}
                        class="w-full h-full object-cover"
                    />
                </div>
            {:else}
                <div class="w-4"></div>
            {/if}

            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="flex flex-col justify-between gap-2 w-full h-full">
                <div class="text-sm">{value.subject}</div>
                <div class="text-xs">
                    {moment(value.created_at).format("YY/MM/DD HH:mm")}
                </div>

                {#if value.product}
                    <div class="text-xs">
                        <span>
                            광고 : {getProductTypeLabel(value.product)}
                        </span>
                        {#if value.product != "free"}
                            <span>|</span>
                        {/if}
                        <span>
                            {#if value.ad_status}
                                잔여기간 :
                                {#if value.ad_status.status}
                                    {value.ad_status.daysLeft}일
                                {:else}
                                    종료
                                {/if}
                            {/if}
                        </span>
                    </div>
                {/if}
            </div>
            <div class=" text-right">
                <!-- {#if !value.product || value.product == "free"}
                    <button
                        class="btn btn-success btn-xs text-sm min-w-[60px] text-white mb-2"
                        on:click|stopPropagation={() => {
                            console.log("이벤트 버블링 막기!!");

                            if ($manageBoardTabNum == 0) {
                                goto(`/joboffer?modifyidx=${value.idx}`);
                            }else if($manageBoardTabNum == 1){
                                goto(`/simplewrite?modifyidx=${value.idx}`);
                            }
                        }}
                    >
                        수정
                    </button>
                {/if}

                <button
                    class="btn btn-error btn-xs text-sm min-w-[60px] text-white"
                >
                    삭제
                </button>

                {#if value.ad_status}
                    {#if value.ad_status.status}
                        <button
                            class="btn btn-success btn-xs text-sm min-w-[60px] text-white"
                            on:click={() => {
                                goto(`/joboffer?modifyidx=${value.idx}`);
                            }}
                        >
                            수정
                        </button>
                    {:else}
                        <button
                            class="btn btn-soft btn-xs text-sm min-w-[60px]"
                            on:click={() => {
                                unableModifyBool = !unableModifyBool;
                            }}
                        >
                            수정
                        </button>
                    {/if}
                {/if} -->
            </div>
        </div>
    </div>
</div>
