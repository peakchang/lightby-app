<script>
    let {
        classVal,
        hoverColor = "#5E5E5E",
        backgroundColor = "#4C4C4C",
    } = $props();

    let ripples = $state([]);
    let buttonEl;

    function createRipple(event) {
        const rect = buttonEl.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        const id = Math.random().toString(36);
        ripples = [...ripples, { x, y, size, id }];

        setTimeout(() => {
            ripples = ripples.filter((r) => r.id !== id);
        }, 700);
    }

    function handleMouseEnter() {
        buttonEl.style.backgroundColor = hoverColor;
    }

    function handleMouseLeave() {
        buttonEl.style.backgroundColor = backgroundColor;
    }

    function handleClick(event) {
        createRipple(event);
        // 외부로 click 이벤트 전달
        dispatch("click", event);
    }

    $effect(() => {
        buttonEl.style.backgroundColor = backgroundColor;
    });

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
</script>

<!-- svelte-ignore event_directive_deprecated -->
<!-- svelte-ignore slot_element_deprecated -->
<button
    bind:this={buttonEl}
    class="pd-button {classVal}"
    on:click={handleClick}
    on:mouseenter={handleMouseEnter}
    on:mouseleave={handleMouseLeave}
>
    <slot>Click Me</slot>

    {#each ripples as r (r.id)}
        <!-- svelte-ignore element_invalid_self_closing_tag -->
        <span
            class="ripple"
            style="top: {r.y}px; left: {r.x}px; width: {r.size}px; height: {r.size}px;"
        />
    {/each}
</button>

<style>
    .pd-button {
        position: relative;
        overflow: hidden;
        border: none;
        cursor: pointer;
        outline: none;
        transition: background-color 0.3s ease;


        justify-content: center;
    }

    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 700ms ease-out;
        pointer-events: none;
    }

    @keyframes ripple-animation {
        to {
            transform: scale(1);
            opacity: 0;
        }
    }
</style>
