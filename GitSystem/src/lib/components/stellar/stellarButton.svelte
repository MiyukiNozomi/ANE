<script lang="ts">
  let { onclick, label }: { label: string; onclick: () => void } = $props();
</script>

<div
  class="flex flex-row items-center relative p-[1px] bg-orange-200 clip-banner"
>
  <div class=" flex flex-row items-center p-1 px-2 bg-stone-900 clip-banner">
    <div
      class="absolute z-50 top-1/2 left-0 w-full h-px bg-orange-200 transform -translate-y-1/2"
    ></div>
    <div
      class="flex flex-row items-center relative z-50 p-[1px] bg-orange-200 clip-banner"
    >
      <button
        {onclick}
        class="flex flex-row items-center px-6 py-4 bg-stone-800 hover:bg-suisei-800
        clip-banner font-baskervville text-orange-200 transition-colors duration-300 ease-in-out
        cursor-pointer"
      >
        {label}
      </button>
    </div>
  </div>
</div>
