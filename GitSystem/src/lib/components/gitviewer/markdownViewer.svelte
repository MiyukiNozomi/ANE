<script lang="ts">
  import { marked } from "marked";
  import { onMount } from "svelte";

  let { sourceURL }: { sourceURL: string } = $props();

  let title = $state("LOADING");
  let downloadedMarkdown: string | undefined = $state(undefined);

  onMount(() => {
    fetch(sourceURL, { method: "GET" }).then((res) =>
      res.text().then((str) => {
        if (res.status != 200)
          return (downloadedMarkdown =
            "Couldn't load this markdown preview, sorry.");
        // also for paranoia reasons
        const mk = str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const lines = mk.split("\n");
        if (lines[0].startsWith("#")) {
          title = lines[0].substring(1).trim();
          downloadedMarkdown = lines.slice(1).join("\n");
        } else {
          downloadedMarkdown = mk;
        }
      })
    );
  });
</script>

<div class="relative bg-orange-200 p-[1px] clip-notch-tl-br">
  <div class="flex flex-col bg-black p-8 pt-0 clip-notch-tl-br">
    <div
      class="
        flex flex-row w-full items-center gap-4 bg-black py-4
        text-orange-200 group text-4xl font-baskervville"
    >
      <span class="group-hover:animate-pulsing">✧</span>
      <h1 class="">{title}</h1>
    </div>
    {#if downloadedMarkdown}
      <div id="markdown-ctn" class="overflow-auto">
        {@html marked(downloadedMarkdown)}
      </div>
    {/if}
  </div>
</div>
