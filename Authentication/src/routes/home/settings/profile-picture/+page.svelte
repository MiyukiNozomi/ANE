<script lang="ts">
  import { getAccountInfo } from "$lib/client-api";
  import type { PageData } from "./$types";

  import ProgressApi from "$lib/components/progressAPI.svelte";
  import { slide } from "svelte/transition";
  import { onMount } from "svelte";
  import {
    drawCropper,
    type CropperProperties,
  } from "$lib/imageCropper/rendering";
  import { registerEvents } from "$lib/imageCropper/events";

  let { data }: { data: PageData } = $props();

  // literally will never be null due to the restriction in page.server.ts
  const accountInfo = getAccountInfo();

  let progressAPI: ProgressApi | undefined = $state(undefined);

  let cropperCanvas: HTMLCanvasElement;
  let cropperProperties: CropperProperties = {
    posX: 0,
    posY: 0,
    scale: 0,

    iw: 0,
    ih: 0,

    buttonSize: 0,
  };

  let files: FileList | null | undefined = $state();

  let decodedImage: HTMLImageElement | undefined = $state();

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
        let reader = new FileReader();
        reader.onload = (v) => {
          decodedImage = new Image();
          decodedImage.src = v.target!.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        decodedImage = undefined;
      }
    }
  });

  function initCropper() {
    const ctx = cropperCanvas.getContext("2d");

    if (!ctx)
      return setError(
        "Your browser does not support an HTML canvas 2D context, you will not be able to set your profile picture."
      );

    registerEvents(cropperProperties, cropperCanvas);

    const gameLoop = () => {
      drawCropper(cropperProperties, decodedImage, cropperCanvas, ctx);
      setTimeout(() => window.requestAnimationFrame(gameLoop), 20);
    };

    gameLoop();
  }

  async function updateProfilePicture() {}

  onMount(() => {
    initCropper();
  });
</script>

<svelte:head>
  <title>Profile Picture Setup</title>
  <meta name="title" content="Profile Picture Setup" />
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
        {decodedImage
          ? "Now, select a region of the image, and upload it."
          : "Choose an image, and the cropper will become visible."}
      </p>

      <div class="block w-full lg:max-w-2/4">
        <canvas bind:this={cropperCanvas}></canvas>
      </div>

      <div class="flex flex-row">
        {#if decodedImage}
          <button
            class="bg-red-500 rounded-md px-4 py-2 w-fit mx-auto md:m-0"
            onclick={() => {
              decodedImage = undefined;
              files = undefined;
            }}>Cancel</button
          >
        {:else}
          <input
            accept="image/*"
            bind:files
            id="avatar"
            name="avatar"
            type="file"
            class=" mx-auto md:m-0 file:bg-blue-500 file:rounded-md file:px-4 file:py-2 file:mr-4"
          />
        {/if}
      </div>
    </div>
  </div>
</div>
