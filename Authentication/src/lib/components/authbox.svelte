<script lang="ts">
    import {
        isUsernameValidClientCheck,
        MAX_PASSWORD_LENGTH,
        MAX_USERNAME_LENGTH,
        MIN_PASSWORD_LENGTH,
        MIN_USERNAME_LENGTH,
    } from "$lib/client-api";

    let {
        children,
        nextFunc,
        backFunc,
    }: {
        children: any;
        nextFunc: () => void;
        backFunc?: () => void;
    } = $props();

    let lastError = $state("");
    let loaderProgress = $state(-1);

    export function isDataInvalid(username: string, password: string) {
        setError("");

        if (username.length < MIN_USERNAME_LENGTH)
            return setError(
                `Usernames must have at least ${MIN_USERNAME_LENGTH} characters.`,
            );
        if (username.length > MAX_USERNAME_LENGTH)
            return setError(
                `Usernames can't have more than ${MAX_USERNAME_LENGTH} characters.`,
            );
        if (!isUsernameValidClientCheck(username))
            return setError(
                `Usernames can only contain A-Z, 0-9 or undercores.`,
            );

        if (
            password.length < MIN_PASSWORD_LENGTH ||
            password.length > MAX_PASSWORD_LENGTH
        )
            return setError(
                `Passwords must have a length between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
            );
        return false;
    }

    export function internalError() {
        setError(
            "An unhandled error happened, check your internet and if that's not the case, contact miyuki@ane.jp.net",
        );
    }

    export function setError(error: string) {
        lastError = error;
        return true;
    }
</script>

<div class="fixed flex items-center h-screen w-screen z-20">
    <div
        class="smooth-height md:w-96 w-screen flex flex-col p-6 mx-auto text-gray-200

        bg-gradient-to-b from-sky-900/40 via-blue-950/80 to-indigo-900/100
        border-indigo-800 border-solid border-2
        backdrop-blur-lg gap-3
        
        transition-all ease-in-out duration-200"
    >
        <img
            src="https://galatea.ane.jp.net/dl/images/ane-logo-final.png"
            class="w-36 md:w-2/4"
            alt=""
        />

        <div class="flex flex-col gap-2" style="animation: fade 1s ease-in-out">
            {@render children()}
            <p class="text-red-500">{lastError}</p>
            <div class="flex flex-row">
                {#if backFunc}
                    <button
                        class="bg-red-600 px-8 py-2 text-lg"
                        onclick={backFunc}>Back</button
                    >
                {/if}
                <button
                    class="ml-auto bg-sky-600 px-8 py-2 text-lg"
                    onclick={nextFunc}>Next</button
                >
            </div>
        </div>
        <!--
        <div class="flex flex-row w-full h-2 bg-gray-900">
            <div
                style="width: {loaderProgress}px"
                class="bg-blue-500 h-2 transition-all ease-in-out duration-200"
            ></div>
        </div>
-->
    </div>
</div>

<style>
    .smooth-height {
        transition: height 300ms ease;
        overflow: hidden;
    }
</style>
