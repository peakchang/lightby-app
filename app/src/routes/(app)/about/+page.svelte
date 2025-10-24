<script>
    import StackNavigator from "$lib/components/StackNavigator.svelte";
    import DetailPage from "$lib/components/pages/DetailPage.svelte";
    import SettingsPage from "$lib/components/pages/SettingsPage.svelte";

    let stackNav = $state([]);

    function openDetail(item) {
        stackNav.push("detail", { item });
    }

    function openSettings() {
        stackNav.push("settings");
    }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore event_directive_deprecated -->
<div class="">
    <div class="max-w-5xl mx-auto page home">
        <header>
            <h1>홈</h1>
            <button on:click={openSettings}>⚙️ 설정</button>
        </header>

        <div class="content">
            {#each Array(50) as _, i}
                <div class="item" on:click={() => openDetail(i + 1)}>
                    <h3>아이템 {i + 1}</h3>
                    <p>탭하여 상세 보기</p>
                </div>
            {/each}
        </div>
    </div>

    <StackNavigator bind:this={stackNav} let:screenType let:props let:pop>
        {#if screenType === "detail"}
            <DetailPage item={props.item} {pop} />
        {:else if screenType === "settings"}
            <SettingsPage {pop} />
        {/if}
    </StackNavigator>
</div>
