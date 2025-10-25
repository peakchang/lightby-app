<script>
    import { TokenManager } from "$lib/token_manager";

    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    onMount(async () => {
        const tokens = new TokenManager();

        await tokens.setToken(
            "access_token",
            "accessToken!!!!!!!!!!!!",
            Date.now() + 1000 * 5,
        );
        await tokens.setToken(
            "refresh_token",
            "refreshToken!!!!!!!!!!!",
            Date.now() + 1000 * 60 * 60 * 24 * 14,
        );
    });
</script>

<div class="pt-20">
    --------------------------------------
    <button
        on:click={() => {
            goto("/test2");
        }}
    >
        gotest2
    </button>
</div>
