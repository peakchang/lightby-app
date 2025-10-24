<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="fixed top-0 left-0 w-full z-20 suit-font">
    <div class="max-w-[530px] mx-auto bg-white border-b border-gray-300">
        <div class="flex justify-between items-center">
            <div
                class="cursor-pointer p-2"
                style="color: #3da83b;"
                on:click={() => {
                    if ($page.url.searchParams.get("prev")) {
                        goto($page.url.searchParams.get("prev"));
                    } else {
                        window.history.back();
                    }
                }}
            >
                <i class="fa fa-angle-left text-2xl mr-1" aria-hidden="true"
                ></i>
                <span class="text-sm">뒤로가기</span>
            </div>
        </div>
    </div>
</div>
