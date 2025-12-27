<script lang="ts">
  import CodeBlock from "$lib/components/codeBlock.svelte";
  import DocPage from "$lib/components/docPage.svelte";
  import Warning from "$lib/components/warning.svelte";
  import type { PageProps } from "../$types";

  let { data }: PageProps = $props();
</script>

<DocPage
  title="Syntax"
  description="This page will go into the ashen's syntax."
>
  <h2 class="text-4xl font-metal font-bold">It is not that different!</h2>
  <p class="font-mplus2">
    Ashen has C-style if-else statements, do-while loops, Haxe style switch
    statements (break not mandatory), but with a few caveats
  </p>

  <h2 class="text-4xl font-metal font-bold">Ternaries are not C-like.</h2>
  <CodeBlock
    code={`
var value = true ? 4 : 2; // Error!

var value = if (true) then 4 else 2; // Okay!
`}
  ></CodeBlock>
  <h2 class="text-4xl font-metal font-bold">For-loops are unique.</h2>
  <CodeBlock
    code={`
var array = [4, 3, 2];

// Will iterate from 0 all the way to array.length - 1, 
// aka 'for (int i = 0; i < array.length; i++)'
for (i in 0 < array.length) {
}

// You can invert the direction!
// this will iterate from array.length - 1 all the way to 0. 
// aka 'for (int i = array.length - 1; i >= 0; i--)'
for (i in array.length > 0) {
}

// Looking for a for-each like in Haxe? you can do that too!
for (elm in array) {
}
`}
  ></CodeBlock>
  <Warning
    code=" In languages like JavaScript, using for-each is slower than for i = 0; i < [length], but in ashen, doing any for-each statement 
will generate nearly identical iteration code, it is just that Ashen for-each statements also index the array while iterating, you do not have to fear performance problems between a for-each and numeric range for-loops."
  ></Warning>

  <h2 class="text-4xl font-metal font-bold">Variables</h2>
  <p>
    Through ashen's type inference, you can define variables in more than one
    way, you are not mandated to initialize or define the type of a variable
    immediately, although, variables with unknown types will result in
    compilation errors.
  </p>
  <CodeBlock
    code={`
// Like in golang, you can define both an explicit type and an assignment.
var fullyDefined : Int = 4;

// Not going to assign it yet? no worries!
var valueless : Int; // will be automatically 0, and not garbage.

// Or omit the type!
var infered = 4; // infered is a : Int 

// Going to assign it later? also no worries!
var waitingProcessing; // = 0;

if (...) {
  waitingProcessing = 90;
}
// waitingProcessing will now be of type Int!
`}
  ></CodeBlock>
  <Warning
    code="If no explicit type is set (e.g defining the type directly), if assigned to null, will result in said variable having the next type being nullable, example: var r /* : B? */ = null; r = B &lbrace;...&rbrace;; /*r will be a B?*/"
  ></Warning>
  <h2 class="text-4xl font-metal font-bold">About the other statements</h2>
  <p>
    Ashen if-statements are identical to C, with the exception of <a
      class="underline text-purple-800"
      href="/docs/pattern-matching">Pattern Matching</a
    > in their condition.
  </p>
  <CodeBlock
    code={`
if (condition) {
  // statement
}

// You can also omit the context (scope) if you dont want to:
if (condition)
  // statement

// Pattern matching (see link above)
if (fruit instanceof Banana then banana) {
  ...
}

// ..you can omit scopes pretty much in any statement.
`}
  ></CodeBlock>
  <p>
    Ashen while and do-while loops are also identical, except you can add an
    else clasule to while loops:
  </p>
  <CodeBlock
    code={`
// Normal while loop
while (condition) {
  // statement
}

// Do-while (run first, loop again if true)
do {

} while (condition);

// While loop with else
while (condition) {

} else { // This else will run if condition is false when entering the while loop.
 
}
`}
  />
  <p>
    Ashen switches are nowhere like Cs, syntax-wise? they are identical, but in
    Ashen, cases will by default always create a scope, and ashen will always
    put a default break (so it wont be looping forever like in other languages
    when no case is matched.)
  </p>
  <CodeBlock
    code={`
switch (target) {
      case EXPR:
          var p = 4; // P is isolated to this case statement
      
          // no need for break;
      
      // You can also match multiple cases
      case THREE:
      case FIVE:
        printString("Prime number!");

      // Default is not mandatory:
      // default: (OK)
}
`}
  ></CodeBlock>
  <p>
    Unlike C, switch statements do not require their cases to be constants or
    known at compile time. (it is better if you use compile time values, but its
    fine otherwise.)
  </p>
  <p>This also means you can use strings in Ashen switches!</p>
  <CodeBlock
    code={`
switch (name) {
  case "miyuki":
    printString("Hey look its me!");
  case "suisei":
    printString("Favorite singer, yes");
  case "alvorada":
    printString("Liar, scammer, but funny");
  case "amd":
    printString("Some x86 CPU company i think");
  
  default: 
    printString("Who is that?");
}
`}
  ></CodeBlock>

  <h2 class="text-4xl font-metal font-bold">Arrays</h2>
  <p>
    The syntax is a mixture of java and JS, you can either use a array literal,
    or instance an array by size:
  </p>
  <CodeBlock
    code={`
// Array literal
var primeNumbers = [2, 3, 5, 7];

// Create an array with initial length:
// Note: you can use the 'alloc' keyword instead of 'new' if you want.
// The alloc keyword comes from the early days of ashen, there is no functional difference between both keywords.

var empty = new Int[40];
`}
  ></CodeBlock>
  <Warning
    code={"Note: ashen does not have fixed-size arrays, it is simillar in mechanic to arrays in JavaScript. Please do not use the type for C Nullterminated arrays (e.g Type[<size]) as fixed size arrays unless you are working with embedded or bare metal projects."}
  ></Warning>
  <h2 class="text-4xl font-metal font-bold">About operator overloading</h2>
  <p>
    Ashen does not provide any standard way for operator overloading, this
    feature is specifically reserved for the compiler and <a
      class="underline text-purple-800"
      href="/docs/advanced/compiler-interstricts/#libnebula">LibNebula</a
    >.
  </p>
  <p>
    The reason for operator overloading not being a proper feature in ashen, is
    because of the problems it creates, mostly readability wise. If you did a
    &lt;&lt; b, you expect a and b to be numeric values where a is being shifted
    by B bits, but with operator overloading, this very well could be that A is
    a stream and B is some buffer.
  </p>
  <p>
    But, if you really want operator overloading.. you can only overload array
    indexing, through get() and set() with a @AshenInternal <a
      class="underline text-purple-800"
      href="/docs/advanced/compiler-interstricts/#rune">Rune</a
    >. but I do not recomend this as it often leads to problems and warnings (As
    AshenInternal is well, internal.)
  </p>
</DocPage>
