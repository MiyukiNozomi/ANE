<script lang="ts">
  import { browser } from "$app/environment";

  let links = [
    ["Welcome", "/docs"],
    ["Syntaxes", "/docs/syntax"],
    ["Pattern Matching", "/docs/pattern-matching"],
    ["Building and Compiling", "/docs/building"],
    ["Compiler Interstricts", "/docs/advanced/compiler-interstricts"],
  ];
</script>

<div
  class="flex flex-col lg:grow lg:gap-4 px-4 lg:py-8 not-lg:py-4 font-mplus2 text-2xl bg-purple-200/40 lg:min-h-screen not-lg:h-fit lg:w-48 rounded-b-xl"
>
  <h1 class="font-kumbh font-bold text-2xl">TABLE OF CONTENTS</h1>
  {#each links as link}
    <a
      class="not-lg:py-4 {browser && link[1] == window.location.pathname
        ? 'underline text-indigo-600'
        : ''}"
      href={link[1]}>{link[0]}</a
    >
  {/each}
</div>
