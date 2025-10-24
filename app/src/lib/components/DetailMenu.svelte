<script>
    import CustomModal from "$lib/components/CustomModal.svelte";
    import { page } from "$app/stores";
    import { user_info } from "$lib/stores/stores";
    import axios from "axios";
    import { back_api } from "$lib/const";
    import { favorateBool } from "$lib/stores/stores";
    import { toastStore } from "$lib/stores/stores";
    import { goto } from "$app/navigation";
    import { prev } from "$lib/stores/stores";

    let { favorateShow = true, shareShow = true, openShareModal } = $props();

    let notLoginAlertModal = $state(false);

    async function favorateAct() {
        if (!$user_info.idx) {
            notLoginAlertModal = true;
        }

        console.log("좋아요 클릭?!?!?!?");
        console.log(this.value);

        try {
            const res = await axios.post(`${back_api}/detail/postlike_act`, {
                user_id: $user_info.idx,
                item_id: $page.params.id,
                type: this.value,
            });

            $favorateBool = !$favorateBool;
            //     toastShow = 1;
            if ($favorateBool) {
                toastStore.set({
                    show: true,
                    message: "관심현장에 등록 되었습니다.",
                    color: "#6799FF",
                });
            } else {
                toastStore.set({
                    show: true,
                    message: "관심현장에 해제 되었습니다.",
                    color: "#6799FF",
                });
            }
        } catch (err) {
            console.log(err.response.data.message);
        }
    }
</script>

<CustomModal bind:visible={notLoginAlertModal} closeBtn={false}>
    <div class="text-center">
        <div class=" text-red-500 text-3xl mb-5">
            <i class="fa fa-exclamation-circle" aria-hidden="true"></i>
        </div>
        <div class="mb-5">찜하기는 로그인 후 가능합니다.</div>
        <div>
            <button class="btn btn-active btn-success text-white w-1/3">
                닫기
            </button>
        </div>
    </div>
</CustomModal>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore event_directive_deprecated -->
<!-- svelte-ignore a11y_consider_explicit_label -->
<div class="flex justify-between items-center p-3">
    <div
        class="text-3xl w-12 cursor-pointer"
        on:click={() => {
            goto($prev);
        }}
    >
        <i class="fa fa-angle-left" aria-hidden="true"></i>
    </div>

    <a href="/">
        <div>
            <img src="/logo.png" alt="" class=" max-w-[110px]" />
        </div>
    </a>

    <div>
        {#if favorateShow}
            {#if $favorateBool}
                <button
                    class="cursor-pointer"
                    value="unfav"
                    on:click={favorateAct}
                >
                    <svg
                        width="24"
                        height="24"
                        fill="#FF4848"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        ><path
                            d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"
                        /></svg
                    >
                </button>
            {:else}
                <button
                    class="cursor-pointer"
                    value="fav"
                    on:click={favorateAct}
                >
                    <svg
                        width="24"
                        height="24"
                        fill="#8C8C8C"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        ><path
                            d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8l0-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5l0 3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20-.1-.1s0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5l0 3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2l0-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"
                        /></svg
                    >
                </button>
            {/if}
        {/if}

        {#if shareShow}
            <button class="cursor-pointer" on:click={openShareModal}>
                <svg
                    width="24"
                    height="24"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="#8C8C8C"
                    ><path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M15.1622 6.35404C15.1622 5.14326 16.1423 4.16173 17.3514 4.16173C18.5604 4.16173 19.5405 5.14326 19.5405 6.35404C19.5405 7.56482 18.5604 8.54635 17.3514 8.54635C16.1423 8.54635 15.1622 7.56482 15.1622 6.35404ZM17.3514 2.7002C15.3363 2.7002 13.7027 4.33608 13.7027 6.35404C13.7027 6.70313 13.7516 7.04078 13.8429 7.36051L9.41758 9.82065C8.74843 9.0405 7.75616 8.54635 6.64865 8.54635C4.63356 8.54635 3 10.1822 3 12.2002C3 14.2182 4.63356 15.854 6.64865 15.854C7.80468 15.854 8.83514 15.3156 9.50364 14.4756L13.8326 17.0767C13.7479 17.3855 13.7027 17.7106 13.7027 18.0463C13.7027 20.0643 15.3363 21.7002 17.3514 21.7002C19.3664 21.7002 21 20.0643 21 18.0463C21 16.0284 19.3664 14.3925 17.3514 14.3925C16.1953 14.3925 15.1648 14.9309 14.4963 15.771L10.1674 13.17C10.2521 12.8611 10.2973 12.536 10.2973 12.2002C10.2973 11.8158 10.238 11.4453 10.1281 11.0973L14.5183 8.65669C15.1872 9.48112 16.2079 10.0079 17.3514 10.0079C19.3664 10.0079 21 8.372 21 6.35404C21 4.33608 19.3664 2.7002 17.3514 2.7002ZM6.64865 10.0079C5.43959 10.0079 4.45946 10.9894 4.45946 12.2002C4.45946 13.411 5.43959 14.3925 6.64865 14.3925C7.8577 14.3925 8.83784 13.411 8.83784 12.2002C8.83784 10.9894 7.8577 10.0079 6.64865 10.0079ZM17.3514 15.854C16.1423 15.854 15.1622 16.8356 15.1622 18.0463C15.1622 19.2571 16.1423 20.2387 17.3514 20.2387C18.5604 20.2387 19.5405 19.2571 19.5405 18.0463C19.5405 16.8356 18.5604 15.854 17.3514 15.854Z"
                        fill="current"
                    />
                </svg>
            </button>
        {/if}
    </div>
</div>
