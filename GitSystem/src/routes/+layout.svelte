<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <meta name="darkreader-lock" />
  <meta name="theme-color" content="#1d4ed8" />
</svelte:head>
{@render children()}
