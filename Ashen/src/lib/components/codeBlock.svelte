<script lang="ts">
  let { extraClasses, code }: { extraClasses?: string; code: string } =
    $props();
</script>

<div
  class="{extraClasses} bg-linear-to-br from-black/20 to-black/30 rounded-2xl p-2 font-mplus2 text-sm"
>
  <pre class="wrap-break-word max-w-full">{code.trim()}</pre>
</div>
