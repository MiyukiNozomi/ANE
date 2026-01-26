<script lang="ts">
  import BackArrow from "$lib/components/gitviewer/backArrow.svelte";
  import CodeView from "$lib/components/gitviewer/codeView.svelte";
  import FileList from "$lib/components/gitviewer/fileList.svelte";
  import MarkdownViewer from "$lib/components/gitviewer/markdownViewer.svelte";
  import PageBody from "$lib/components/pageBody.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Index of {data.filename}</title>
  <meta name="description" content={data.project.description} />
</svelte:head>

<PageBody>
  <div class="flex flex-col gap-8">
    <div class="flex flex-row">
      <p
        class="px-8 mx-auto italic text-xl font-baskervville text-orange-300 flex flex-row items-center gap-2"
      >
        {data.individualFile ? "Viewing" : "Index of"}
        <span class="text-3xl">&quot;</span>

        {data.filename}
        <span class="text-3xl transform rotate-180">&quot;</span>
        in
        <span class="text-3xl">&quot;</span>
        <a
          href="/u/{data.profile.name}/projects/{data.project.name}"
          class="hover:text-white hover:underline"
          >{data.project.displayName ?? data.project.name}</a
        >
        <span class="text-3xl transform rotate-180">&quot;</span>
      </p>
    </div>
    <div class="flex flex-col gap-4 mb-8 px-8">
      <div class="bg-orange-200 clip-notch-tl-br p-px">
        <div class="bg-black clip-notch-tl-br p-6">
          {#if data.individualFile}
            {#if data.isImage}
              <BackArrow activeBranch={data.activeBranch}></BackArrow>
              <img
                src={`/u/${data.profile.name}/projects/${data.project.name}/fs-raw/${data.individualFile.filepath}`}
                alt=""
                class="max-w-full overflow-auto mx-auto"
              />
            {:else}
              <CodeView
                activeBranch={data.activeBranch}
                sourceURL={`/u/${data.profile.name}/projects/${data.project.name}/fs-raw/${data.individualFile.filepath}`}
              />
            {/if}
          {:else}
            <FileList
              activeBranch={data.activeBranch}
              project={data.project}
              parentDirectory={data.directoryEntry}
            />
          {/if}
        </div>
      </div>

      {#if data.currentReadmeFile}
        <MarkdownViewer
          sourceURL={`/u/${data.profile.name}/projects/${data.project.name}/fs-raw/${data.currentReadmeFile.filepath}`}
        ></MarkdownViewer>
      {/if}
    </div>
  </div>
</PageBody>
