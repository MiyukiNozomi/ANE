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
    <p class="mx-auto">{data.project.description}</p>
  </div>
</PageBody>
