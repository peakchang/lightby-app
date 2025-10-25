<script>
    import { TokenManager } from "$lib/token_manager";
    import { onMount } from "svelte";

    let { data } = $props();

    let access = $state("");
    let refresh = $state("");
    onMount(async () => {
        const tokens = new TokenManager();

        access = await tokens.getToken("access_token");
        refresh = await tokens.getToken("refresh_token");

        console.log(access);
        console.log(refresh);
    });
</script>

<div class="pt-20">
    <div>
        {data.refresh}
    </div>
    <div>
        {data.access}
    </div>
</div>
