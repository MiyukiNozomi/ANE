<script lang="ts">
  import Footer from "./footer.svelte";
  import Header, { type HeaderOptions } from "./header.svelte";

  let {
    children,
    headerOptions,
  }: { children: Function; headerOptions?: HeaderOptions } = $props();
</script>

<div
  class="fixed top-0 left-0 w-full h-screen border-x border-orange-200"
></div>
<div class="font-mplus2 min-h-screen bg-stone-900 text-white flex flex-col">
  <div class="flex flex-col min-h-screen grow gap-8 z-10">
    <Header {headerOptions} />
    {@render children()}
  </div>
  <Footer />
</div>
