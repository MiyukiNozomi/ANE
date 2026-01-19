<script lang="ts">
  import { getAccountInfo } from "$lib/client/API/client";
  import { blur, fly, scale, slide } from "svelte/transition";
  import type { PageData } from "./$types";
  import Handbook from "$lib/client/component/handbook.svelte";

  let {}: PageData = $props();

  let account = getAccountInfo();

  const tabOptions = ["SYSTEM", "HANDBOOK"] as const;
  let activeTab: (typeof tabOptions)[number] = $state(tabOptions[0]);
</script>

<div
  class="min-h-screen bg-linear-to-br from-red-950 to-blue-900 flex flex-col"
>
  <div
    class="h-screen max-h-screen flex flex-row items-center relative overflow-hidden"
  >
    <div class="absolute flex flex-row top-0 left-0 w-full z-20">
      <div
        class="px-4 bg-black/40 w-full text-white border-b-4 border-white/60 h-11"
      >
        {#each tabOptions as option}
          <button
            onclick={() => (activeTab = option)}
            class="font-kumbh mt-1 px-8 py-2 hover:bg-white/20 pb-1 {activeTab ==
            option
              ? 'text-black bg-linear-0 from-white/60 to-white rounded-t-lg'
              : ''}">{option}</button
          >
        {/each}
      </div>
      <div
        class="h-11 w-30 not-lg:hidden"
        style="background: linear-gradient(162deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 58.5%, rgba(255, 255, 255, 0.60) 58.5%, rgba(255, 255, 255, 0.60) 64%, rgba(0, 0, 0, 0) 65%);"
      ></div>
      <div
        class="flex flex-row w-2/4 bg-black/40 h-5 border-b-4 border-white/60 not-lg:hidden"
      ></div>
    </div>

    <div class="flex flex-col m-8 z-10 text-indigo-200 font-mplus2">
      {#if activeTab == "SYSTEM"}
        <div transition:blur class="">
          <div class="text-8xl font-kumbh text-white">Auth</div>
          <p class="text-lg lg:text-2xl">
            The authorization microservice of Miyuki Studio / ANE
          </p>
          {#if account}
            <a
              href="/home/settings"
              class="text-2xl text-blue-400 underline hover:cursor-pointer"
              >Account Settings</a
            >
          {:else}
            <a
              href="/sign"
              class="text-2xl text-blue-400 underline hover:cursor-pointer"
              >Sign in</a
            >
          {/if}
        </div>
      {:else if activeTab == "HANDBOOK"}
        <Handbook />
      {/if}
    </div>
    <img
      src="/favicon.webp"
      alt=""
      style="-webkit-user-drag: none;"
      class="select-none not-lg:top-2/4 not-lg:w-[120vh] not-lg:-right-1/4
      absolute lg:top-1/6 lg:-right-1/4 rotate-45 lg:w-5/6 grayscale opacity-20 brightness-200"
    />
  </div>
</div>
