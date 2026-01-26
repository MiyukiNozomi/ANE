<script lang="ts">
  import BackArrow from "$lib/components/gitviewer/backArrow.svelte";
  import PageBody from "$lib/components/pageBody.svelte";
  import StellarCheckbox from "$lib/components/stellar/stellarCheckbox.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  // svelte-ignore state_referenced_locally
  const initialIsPrivateRepository = data.project.isPrivateRepository;

  let projectOptions = $state({
    isPrivateRepository: initialIsPrivateRepository,
  });
</script>

<svelte:head>
  <title>Commits of {data.project.displayName ?? data.project.name}</title>
  <meta name="description" content="Private page." />
</svelte:head>

<PageBody>
  <p>TODO this page</p>
  <div class="flex flex-col gap-8">
    <div class="flex flex-row">
      <p
        class="px-8 mx-auto italic text-xl font-baskervville text-orange-300 flex flex-row items-center gap-2"
      >
        <span class="text-3xl">&quot;</span>
        Introspection of
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
        <div class="flex flex-col gap-4 bg-black clip-notch-tl-br p-6">
          <BackArrow activeBranch="master"></BackArrow>
          <h1
            class=" gap-4 py-4
        text-orange-200 group text-4xl font-baskervville"
          >
            Configuration
          </h1>

          <StellarCheckbox
            bind:checkValue={projectOptions.isPrivateRepository}
            label={"Private Repository"}
          />
        </div>
      </div>
    </div>
  </div>
</PageBody>
