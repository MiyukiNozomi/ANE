<script lang="ts">
  import { invokeAPI } from "$lib/client/API/client";
  import { tick } from "svelte";

  let requestProgressLabel: string | undefined = $state(undefined);
  let errorMessage: string | undefined = $state(undefined);

  export async function invokeAPIWithStatus<T>(
    label: string,
    endpointString: string,
    payload: any,
    method: "POST" | "PUT" = "POST",
  ) {
    errorMessage = undefined;
    requestProgressLabel = label;
    await tick();
    const res = await invokeAPI<T>(endpointString, payload, method);
    if (!res) {
      errorMessage = "Failed to contact server. try again later";
      return null;
    }

    requestProgressLabel = undefined;

    return res;
  }

  export function setError(error: string) {
    errorMessage = error;
  }

  export function isActive() {
    return Boolean(requestProgressLabel) || Boolean(errorMessage);
  }

  export function forceActive(message: string) {
    requestProgressLabel = message;
  }
  export function forceDeactivate() {
    requestProgressLabel = undefined;
  }
</script>

{#if isActive()}
  <div class="flex flex-row items-center gap-2">
    {#if errorMessage}
      <p class="text-xl text-red-900">{errorMessage}</p>
    {:else}
      <div
        class="w-10 h-10 border-4 border-t-blue-500 border-[#00000000] rounded-full animate-spin"
      ></div>
      <p class="text-xl">{requestProgressLabel}</p>
    {/if}
  </div>
{/if}
