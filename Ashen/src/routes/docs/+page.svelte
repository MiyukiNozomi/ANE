<script lang="ts">
  import CodeBlock from "$lib/components/codeBlock.svelte";
  import DocPage from "$lib/components/docPage.svelte";
  import Header from "$lib/components/header.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<DocPage
  title="Welcome to Ashen!"
  description="This page will go into the basics of Ashen."
>
  <h1 class="text-4xl font-metal font-bold">Procedures</h1>
  <p class="font-mplus2">
    Many call them functions, but the distinction of the Ashen Procedure is that
    its runes and sigils define rules to the constrained universe of a
    procedure.
  </p>

  <p class="font-mplus2">
    In human language.. Procedures are contained to their own scopes, they can
    only operate with what parameters are received, (they can mutate these if a
    parameter is a reference). The syntax for procedures is as follows:
  </p>
  <CodeBlock
    code={`proc name() /* Optional return type as : <type */ {
    /* code here */
}`}
  ></CodeBlock>

  <h1 class="text-4xl font-metal font-bold">The Type System</h1>
  <p class="font-mplus2">
    All types have a identifier as their main target, with additions that go as
    suffixes:
  </p>
  <CodeBlock
    code={`

// Modifiers

Int    = An integer
Int[]  = An integer array
Int[]? = A integer array, but can be null
Int&   = Reference to an integer
Int&?  = Nullable Integer Reference

// You can also combine them:

Int&?[]? = A Nullable array of nullable integer references.

// It is possible to define types for function pointers like this

proc (in : Type) : Void = Pointer to procedure that receives one "Type" param and returns Void.
`}
  ></CodeBlock>

  <p class="font-mplus2">
    Ashen has a nominal type system, this also means you cannot do something
    like this:
  </p>
  <CodeBlock code={`proc something() : Entity | Entity[] | null {`}></CodeBlock>
  <p class="font-mplus2">Proper way:</p>
  <CodeBlock code={`proc something() : Entity[]? {`}></CodeBlock>

  <p>
    This is akin to other languages such as Haxe, Rust, C++ and D, opposed to
    structural typing (TypeScript).
  </p>
  <p>
    Ashen Types are also immutable, while data is not, this means once data has
    it's type defined, it can never become something that isnt of said type.
  </p>

  <CodeBlock
    code={`var fruit /* : String */ = "Banana!";
fruit = 4; // error: Interpreter doubts conversion of Int to Byte[]..
`}
  ></CodeBlock>
  <h1 class="text-3xl font-metal font-bold">
    What defines X and Y to be compatible with one another?
  </h1>

  <p>
    Given that ashen will always prioritize X (the left hand type) over Y (the
    right hand type), In a nutshell..
  </p>
  <ul class="list-disc px-4">
    <li>
      If you read data with type Y as X, will there be data loss or stellar
      garbage? (is X bigger or equal than Y in byte size? are they compatible
      internally?)
    </li>
    <li>
      If X is a Nullable type, it will only be compatible with nullable versions
      of X and X itself.
    </li>
    <li>
      If X is an array or reference, is *X equal to Y? not compatible, equal?
    </li>
    <li>If X is a procedure, X will only be assignable to X.</li>
  </ul>
</DocPage>
