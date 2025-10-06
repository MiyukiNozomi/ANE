<script lang="ts">
  import BackArrow from "$lib/components/gitviewer/backArrow.svelte";
  import PageBody from "$lib/components/pageBody.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<PageBody>
  <div class="flex flex-col gap-8">
    <div class="flex flex-row">
      <p
        class="px-8 mx-auto italic text-xl font-baskervville text-orange-300 flex flex-row items-center gap-2"
      >
        <span class="text-3xl">&quot;</span>
        Constelations of {data.project.displayName ?? data.project.name}
        <span class="text-3xl transform rotate-180">&quot;</span>
      </p>
    </div>
    <div class="flex flex-col gap-4 mb-8 px-8">
      <div class="bg-orange-200 clip-notch-tl-br p-[1px]">
        <div class="flex flex-col gap-4 bg-black clip-notch-tl-br p-6">
          <BackArrow activeBranch="master"></BackArrow>
          {#each data.commits as commit}
            <div
              class="flex flex-row gap-4 group items-center cursor-default group hover:bg-orange-400/20 px-2"
            >
              <div class="self-start w-2 flex flex-row text-orange-200">
                <h2 class="mx-auto">⯌</h2>
              </div>
              <p
                class="flex flex-col group-hover:text-md group-hover:text-orange-200"
              >
                <span class="font-baskervville italic text-orange-100"
                  >{commit.message}</span
                >
                <a
                  href="/u/{commit.author}"
                  class="font-kumbh text-sm hover:underline"
                  >{commit.author}
                  <span class="text-orange-200 opacity-60"
                    >&lt;{commit.authorEmail}&gt;</span
                  ></a
                >
              </p>

              <div class="ml-auto w-fit flex-col flex">
                <p class="font-mplus2 text-xs">
                  {new Date(commit.date).toISOString()}
                </p>
                <p class="font-baskervville text-xs text-orange-200/80">
                  {commit.age}
                </p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</PageBody>
