<script lang="ts">
  import CodeBlock from "$lib/components/codeBlock.svelte";
  import Footer from "$lib/components/footer.svelte";
  import { onMount, tick } from "svelte";
  import { slide } from "svelte/transition";

  type MessageInfo = {
    title: string;
    snippet: string;
  };
  let texts: MessageInfo[] = [
    {
      title: "with runtime type checking",
      snippet: `
import stdc.stdio;

struct A { }
struct B < A { num : Float; }
struct C < A { num : Int; }

@Export
proc main(args : String[]) {
    var actually = B { num : 4.2 };

    if (actually instanceof B then itsB) {
        printf("Number is %g\\n"N, itsB.num);
    } else if (actually instanceof C then itsC) {
        printf("Number is %d\\n"N, itsC.num);
    }
} 
`,
    },
    {
      title: "with precise type inference, but with nominal types",
      snippet: `
proc getUserByName(db : Database, user : String) /* : String? */ { 
    if (!userExists(user)) return null;
    return db.run("SELECT * FROM Users WHERE name = ?", user);
}        
`,
    },
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
import ashen.fs;
import ashen.io;
      
@Export
proc main(args : String[]) {
    var aFile : String? = fsReadText("test.txt");
    if (aFile then gotAFile) {
        printString(gotAFile);
    } else {
        printString("aFile is null!\n");
    }
} 
`,
    },
  ];

  let currentMessage: MessageInfo | undefined = $state();
  let index = texts.length * 5;

  onMount(() => {
    const showNext = () => {
      if (index < texts.length) {
        currentMessage = texts[index];
        index++;
      } else {
        currentMessage = undefined;
        index = 0;
        setTimeout(showNext, 1000);
        return;
      }
      setTimeout(showNext, 8000);
    };

    showNext();

    return () => {};
  });
</script>

<svelte:head>
  <title>Ashen</title>
  <meta name="description" content="The language of the universe." />
</svelte:head>

<div
  class="relative min-h-screen bg-linear-to-b from-gray-200 to-indigo-400/60"
>
  <div class="flex flex-row items-center h-screen">
    <div class="relative flex flex-col items-center max-w-2/5 mx-auto">
      <div
        class="absolute w-[108%] aspect-square rounded-full border-b-[#ffffff00] border-indigo-600 border-4
        transform -translate-x-2/4 -translate-y-2/4 top-2/4 left-2/4"
        style="animation: spin 1s linear infinite;"
      ></div>
      <img
        src="https://galatea.ane.jp.net/dl/images/logos/ashen-logo-full.webp"
        alt=""
        class="w-full"
      />
    </div>
    <div class="ml-auto flex flex-col gap-4 mr-24 place-items-end w-2/5">
      <h1 class="font-metal font-light text-6xl text-indigo-600 h-2/4 w-3/4">
        Imagine a world...
      </h1>

      <div class="gap-2 flex flex-col">
        {#key currentMessage}
          <div class="flex flex-col gap-4" transition:slide={{ duration: 500 }}>
            {#if currentMessage}
              <p
                class="font-kumbh font-bold text-4xl px-2 py-1 bg-indigo-500/30"
              >
                {currentMessage.title}
              </p>
              <CodeBlock code={currentMessage.snippet} />
            {/if}
          </div>
        {/key}
      </div>
    </div>
  </div>
  <p
    class="absolute top-[90vh] -translate-x-2/4 left-2/4 font-metal text-indigo-800 text-3xl"
  >
    Try it out &DownArrow;
  </p>

  <div
    class="relative flex flex-col bg-linear-to-br from-indigo-400/60 to-purple-950 p-16 text-white text-center gap-8"
  >
    <div class="font-kumbh text-xl">
      *only POSIX-compliant systems, Microsoft Windows(R) and Apple MacOS are
      unsupported.
    </div>
    <a
      href="https://git.ane.jp.net/u/miyuki/projects/ashen/releases"
      class="cursor-pointer mx-auto bg-linear-to-br from-black/20 to-black/40 hover:bg-indigo-200 transition-colors duration-300 ease-in-out p-6 py-3 rounded-xl font-kumbh"
    >
      Ashen Releases on ANE Git
    </a>
    <a
      href="/docs"
      class="cursor-pointer mx-auto bg-linear-to-br from-black/20 to-black/40 hover:bg-indigo-200 transition-colors duration-300 ease-in-out p-6 py-3 rounded-xl font-kumbh"
    >
      Documentation
    </a>
  </div>
</div>

<Footer></Footer>

<style>
  @keyframes spin {
    0% {
      rotate: 0deg;
    }
    100% {
      rotate: 360deg;
    }
  }
</style>
