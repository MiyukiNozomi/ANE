<script lang="ts">
    import { renderBackgroundCanvas } from "$lib/background";
    import { onMount, tick } from "svelte";
    import type { PageData } from "./$types";
    import { getAccountInfo, invokeAPI } from "$lib/client-api";
    import { slide } from "svelte/transition";

    let canvas: HTMLCanvasElement;
    let { data }: { data: PageData } = $props();

    const Steps = {
        MISSING_OR_EXPIRED: 0,
        ASK_AUTHORIZATION: 1,

        GRANTED: 2,

        ALREADY_AUTHORIZED: 3,
    };

    const accountInfo = getAccountInfo();

    let currentStep = $state(
        data.reqInfo == undefined
            ? Steps.MISSING_OR_EXPIRED
            : data.reqInfo.status == "AUTHORIZED"
              ? Steps.ALREADY_AUTHORIZED
              : Steps.ASK_AUTHORIZATION,
    );

    let errorMessage = $state("");

    onMount(async () => {
        renderBackgroundCanvas(canvas);
        await tick();
    });

    async function onAuthorize() {
        errorMessage = "";

        switch (currentStep) {
            case Steps.ASK_AUTHORIZATION: {
                const res = await invokeAPI<any>("signed/authorize", {
                    authRequestCode: data.reqInfo!.reqCode,
                });

                if (!res)
                    return (errorMessage =
                        "Sorry, Communication with the backend server has failed. (Try reloading the page!)");
                if (res?.translatedError)
                    return (errorMessage = res.translatedError);

                currentStep = Steps.GRANTED;
                return;
            }
            default:
                alert(
                    "Unimplemented step conversion: " +
                        currentStep +
                        " to <undefined>",
                );
                return;
        }
    }
</script>

<div class="w-screen h-screen bg-black">
    <h2 class="z-0 text-blue-950">Background is rendering...</h2>
    <canvas bind:this={canvas} class="fixed top-0 left-0 z-10"> </canvas>

    <div class="fixed flex items-center h-screen w-screen z-20">
        <div
            class="md:w-96 w-screen flex flex-col p-6 mx-auto text-gray-200
        bg-gradient-to-b from-sky-900/40 via-blue-950/80 to-indigo-900/100
        border-indigo-800 border-solid border-2
        backdrop-blur-lg gap-3"
        >
            <a href="/">
                <img
                    src="https://galatea.ane.jp.net/dl/images/logos/ane-logo-final.webp"
                    class="w-36 md:w-2/4"
                    alt=""
                /></a
            >
            <div class="flex flex-col gap-2">
                {#if currentStep == Steps.MISSING_OR_EXPIRED}
                    <div transition:slide class="flex flex-col gap-2">
                        <h1>
                            Hello, {accountInfo?.name}.
                        </h1>
                        <p>
                            You have attempted to authorize a Invalid or
                            non-existant session request.
                        </p>
                        <p>
                            Therefore, there's no possible way to proceed
                            besides re-creating the request.
                        </p>
                        <p>You may now close this tab.</p>
                    </div>
                {:else if currentStep == Steps.ASK_AUTHORIZATION}
                    <div transition:slide class="flex flex-col gap-2">
                        <h1>Hello, {accountInfo?.displayName}!</h1>
                        <p>
                            The application '{data.reqInfo?.realm}' is
                            requesting your authorization.
                        </p>
                        <p>
                            It will be able to view your profile information,
                            but won't be allowed to make any changes.
                        </p>
                    </div>
                {:else if currentStep == Steps.GRANTED}
                    <div transition:slide class="flex flex-col gap-2">
                        <h1>Permission granted, {accountInfo?.displayName}!</h1>
                        <p>You may now close this tab, have a nice day!</p>
                        <p>
                            On a side note, This authorization will last for
                            around a day. If you want to remove it do it from
                            your <a
                                class="text-red-500 underline"
                                href="/home/settings/sessions"
                                >account settings</a
                            >.
                        </p>
                    </div>
                {:else if currentStep == Steps.ALREADY_AUTHORIZED}
                    <div transition:slide class="flex flex-col gap-2">
                        <h1>Hello again, {accountInfo?.displayName}!</h1>
                        <p>
                            You appear to have already given authorization to
                            this request.
                        </p>
                        <p>
                            If you believe this to be a mistake, manage your
                            sessions and authorizations <a
                                class="text-red-500 underline"
                                href="/home/settings/sessions">here</a
                            >.
                        </p>
                    </div>
                {:else}
                    <div transition:slide class="flex flex-col gap-2">
                        <p>
                            <strong>Error!</strong> you stumbled upon a unknown
                            or Unimplemented step (Current step: {currentStep})
                        </p>
                        <p>Please report this to miyuki@ane.jp.net</p>
                    </div>
                {/if}
                <p class="text-red-500">{errorMessage}</p>
                <div class="flex flex-row">
                    {#if currentStep == Steps.ASK_AUTHORIZATION}
                        <button
                            class="bg-red-600 px-8 py-2 text-lg ml-auto"
                            onclick={onAuthorize}>Authorize</button
                        >
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
