<script lang="ts">
  import CodeBlock from "$lib/components/codeBlock.svelte";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

  type MessageInfo = {
    title: string;
    snippet: string;
  };
  let texts: MessageInfo[] = [
    {
      title: "without universal truth",
      snippet: `
var someGlobal; // Error!

@Export
proc main(args : String[]) {
    someGlobal == 0; 
}
            `,
    },
    {
      title: "with explicit nullability",
      snippet: `      
@Export
proc main(args : String[]) {
    var 
} 
`,
    },
  ];

  let currentMessage: MessageInfo = $state(texts[0]);

  onMount(() => {
    setTimeout(() => {
      currentMessage = texts.shift()!;
      texts.push(currentMessage);
    }, 300);
  });
</script>

<svelte:head>
  <title>Ashen</title>
  <meta name="description" content="The language of the universe." />
</svelte:head>

<div class="min-h-screen bg-linear-to-b from-gray-200 to-indigo-400/60">
  <div class="flex flex-row items-center h-screen">
    <div class="relative flex flex-col items-center max-w-2/5 mx-auto">
      <img
        src="https://galatea.ane.jp.net/dl/images/logos/ashen-logo-full.webp"
        alt=""
        class="w-full"
      />
    </div>
    <div class="ml-auto flex flex-col gap-4 mr-24">
      <h1 class="font-metal font-light text-6xl text-indigo-600">
        Imagine a world...
      </h1>
      <div class="gap-2 flex flex-col" transition:slide>
        <p class="font-kumbh font-bold text-4xl px-2 py-1 bg-indigo-500/30">
          {currentMessage.title}
        </p>
        <CodeBlock code={currentMessage.snippet}></CodeBlock>
      </div>
    </div>
  </div>
</div>
