<script lang="ts">
  import BackArrow from "$lib/components/gitviewer/backArrow.svelte";
  import MarkdownViewer from "$lib/components/gitviewer/markdownViewer.svelte";
  import PageBody from "$lib/components/pageBody.svelte";
  import { marked } from "marked";
  import type { PageProps } from "./$types";
  import StellarButton from "$lib/components/stellar/stellarButton.svelte";
  import CreateRelease from "$lib/components/popups/createRelease.svelte";
  import PopupBase from "$lib/components/stellar/popupBase.svelte";
  import type { ProjectRelease } from "$lib/server/db";

  let { data }: PageProps = $props();

  let selectedRelease: (ProjectRelease & { localFiles: string[] }) | undefined =
    $state();
  let selectedReleasePopup: PopupBase | undefined = $state();

  let createReleasePopup: CreateRelease | undefined = $state();
</script>

<CreateRelease project={data.project} bind:this={createReleasePopup} />

<svelte:head>
  <title>
    Releases of {data.project.displayName ?? data.project.name}</title
  >
  <meta name="description" content="Has {data.releases.length} releases." />
</svelte:head>

{#if selectedRelease}
  <PopupBase
    bind:this={selectedReleasePopup}
    onClose={() => (selectedRelease = undefined)}
    title={selectedRelease.markdownText.split("\n")[0].replaceAll("#", "")}
    buttons={{}}
  >
    <div id="markdown-ctn" class="overflow-auto">
      {@html marked(
        selectedRelease.markdownText.split("\n").slice(1).join("\n"),
      )}
    </div>
    <h1 class="font-baskervville text-amber-200 text-xl">Artifacts</h1>
    <div class="flex flex-col gap-2">
      {#each selectedRelease.localFiles as artifact}
        <a
          href="/u/{data.profile.name}/projects/{data.project
            .name}/releases/dl/{selectedRelease.id}/{artifact}"
          class="h-full hover:bg-amber-500/20 flex flex-row gap-1 items-center"
        >
          <img
            src="https://galatea.ane.jp.net/dl/images/explorer/file-unknown.webp"
            alt=""
            class="h-8"
          />
          {artifact}</a
        >
      {/each}
    </div>
  </PopupBase>
{/if}

<PageBody>
  <div class="flex flex-col gap-8">
    <div class="flex flex-row">
      <p
        class="px-8 mx-auto italic text-xl font-baskervville text-orange-300 flex flex-row items-center gap-2"
      >
        <span class="text-3xl">&quot;</span>
        Novae of {data.project.displayName ?? data.project.name}
        <span class="text-3xl transform rotate-180">&quot;</span>
      </p>
    </div>
    <div class="flex flex-col gap-4 mb-8 px-8">
      <div class="mx-auto">
        <StellarButton
          onclick={() => createReleasePopup?.setVisible(true)}
          label="Create"
        />
      </div>
      <div class="bg-orange-200 clip-notch-tr-bl p-px">
        <div class="relative flex flex-col gap-4 bg-black clip-notch-tr-bl p-6">
          <BackArrow activeBranch="master"></BackArrow>
          {#each data.releases as release}
            <button
              class="flex flex-row text-left gap-4 group items-center group hover:bg-orange-400/20 px-2 cursor-pointer"
              onclick={() => {
                selectedRelease = release;
                selectedReleasePopup?.setVisible(true);
              }}
            >
              <div class="self-start w-2 flex flex-row text-orange-200">
                <h2 class="mx-auto">⯌</h2>
              </div>
              <div
                class="flex flex-col group-hover:text-md group-hover:text-orange-200"
              >
                <p class="font-baskervville italic text-orange-100">
                  {@html marked(
                    release.markdownText.split("\n")[0].replaceAll("#", ""),
                  )}
                </p>

                <p class="font-kumbh text-sm w-fit">
                  By
                  <a
                    href="/u/{release.contributorUsername}"
                    class="hover:underline w-fit"
                    >{release.contributorUsername}
                  </a>
                </p>
              </div>

              <div class="ml-auto w-fit flex-col flex">
                <p class="font-mplus2 text-xs">
                  {new Date(release.created_at * 1000).toISOString()}
                </p>
              </div>
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</PageBody>
