<script lang="ts">
  import { getAccountInfo } from "$lib/client-account";
  import { onMount } from "svelte";
  import AuthorizationPopup from "./authorizationPopup.svelte";

  let authorizationPopup: AuthorizationPopup;
  const accountInfo = getAccountInfo();
</script>

<AuthorizationPopup bind:this={authorizationPopup} />

<div
  class="relative flex flex-row items-center font-kumbh pl-8 bg-sky-950 text-center md:text-start z-40"
>
<div class="">
  <a href="/">
    <img
      class="w-36"
      src="https://galatea.ane.jp.net/dl/images/logos/ane-git-logo.webp"
      alt="Logo"
    />
  </a>
  </div>

  <div class="ml-auto bg-linear-to-bl from-suisei-900 via-suisei-900 to-[#00000000] to-50% h-full w-24">

  </div>

  <div class="flex flex-row font-ibmplex items-center p-8 py-6 bg-suisei-900">
    {#if accountInfo}
      <a class="text-xl hover:underline" href="/u/{accountInfo.name}"
        >{accountInfo.displayName}
      </a>
    {:else}
      <button
        class="text-xl hover:underline"
        onclick={() => {
          authorizationPopup.showPanel();
        }}
      >
        Sign In
      </button>
    {/if}
  </div>
</div>
