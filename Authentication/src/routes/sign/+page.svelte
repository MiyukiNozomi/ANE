<script lang="ts">
    import { renderBackgroundCanvas } from "$lib/background";
    import { onMount, tick } from "svelte";
    import type { PageData } from "./$types";
    import Input from "$lib/components/input.svelte";
    import {
        getAccountInfo,
        invalidateSession,
        invokeAPI,
        isUsernameValidClientCheck,
        MAX_USERNAME_LENGTH,
        MIN_PASSWORD_LENGTH,
        MIN_USERNAME_LENGTH,
    } from "$lib/client-api";
    import type {
        UserSessionInfo,
        AccountInfo,
    } from "$lib/server/backend-types";
    import { slide } from "svelte/transition";

    let canvas: HTMLCanvasElement;
    let { data }: { data: PageData } = $props();

    const Steps = {
        USERNAME_STEP: 0,
        ACCOUNT_DOES_NOT_EXIST: 1,
        ACCOUNT_EXISTS: 2,

        TWOFACTOR_CODE_INPUT: 3,

        ACCOUNT_REGISTERED: 10,
        ACCOUNT_SIGNED_IN: 11,

        ALREADY_HAS_SESSION: 20,
    };

    const accountInfo = getAccountInfo();

    let disableBackButton = $state(false);

    let currentStep = $state(Steps.USERNAME_STEP);

    let username = $state("");
    let password = $state("");
    let repeatPassword = $state("");
    let totpCode = $state("");

    let errorMessage = $state("");

    let authSession: UserSessionInfo | undefined = $state(undefined);

    onMount(async () => {
        renderBackgroundCanvas(canvas);
        await tick();
    });

    function isUsernameInvalid() {
        if (username.length < MIN_USERNAME_LENGTH) {
            errorMessage =
                "Usernames must contain at least " +
                MIN_USERNAME_LENGTH +
                " characters.";
            return true;
        }
        if (!isUsernameValidClientCheck(username)) {
            errorMessage =
                "Usernames may only contain A-Z, 0-9 or underscores.";
            return true;
        }
        return false;
    }

    function isPasswordInvalid() {
        if (password.length < MIN_PASSWORD_LENGTH) {
            errorMessage =
                "Passwords must contain at least " +
                MIN_USERNAME_LENGTH +
                " characters.";
            return true;
        }
        return false;
    }

    async function backwardStep() {
        errorMessage = "";
        if (currentStep == Steps.ACCOUNT_EXISTS)
            return (currentStep = Steps.USERNAME_STEP);
        currentStep--;
    }

    async function nextStep() {
        errorMessage = "";

        switch (currentStep) {
            case Steps.USERNAME_STEP: {
                if (isUsernameInvalid()) return;
                const existingAccountInfo = await invokeAPI<AccountInfo>(
                    "get-account",
                    { username },
                );

                if (!existingAccountInfo)
                    return (errorMessage =
                        "Could not reach miyuki.gov.neptune, sorry.");

                currentStep =
                    existingAccountInfo.error == "DOES_NOT_EXIST"
                        ? Steps.ACCOUNT_DOES_NOT_EXIST
                        : Steps.ACCOUNT_EXISTS;
                break;
            }
            case Steps.ACCOUNT_DOES_NOT_EXIST: {
                if (isPasswordInvalid()) return;
                const accountSession = await invokeAPI<UserSessionInfo>(
                    "register",
                    { username, password },
                );

                if (!accountSession)
                    return (errorMessage =
                        "Could not reach miyuki.gov.neptune, sorry.");

                if (accountSession?.translatedError) {
                    errorMessage = accountSession.translatedError;
                    return;
                }

                disableBackButton = true;
                currentStep = Steps.ACCOUNT_REGISTERED;
                authSession = accountSession?.data!;
                break;
            }
            case Steps.ACCOUNT_EXISTS:
            case Steps.TWOFACTOR_CODE_INPUT: {
                if (isPasswordInvalid()) return;
                const accountSession = await invokeAPI<UserSessionInfo>(
                    "login",

                    currentStep == Steps.TWOFACTOR_CODE_INPUT
                        ? { username, password, totpCode }
                        : { username, password },
                );

                if (!accountSession)
                    return (errorMessage =
                        "Could not reach miyuki.gov.neptune, sorry.");

                if (accountSession.error == "TWO_FACTOR_REQUIRED") {
                    currentStep = Steps.TWOFACTOR_CODE_INPUT;
                    return;
                }
                if (accountSession?.translatedError) {
                    errorMessage = accountSession.translatedError;
                    return;
                }

                disableBackButton = true;
                currentStep = Steps.ACCOUNT_SIGNED_IN;
                authSession = accountSession?.data!;
                break;
            }
            case Steps.ALREADY_HAS_SESSION:
            case Steps.ACCOUNT_REGISTERED:
            case Steps.ACCOUNT_SIGNED_IN: {
                if (currentStep != Steps.ALREADY_HAS_SESSION)
                    await installSession();
                if (currentStep == Steps.ACCOUNT_REGISTERED) {
                    window.location.pathname = "/home/settings";
                    return;
                }
                let pth: string | undefined;
                const rawRedirect = new URLSearchParams(
                    window.location.search,
                ).get("redir");

                if (rawRedirect) pth = decodeURI(rawRedirect);

                pth = pth ?? "/home";
                if (!pth.startsWith("/")) pth = "/" + pth;

                window.location.href = pth;
                break;
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

    async function installSession() {
        if (!authSession)
            return alert(
                "This is a bug: installSession called with authSession being null",
            );

        document.cookie = `AuthToken=${authSession.sessionToken}; SameSite=Lax; Path=/`;
        document.cookie = `AccountInfo=${btoa(JSON.stringify(authSession.accountInfo))}; SameSite=Lax; Path=/`;
    }

    if (data.isUserSessionValid && accountInfo != null) {
        disableBackButton = true;
        currentStep = Steps.ALREADY_HAS_SESSION;
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
                {#if currentStep == Steps.USERNAME_STEP}
                    <div transition:slide class="flex flex-col gap-2">
                        <h1>
                            Welcome! {!data.isUserSessionValid &&
                            accountInfo != null
                                ? "Your session has expired, sorry!"
                                : ""}
                        </h1>
                        <Input
                            type="text"
                            placeholder="Input your username"
                            maxLength={MAX_USERNAME_LENGTH}
                            bind:text={username}
                        />
                    </div>
                {:else if currentStep == Steps.ACCOUNT_DOES_NOT_EXIST}
                    <div transition:slide class="flex flex-col gap-2">
                        <h1>Welcome {username}, to ANE!</h1>
                        <p>
                            Your username isn't taken, therefore you have
                            entered the registration pathway!
                        </p>
                        <Input
                            type="password"
                            placeholder="Input a unique password here"
                            bind:text={password}
                        />
                        <Input
                            type="password"
                            placeholder="Repeat your unique password here"
                            bind:text={repeatPassword}
                        />
                    </div>
                {:else if currentStep == Steps.ACCOUNT_EXISTS}
                    <div transition:slide class="flex flex-col gap-2">
                        <h1>Welcome back, {username}!</h1>
                        <p>
                            Input your password, if you have 2FA enabled, we
                            will ask for your OTP code later.
                        </p>
                        <Input
                            type="password"
                            placeholder="Input your password"
                            bind:text={password}
                        />
                    </div>
                {:else if currentStep == Steps.TWOFACTOR_CODE_INPUT}
                    <div transition:slide class="flex flex-col gap-2">
                        <h1>Security demands it, {username}.</h1>
                        <p>
                            Your account has two factor authentication enabled,
                            therefore...
                        </p>
                        <Input
                            type="text"
                            placeholder="Input your one time password."
                            maxLength={6}
                            bind:text={totpCode}
                        />
                    </div>
                {:else if currentStep == Steps.ACCOUNT_REGISTERED}
                    <div transition:slide class="flex flex-col gap-2">
                        <h1>Welcome to the community!</h1>
                        <p>
                            This page will now take you to your account's
                            settings, I'm glad you're here.
                        </p>
                    </div>
                {:else if currentStep == Steps.ACCOUNT_SIGNED_IN}
                    <div transition:slide class="flex flex-col gap-2">
                        <h1>Welcome back, {username}!</h1>
                        <p>
                            I'll soon redirect you back to the resource you
                            wanted.
                        </p>
                    </div>
                {:else if currentStep == Steps.ALREADY_HAS_SESSION && accountInfo}
                    <div transition:slide class="flex flex-col gap-2">
                        <h1>Welcome back, {accountInfo.name}!</h1>
                        <p>
                            Since you have a valid session, there's no need to
                            authenticate again.
                        </p>
                        <p>
                            However, If you wish to sign in with a different
                            account, <button
                                onclick={async (event) => {
                                    event.preventDefault();
                                    await invalidateSession();
                                    window.location.reload();
                                }}
                                class="text-red-500 underline cursor-pointer"
                                >click here</button
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
                    {#if currentStep > 0 && !disableBackButton}
                        <button
                            class="bg-red-600 px-8 py-2 text-lg"
                            onclick={backwardStep}>Back</button
                        >
                    {/if}
                    <button
                        class="ml-auto bg-sky-600 px-8 py-2 text-lg"
                        onclick={nextStep}>Next</button
                    >
                </div>
            </div>
        </div>
    </div>
</div>
