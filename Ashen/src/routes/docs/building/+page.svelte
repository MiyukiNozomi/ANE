<script lang="ts">
  import CodeBlock from "$lib/components/codeBlock.svelte";
  import DocPage from "$lib/components/docPage.svelte";
  import Warning from "$lib/components/warning.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<DocPage
  title="Building and Compiling"
  description="Guide on how to not only setup an ashen project, but also on how to compile it."
>
  <h1 class="text-4xl font-metal font-bold" id="libnebula">
    Creating a project
  </h1>
  <p class="font-mplus2">
    Simple run "<strong>ashen init</strong>" and the compiler will guide you
    through project creation (please do so in an empty directory! note that the
    compiler won't let you make a project in a directory with files...)
  </p>
  <h1 class="text-4xl font-metal font-bold" id="project-guide">
    But I just want to compile without making a project!
  </h1>
  <p>
    No worries, Projects in ashen are just a series of parameters stored in a
    .ashml file like this:
  </p>
  <CodeBlock
    code={`-o miyuki
-I ./source
app.ashen
`}
  ></CodeBlock>
  <p>If you just want to compile one file,</p>
  <CodeBlock
    code={`
ashen build main.ashen -o myprogram

# Or make a ashml file for it
echo "-o hello\n-I src\nsrc/main.ashen" > project.ashml
ashen build project.ashml
`}
  ></CodeBlock>
  <p>
    So, you can either hand write the parameters line by line in an .ashml file
    and pass it to the compiler (like this: <strong
      >ashen build project.ashml</strong
    >)
  </p>
  <p>...or pass them individually!</p>
  <Warning
    code={`Heads up: Ashen main procedures are defined with a @Export rune and a args String[] parameter, like this:
@Export
proc main(args : String[]) {...
`}
  ></Warning>
  <CodeBlock
    code={`
ashen build -o miyuki -I ./source app.ashen
`}
  ></CodeBlock>
  <p>
    By the way, you can always pass both build.ashml and extra parameters, just
    make sure to place them in order of priority of least required to most
    required (if using a parameter like -o, dont pass -o before your build.ashml
    as the -o on your ashml file will overwrite the one you wrote before it)
  </p>

  <h1 class="text-4xl font-metal font-bold" id="flags">Compilation Flags</h1>
  <CodeBlock
    code={`
--no-nebulosa 
or --no-builtin     -- Disables libnebula, but you will also be unable to use Ashen Arrays, and anything that rely on them.

--freestanding      -- Will not compile against the systems libc and the ashen standard library will not be available.

--gen-<flag>        -- Parameter to pass to the generator, currently, the only generator is C code, so this will be either a clang or gcc parameter after --gen-.

--link-<flag>       -- Parameter to pass to the linker

-I <path>           -- Adds an import path

-o <out>            -- Specifies an output executable name 

--dump-ast          -- Dumps the AST of your project into a file named "bootstrap-ast"
`}
  ></CodeBlock>
</DocPage>
