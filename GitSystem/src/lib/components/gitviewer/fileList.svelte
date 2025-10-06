<script lang="ts">
  import type { Project } from "$lib/server/db";
  import type { GitFile } from "$lib/server/git/fs/branch";
  import { SUPPORTED_LANGUAGES_BY_EXTENSION } from "$lib/shared/constants";
  import BackArrow from "./backArrow.svelte";

  let {
    project,
    activeBranch,
    parentDirectory,
    isRoot = false,
  }: {
    isRoot?: boolean;
    activeBranch: string;
    project: Project;
    parentDirectory: GitFile;
  } = $props();

  const galateaExplorerURL = "https://galatea.ane.jp.net/dl/images/explorer/";

  function iconURLOf(file: GitFile) {
    if (!file.isFile) return galateaExplorerURL + "folder.webp";
    const ext = file.filename.substring(file.filename.lastIndexOf(".") + 1);
    const lang = (SUPPORTED_LANGUAGES_BY_EXTENSION as Record<string, string>)[
      ext
    ];

    if (lang && lang != "text/plain")
      return galateaExplorerURL + "file-" + lang + ".webp";
    return galateaExplorerURL + "file-unknown.webp";
  }
</script>

<div class="flex flex-col">
  {#if !isRoot}
    <BackArrow {activeBranch}></BackArrow>
  {/if}
  {#each parentDirectory.children as fileEntry}
    <a
      class="
    flex flex-row gap-4 p-1 text-xl items-center font-mplus2 group
    text-orange-200 bg-inherit border-1 border-black
    hover:text-white hover:underline hover:border-orange-200"
      href={`/u/${project.authorUsername}/projects/${project.name}/fs/${fileEntry.filepath}?branch=${activeBranch}`}
    >
      <img
        class="h-8
        filter-none group-hover:filter group-hover:grayscale group-hover:brightness-100"
        src={iconURLOf(fileEntry)}
        alt="File/directory icon"
      />
      {fileEntry.filename}
    </a>
  {/each}
</div>
