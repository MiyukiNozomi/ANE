<script lang="ts">
  let {
    children,
    extraClasses,
  }: { children: Function; extraClasses?: string } = $props();
</script>

<div
  class="flex flex-row items-center p-[1px] bg-orange-200 clip-banner {extraClasses}"
>
  <div
    class="relative flex mx-auto z-40 flex-row items-center p-3 px-5 bg-zinc-900 clip-banner"
  >
    <div
      class="absolute top-1/2 left-0 w-full h-px bg-orange-200 z-50 transform -translate-y-1/2"
    ></div>
    <div
      class="relative z-50 flex mx-auto flex-row items-center p-[1px] bg-orange-200 clip-banner"
    >
      <div
        class="bg-suisei-700 hover:bg-suisei-900 transition-colors text-orange-200
          text-xl text-center py-2 px-2 clip-banner"
      >
        {@render children()}
      </div>
    </div>
  </div>
</div>
