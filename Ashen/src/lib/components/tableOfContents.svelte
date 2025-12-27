<script lang="ts">
  import { browser } from "$app/environment";

  let links: Array<{
    title: string;
    href?: string;
    sublinks?: {
      title: string;
      href: string;
    }[];
  }> = [
    {
      title: "Welcome!",
      href: "/docs",
      sublinks: [
        {
          title: "Ashen Basics",
          href: "/docs/#basics",
        },
      ],
    },
    {
      title: "Syntax",
      href: "/docs/syntax",
      sublinks: [
        {
          title: "Procedures",
          href: "/docs/syntax#procedures",
        },
        {
          title: "Statements",
          href: "/docs/syntax#statements",
        },
        {
          title: "Expressions",
          href: "/docs/syntax#expressions",
        },
      ],
    },
  ];
</script>

<div
  class="flex flex-col lg:gap-2 lg:py-8 not-lg:py-4 font-mplus2 text-2xl bg-purple-200/40 h-fit lg:w-52 rounded-b-xl"
>
  <h1 class="font-kumbh font-bold text-3xl text-white px-4 border-b-2 pb-8">
    TABLE OF CONTENTS
  </h1>
  {#each links as link}
    {#if browser && link.href == window.location.pathname}
      <p
        class="not-lg:py-2 text-black px-4 py-1 {link.sublinks
          ? 'pb-0 text-2xl'
          : 'text-xl'}"
      >
        {link.title}
      </p>
    {:else}
      <a
        class="not-lg:py-4 px-4 py-1 {link.sublinks
          ? 'pb-0 text-2xl text-indigo-200'
          : 'text-xl'} cursor-pointer underline hover:bg-purple-900 text-indigo-100"
        href={link.href}>{link.title}</a
      >
    {/if}
    {#if link.sublinks}
      <ul class="text-lg list-disc list-inside marker:text-indigo-100 pl-4">
        {#each link.sublinks as sublink}
          <li class="w-full hover:bg-purple-900 px-2">
            {#if browser && sublink.href == window.location.pathname}
              <p
                class="text-xl not-lg:py-4 underline w-full text-black py-1 cursor-pointer max-w-full"
              >
                {sublink.title}
              </p>
            {:else}
              <a
                class="text-xl not-lg:py-4 underline w-full text-indigo-100 py-1 cursor-pointer max-w-full"
                href={sublink.href}>{sublink.title}</a
              >
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  {/each}
</div>
