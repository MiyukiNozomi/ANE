<script lang="ts">
  import { onMount } from "svelte";
  import { renderBackgroundCanvas } from "../rendering/authboxBackground";

  let {
    children,
    onNextStep,
    onBackStep,
  }: {
    children: Function;
    onNextStep: () => Promise<void> | void;
    onBackStep: () => Promise<void> | void;
  } = $props();

  let allowNext = $state(true);
  let allowBack = $state(false);

  let canvas: HTMLCanvasElement | undefined = $state();

  export function setAllowNextButton(state: boolean) {
    allowNext = state;
  }

  export function setAllowBackButton(state: boolean) {
    allowBack = state;
  }

  onMount(() => {
    if (canvas) renderBackgroundCanvas(canvas);
  });
</script>

<canvas bind:this={canvas} class="fixed top-0 left-0 z-10"> </canvas>
<div class="min-h-screen bg-black flex flex-row grow items-center">
  <div
    class="overflow-hidden absolute z-10 w-screen h-screen flex flex-col items-center grow"
  >
    <form
      onsubmit={(e) => {
        e.preventDefault();
        if (allowNext) onNextStep();
      }}
      class="font-kumbh flex flex-col border border-sky-950 bg-black/80 p-6 rounded-2xl my-auto w-96 not-lg:w-full"
    >
      <img
        class="w-36"
        src="https://galatea.ane.jp.net/dl/images/logos/ane-logo-final.webp"
        alt=""
      />
      <div class="py-4 font-mplus2 flex flex-col gap-2 text-gray-300">
        {@render children()}
      </div>
      <div class="flex gap-4 flex-row">
        {#if allowBack}
          <button
            onclick={onBackStep}
            class="bg-linear-to-b from-red-800 to-amber-900 hover:from-red-950 border border-red-900 hover:border-red-200
        transition-colors duration-300 ease-in-out
        px-4 py-2 text-white first:ml-auto rounded-lg">Back</button
          >
        {/if}
        {#if allowNext}
          <button
            onclick={onNextStep}
            class="bg-linear-to-b from-blue-800 to-sky-900 hover:from-blue-950 border border-blue-900 hover:border-blue-200
            transition-colors duration-300 ease-in-out
            px-4 py-2 text-white first:ml-auto rounded-lg">Next</button
          >
        {/if}
      </div>
    </form>
  </div>
</div>
