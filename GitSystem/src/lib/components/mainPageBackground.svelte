<script lang="ts">
  import { onMount } from "svelte";

  let props: {} = $props();

  let isReady = $state(false);
  let backgroundImage: HTMLImageElement;
  let foregroundImage: HTMLImageElement;

  onMount(() => {
    backgroundImage = new Image();
    foregroundImage = new Image();

    backgroundImage.src =
      "https://galatea.ane.jp.net/dl/images/backgrounds/compass/compass-static.webp";
    foregroundImage.src =
      "https://galatea.ane.jp.net/dl/images/backgrounds/compass/compass-main.webp";
  });
</script>

<div class="absolute inset-0 overflow-hidden z-0">
  {#if isReady}
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
           h-[105vh] w-[105vh] md:h-[105vw] md:w-[105vw]
           animate-spin-slow bg-cover"
    ></div>
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
           h-[105vh] w-[105vh] md:h-[105vw] md:w-[105vw]
           animate-spin-fast bg-cover"
    ></div>
  {:else}
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    >
      <div
        class="flex gap-8 justify-center items-center font-baskervville text-orange-300"
      >
        <h2 class="font-semibold flex items-center gap-4">
          <span style="animation: pulse 1s ease-in-out infinite;">✧</span>
          <span style="animation: pulse 1s linear infinite;">✧</span>
          <span style="animation: pulse 1s linear infinite;">✧</span>
        </h2>
        <h1 class="text-3xl flex gap-2 justify-center">
          {#each "NOW  LOADING".split("") as ch, i}
            <span
              style="animation: spinY 6s linear infinite; transform-style: preserve-3d;"
              >{ch}</span
            >
          {/each}
        </h1>
        <h2 class="font-semibold flex items-center gap-4">
          <span style="animation: pulse 1s ease-in-out infinite;">✧</span>
          <span style="animation: pulse 1s linear infinite;">✧</span>
          <span style="animation: pulse 1s linear infinite;">✧</span>
        </h2>
      </div>
    </div>
  {/if}
</div>
