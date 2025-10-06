<script lang="ts">
  import { dev } from "$app/environment";
  import { doHighlighting } from "$lib/client/codeview/codeview";
  import type { Token } from "$lib/client/codeview/lexer";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import BackArrow from "./backArrow.svelte";

  let { activeBranch, sourceURL }: { activeBranch: string; sourceURL: string } =
    $props();

  let downloadedText: string | undefined = $state(undefined);
  let tokens: Array<Array<Token>> = $state([]);

  let highlightedIndices: number[] = $state([]);

  onMount(async () => {
    const res = await fetch(sourceURL + "?branch=" + activeBranch, {
      method: "GET",
    });
    // also for paranoia reasons
    if (res.status != 200)
      return (downloadedText = "Couldn't load this file as text, sorry.");
    const str = await res.text();
    downloadedText = str;

    let ext = sourceURL.substring(sourceURL.lastIndexOf(".") + 1);

    tokens = await doHighlighting(ext, downloadedText);
    if (dev) console.log(tokens);

    let searchParams = window.location.hash;
    if (searchParams.startsWith("#")) {
      // meh, i don't need column support.
      highlightedIndices = searchParams
        .slice(1)
        .split(":")
        .map((v) => parseInt(v) - 1)
        .filter((v) => !isNaN(v));
    }
  });

  function styleToken(token: Token) {
    if (token.type == "Keyword") return "text-orange-300";
    if (token.type == "String") return "text-sky-200";
    if (token.type == "Number") return "text-suisei-500";
    if (token.type == "Comment") return "text-suisei-300";
    if (token.type == "Type") return "text-blue-500";
    return "font-light";
  }
</script>

<BackArrow {activeBranch}></BackArrow>
{#if downloadedText}
  <div transition:slide class="flex flex-row overflow-auto font-ibmplex">
    <!-- Line numbers column -->
    <div class="flex flex-col items-end text-orange-200 select-none">
      {#each tokens as _, lineNum}
        <button
          onclick={() => {
            highlightedIndices = [];
            highlightedIndices.push(lineNum);
          }}
          class="w-8 text-right pr-4 cursor-pointer {highlightedIndices.includes(
            lineNum,
          )
            ? 'bg-orange-500/10'
            : ''}">{lineNum + 1}</button
        >
      {/each}
    </div>

    <!-- Code content column -->
    <div class="flex flex-col flex-1">
      {#each tokens as tokenLine, lineNum}
        <pre><p
            class="flex flex-row {highlightedIndices.includes(lineNum)
              ? 'bg-orange-300/10'
              : 'hover:bg-white/10'} flex-wrap">
          {#each tokenLine as token}
              <span class={styleToken(token)}
                >{#if token.str.length == 0}&nbsp;{:else}{token.str}{/if}</span
              >
            {/each}
        </p></pre>
      {/each}
    </div>
  </div>
{:else}
  <div
    transition:slide
    class="
        flex flex-row w-full items-center gap-4 bg-black py-4
        text-orange-200 group text-4xl font-baskervville"
  >
    <span class="group-hover:animate-pulsing">✧</span>
    <h1 class="">LOADING</h1>
  </div>
{/if}
