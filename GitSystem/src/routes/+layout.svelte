<script lang="ts">
  import "../app.css";

  let { children } = $props();
</script>

<svelte:head>
  <meta name="darkreader-lock" />
</svelte:head>
{@render children()}
