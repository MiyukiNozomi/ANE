<script lang="ts">
  import Header from "./header.svelte";
  import TableOfContents from "./tableOfContents.svelte";

  let { children, title, description } = $props();
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
</svelte:head>

<div
  class="flex flex-col bg-linear-to-b from-indigo-200 not-lg:to-indigo-400/90 lg:to-purple-950/40 min-h-screen"
>
  <Header />
  <div class="flex not-lg:flex-col lg:flex-row h-full">
    <TableOfContents></TableOfContents>
    <div
      class="flex flex-col not-lg:gap-2 lg:gap-6 p-8 w-full lg:max-w-5/6 font-mplus2"
    >
      <h1 class="font-kumbh not-lg:text-2xl lg:text-4xl pb-2">{title}</h1>
      <p class="lg:text-2xl not-lg:text-xl font-light">{description}</p>
      {@render children()}
    </div>
  </div>
</div>
