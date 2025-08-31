<script lang="ts">
  import { getAccountInfo } from "$lib/client-account";

  const accountInfo = getAccountInfo();
</script>

<div
  class="relative flex flex-row z-50 w-full top-[-0.85rem] font-baskervville overflow-hidden"
>
  <div
    class="absolute top-0 left-0 bg-black w-full h-2/4
    flex flex-row border-orange-200 border-b-1 border-t-1 border-solid"
  >
    <!-- left conner -->
    <div
      class="hidden md:flex absolute mr-auto w-18 aspect-square left-[-2.25rem] border-orange-200 -rotate-36 border-r-black border-1 bg-black rounded-full"
    ></div>
    <!-- right conner-->
    <div
      class="hidden md:flex absolute mr-auto w-18 aspect-square right-[-2.25rem] border-orange-200 rotate-36 border-l-black border-1 bg-black rounded-full"
    ></div>

    <div class="w-full mt-[1.1rem] flex flex-row items-start text-orange-200">
      <!-- left side of header-->
      <div
        class="relative z-20 flex flex-row justify-start md:justify-center w-2/4 items-center px-4 text-xs"
      >
        {#if accountInfo}
          <a class="hover:underline" href="/u/{accountInfo.name}"
            >{accountInfo.displayName}
          </a>
        {:else}
          <a class="hover:underline" href="/sign/redirect"> Sign In </a>
        {/if}
      </div>
      <!-- right side of header-->
      <div
        class="flex flex-row justify-end md:justify-center w-2/4 items-center px-4 text-xs"
      >
        <a class="hover:underline m" href="/search">Search </a>
      </div>
    </div>
  </div>

  <div
    class="flex mx-auto flex-row items-center p-[1px] bg-orange-200 clip-banner"
  >
    <!-- inner hexagon background -->
    <div
      class="relative flex mx-auto z-40 flex-row items-center p-3 px-4 bg-zinc-900 clip-banner"
    >
      <!-- line that cuts it-->
      <div
        class="absolute top-1/2 left-0 w-full h-px bg-orange-200 z-50 transform -translate-y-1/2"
      ></div>

      <!-- inner hexagon -->
      <div
        class="relative z-50 flex mx-auto flex-row items-center p-[1px] bg-orange-200 clip-banner"
      >
        <a
          href="/"
          class="bg-suisei-700 hover:bg-suisei-900 transition-colors duration-300 ease-in-out text-orange-200
          text-xl text-center py-2 px-8 clip-banner"
        >
          <img
            class="h-11 animate-header-logo-spin [animation-play-state:paused] hover:[animation-play-state:running] duration-1000 transition-all ease-out"
            alt="logo"
            src="/golden-favicon.png"
          />
        </a>
      </div>
    </div>
  </div>
</div>
