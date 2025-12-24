<script lang="ts">
  import { getAccountInfo } from "$lib/client/API/client";
  import type { PageData } from "./$types";

  let {}: PageData = $props();

  let account = getAccountInfo();
</script>

<div class="min-h-screen bg-linear-to-br from-gray-950 via-indigo-950">
  <div class="text-2xl text-white">
    Hi, this page is currently being reworked. Many features are missing, but
    are coming in the future.
  </div>

  {#if account}
    <a
      href="/home/settings"
      class="text-xl text-blue-500 underline hover:cursor-pointer"
      >Account Settings</a
    >
  {:else}
    <a href="/sign" class="text-xl text-blue-500 underline hover:cursor-pointer"
      >Sign in</a
    >
  {/if}
</div>
