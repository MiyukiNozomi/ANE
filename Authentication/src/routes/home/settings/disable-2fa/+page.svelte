<script lang="ts">
  import { getAccountInfo } from "$lib/client-api";
  import Input from "$lib/components/input.svelte";
  import ProgressApi from "$lib/components/progressAPI.svelte";
  import { slide } from "svelte/transition";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  let progressAPI: ProgressApi | undefined = $state();

  let recoveryKey = $state("");

  let errorMessage = $state("");

  function setError(msg: string) {
    errorMessage = msg;
    document.querySelector("#error-msg")?.scrollIntoView();
  }

  async function disable2FA() {
    if (progressAPI?.isActive()) return;
    errorMessage = "";

    const apiRes = await progressAPI?.invokeAPIWithStatus<unknown>(
      "Removing...",
      "signed/2fa/disable",
      {
        recoveryKey,
      }
    );
    if (!apiRes)
      return setError(
        "Could not contact miyuki.gov.nt, this is a bug, report it to miyuki@ane.jp.net with your inspector's logs."
      );

    if (apiRes.translatedError) return setError(apiRes.translatedError);
    window.location.href = "/home/settings";
  }
</script>

<svelte:head>
  <title>Account 2FA Disable (Danger!)</title>
  <meta name="title" content="Account 2FA Disable (Danger!)" />
  <meta name="description" content="Protected Resource." />
</svelte:head>

<div class="min-h-screen bg-zinc-900 font-kumbh">
  <div class="w-full flex flex-row gap-4 items-center bg-red-700 px-8 py-2">
    <a class="text-white text-4xl" href="/home/settings">&equiv;</a>
    <div class=" text-white text-2xl">2FA Removal</div>
  </div>
  <div class="flex flex-col gap-4 py-4 text-white p-8">
    <div class="">
      <p class="text-red-600 text-xl" id="error-msg">{errorMessage}</p>
    </div>
    <div class="flex flex-col gap-2">
      <div class="" transition:slide>
        <ProgressApi bind:this={progressAPI} />
      </div>
      <h2 class="font-bold text-4xl">Notice</h2>
      <p class="text-gray-200">
        Please note that disabling 2FA increases the likelyhood of your account
        being accessed by an unknown individual or bot.
      </p>
      <p class="text-gray-200">
        You will need your recovery key in order to disable this feature.
      </p>
    </div>
    <div class="flex flex-col gap-2">
      <h2 class="font-bold text-4xl text-red-400">
        If you still wish to proceed..
      </h2>
      <div class="md:w-96">
        <Input
          bind:text={recoveryKey}
          type="text"
          placeholder="Input your recovery key here."
          maxLength={256}
        />
      </div>
      <button
        class="{progressAPI?.isActive()
          ? 'bg-red-950'
          : 'bg-red-600'} w-fit rounded-md px-4 py-2"
        onclick={disable2FA}>Remove 2FA</button
      >
    </div>
  </div>
</div>
