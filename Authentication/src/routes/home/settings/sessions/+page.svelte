<script lang="ts">
    import {
        getAccountInfo,
        getCookie,
        invalidateSession,
        invokeAPI,
    } from "$lib/client-api";
    import Input from "$lib/components/input.svelte";
    import type { SessionInfo } from "$lib/server/backend-types";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    let errorMessage = $state("");
    let successMessage = $state("");

    let sessionList = $state(
        data.sessions.sort(
            (a, b) => (a.isThirdParty ? 1 : 0) - (b.isThirdParty ? 1 : 0),
        ),
    );

    function setError(msg: string) {
        errorMessage = msg;
        document.querySelector("#error-msg")?.scrollIntoView();
    }

    function setSuccessful(msg: string) {
        successMessage = msg;
        document.querySelector("#success-msg")?.scrollIntoView();
    }

    async function onDeleteAll() {
        const res = await invokeAPI<any>(
            "signed/session/delete-all",
            undefined,
        );
        if (!res || res.translatedError)
            setError(
                res?.translatedError ??
                    "Failed to contact backend. Verify your network or try reloading the page.",
            );

        // nothing else to do now
        await invalidateSession();
        window.location.href = "/";
    }

    async function onDeleteSingleSession(idForDeletion: SessionInfo) {
        if (
            !window.confirm(
                `Are you sure you wish to delete the session '${idForDeletion.realmName ?? "ANE"}'?
                ${
                    idForDeletion.isThirdParty
                        ? "You will have to authorize the application again if you later need this session."
                        : "It can only be recreated after a sign in."
                }
                `,
            )
        ) {
            return;
        }
        const thisSession = getCookie("AuthToken");
        // temporariarly switch to the session ID
        document.cookie = `AuthToken=${idForDeletion.ID}; SameSite=Lax; Path=/`;

        const res = await invokeAPI<any>(
            "signed/session/delete-self",
            undefined,
        );

        // switch back to our ID
        document.cookie = `AuthToken=${thisSession}; SameSite=Lax; Path=/`;

        if (!res || res.translatedError) {
            setError(
                res?.translatedError ??
                    "Failed to contact backend. Verify your network or try reloading the page.",
            );
        } else {
            sessionList.splice(
                sessionList.findIndex((a) => a.ID == idForDeletion.ID),
                1,
            );
            setSuccessful("Successfully deleted session!");
        }
    }
</script>

<div class="min-h-screen bg-zinc-900 font-kumbh">
    <div class="w-full flex flex-row gap-4 items-center bg-red-700 px-8 py-2">
        <a class="text-white text-4xl" href="/home/settings">&equiv;</a>
        <div class=" text-white text-2xl">Account Session Manager</div>
    </div>
    <div class="flex flex-col gap-6 py-4 text-white p-8">
        <div class="">
            <p class="text-red-600 text-xl" id="error-msg">{errorMessage}</p>
            <p class="text-green-600 text-xl" id="success-msg">
                {successMessage}
            </p>
        </div>
        <div class="flex flex-col gap-2">
            <h1 class="font-bold text-4xl">List of active sessions</h1>

            <button
                class="bg-red-600 w-fit rounded-md px-4 py-2"
                onclick={onDeleteAll}>Delete All Sessions</button
            >
        </div>
        <div class="flex flex-col gap-2">
            <h2 class="font-bold text-2xl">Individual Session Management</h2>
            <p class="text-gray-200">
                These are sessions that have full permission over your account,
                (read-write access)
            </p>

            <table class="text-center">
                <thead>
                    <tr
                        class="text-md bg-red-800 border-b-red-950 border-b-4 border-solid"
                    >
                        <th class="p-2">Realm</th>
                        <th class="p-2"> Date</th>
                        <th class="p-2">Permission</th>
                        <th class="p-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {#each sessionList as session, i}
                        {#if session.ID != getCookie("AuthToken")}
                            <tr
                                class="{i % 2 == 0
                                    ? 'bg-slate-800'
                                    : 'bg-slate-900'} text-md hover:bg-slate-700"
                            >
                                <td>
                                    {#if session.isThirdParty}
                                        {session.realmName}
                                    {:else}
                                        ANE
                                    {/if}
                                </td>
                                <td>
                                    {(() => {
                                        const date = new Date(
                                            session.createdAt * 1000,
                                        );
                                        return (
                                            date.toLocaleDateString() +
                                            " " +
                                            date.toLocaleTimeString()
                                        );
                                    })()}
                                </td>
                                <td>
                                    {session.isThirdParty
                                        ? "read-only"
                                        : "read-write"}
                                </td>
                                <td class="text-sm">
                                    <button
                                        class="bg-red-600 m-2 w-fit rounded-md px-4 py-2"
                                        onclick={() =>
                                            onDeleteSingleSession(session)}
                                        >Delete</button
                                    >
                                </td>
                            </tr>
                        {/if}
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>
