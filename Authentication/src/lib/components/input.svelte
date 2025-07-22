<script lang="ts">
    import { MAX_PASSWORD_LENGTH } from "$lib/client-api";

    let {
        text = $bindable(),
        maxLength = MAX_PASSWORD_LENGTH,
        placeholder,
        type,
    }: {
        text: string;
        maxLength?: number;
        placeholder: string;
        type: string;
    } = $props();
    let thisInput = $state();
</script>

<input
    {type}
    bind:this={thisInput}
    bind:value={text}
    maxlength={maxLength}
    {placeholder}
    class="w-full border-solid border-b-[1px] text-md border-white outline-none px-4 pt-2 pb-1"
/>
