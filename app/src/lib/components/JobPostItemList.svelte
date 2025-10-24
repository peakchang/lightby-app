<script>
    import { goto, invalidateAll } from "$app/navigation";
    import { back_api, public_img_bucket } from "$lib/const.js";
    import {
        prev,
        nonMemberViewLimitNum,
        user_info,
        viewLimitAlertModal,
        main_list,
    } from "$lib/stores/stores";
    import { raiseViewCount } from "$lib/lib";
    import { onMount } from "svelte";
    let { type, goToDetail } = $props();
    let imgError = $state(false);

    const businessReplaceDict = $derived({
        도시형생활주택: "도생",
        지식산업센터: "지산",
        "상가/쇼핑몰": "상가",
    });

    let postList = $state([]);

    $effect(() => {
        postList = $main_list[type];

        // for (let i = 0; i < postList.length; i++) {
        //     const value = postList[i];
        //     postList[i]["fee_value"] = /^[0-9]+$/.test(value.fee)
        //         ? Number(value.fee).toLocaleString()
        //         : `${value.fee} 만`;
        // }
    });

    // function goToDetail(idx) {
    //     // 비회원 조회수 제한!!
    //     if (!$user_info.idx) {
    //         if ($nonMemberViewLimitNum > 3) {
    //             $viewLimitAlertModal = true;
    //             return;
    //         }
    //         $nonMemberViewLimitNum = $nonMemberViewLimitNum + 1;
    //     }

    //     // 조회수 올리기
    //     raiseViewCount("site", idx);

    //     // 페이지 이동
    //     $prev = "/";
    //     goto(`/detail/${idx}`);
    // }
    function multiReplace(str, map) {
        const regex = new RegExp(Object.keys(map).join("|"), "g");
        return str.replace(regex, (match) => map[match]);
    }

    function handleImageError() {
        // imgError = true;
        this.src = "/alt_image.jpg";
    }

    function isNumeric(str) {
        return /^\d+$/.test(str);
    }
</script>

<!-- svelte-ignore event_directive_deprecated -->

{#each postList as value}
    <a
        href="/detail/{value.idx}"
        on:click|preventDefault={() => {
            goToDetail(value.idx);
        }}
    >
        <div
            class="border border-gray-300 rounded-lg p-2 mb-3 shadow-sm cursor-pointer relative"
        >
            <div class="absolute bottom-0 right-0 p-3">
                {#if value.icons}
                    <div class="w-full flex justify-end gap-1 min-w-[170px]">
                        <div class="w-1/3 max-w-[50px] md:max-w-[90px]">
                            <img
                                src="/icons/icon-{value.icons.split(
                                    ',',
                                )[0]}.png"
                                alt=""
                            />
                        </div>
                    </div>
                {/if}
            </div>
            <div class="flex gap-3 md:gap-5 items-center border-b-gray-300">
                <div
                    class="w-32 h-[100px] md:w-36 md:h-28 rounded-lg overflow-hidden flex-shrink-0"
                >
                    {#if imgError}
                        <img
                            src="/alt_image.jpg"
                            alt=""
                            class="w-full h-full object-cover"
                        />
                    {:else if value.thumbnail}
                        <img
                            src={`${public_img_bucket}${value.thumbnail}`}
                            alt=""
                            on:error={handleImageError}
                            class="w-full h-full object-cover"
                        />
                    {:else if value.imgs}
                        <img
                            src={`${public_img_bucket}${value.imgs.split(",")[0]}`}
                            alt=""
                            on:error={handleImageError}
                            class="w-full h-full object-cover"
                        />
                    {:else}
                        <img
                            src="/alt_image.jpg"
                            alt=""
                            class="w-full h-full object-cover"
                        />
                    {/if}
                </div>
                <div class="flex flex-col justify-around overflow-hidden">
                    <div class="text-xs md:text-sm text-amber-800 truncate">
                        {value.point}
                    </div>

                    <div class="text-sm md:text-base truncate">
                        <span>{value.subject}</span>
                    </div>

                    <div>
                        <div>
                            <div class="mb-1">
                                <span class="font-semibold text-blue-500">
                                    {value.fee_type}
                                    {isNumeric(value.fee)
                                        ? Number(value.fee).toLocaleString()
                                        : value.fee}원
                                </span>
                            </div>

                            <div class="text-[10px] md:text-xs flex flex-wrap">
                                <span
                                    class="bg-[#ff5c6a] px-1.5 py-0.5 text-white rounded-md mr-1"
                                >
                                    {multiReplace(
                                        value.business,
                                        businessReplaceDict,
                                    )}
                                </span>

                                <span
                                    class="bg-[#6b6cff] px-2 py-0.5 text-white rounded-md mr-1"
                                >
                                    {value.occupation}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a>
{/each}
