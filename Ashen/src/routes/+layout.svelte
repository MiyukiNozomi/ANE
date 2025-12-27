<script lang="ts">
  import "./layout.css";

  let { children } = $props();
</script>

<svelte:head>
  <meta name="darkreader-lock" />
  <link rel="icon" href={"/favicon.png"} />
</svelte:head>
{@render children()}
