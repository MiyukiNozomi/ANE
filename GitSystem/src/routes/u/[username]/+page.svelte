<script lang="ts">
  import { getAccountInfo } from '$lib/client-account';
  import Footer from '$lib/components/footer.svelte';
  import Header from '$lib/components/header.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    const accountInfo = getAccountInfo();
</script>


<div class="font-mplus2 min-h-screen bg-slate-900 text-white flex flex-col">
  <div class="flex flex-col h-screen z-20">
    <Header />
    <div class="h-full flex flex-col text-center md:text-start relative">
      {#if accountInfo?.name == data.profile.name}
      <div class="flex flex-row">
        <button>Create Repository</button>
      </div>
      {/if}
      <h1>{data.profile.displayName}</h1>
      <h1>Repositories</h1>
    </div>
  </div>
  <Footer />
</div>
