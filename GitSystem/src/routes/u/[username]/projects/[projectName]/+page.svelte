<script lang="ts">
  import FileList from "$lib/components/gitviewer/fileList.svelte";
  import MarkdownViewer from "$lib/components/gitviewer/markdownViewer.svelte";
  import PageBody from "$lib/components/pageBody.svelte";
  import CollapsablePanel from "$lib/components/stellar/collapsablePanel.svelte";
  import StellarSection from "$lib/components/stellar/stellarSection.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

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
    <!-- Upper Half of Page -->
    <div class="flex flex-col md:grid md:grid-cols-9 gap-8 px-8">
      <div class="flex flex-col col-span-6 md:col-span-7 gap-8">
        {#if data.filelist}
          <CollapsablePanel
            openLabel="Reveal File List"
            closeLabel="Hide File List"
            className="w-full"
          >
            <FileList
              isRoot={true}
              activeBranch={data.activeBranch}
              project={data.project}
              parentDirectory={data.filelist}
            />
          </CollapsablePanel>
        {:else}
          <h2 class="w-full">Apologies! this repository is empty!</h2>
        {/if}

        <!-- README -->
        {#if data.hasMarkdownFile}
          <MarkdownViewer
            sourceURL={`/u/${data.profile.name}/projects/${data.project.name}/fs-raw/README.md`}
          />
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
        <h1 class="font-baskervville text-gray-300 font-light text-lg">
          <a
            href="/u/{data.profile.name}/projects/{data.project.name}/commits"
            class="hover:text-orange-200 hover:underline group"
          >
            <span class="group-hover:text-orange-300 text-white"
              >{data.commitCount}</span
            > COMMITS
          </a>
        </h1>

        {#if data.branchlist.length > 0}
          <h2
            class="font-baskervville text-xl text-orange-300 text-center pb-2 border-b-1 border-orange-200 border-dotted"
          >
            B R A N C H E S
          </h2>
          <div class="flex flex-col">
            {#each data.branchlist as branch}
              <a
                href="/u/{data.profile.name}/projects/{data.project
                  .name}?branch={branch}"
                class="hover:text-orange-200 hover:underline group font-baskervville"
              >
                {branch}
              </a>
            {/each}
          </div>
        {/if}
        <h2
          class="font-baskervville text-xl text-orange-300 text-center pb-2 border-b-1 border-orange-200 border-dotted"
        >
          M E M B E R S
        </h2>
        <div class="grid grid-cols-3">
          {#each data.project.contributors as contributor}
            <a
              href="/u/{contributor.contributorUsername}"
              class="flex flex-row items-center w-12 h-12 relative cursor-pointer"
              title={contributor.contributorUsername ==
              data.project.authorUsername
                ? contributor.contributorUsername +
                  " is the author of this project."
                : ""}
            >
              {#if contributor.contributorUsername == data.project.authorUsername}
                <img
                  class="absolute h-full w-full animate-spin-fast [animation-play-state:paused] hover:[animation-play-state:running] duration-1000 transition-all ease-out"
                  src="https://galatea.ane.jp.net/dl/images/badges/gitsys-author.webp"
                  alt=""
                />
              {/if}
              <img
                class="w-4/5 h-4/5 mx-auto rounded-full p-1"
                src="https://auth.ane.jp.net/home/u/{contributor.contributorUsername}/picture"
                alt=""
              />
            </a>
          {/each}
        </div>
      </StellarSection>
    </div>
  </div>
</PageBody>
