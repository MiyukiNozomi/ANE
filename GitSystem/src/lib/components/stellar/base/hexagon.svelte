<script lang="ts">
  let {
    children,
    className,
    parentClassName = "h-full",
    containBorder = false,
  }: {
    containBorder?: boolean;
    parentClassName?: string;
    children: Function;
    className: string;
  } = $props();
</script>

<div
  class="flex flex-row items-center relative {parentClassName} p-[1px] bg-orange-200 clip-banner"
>
  <div
    class=" flex flex-row items-center {parentClassName} p-1 px-2 bg-stone-900 clip-banner"
  >
    <div
      class="absolute z-50 top-1/2 left-0 w-full h-px bg-orange-200 transform -translate-y-1/2"
    ></div>
    <div
      class="flex flex-row items-center relative z-50 {parentClassName} p-[1px] bg-orange-200 clip-banner"
    >
      <div
        class=" flex flex-row items-center {parentClassName} px-6 py-4 bg-stone-800 clip-banner
        font-baskervville text-orange-200"
      >
        {@render children()}
      </div>
    </div>
  </div>
</div>
