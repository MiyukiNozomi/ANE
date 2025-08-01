<script lang="ts">
  import { invokeAPI } from "$lib/client-api";
  import { tick } from "svelte";

  let requestProgressLabel: string | undefined = $state(undefined);

  export async function invokeAPIWithStatus<T>(
    label: string,
    endpointString: string,
    payload: any
  ) {
    requestProgressLabel = label;
    await tick();
    const res = await invokeAPI<T>(endpointString, payload);
    requestProgressLabel = undefined;

    return res;
  }

  export function isActive() {
    return requestProgressLabel != undefined;
  }
</script>

{#if isActive()}
  <div class="flex flex-row items-center gap-2">
    <div
      class="w-10 h-10 border-4 border-t-blue-500 border-[#00000000] rounded-full animate-spin"
    ></div>
    <p class="text-xl">{requestProgressLabel}</p>
  </div>
{/if}
