<script lang="ts">
  import Header from "$lib/components/header.svelte";
  import PageBody from "$lib/components/pageBody.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Search for "{data.query}"</title>
  <meta name="title" content="Search for '{data.query}'" />
  <meta
    name="description"
    content="Compass search page, this query has yielded {data.searchResults
      .length} search results."
  />
</svelte:head>

<PageBody>
  <div class="px-8 flex flex-col gap-4">
    <p class="text-orange-200 font-baskervville md:text-3xl not-md:text-xl">
      Search Results for "{data.query}"
    </p>
    {#each data.searchResults as searchResult}
      <div class="flex flex-col px-2 w-full">
        <a
          class="text-suisei-200 font-baskervville md:text-2xl not-md:text-lg hover:underline w-fit"
          href={searchResult.url}
        >
          {searchResult.title}
        </a>
        <p class="text-green-200 font-ibmplex text-xs">{searchResult.url}</p>
        <p class="py-1 text-md not-lg:text-sm">{searchResult.description}</p>
      </div>
    {:else}
      <p class="text-red-200 text-2xl not-md:text-lg">No results!</p>
    {/each}
  </div>
</PageBody>
