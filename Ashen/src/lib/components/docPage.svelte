<script lang="ts">
  import Header from "./header.svelte";
  import TableOfContents from "./tableOfContents.svelte";

  let { children } = $props();
</script>

<div
  class="flex flex-col bg-linear-to-b from-indigo-200 to-purple-950/40 min-h-screen h-screen"
>
  <Header />
  <div class="flex flex-row h-full">
    <TableOfContents></TableOfContents>
    <div class="flex flex-col gap-6 p-8 w-full">
      {@render children()}
    </div>
  </div>
</div>
