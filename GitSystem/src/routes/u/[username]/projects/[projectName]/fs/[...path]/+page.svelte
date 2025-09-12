<script lang="ts">
  import { getAccountInfo } from "$lib/client/client-account";
  import CodeView from "$lib/components/gitviewer/codeView.svelte";
  import FileList from "$lib/components/gitviewer/fileList.svelte";
  import PageBody from "$lib/components/pageBody.svelte";
  import NewRepository from "$lib/components/popups/newRepository.svelte";
  import CollapsablePanel from "$lib/components/stellar/collapsablePanel.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const accountInfo = getAccountInfo();

  let newRepositoryPopup: NewRepository;
</script>

<NewRepository bind:this={newRepositoryPopup} />

<PageBody>
  <div class="flex flex-col gap-8">
    <div class="flex flex-row">
      <p
        class="px-8 mx-auto italic text-xl font-baskervville text-orange-300 flex flex-row items-center gap-2"
      >
        {data.filelist.length == 0 ? "Viewing" : "Index of"}
        <span class="text-3xl">&quot;</span>
        {data.filename}
        <span class="text-3xl transform rotate-180">&quot;</span>
      </p>
    </div>
    <div class="flex flex-col gap-4 mb-8 px-8">
      <div class="bg-orange-200 clip-notch-tl-br p-[1px]">
        <div class="bg-black clip-notch-tl-br p-6">
          {#if data.individualFile}
            <CodeView
              sourceURL={`/u/${data.profile.name}/projects/${data.project.name}/fs-raw/${data.individualFile.filepath}`}
            />
          {:else}
            <FileList project={data.project} filelist={data.filelist} />
          {/if}
        </div>
      </div>
    </div>
  </div>
</PageBody>
