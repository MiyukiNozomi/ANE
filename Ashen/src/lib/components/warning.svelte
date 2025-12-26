<script lang="ts">
  let { extraClasses, code }: { extraClasses?: string; code: string } =
    $props();
</script>

<div
  class="{extraClasses} bg-linear-to-br from-amber-400 to-amber-500/30 rounded-2xl p-2 font-mplus2 text-sm"
>
  <p><strong>WITCH WARNING: </strong>{code.trim()}</p>
</div>
