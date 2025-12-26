<script lang="ts">
  import CodeBlock from "$lib/components/codeBlock.svelte";
  import DocPage from "$lib/components/docPage.svelte";
  import Header from "$lib/components/header.svelte";
  import Warning from "$lib/components/warning.svelte";
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
    code={`proc name(param : Type) /* Optional return type as : <type */ {
    /* code here */
}`}
  ></CodeBlock>
  <p class="font-mplus2">
    If you are interfacing with C, you can use this syntax to define external
    functions:
  </p>
  <CodeBlock
    code={`extern name(param : Type) : Type; // return type is mandatory.`}
  ></CodeBlock>

  <h1 class="text-4xl font-metal font-bold">Structures</h1>

  <p class="font-mplus2">
    The composer allows the creator to define structured entities that arent
    basic arithmetic concepts
    <br />
    In human language, you can define structures like in C++ or D, and even copy
    fields of said structures
  </p>
  <CodeBlock
    code={`
struct A {
    someField : Int;
}  
  
struct B < A {
    // B also has someField!
    anotherField : Float;
}

// To instantiate:

var bStruct = B {
  someField: 4,
  anotherField: 2
  // You dont have to initialize numeric type fields, the same applies for nullable values
}

// Ashen structures can also hold procedures:


struct B < A {
    anotherField : Float;

    proc getC() {
      return this.someField * this.anotherField;
    }
}

bStruct.getC(); // 8!

// But they you can only call them using the respective struct type.
`}
  ></CodeBlock>

  <Warning
    code={` Ashen Structures have a hidden Runtime Type Information ID field on the first 8-bytes of every structure, when writing external functions that return or receive structures,
you can add the 'extern' keyword before a 'struct' keyword to disable RTTI, be aware this will also keep you from creating instances through the usual syntax and the copy field feature will not be available.
  `}
  ></Warning>

  <h1 class="text-3xl font-metal font-bold">Enumerators</h1>
  <p class="font-mplus2">
    Need concrete categorization of data? hence, Enumerators in ashen! Be aware
    these are not the same as enumerators in rust (Rust-like unions are coming
    in Ashen 2)
  </p>
  <CodeBlock
    code={`
enum CardType {
    Debit,
    Credit = 4, // If you make a enum member have an explcit number value, subsequent enum fields will follow its value:
    MarketTicket // E.g CardType:Credit + 1
    // and so on..
}

// You can return any type in an enumerator, but not mix them!
enum Bad {
    AMember = 54,
    AString = "54" // Incompatible!
}

// Now you can get their value, for example: 
CardType:Debit
`}
  ></CodeBlock>

  <h1 class="text-4xl font-metal font-bold">The Type System</h1>
  <p class="font-mplus2">
    All types have a identifier as their main target, with additions that go as
    suffixes:
  </p>
  <CodeBlock
    code={`
// Built in Types
Byte  = Signed 8 Bit Integer
Short = Signed 16 Bit Integer
Int   = Signed 32 Bit Integer
Long  = Signed 64 Bit Integer

// For unsigned numbers, simply add a 'U' prefix to any primitive number:
ULong = Unsigned 64 bit integer

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


// Other built-in types
CSize   = equivalent to Cs size_t
CString = null terminated string, alias for a Byte&
String  = Alias for a Byte[] 

// C Stack/nullterminated array:
Type[<size>] = A C array of <size>.
// But be aware this type isnt fully implemented, only use it for foreign procedure interfacing.
`}
  ></CodeBlock>

  <h1 class="text-3xl font-metal font-bold">
    Can I assign X to Y, or make something be X, Y and then turn into Z?
  </h1>
  <p class="font-mplus2">
    Ashen has a nominal type system, this also means you cannot do something
    like this to make something be multiple types are the same time:
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

  <Warning
    code={` Note that, in the earlier struct example of B extending A, the type system opens an exception that A can be assigned by a value of type B, as B has the same internal structure as A, which follows rule 1 of the above checklist.  `}
  ></Warning>
</DocPage>
