<script lang="ts">
  import { blur } from "svelte/transition";
  import OverlayWindow from "$lib/client/component/overlayWindow.svelte";
  import { getAccountInfo } from "../../API/client";
  import { onMount } from "svelte";

  const account = getAccountInfo();

  let delay = $state(Math.random() * 20);
  let showWindow = $state(false);
  let interval: any;

  onMount(() => {
    interval = setInterval(() => {
      delay--;

      if (delay <= 0) {
        showWindow = true;
        clearInterval(interval);
      }
    }, 200);
  });
</script>

<div transition:blur>
  <div
    class="absolute flex grow flex-col left-2/4 top-2/4 transform -translate-2/4 font-mplus2 font-bold text-4xl {showWindow
      ? 'text-white/30'
      : 'animate-pulse text-white '}"
  >
    {showWindow ? "ERRORED" : "CONNECTING..."}
  </div>

  {#if showWindow}
    <OverlayWindow title="Error" isPopup={true}>
      <div class="flex flex-col gap-1">
        <img
          src="/favicon.webp"
          alt=""
          style="-webkit-user-drag: none;"
          class="select-none w-12 h-12 grayscale opacity-40 brightness-200"
        />
        <div class="text-3xl font-kumbh font-bold">
          Error {account ? 403 : 401}
        </div>
      </div>
      <div
        class="text-md text-white/80 font-kumbh font-bold overflow-hidden flex flex-col"
      >
        {#if account}
          Authorization level insufficient
        {:else}
          Authorization Required
        {/if}

        <p>If the problem persists,</p>
        <ul class="list-disc pl-4 text-xs py-2">
          <li>Try contacting the admin;</li>
          <li>Consider throwing your access point into the window;</li>
          <li>Send an angry email to HR;</li>
          <li>Or rethink your life choices;</li>
        </ul>
      </div>
    </OverlayWindow>
  {/if}
</div>
