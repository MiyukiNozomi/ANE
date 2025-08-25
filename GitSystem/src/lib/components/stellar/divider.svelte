<script lang="ts">
  let {
    children,
    extraClasses,
  }: { children: Function; extraClasses?: string } = $props();
</script>

<div class="flex flex-col">
  {@render children()}
</div>
