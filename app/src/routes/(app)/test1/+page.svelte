<script>
    import { TokenManager } from "$lib/token_manager";

    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    import { SsgoiTransition } from "@ssgoi/svelte";

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

<SsgoiTransition id="/test1">
    <div class="pt-20">
        --------------------------------------
        <button
            on:click={() => {
                goto("/test2", {
                    state: {
                        testval: { name: "홍길동", age: 20 },
                    },
                });
            }}
        >
            gotest2
        </button>
    </div>
</SsgoiTransition>
