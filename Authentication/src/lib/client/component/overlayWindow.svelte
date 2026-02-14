<script lang="ts">
    import { browser } from "$app/environment";

    let {
        title,
        children,
        isPopup,
        initialWidth = 320,
        initialHeight = 320,
        onClosing,
    }: {
        title: string;
        children: Function;
        isPopup: boolean;
        initialWidth?: number;
        initialHeight?: number;
        onClosing?: () => void;
    } = $props();

    let windowDiv: HTMLDivElement | undefined = $state();

    let left = $derived(window.innerWidth / 2 - initialWidth / 2);
    let top = $derived(window.innerHeight / 2 - initialHeight / 2);

    let width = $derived(initialWidth);
    let height = $derived(initialHeight);

    let moving = $state(false);
</script>

<svelte:window
    onresize={() => {
        const isMobile = browser && window.innerWidth < window.innerHeight;

        if (isMobile) {
            top = window.innerHeight * 0.1;
            height = window.innerHeight * 0.8;
            left = 8;
            width = window.innerWidth - 16;
        } else {
            left = window.innerWidth / 2 - width / 2;
            top = window.innerHeight / 2 - height / 2;

            width = initialWidth;
            height = initialHeight;
        }
    }}
    onmouseup={() => (moving = false)}
    onmousemove={(e) => {
        const isMobile = browser && window.innerWidth < window.innerHeight;
        if (moving && !isPopup && !isMobile) {
            left += e.movementX;
            top += e.movementY;

            left = Math.min(Math.max(left, 0), window.innerWidth - width);
            top = Math.min(
                Math.max(top, window.innerHeight * 0.08),
                window.innerHeight - height,
            );
        }
    }}
/>

<div
    bind:this={windowDiv}
    class="absolute bg-black/20 rounded-md backdrop-blur-sm border-white/70 border z-50 flex flex-col"
    style="left: {left}px; top: {top}px; width: {width}px; min-height: {height}px"
    draggable="false"
>
    <div class="font-kumbh text-white/70 flex flex-row items-center px-2 py-1">
        <button
            class="text-xs text-white/70 select-none w-full text-start"
            onmousedown={() => (moving = true)}
            onmouseup={() => (moving = false)}>{title}</button
        >
        <button
            onclick={() => {
                if (onClosing) onClosing();
                windowDiv?.remove();
            }}
            class="select-none text-xs rounded-md hover:bg-white/30 cursor-pointer ml-auto px-4 bg-white/10 text-center items-center flex flex-row"
            ><p>X</p></button
        >
    </div>
    <div
        class="m-1 p-4 mt-0 border-white/60 border rounded-b-md h-full flex flex-col grow gap-4"
    >
        {@render children()}
    </div>
</div>
