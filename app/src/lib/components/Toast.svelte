<script>
    import { toastStore } from "$lib/stores/stores";

    let timeoutId = null;

    $effect(() => {
        if ($toastStore.show == true) {

            if (timeoutId) {
                clearTimeout(timeoutId);
            }

            timeoutId = setTimeout(() => {
                toastStore.set({ show: false, message: "" });
            }, 1800);
        }
    });
</script>

<!-- opacity-{toastShow} -->

{#if $toastStore.show}
    <div
        id="toast"
        class="toast toast-center toast-bottom z-[9999999] suit-font"
    >
        <div
            class="alert text-white mb-20"
            style="background-color: {$toastStore.color};"
        >
            <span> {$toastStore.message} </span>
        </div>
    </div>
{/if}
