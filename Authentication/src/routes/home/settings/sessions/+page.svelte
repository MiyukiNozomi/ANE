<script lang="ts">
    import { getAccountInfo, invokeAPI } from "$lib/client-api";
    import Input from "$lib/components/input.svelte";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let errorMessage = $state("");
    let successMessage = $state("");

    function setError(msg: string) {
        errorMessage = msg;
        document.querySelector("#error-msg")?.scrollIntoView();
    }

    function setSuccessful(msg: string) {
        successMessage = msg;
        document.querySelector("#success-msg")?.scrollIntoView();
    }
</script>

<div class="min-h-screen bg-zinc-900 font-kumbh">
    <div class="w-full flex flex-row gap-4 items-center bg-red-700 px-8 py-2">
        <a class="text-white text-4xl" href="/home/settings">&equiv;</a>
        <div class=" text-white text-2xl">Account Session Manager</div>
    </div>
    <div class="flex flex-col gap-4 py-4 text-white p-8">
        <div class="">
            <p class="text-red-600 text-xl" id="error-msg">{errorMessage}</p>
            <p class="text-green-600 text-xl" id="success-msg">
                {successMessage}
            </p>
        </div>
        <div class="flex flex-col gap-2">
            <h2 class="font-bold text-4xl">List of active sessions</h2>

            <p class="text-gray-200">This page is a work in progress! Sorry!</p>
        </div>
    </div>
</div>
