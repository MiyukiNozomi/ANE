<script lang="ts">
  import CodeBlock from "$lib/components/codeBlock.svelte";
  import DocPage from "$lib/components/docPage.svelte";
  import Warning from "$lib/components/warning.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<DocPage
  title="Compiler Interstricts"
  description="Experimental / Compilation details"
>
  <h1 class="text-4xl font-metal font-bold" id="libnebula">LibNebula</h1>
  <p class="font-mplus2">
    Nebulosas are regions of gas that form stars, many call them the pillars of
    creation, and in ashen, LibNebula is the pillar of creation.
  </p>
  <p>
    LibNebula is a <strong>internal API</strong> that supplements not only the compiler
    but your projects aswell, it is written in both Ashen and C to facilitate interop.
  </p>
  <p>
    <strong>Why?</strong> For a few reasons, having C means Ashen can use the system
    compiler to determine the operating system and architecture with ease, it also
    helps with portability. Although, you can technically use libnebula in your code:
  </p>
  <CodeBlock
    code={`
import libnebula.index;
`}
  ></CodeBlock>
  <Warning
    code=" Libnebula is purposefuly undocumented, using it directly can cause issues, please open its source code for details on functions."
  ></Warning>

  <h1 class="text-4xl font-metal font-bold" id="rune">Runes</h1>
  <p>Runes are additional compiler metadata, they come in many shapes:</p>
  <CodeBlock
    code={`
// As information for compilation of procedures:
@DisableNameMangling
proc somePublicAPI(...) {...

// As markers
@Deprecated
proc someDeprecatedFunction (...) {..

// As macros in the case of LocationAware.
@LocationAware
proc logFunc(message : String, location : Byte&) { // location parameter wont be mandatory, and will be auto filled by the compiler

// as struct metadata
@AshenInternal
struct SomeStruct {..

// As type checkers

abstract<T> struct Array {
  ..

  @HideIfArray<T>
  proc split(splitter : T) : T[][] {
    ...
  }
}
`}
  ></CodeBlock>
  <Warning
    code="Currently, there is no future for user programs to utilize custom metadata as ashen is still in beta, but this type of reflection will be available in Ashen 2."
  ></Warning>
</DocPage>
