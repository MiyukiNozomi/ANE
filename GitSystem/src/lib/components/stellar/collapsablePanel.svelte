<script lang="ts">
  import { fade, slide } from "svelte/transition";

  let {
    openLabel,
    closeLabel,
    className = "",
    children,
  }: {
    openLabel: string;
    className?: string;
    closeLabel: string;
    children: Function;
  } = $props();

  let visible = $state(false);
</script>

<div
  class="flex flex-col px-4 transition-transform duration-300 ease-in-out {className}"
>
  <button
    onclick={() => (visible = !visible)}
    class="flex flex-row w-full items-center relative gap-0 bg-black cursor-pointer ease-in-out transition-colors duration-200
    text-orange-200 hover:text-orange-300 group border-orange-200"
  >
    <div
      class="flex flex-row py-1 font-baskervville border-y-1 z-20 w-full h-auto"
    >
      <span class="group-hover:animate-pulsing">✧</span>
      <h1 class="z-10 mx-auto">{visible ? closeLabel : openLabel}</h1>
    </div>

    <div
      class="absolute -left-3 bg-none rotate-45 border-l-1 border-b-1 aspect-square h-6 bg-black"
    ></div>
    <div
      class="absolute -right-3 bg-none rotate-45 border-r-1 border-t-1 aspect-square h-6 bg-black"
    ></div>
  </button>
  {#if visible}
    <div
      transition:slide
      class="flex flex-row items-center w-full bg-orange-200 p-[1px] pt-0 clip-notch-bottom"
    >
      <div
        class="flex flex-col mx-auto w-full p-8 pt-6 bg-black clip-notch-bottom"
      >
        {@render children()}
      </div>
    </div>
  {/if}
</div>
