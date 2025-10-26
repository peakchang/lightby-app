<script>
    import { TokenManager } from "$lib/token_manager";
    import { onMount } from "svelte";
    import { page } from '$app/stores';

    import { SsgoiTransition } from "@ssgoi/svelte";

    let { data } = $props();

    let access = $state("");
    let refresh = $state("");
    onMount(async () => {

        console.log($page.state?.testval);

        const tokens = new TokenManager();

        access = await tokens.getToken("access_token");
        refresh = await tokens.getToken("refresh_token");

        console.log(access);
        console.log(refresh);
    });
</script>

<SsgoiTransition id="/test2">
    <div class="pt-20">
        <div>
            {data.refresh}
        </div>
        <div>
            {data.access}
        </div>
    </div>
</SsgoiTransition>
