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

<div class="flex flex-row items-center relative {parentClassName}">
  <div
    class="clip-left-triangle {className} {parentClassName} aspect-square"
  ></div>
  <div
    class="flex flex-row items-center mx-[-2px] w-full border-1 border-orange-200 {parentClassName} {className}
    px-0.5 rounded-[1.5px]"
  >
    {@render children()}
  </div>
  <div
    class="clip-right-triangle {className} {parentClassName} aspect-square"
  ></div>
</div>
