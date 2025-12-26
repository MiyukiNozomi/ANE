<script lang="ts">
  import DocPage from "$lib/components/docPage.svelte";
  import Header from "$lib/components/header.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<DocPage>
  <h1 class="font-kumbh text-4xl">Welcome to Ashen</h1>
</DocPage>
