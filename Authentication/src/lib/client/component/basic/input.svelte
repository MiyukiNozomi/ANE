<script lang="ts">
  import { onMount } from "svelte";
  import { fade, slide } from "svelte/transition";

  let {
    text = $bindable(""),
    maxLength,
    minLength = 0,
    placeholder,
    type,

    validate,
    onErrorChange,
  }: {
    text?: string;
    maxLength?: number;
    minLength: number;
    placeholder: string;
    type: string;

    validate?: (text: string) => string | undefined;
    onErrorChange?: (errorMessage: string | undefined) => void;
  } = $props();

  let error: string | undefined = $state();
  let thisInput = $state();

  export function changeEvent() {
    error =
      text.trim().length < minLength
        ? `Input at least ${minLength} characters.`
        : undefined;

    if (!error && validate) {
      error = validate(text.trim());
    }

    if (onErrorChange) onErrorChange(error);
  }

  onMount(changeEvent);
</script>

<div transition:slide class="flex flex-col">
  <input
    {type}
    bind:this={thisInput}
    bind:value={text}
    maxlength={maxLength}
    {placeholder}
    onchange={changeEvent}
    onkeyup={changeEvent}
    class="font-mplus2 w-full border-solid border-b text-md border-white outline-none px-4 py-2"
  />
  <p transition:slide class="text-red-500">{error}</p>
</div>
