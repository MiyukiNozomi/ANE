<script lang="ts">
  import Hexagon from "./base/hexagon.svelte";

  let { onclick, label }: { label: string; onclick: () => void } = $props();
</script>

<!-- wtf did i just recreate reactjs?-->
<Hexagon className="bg-black" containBorder={true}>
  <button {onclick} class="">{label}</button>
</Hexagon>
