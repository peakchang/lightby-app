<script>
    import { loadingStore } from "$lib/stores/stores";
</script>

{#if $loadingStore}
    <div
        class="fixed top-0 left-0 w-full h-full z-[9999999999] flex justify-center items-center"
    >
        <!-- 반투명 배경 레이어 -->
        <div class="absolute top-0 left-0 w-full h-full bg-black/50"></div>

        <!-- 가운데 로딩 박스 -->
        <div
            class="w-24 h-24 bg-white rounded-full z-10 flex items-center justify-center"
        >
            <img src="/loading.gif" alt="" />
        </div>
    </div>
{/if}
