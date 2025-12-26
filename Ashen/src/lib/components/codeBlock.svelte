<script lang="ts">
  let { extraClasses, code }: { extraClasses?: string; code: string } =
    $props();
</script>

<div
  class="{extraClasses} bg-linear-to-br from-black/20 to-black/30 rounded-2xl p-2 font-mplus2 text-xs lg:text-sm w-full"
>
  <pre
    class="wrap-break-word max-w-full overflow-x-auto whitespace-pre-wrap">{code.trim()}</pre>
</div>
