<script lang="ts">
  import { getAccountInfo, invalidateSession } from "$lib/client-account";
  import Footer from "$lib/components/footer.svelte";
  import Header from "$lib/components/header.svelte";
  import NewRepository from "$lib/components/popups/newRepository.svelte";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";
  import StellarButton from "$lib/components/stellar/stellarButton.svelte";
  import PageBody from "$lib/components/pageBody.svelte";

  let { data }: PageProps = $props();

  const accountInfo = getAccountInfo();

  let newRepositoryPopup: NewRepository;
</script>

<NewRepository bind:this={newRepositoryPopup} />

<PageBody>
  <div class="flex flex-row">
    <p
      class="mx-auto italic text-xl font-baskervville text-orange-300 flex flex-row items-center gap-2"
    >
      <span class="text-3xl">&quot;</span>
      {data.project.description}
      <span class="text-3xl transform rotate-180">&quot;</span>
    </p>
  </div>
</PageBody>
