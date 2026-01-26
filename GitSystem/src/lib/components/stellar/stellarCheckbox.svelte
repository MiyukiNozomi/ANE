<script lang="ts">
    let {
        checkValue = $bindable(),
        onCheckValueChange,
        label,
    }: {
        checkValue: boolean;
        onCheckValueChange?: (v: Boolean) => any;
        label: string;
    } = $props();
</script>

<button
    class="flex flex-row {checkValue
        ? 'text-gray-300'
        : 'text-gray-400'} group-hover:text-white gap-2 items-center"
    onclick={() => {
        checkValue = !checkValue;
        if (onCheckValueChange) onCheckValueChange(checkValue);
    }}
>
    <div
        class="p-px bg-orange-200 checkbox-clip-notch-tr-bl text-black
        relative"
    >
        <div
            class=" w-8 h-8 checkbox-clip-notch-tr-bl {checkValue
                ? 'bg-orange-200'
                : 'bg-black'}"
        ></div>
        <p
            class="text-4xl absolute text-black left-2/4 top-2/4 transform -translate-2/4"
        >
            &checkmark;
        </p>
    </div>
    <h1 class="font-mplus2 text-xl">
        {label}
    </h1>
</button>

<style>
    .checkbox-clip-notch-tr-bl {
        clip-path: polygon(
            6px 0,
            100% 0,
            100% calc(100% - 6px),
            calc(100% - 6px) 100%,
            0 100%,
            0 6px
        );
    }
</style>
