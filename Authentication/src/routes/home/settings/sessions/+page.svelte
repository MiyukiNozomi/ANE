<script lang="ts">
  import {
    getAccountInfo,
    getCookie,
    invalidateSession,
  } from "$lib/client-api";
  import Input from "$lib/components/input.svelte";
  import { fade, slide } from "svelte/transition";
  import type { PageData } from "./$types";
  import ProgressApi from "$lib/components/progressAPI.svelte";
  import type { Session, User } from "$lib/server/db/schema";
  import { MIN_REALM_LENGTH } from "$lib/shared/safety";
  import type { UserSessionInfo } from "$lib/server/serviceTypes";

  let { data }: { data: PageData } = $props();

  let progressAPI: ProgressApi | undefined;

  // for the New API Token setup
  let showApiTokenSetup = $state(false);
  let newTokenLabel = $state("");
  let resultingToken: string | undefined = $state(undefined);

  // error message handling
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

  //
  let sessionList = $state(
    data.sessions.sort(
      (a, b) =>
        (a.isThirdPartySession ? 1 : 0) - (b.isThirdPartySession ? 1 : 0),
    ),
  );

  async function onDeleteAll() {
    if (progressAPI?.isActive()) return;

    const res = await progressAPI?.invokeAPIWithStatus<any>(
      "Deleting all sessions...",
      "signed/session/delete-all",
      undefined,
    );
    if (!res || "error" in res)
      setError(
        res?.error ??
          "Failed to contact backend. Verify your network or try reloading the page.",
      );

    // nothing else to do now
    await invalidateSession();
    window.location.href = "/";
  }

  async function onDeleteSingleSession(idForDeletion: Session) {
    if (progressAPI?.isActive()) return;

    if (
      !window.confirm(
        `Are you sure you wish to delete the session '${idForDeletion.realmName ?? "ANE"}'?
                ${
                  idForDeletion.isThirdPartySession
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
    document.cookie = `AuthToken=${idForDeletion.id}; SameSite=Lax; Path=/`;

    const res = await progressAPI?.invokeAPIWithStatus<any>(
      "Removing " + idForDeletion.id + "...",
      "signed/session/delete-self",
      undefined,
    );

    // switch back to our ID
    document.cookie = `AuthToken=${thisSession}; SameSite=Lax; Path=/`;

    if (!res || "error" in res) {
      setError(
        res?.error ??
          "Failed to contact backend. Verify your network or try reloading the page.",
      );
    } else {
      sessionList.splice(
        sessionList.findIndex((a) => a.id == idForDeletion.id),
        1,
      );
      setSuccessful("Successfully deleted session!");
    }
  }

  async function onCreateAPIToken() {
    if (progressAPI?.isActive()) return;

    errorMessage = "";
    if (newTokenLabel.length < MIN_REALM_LENGTH)
      return (errorMessage =
        "This label should have at least " +
        MIN_REALM_LENGTH +
        " characters in length.");

    const res = await progressAPI?.invokeAPIWithStatus<UserSessionInfo>(
      "Creating API token...",
      "signed/create-api-token",
      {
        name: newTokenLabel,
      },
    );

    if (!res || "error" in res) {
      return (errorMessage = res?.error ?? "Failed to contact backend!");
    }
    sessionList.unshift(res.object.session);
    resultingToken = res.object.session.id;
  }
</script>

<svelte:head>
  <title>Account Session Manager</title>
  <meta name="title" content="Account Session Manager" />
  <meta name="description" content="Protected Resource." />
</svelte:head>

{#if showApiTokenSetup}
  <div
    transition:fade
    class="bg-[#00000066] backdrop-blur-sm fixed w-screen h-screen top-0 left-0 flex flex-row items-center"
  >
    <div
      class="flex m-auto p-4 bg-zinc-800 w-full md:w-96 border-red-700 border-1 border-solid rounded-md text-white font-kumbh"
    >
      <div transition:slide class="flex gap-2 flex-col w-full text-start">
        {#if resultingToken}
          <h1 class="font-semibold text-xl">Done!</h1>
          <p>
            Feel free to use the token below (note this is a non-root token.)
          </p>
          <p class="p-2 bg-zinc-700 break-words">{resultingToken}</p>
          <div class="flex flex-row pt-4">
            <button
              onclick={() => {
                showApiTokenSetup = false;
              }}
              class="bg-red-600 w-fit ml-auto rounded-md px-4 py-2"
              >Thanks!</button
            >
          </div>
        {:else}
          <h1 class="font-semibold text-xl">Create an API Token</h1>
          <p class="text-red-600 text-xl" id="error-msg">{errorMessage}</p>
          <Input
            placeholder="Input a name for this token.."
            type="text"
            bind:text={newTokenLabel}
            maxLength={128}
          />
          <div class="flex flex-row pt-4">
            <button
              onclick={() => (showApiTokenSetup = false)}
              class="bg-red-950 w-fit rounded-md px-4 py-2">Cancel</button
            >
            <button
              onclick={onCreateAPIToken}
              class="ml-auto bg-red-600 w-fit rounded-md px-4 py-2"
              >Create</button
            >
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
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
      <div class="" transition:slide>
        <ProgressApi bind:this={progressAPI} />
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <h1 class="font-bold text-4xl">List of active sessions</h1>

      <button
        class="bg-red-600 w-fit rounded-md px-4 py-2"
        onclick={onDeleteAll}>Delete All Sessions</button
      >
    </div>
    <div class="flex flex-col gap-2">
      <h2 class="font-bold text-2xl">Need an API token?</h2>
      <p class="text-gray-200">
        If you want to create an API token to interact with your account without
        having to code authorization support, you can manually create a session
        here.
      </p>
      <button
        class="bg-red-600 w-fit rounded-md px-4 py-2"
        onclick={() => {
          newTokenLabel = "";
          resultingToken = undefined;
          showApiTokenSetup = true;
        }}>Create API Token</button
      >
    </div>

    <div class="flex flex-col gap-2">
      <h2 class="font-bold text-2xl">Individual Session Management</h2>
      <p class="text-gray-200">
        Read-write sessions represent sessions generated when you log into this
        website directly.
      </p>
      <p class="text-gray-200">
        Read-only sessions represent sessions generated when you authorize an
        application to access your profile.
      </p>

      <table class="text-center">
        <thead>
          <tr
            class="text-md bg-red-800 border-b-red-950 border-b-4 border-solid"
          >
            <th class="p-2">Realm</th>
            <th class="p-2">Date</th>
            <th class="p-2">Permission</th>
            <th class="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {#each sessionList as session, i}
            {#if session.id != getCookie("AuthToken")}
              <tr
                class="{i % 2 == 0
                  ? 'bg-slate-800'
                  : 'bg-slate-900'} text-md hover:bg-slate-700"
              >
                <td>
                  {#if session.isThirdPartySession}
                    {session.realmName}
                  {:else}
                    ANE
                  {/if}
                </td>
                <td>
                  {(() => {
                    const date = new Date(session.createdAt * 1000);
                    return (
                      date.toLocaleDateString() +
                      " " +
                      date.toLocaleTimeString()
                    );
                  })()}
                </td>
                <td>
                  {session.isThirdPartySession ? "read-only" : "read-write"}
                </td>
                <td class="text-sm">
                  <button
                    class="bg-red-600 m-2 w-fit rounded-md px-4 py-2"
                    onclick={() => onDeleteSingleSession(session)}
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
