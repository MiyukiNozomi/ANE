<script lang="ts">
  let {
    text = $bindable(),
    placeholder,
    type,
    maxlength,
    isMultiline,
  }: {
    text: string;
    placeholder: string;
    type: "password" | "text";
    maxlength: number;
    isMultiline: boolean;
  } = $props();
</script>

<!-- Here the hexagon code is different because Input elements break it for some reason.-->
<div class="px-4">
  <div class="flex flex-row items-center relative gap-0">
    <div class="border-orange-200 border-y-1 w-full h-auto">
      <input
        class="outline-0 font-mplus2 p-1 w-full"
        bind:value={text}
        {type}
        max={maxlength}
        {placeholder}
      />
    </div>

    <div
      class="absolute -left-3 bg-none rotate-45 border-orange-200 border-l-1 border-b-1 aspect-square h-6"
    ></div>
    <div
      class="absolute -right-3 bg-none rotate-45 border-orange-200 border-r-1 border-t-1 aspect-square h-6"
    ></div>
  </div>
</div>
