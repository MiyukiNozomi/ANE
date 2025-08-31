<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import StellarButton from "./stellarButton.svelte";

  let {
    children,
    buttons,
    title,
  }: {
    buttons?: Record<string, () => void>;
    children: Function;
    title: string;
  } = $props();

  let visible = $state(false);
  let errorMessage = $state("");

  export function setVisible(b: boolean) {
    visible = b;
  }

  export function setError(text: string) {
    errorMessage = text;
  }
</script>

{#if visible}
  <div
    transition:fade
    class="fixed left-0 top-0 w-screen h-screen bg-suisei-700/20 backdrop-blur-sm bg-opac z-50"
  >
    <div class="fixed right-8 top-8">
      <div
        class="flex flex-col items-center bg-black border-orange-300 transition-colors duration-300 ease-in-out hover:bg-orange-300 rotate-45 border-1 aspect-square w-8 h-8"
      >
        <button
          onclick={() => setVisible(false)}
          class="transition-colors duration-300 ease-in-out hover:text-black text-orange-300 font-baskervville text-xl -rotate-45"
          >X
        </button>
      </div>
    </div>
    <div transition:slide class="flex flex-row h-full items-center">
      <div class="flex flex-col mx-auto">
        <div class="bg-orange-300 clip-notch-tl-br p-[1px] w-full md:w-auto">
          <div
            class="bg-black mx-auto clip-notch-tl-br p-6 gap-6 text-gray-300 w-full md:w-auto
          flex flex-col {buttons != undefined ? 'pb-16' : ''}"
          >
            <div class="flex flex-col">
              <h1 class="text-orange-200 font-baskervville text-2xl">
                {title}
              </h1>
              <p
                class="font-mplus2 text-red-500 {errorMessage.length == 0
                  ? 'hidden'
                  : ''}"
              >
                {errorMessage}
              </p>
            </div>
            <div class="flex flex-col gap-8">
              {@render children()}
            </div>
          </div>
        </div>
        {#if buttons}
          <div
            class="flex flex-row items-center h-fit -translate-y-2/4 justify-center pr-6 gap-4"
          >
            {#each Object.keys(buttons) as buttonLabel}
              <StellarButton
                label={buttonLabel}
                onclick={buttons[buttonLabel]}
              />
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
