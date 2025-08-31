<script lang="ts">
  import Footer from "./footer.svelte";
  import Header from "./header.svelte";

  let { children }: { children: Function } = $props();
</script>

<div class="font-mplus2 min-h-screen bg-stone-900 text-white flex flex-col">
  <div class="flex flex-col min-h-screen flex-grow">
    <Header />
    {@render children()}
  </div>
  <Footer />
</div>
