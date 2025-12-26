<script lang="ts">
  import { browser } from "$app/environment";

  let links: Array<[string, string]> = [["Welcome", "/docs"]];
</script>

<div
  class="flex flex-col gap-4 px-4 py-8 font-mplus2 text-2xl bg-purple-200/40 h-full w-48"
>
  {#each links as link}
    <a
      class={browser && link[1] == window.location.pathname
        ? "underline text-indigo-600"
        : ""}
      href={link[1]}>{link[0]}</a
    >
  {/each}
</div>
