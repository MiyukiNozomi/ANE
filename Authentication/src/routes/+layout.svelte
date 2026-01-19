<script lang="ts">
  import "./layout.css";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.webp" />
  <meta name="darkreader-lock" />
  <meta name="theme-color" content="#812597" />
</svelte:head>
{@render children()}
