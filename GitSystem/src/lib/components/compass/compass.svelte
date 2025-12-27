<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fade } from "svelte/transition";
  import { Constelations } from "./constelations.svelte";

  let props: {} = $props();

  let readyCounter = $state(0);
  let totalElementsToLoad = 3;

  let nebulosaCanvas: HTMLCanvasElement | undefined = $state();
  let canvas: HTMLCanvasElement | undefined = $state();

  let backgroundImage: HTMLImageElement | undefined;
  let compassImage: HTMLImageElement | undefined;

  let nebulosaRendererWorker: Worker | null = null;

  let bgStarted = false;
  function startBg() {
    if (readyCounter < totalElementsToLoad)
      return console.log(
        "Ready counter is ",
        readyCounter,
        " (still not ready)",
      );
    if (bgStarted || !canvas) return;
    bgStarted = true;

    let ctx = canvas.getContext("2d");

    // background
    let bgFadeProgress = 0.0;

    let bgRotation = 0.0;
    let bgRotationSpeed = 0.0;

    // compass
    let compassProgress = 0.0;
    let compassApproachSpeed = 0.0;

    let compassRotation = 0.0;
    let compassRotationSpeed = 0.0;

    let constellations = new Constelations(canvas, ctx!);

    console.log("Background started.");
    const bgFunc = () => {
      if (!canvas) return console.error("Missing canvas!");
      if (!ctx) return console.error("Browser not supported!");
      if (!backgroundImage || !compassImage)
        return console.error("Not fully loaded!");

      const drawRotatedImage = (
        image: HTMLImageElement,
        x: number,
        y: number,
        degrees: number,
        iw?: number,
        ih?: number,
      ) => {
        const radians = degrees * (Math.PI / 180);
        const imageWidth = iw ?? image.width;
        const imageHeight = ih ?? image.height;

        const cx = imageWidth / 2;
        const cy = imageHeight / 2;

        ctx.save();
        ctx.translate(x, y); // Move origin to desired center
        ctx.rotate(radians); // Rotate canvas around new origin
        ctx.drawImage(image, -cx, -cy, imageWidth, imageHeight); // Draw image centered at origin
        ctx.restore();
      };

      canvas!.width = window.screen.width;
      canvas!.height = window.screen.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      constellations.render();

      const centerX = canvas!.width / 2;
      const centerY = canvas!.height / 2;

      // rendering the background
      ctx.globalAlpha = Math.min(1.0, bgFadeProgress);

      const bgSize = Math.max(canvas!.width, canvas!.height);

      drawRotatedImage(
        backgroundImage,
        centerX,
        centerY,
        bgRotation,
        bgSize,
        bgSize,
      );
      bgRotation += bgRotationSpeed;

      if (bgFadeProgress < 1.0) {
        bgFadeProgress += 0.002;
        bgRotationSpeed += 0.00009;
      }

      // rendering the compass
      let scale = 6.0 - compassProgress * 5;

      ctx.globalAlpha = 1.0;

      const compassSize = Math.max(canvas!.width, canvas!.height) * scale;

      drawRotatedImage(
        compassImage,
        centerX,
        centerY,
        compassRotation,
        compassSize,
        compassSize,
      );

      compassRotation += compassRotationSpeed;

      if (compassProgress < 1.0) {
        compassProgress += compassApproachSpeed;
        compassApproachSpeed += 0.00005;
        compassRotationSpeed += 0.0015;
      }

      setTimeout(() => window.requestAnimationFrame(bgFunc), 5);
    };

    bgFunc();
  }

  function runNebulosaRendererWorker() {
    return new Promise(async (resolve, reject) => {
      const nebulosaWorker = await import(
        "$lib/components/compass/nebulosaworker?worker"
      );
      nebulosaRendererWorker = new nebulosaWorker.default();

      nebulosaRendererWorker.onmessage = (r) => {
        if (r.data.ok) {
          readyCounter++;
          resolve({});
        }
      };
      nebulosaRendererWorker.onerror = (err) => reject(err);

      nebulosaCanvas!.width = window.screen.width;
      nebulosaCanvas!.height = window.screen.height;
      const offscreen = nebulosaCanvas!.transferControlToOffscreen();
      nebulosaRendererWorker.postMessage({ canvas: offscreen }, [offscreen]);
    });
  }

  function tryLoadImage(imageObject: HTMLImageElement, src: string) {
    const imageOnLoad = () => {
      readyCounter++;
      console.log("Image loaded from " + src + " successfully.");
    };

    if (imageObject.complete && imageObject.naturalWidth !== 0) {
      imageOnLoad();
    } else imageObject.onload = imageOnLoad;

    imageObject.src = src;
  }

  onMount(() => {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const backgroundSize =
      screenHeight > screenWidth
        ? "?height=" + screenHeight
        : "?width=" + 1.2 * screenWidth;
    const compassSize =
      screenHeight > screenWidth
        ? "?height=" + 4 * screenHeight
        : "?width=" + 4 * screenWidth;

    backgroundImage = new Image();
    compassImage = new Image();

    tryLoadImage(
      backgroundImage,
      "https://galatea.ane.jp.net/dl/images/backgrounds/compass/compass-static.webp" +
        backgroundSize,
    );
    tryLoadImage(
      compassImage,
      "https://galatea.ane.jp.net/dl/images/backgrounds/compass/compass-main.webp" +
        compassSize,
    );

    runNebulosaRendererWorker();
  });

  onDestroy(() => {
    if (nebulosaRendererWorker) nebulosaRendererWorker!.terminate();
  });

  $effect(() => {
    if (readyCounter >= totalElementsToLoad) startBg();
  });
</script>

<div class="absolute inset-0 overflow-hidden z-0">
  <div
    class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#1A1F21] w-full h-full"
  >
    <canvas
      bind:this={canvas}
      transition:fade
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
    ></canvas>
    <canvas
      bind:this={nebulosaCanvas}
      transition:fade
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
    ></canvas>
  </div>

  {#if readyCounter < totalElementsToLoad}
    <div
      transition:fade
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    >
      <div
        class="flex gap-8 justify-center items-center font-baskervville text-orange-300"
      >
        <h2 class="font-semibold flex items-center gap-4 text-xs md:text-xl">
          <span style="animation: pulse 2s linear infinite;">✧</span>
          <span style="animation: pulse 2s linear infinite;">✧</span>
          <span style="animation: pulse 2s linear infinite;">✧</span>
        </h2>
        <h1 class="text-sm md:text-3xl flex gap-2 justify-center">
          {#each "NOW  LOADING".split("") as ch, i}
            <span
              style="animation: spinY 6s linear infinite; transform-style: preserve-3d;"
              >{ch}</span
            >
          {/each}
        </h1>
        <h2 class="font-semibold flex items-center gap-4 text-xs md:text-xl">
          <span style="animation: pulse 2s linear infinite;">✧</span>
          <span style="animation: pulse 2s linear infinite;">✧</span>
          <span style="animation: pulse 2s linear infinite;">✧</span>
        </h2>
      </div>
    </div>
  {/if}
</div>
