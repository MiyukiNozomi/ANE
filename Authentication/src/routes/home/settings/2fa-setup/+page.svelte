<script lang="ts">
    import { getAccountInfo, invokeAPI } from "$lib/client-api";
    import Input from "$lib/components/input.svelte";
    import type { PageData } from "./$types";

    import type { TwoFactorStepFinish } from "$lib/server/backend-types";
    import QRCode from "@castlenine/svelte-qrcode";

    let { data }: { data: PageData } = $props();

    // literally will never be null due to the restriction in page.server.ts
    const accountInfo = getAccountInfo();

    const Issuer = encodeURI("auth.ane.jp.net");

    let recoveryKey: string | undefined = $state(undefined);
    let twoFactorCode = $state("");

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

    async function verify() {
        errorMessage = "";
        successMessage = "";
        if (twoFactorCode.length < 6)
            return setError("One-time-passwords in ANE have 6 characters.");
        const apiRes = await invokeAPI<TwoFactorStepFinish>(
            "signed/2fa/setup",
            { twoFactorCode },
        );

        if (!apiRes) return setError("Failed to contact miyuki.gov.nt, Sorry.");
        if (apiRes.translatedError) return setError(apiRes.translatedError);

        recoveryKey = apiRes.data?.["recovery-key"];
        setSuccessful("Successfully enabled 2FA!");
    }
</script>

<svelte:head>
    <title>Account 2FA Setup</title>
    <meta name="title" content="Account 2FA Setup" />
    <meta name="description" content="Protected Resource." />
</svelte:head>

{#if recoveryKey}
    <div
        class="fixed left-0 top-0 flex flex-row items-center w-screen h-screen bg-[#000000AA]"
    >
        <div
            class="md:w-96 w-screen mx-auto
                bg-zinc-700 border-blue-500 border-solid border-2 p-4 rounded-lg
                font-kumbh text-gray-300 text-md
                flex flex-col gap-2"
        >
            <h1 class="text-white font-semibold text-xl">
                Two Factor Authentication has been Activated!
            </h1>
            <p>
                Your account will now require a one time password from now on!
            </p>
            <p>
                To ensure you will never loose this account, store this recovery
                key somewhere safe in your computer.
            </p>
            <p class="bg-zinc-600 p-2 rounded-lg break-words">
                {recoveryKey}
            </p>

            <div class="flex flex-row">
                <a
                    class="ml-auto text-white bg-blue-600 w-fit rounded-md px-4 py-2"
                    href="/home/settings">I've saved it, go ahead!</a
                >
            </div>
        </div>
    </div>
{/if}
<div class="min-h-screen bg-zinc-900 font-kumbh">
    <div class="w-full flex flex-row gap-4 items-center bg-sky-700 px-8 py-2">
        <a class="text-white text-4xl" href="/home/settings">&equiv;</a>
        <div class=" text-white text-2xl">Two Factor Authentication Setup</div>
    </div>
    <div class="flex flex-col gap-4 py-4 text-white p-8">
        <div class="">
            <p class="text-red-600 text-xl" id="error-msg">{errorMessage}</p>
            <p class="text-green-600 text-xl" id="success-msg">
                {successMessage}
            </p>
        </div>

        <div class="flex flex-col gap-2">
            <p class="text-gray-200">
                Scan the QR code below using your authenticator app, or copy the
                shared secret into your one-time-password app.
            </p>

            <div
                class="mt-4 p-4 border-blue-500 border-solid border-2 rounded-lg flex flex-col md:flex-row gap-4"
            >
                <div class="w-fit mx-auto md:m-0 p-4 bg-white rounded-lg">
                    <QRCode
                        backgroundColor="#ffffff"
                        color="#155dfc"
                        data={`otpauth://totp/${Issuer}:${accountInfo?.name}?secret=${data.sharedSecret}&issuer=${Issuer}`}
                    />
                </div>
                <div class="flex flex-col text-start gap-4">
                    <h1 class="text-white font-semibold text-xl">
                        Shared Secret (if you want to add it manually)
                    </h1>
                    <p class="bg-zinc-600 p-2 rounded-lg break-words">
                        {data.sharedSecret}
                    </p>

                    <h1 class="text-white font-semibold text-xl">
                        Verify your 6-digit code below:
                    </h1>
                    <div class="flex flex-row gap-4">
                        <div class="w-32 text-2xl">
                            <Input
                                maxLength={6}
                                placeholder="000000"
                                bind:text={twoFactorCode}
                                type="text"
                            />
                        </div>
                        <button
                            class="bg-blue-600 w-fit rounded-md px-4 py-2"
                            onclick={verify}>Enable 2FA</button
                        >
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
