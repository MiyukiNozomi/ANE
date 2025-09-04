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
      <div class="col-span-6 md:col-span-7">
        {#if data.filelist}
          <CollapsablePanel
            openLabel="Reveal File List"
            closeLabel="Hide File List"
            className="w-full"
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
        {:else}
          <h2 class="w-full">Apologies! this repository is empty!</h2>
        {/if}
      </div>
      <StellarSection
        title={"DETAILS"}
        className="col-span-3 md:col-span-2 h-fit"
      >
        <h2
          class="font-baskervville text-xl text-orange-300 text-center pb-2 border-b-1 border-orange-200 border-dotted"
        >
          S T A T I S T I C S
        </h2>
        <h1 class="font-mplus2 text-gray-300 font-extrabold text-sm">
          <span class="text-white">{data.commitCount}</span> COMMITS
        </h1>
      </StellarSection>
    </div>
  </div>
</PageBody>
