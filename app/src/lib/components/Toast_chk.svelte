<script>
    import { toastStore } from "$lib/stores/stores";

    $effect(() => {
        console.log(`$toastStore 값이 변경됨?!?! : ${$toastStore}`);
    });
</script>

{#if $toastStore.show}
    <div class="toast toast-{$toastStore.type}">
        {$toastStore.message}
    </div>
{/if}

<style>
    .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem;
        border-radius: 4px;
        color: white;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    }

    .toast-success {
        background: #10b981;
    }
    .toast-error {
        background: #ef4444;
    }
    .toast-warning {
        background: #f59e0b;
    }
    .toast-info {
        background: #3b82f6;
    }

    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
</style>
