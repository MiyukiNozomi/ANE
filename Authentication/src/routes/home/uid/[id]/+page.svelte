<script lang="ts">
    import { browser } from "$app/environment";
    import { getAccountInfo } from "$lib/client-api";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();
    const { homeAccountInfo } = data;

    const accountInfo = getAccountInfo();
</script>

<svelte:head>
    <title>{data.homeAccountInfo.displayName}'s Profile</title>
    <meta
        name="title"
        content={`${data.homeAccountInfo.displayName}'s Profile`}
    />
    <meta
        name="description"
        content="This page is a work-in-progress, a lot of features are in-fact missing."
    />
</svelte:head>

<!--
    List of TODOs:

    [ ] Profile pictures
    [ ] About Me
    [ ] Badges?
-->
<div class="bg-zinc-900 h-screen w-screen text-white flex flex-col">
    <div
        class="flex flex-col gap-2 p-4 m-4 border-blue-600 border-solid border-2 rounded-md"
    >
        <h1 class="text-white text-xl">{homeAccountInfo.displayName}</h1>
        <p class="text-gray-300 text-md">
            /home/u/{homeAccountInfo.name}
        </p>
        <p class="mt-4 text-gray-400 italic">
            <!-- ane.jp.net times are always Unix Time-->
            Account created on {new Date(
                homeAccountInfo.createdAt * 1000,
            ).toDateString()}
        </p>

        <div class="flex flex-row items-center">
            {#if accountInfo && accountInfo.id == homeAccountInfo.id}
                <a
                    href="/home/settings"
                    class="ml-auto bg-blue-600 px-4 py-2 rounded-md"
                    >Edit &nwarrow;</a
                >
            {/if}
        </div>
    </div>

    <div class="p-4">
        <p class="text-red-500 italic font-kumbh">
            This page is a work in progress, hence why it has so little content.
        </p>
    </div>
</div>
