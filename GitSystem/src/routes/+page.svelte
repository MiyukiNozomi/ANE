<script lang="ts">
  import Footer from "$lib/components/footer.svelte";
  import Header from "$lib/components/header.svelte";
  import Hexagon from "$lib/components/hexagon.svelte";
  import SplitPanel from "$lib/components/splitPanel.svelte";
</script>

<svelte:head>
  <title>Projects</title>
  <meta name="title" content="Projects" />
  <meta
    name="description"
    content="The location of every public project I (miyuki) worked on :)"
  />
</svelte:head>

<div class="font-mplus2 min-h-screen bg-index-bg text-white flex flex-col">
  <div class="relative flex flex-col h-[93vh] z-20">
    <Header />
    <div class="absolute inset-0 overflow-hidden z-0">
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
           h-[105vh] w-[105vh] md:h-[105vw] md:w-[105vw]
           animate-spin-slow bg-[url('/images/compass/compass-static.png')] bg-cover"
      ></div>
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
           h-[105vh] w-[105vh] md:h-[105vw] md:w-[105vw]
           animate-spin-fast bg-[url('/images/compass/compass-main.png')] bg-cover"
      ></div>
    </div>
    <div class="h-full flex flex-col text-center md:text-start relative">
      <p class="text-4xl font-mplus2 p-16 md:p-24"></p>
    </div>
  </div>

  <div class="flex flex-col gap-8 bg-black">
    <SplitPanel label="PROJECTS">
      <h1>Hello!</h1>
    </SplitPanel>
    <SplitPanel label="UPDATES">
      <h1>Hello!</h1>
    </SplitPanel>
  </div>

  <Footer />
</div>

<style>
  @keyframes imageSpin {
    0% {
      rotate: 0deg;
    }
    100% {
      rotate: 360deg;
    }
  }
  .animate-spin-slow {
    animation: imageSpin 360s linear infinite;
  }

  .animate-spin-fast {
    animation: imageSpin 32s linear infinite;
  }
</style>
