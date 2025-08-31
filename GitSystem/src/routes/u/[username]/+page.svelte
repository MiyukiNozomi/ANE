<script lang="ts">
  import { getAccountInfo, invalidateSession } from "$lib/client-account";
  import PageBody from "$lib/components/pageBody.svelte";
  import NewRepository from "$lib/components/popups/newRepository.svelte";
  import StellarButton from "$lib/components/stellar/stellarButton.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const accountInfo = getAccountInfo();

  let newRepositoryPopup: NewRepository;
</script>

<NewRepository bind:this={newRepositoryPopup} />

<PageBody>
  <div class="flex flex-col text-center md:text-start relative">
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
</PageBody>
