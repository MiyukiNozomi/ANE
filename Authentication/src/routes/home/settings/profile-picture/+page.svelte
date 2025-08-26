<script lang="ts">
  import { getAccountInfo } from "$lib/client-api";
  import type { PageData } from "./$types";

  import ProgressApi from "$lib/components/progressAPI.svelte";
  import { slide } from "svelte/transition";
  import { file } from "zod";

  let { data }: { data: PageData } = $props();

  // literally will never be null due to the restriction in page.server.ts
  const accountInfo = getAccountInfo();

  let progressAPI: ProgressApi | undefined = $state(undefined);

  let files: FileList | null | undefined = $state();

  let errorMessage = $state("");
  let successMessage = $state("");

  function setError(msg: string) {
    errorMessage = msg;
    document.querySelector("#error-msg")?.scrollIntoView();
  }

  function setSuccessful(msg: string) {
    successMessage = msg;
    document.querySelector("#success-msg")?.scrollIntoView();
  }

  $effect(() => {
    if (files) {
      const file = files.item(0);

      if (file) {

      } else {
        
      }
    }
  });
</script>

<svelte:head>
  <title>Account 2FA Setup</title>
  <meta name="title" content="Account 2FA Setup" />
  <meta name="description" content="Protected Resource." />
</svelte:head>

<div class="min-h-screen bg-zinc-900 font-kumbh">
  <div class="w-full flex flex-row gap-4 items-center bg-sky-700 px-8 py-2">
    <a class="text-white text-4xl" href="/home/settings">&equiv;</a>
    <div class=" text-white text-2xl">Profile Picture Setup</div>
  </div>
  <div class="flex flex-col gap-4 py-4 text-white p-8">
    <div class="">
      <p class="text-red-600 text-xl" id="error-msg">{errorMessage}</p>
      <p class="text-green-600 text-xl" id="success-msg">
        {successMessage}
      </p>
    </div>

    <div class="flex flex-col gap-2">
      <div class="" transition:slide>
        <ProgressApi bind:this={progressAPI} />
      </div>
      <p class="text-gray-200">
        Choose an image, and the cropper will become visible.
      </p>

      <label for="avatar">Upload a picture:</label>
      <input
        accept="image/*"
        bind:files
        id="avatar"
        name="avatar"
        type="file"
      />
    </div>
  </div>
</div>
