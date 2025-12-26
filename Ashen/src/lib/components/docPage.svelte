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
  class="flex flex-col bg-linear-to-b from-indigo-200 to-purple-950/40 min-h-screen"
>
  <Header />
  <div class="flex flex-row h-full">
    <TableOfContents></TableOfContents>
    <div class="flex flex-col gap-6 p-8 w-full font-mplus2">
      <h1 class="font-kumbh text-4xl pb-2">{title}</h1>
      <p class="text-2xl font-light">{description}</p>
      {@render children()}
    </div>
  </div>
</div>
