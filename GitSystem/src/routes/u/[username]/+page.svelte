<script lang="ts">
  import { getAccountInfo, invalidateSession } from "$lib/client-account";
  import Footer from "$lib/components/footer.svelte";
  import Header from "$lib/components/header.svelte";
  import NewRepository from "$lib/components/popups/newRepository.svelte";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";
  import StellarButton from "$lib/components/stellar/stellarButton.svelte";

  let { data }: PageProps = $props();

  const accountInfo = getAccountInfo();

  let newRepositoryPopup: NewRepository;
</script>

<NewRepository bind:this={newRepositoryPopup} />

<div class="font-mplus2 min-h-screen bg-stone-900 text-white flex flex-col">
  <div class="flex flex-col h-screen z-20">
    <Header />
    <div class="h-full flex flex-col text-center md:text-start relative">
      {#if accountInfo?.name == data.profile.name && accountInfo.isAdmin}
        <div class="flex flex-row">
          <StellarButton
            onclick={() => newRepositoryPopup.setVisible(true)}
            label={"New Repository!"}
          />
        </div>
      {/if}

      {#if accountInfo?.name == data.profile.name}
        <button onclick={invalidateSession}>Sign Out</button>
      {/if}
    </div>
  </div>
  <Footer />
</div>
