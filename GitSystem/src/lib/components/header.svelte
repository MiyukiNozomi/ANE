<script lang="ts">
  import { getAccountInfo } from "$lib/client-account";
  import AuthorizationPopup from "./authorizationPopup.svelte";

  let authorizationPopup: AuthorizationPopup;
  const accountInfo = getAccountInfo();
</script>

<AuthorizationPopup bind:this={authorizationPopup} />

<div
  class="flex flex-row font-kumbh p-8 py-4 bg-suisei-950 backdrop-blur-sm text-center md:text-start z-40"
>
  <img
    class="w-48"
    src="https://galatea.ane.jp.net/dl/images/logos/ane-git-logo.webp"
    alt="Logo"
  />

  <div class="flex flex-row items-center ml-auto px-8">
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
