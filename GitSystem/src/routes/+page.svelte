<script lang="ts">
  import Footer from "$lib/components/footer.svelte";
  import Header from "$lib/components/header.svelte";
  import MainPageBackground from "$lib/components/mainPageBackground.svelte";
  import SplitPanel from "$lib/components/stellar/splitPanel.svelte";
  import { onMount } from "svelte";

  let backgroundImage: HTMLImageElement;
  let foregroundImage: HTMLImageElement;

  onMount(() => {
    backgroundImage = new Image();
    foregroundImage = new Image();

    backgroundImage.src =
      "https://galatea.ane.jp.net/dl/images/backgrounds/compass/compass-static.webp";
    foregroundImage.src =
      "https://galatea.ane.jp.net/dl/images/backgrounds/compass/compass-main.webp";
  });
</script>

<svelte:head>
  <title>Projects</title>
  <meta name="title" content="Projects" />
  <meta
    name="description"
    content="The location of every public project I (miyuki) worked on :)"
  />
</svelte:head>

<div
  class="font-mplus2 min-h-screen bg-index-bg text-white flex flex-col overflow-y-scroll no-scrollbar"
>
  <div class="relative flex flex-col h-[93vh] z-20">
    <Header />
    <MainPageBackground />
  </div>

  <div class="flex flex-col gap-8 bg-black pb-8">
    <SplitPanel label="ABOUT">
      <h1 class="font-baskervville text-orange-200">
        The homepage of hopes and dreams
      </h1>
      <p class="font-kumbh text-sm">
        Welcome to Miyuki's online git repository, a compass into the crazy
        ideas I've written and maintain.
        <br />
        I no longer sees my projects as just software, I see them as an artistic
        mean.
      </p>
    </SplitPanel>
    <SplitPanel label="PROJECTS">
      <h1>TODO</h1>
    </SplitPanel>
    <SplitPanel label="UPDATES">
      <h1>TODO</h1>
    </SplitPanel>
  </div>

  <Footer />
</div>
