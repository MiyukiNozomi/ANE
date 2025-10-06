<script lang="ts">
	let data: { activeBranch: string } = $props();
</script>

<a
	class="
            flex flex-row gap-4 p-1 text-4xl items-center
            font-kumbh hover:text-orange-200 hover:underline transition-all ease-in-out duration-200"
	href="./?branch={data.activeBranch}"
>
	&LeftArrow;
</a>
