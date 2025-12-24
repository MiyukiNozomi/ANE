<script lang="ts">
  import "./layout.css";

  let { children } = $props();
</script>

<svelte:head><link rel="icon" href="/favicon.webp" /></svelte:head>
{@render children()}
