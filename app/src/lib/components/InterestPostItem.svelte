<script>
    import { goto } from "$app/navigation";
    import { public_img_bucket, img_bucket } from "$lib/const";
    import { prev } from "$lib/stores/stores";
    import moment from "moment-timezone";

    let { post } = $props();

    let imgError = $state(false);

    // /detail/{post.idx}?prev=/interest

    function goToDetail() {
        $prev = "/interest";
        goto(`/detail/${post.idx}`);
    }
</script>

<!-- svelte-ignore event_directive_deprecated -->
<a href="/detail/{post.idx}" on:click|preventDefault={goToDetail}>
    <div
        class="border border-gray-300 rounded-lg p-2 mb-3 shadow-sm cursor-pointer relative"
    >
        <div class="flex gap-3 md:gap-5 items-center border-b-gray-300">
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
            {:else if post.thumbnail}
                <div
                    class=" w-28 h-16 md:w-32 md:h-20 rounded-lg overflow-hidden flex-shrink-0"
                >
                    <!-- svelte-ignore event_directive_deprecated -->
                    <img
                        src={`${public_img_bucket}${post.thumbnail}`}
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

            <div class="flex flex-col justify-between">
                <div class="mb-1">
                    {post.subject}
                </div>
                <div class="text-sm">
                    {moment(post.created_at).format("YY/MM/DD HH:mm")}
                </div>
            </div>
        </div>
    </div>
</a>
