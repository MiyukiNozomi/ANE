<script lang="ts">
  import CodeBlock from "$lib/components/codeBlock.svelte";
  import DocPage from "$lib/components/docPage.svelte";
  import Header from "$lib/components/header.svelte";
  import Warning from "$lib/components/warning.svelte";
  import type { PageProps } from "../../docs copy/$types";

  let { data }: PageProps = $props();
</script>

<DocPage title="Pattern Maching" description="Were it so easy..">
  <h1 class="text-4xl font-metal font-bold">It is not that different!</h1>
  <p class="font-mplus2">
    In the basics, we read that Ashen types are immutable, so how is null safety
    done? how do I.. un-null something?
  </p>

  <h1 class="text-4xl font-metal font-bold">
    Checking if something is null, and if not generating a new variable:
  </h1>
  <CodeBlock
    code={`
var nullContent : String? = fsReadText("/banana.txt");

if (nullContent then ctn) {
      // ctn is nullContent but of type String, only if nullContent is not null!
}

// If you do not want to manually handle nullables, you can alternative call .force() on any null value to make
// your program crash immediately in case it is null.
`}
  ></CodeBlock>

  <h1 class="text-4xl font-metal font-bold">
    I have a tree of Nodes, but how do I know if a Node is a Text node or HTML
    Element?
  </h1>
  <p>And there is Ashen's instanceof operator!</p>
  <CodeBlock
    code={`
var node = parseDocument(....);
  
if (node instanceof HTMLElement) {
      // node is an HTMLElement! cast like this:
    var element = node as HTMLElement;
}

// hmm.. thats a lot, but fear no evil! the snippet below does the same thing:

if (node instanceof HTMLElement then element) {
      // element is of type HTMLElement!
}
`}
  ></CodeBlock>
</DocPage>
