<script lang="ts">
  import SplitPanelHexagon from "./splitPanelHexagon.svelte";
  import Hexagon from "./splitPanelHexagon.svelte";

  let { children, label }: { children: Function; label: string } = $props();
</script>

<div
  class="bg-black border-t-orange-200 border-solid border-t-1 relative px-8 py-6"
>
  <SplitPanelHexagon
    extraClasses="absolute left-1/2 transform -translate-x-1/2  top-[-2.3rem] z-30"
    ><h1 class="font-baskervville text-lg px-2">{label}</h1></SplitPanelHexagon
  >
  <div class="pt-10 pb-2 flex flex-col">
    {@render children()}
  </div>
</div>
