<script lang="ts">
  import Footer from "./footer.svelte";
  import Header from "./header.svelte";

  let { children }: { children: Function } = $props();
</script>

<div
  class="fixed top-0 left-0 w-full h-screen border-x-1 border-orange-200"
></div>
<div class="font-mplus2 min-h-screen bg-stone-900 text-white flex flex-col">
  <div class="flex flex-col min-h-screen flex-grow gap-8 z-10">
    <Header />
    {@render children()}
  </div>
  <Footer />
</div>
