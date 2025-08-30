<script lang="ts">
  import { fade, slide } from "svelte/transition";

  let { children, title }: { children: Function; title: string } = $props();

  let visible = $state(false);

  export function setVisible(b: boolean) {
    visible = b;
  }
</script>

{#if visible}
  <div
    transition:fade
    class="fixed left-0 top-0 w-screen h-screen bg-suisei-700/20 backdrop-blur-sm bg-opac z-50"
  >
    <div class="fixed right-8 top-8">
      <div
        class="flex flex-col items-center bg-black border-orange-300 rotate-45 border-1 aspect-square w-8 h-8"
      >
        <button
          onclick={() => setVisible(false)}
          class="text-orange-300 font-baskervville text-xl -rotate-45"
          >X
        </button>
      </div>
    </div>
    <div transition:slide class="flex flex-row h-full items-center">
      <div
        class="bg-orange-300 mx-auto clip-notch-tl-br p-[1px] w-full md:w-auto"
      >
        <div
          class="bg-black mx-auto clip-notch-tl-br p-6 gap-8 text-gray-300 w-full md:w-auto
          flex flex-col"
        >
          <h1 class="text-orange-200 font-baskervville text-2xl">{title}</h1>
          {@render children()}
        </div>
      </div>
    </div>
  </div>
{/if}
