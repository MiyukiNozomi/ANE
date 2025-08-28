<script lang="ts">
  import { getAccountInfo } from "$lib/client-api";
  import type { PageData } from "./$types";

  import ProgressApi from "$lib/components/progressAPI.svelte";
  import { slide } from "svelte/transition";
  import { onMount } from "svelte";
  import { ImageCropper } from "$lib/imageCropper/index.svelte";

  let { data }: { data: PageData } = $props();

  // literally will never be null due to the restriction in page.server.ts
  const accountInfo = getAccountInfo();

  let progressAPI: ProgressApi | undefined = $state(undefined);

  let cropperCanvas: HTMLCanvasElement;
  let imageCropper: ImageCropper | undefined = $state();

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
    if (files && imageCropper) {
      const file = files.item(0);

      if (file) {
        let reader = new FileReader();
        reader.onload = (v) => {
          let decodedImage = new Image();
          decodedImage.src = v.target!.result as string;
          imageCropper?.setImage(decodedImage);
        };
        reader.readAsDataURL(file);
      } else {
        imageCropper.setImage(undefined);
      }
    }
  });

  async function updateProfilePicture() {
    if (!imageCropper) return setError("The cropper is null! this is a bug!");
    const imageData = await imageCropper.getTranscodedImage();
    if (!imageData) return setError("Cropped image is null!");

    const formData = new FormData();
    formData.append("inputImage", imageData, "myself.bin");

    const res = await progressAPI?.invokeAPIWithStatus(
      "Sending your cute image..",
      "signed/update-picture",
      formData,
      "PUT"
    );

    if (!res || res.error) {
      return setError(
        `Something bad has occurred, this could either be from a bug, or you've been rate limited.
Try again later, should the error persist contact miyuki@ane.jp.net as this is a bug.`
      );
    }

    imageCropper.setImage(undefined);
    files = undefined;

    setSuccessful(
      "Successfully defined your new profile picture! you should see it update accross ANE."
    );
  }

  onMount(() => {
    imageCropper = new ImageCropper(cropperCanvas);
    imageCropper.createRenderer();
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
        {imageCropper?.hasImage()
          ? "Now, select a region of the image, and upload it."
          : "Choose an image, and the cropper will become visible."}
      </p>

      <div class="block w-full lg:max-w-2/4">
        <canvas bind:this={cropperCanvas}></canvas>
      </div>

      {#if progressAPI && !progressAPI.isActive()}
        <div class="flex flex-row gap-4">
          {#if imageCropper?.hasImage()}
            <button
              class="bg-red-500 rounded-md px-4 py-2 w-fit mx-auto md:m-0"
              onclick={() => {
                imageCropper?.setImage(undefined);
                files = undefined;
              }}
              >Cancel
            </button>
            <button
              class="bg-blue-500 rounded-md px-4 py-2 w-fit mx-auto md:m-0"
              onclick={updateProfilePicture}>Upload</button
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
      {/if}
    </div>
  </div>
</div>
