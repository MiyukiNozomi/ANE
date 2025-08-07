<script lang="ts">
  import { fade, slide } from "svelte/transition";

  let showLoginPanel = $state(false);
  let status: "PRE_REQUEST" | "WAITING" | "REQUESTED" = $state("PRE_REQUEST");

  async function requestAuthorization() {
    const reqRes = await fetch("/api/ext/authorizations", {
      method: "POST",
    });
    const json = await reqRes.json();

    window.open(json["request-url"]);
    status = "WAITING";
  }
</script>

{#if showLoginPanel}
  <div
    class="fixed top-0 left-0 w-screen h-screen flex flex-row items-center bg-[#000000AA] backdrop-blur-md z-90"
    transition:fade
  >
    <div
      class="bg-gray-900 mx-auto p-4 rounded-lg flex flex-col text-white font-kumbh"
      transition:slide
    >
      {#if status == "PRE_REQUEST"}
        <button
          onclick={requestAuthorization}
          class="flex flex-row items-center rounded-md px-4 py-2 w-fit bg-black border-2 border-blue-600 border-solid gap-2"
          >Sign in with your <img
            src="/favicon.png"
            alt="ANE Logo"
            class="h-12"
          /> ANE Account</button
        >
      {:else if status == "WAITING"}
        <h1>Awaiting for your Authorization</h1>
        <p>
          Didn't work? <button class="underline text-blue-600"
            >restart here</button
          >.
        </p>
      {:else if status == "REQUESTED"}
        <h1>Awaiting for your Authorization</h1>
      {/if}
    </div>
  </div>
{/if}

<div
  class="flex flex-row font-kumbh p-8 py-4 bg-suisei-950 backdrop-blur-sm text-center md:text-start z-40"
>
  <img
    class="w-48"
    src="https://galatea.ane.jp.net/dl/images/logos/ane-git-logo.webp"
    alt="Logo"
  />

  <div class="flex flex-row ml-auto px-8">
    <button
      class="text-xl hover:underline"
      onclick={() => {
        showLoginPanel = true;
        status = "PRE_REQUEST";
      }}>Sign In</button
    >
  </div>
</div>
