<script lang="ts">
  import { getAccountInfo } from "$lib/client-account";
  import PageBody from "$lib/components/pageBody.svelte";
  import NewRepository from "$lib/components/popups/newRepository.svelte";
  import CollapsablePanel from "$lib/components/stellar/collapsablePanel.svelte";
  import StellarSection from "$lib/components/stellar/stellarSection.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const accountInfo = getAccountInfo();

  let newRepositoryPopup: NewRepository;
</script>

<NewRepository bind:this={newRepositoryPopup} />

<PageBody>
  <div class="flex flex-row">
    <p
      class="px-8 mx-auto italic text-xl font-baskervville text-orange-300 flex flex-row items-center gap-2"
    >
      <span class="text-3xl">&quot;</span>
      {data.project.description}
      <span class="text-3xl transform rotate-180">&quot;</span>
    </p>
  </div>

  <div class="flex flex-col gap-4 mb-8">
    <div class="flex flex-col md:grid md:grid-cols-9 gap-8 px-8">
      <CollapsablePanel
        openLabel="Reveal File List"
        closeLabel="Hide File List"
        className="col-span-7"
      >
        <a
          class="transition-colors duration-300 ease-in-out text-gray-200 hover:text-orange-300 hover:underline"
          href={`../`}
          >..
        </a>
        {#each data.filelist as fileEntry}
          <a
            class="transition-colors duration-300 ease-in-out text-gray-200 hover:text-orange-300 hover:underline"
            href={`/u/${data.project.authorUsername}/projects/${data.project.name}/${fileEntry.filepath}`}
          >
            {#if fileEntry.isFile}
              &#128196;
            {:else}
              &#128194;
            {/if}
            {fileEntry.filename}</a
          >
        {/each}
      </CollapsablePanel>
      <StellarSection title={"DETAILS"} className="col-span-2 h-fit">
        <h1>b</h1>
      </StellarSection>
    </div>
  </div>
</PageBody>
