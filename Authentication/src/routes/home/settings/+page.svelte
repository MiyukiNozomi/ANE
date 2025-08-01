<script lang="ts">
  import {
    getAccountInfo,
    getCookie,
    invalidateSession,
    MAX_USERNAME_LENGTH,
    MIN_USERNAME_LENGTH,
  } from "$lib/client-api";
  import Input from "$lib/components/input.svelte";
  import { error } from "@sveltejs/kit";
  import type { PageData } from "./$types";
  import ProgressApi from "$lib/components/progressAPI.svelte";
  import { slide } from "svelte/transition";

  let { data }: { data: PageData } = $props();

  // literally will never be null due to the restriction in page.server.ts
  const accountInfo = getAccountInfo();

  let progressAPI: ProgressApi | undefined = $state();

  let newDisplayName = $state(accountInfo?.displayName ?? "");
  let errorMessage = $state("");
  let successMessage = $state("");

  function clearMessages() {
    errorMessage = "";
    successMessage = "";
  }

  function setError(msg: string) {
    errorMessage = msg;
    document.querySelector("#error-msg")?.scrollIntoView();
  }

  function setSuccessful(msg: string) {
    successMessage = msg;
    document.querySelector("#success-msg")?.scrollIntoView();
  }
  async function updateDisplayName() {
    if (progressAPI?.isActive()) return;

    clearMessages();

    if (newDisplayName.length < MIN_USERNAME_LENGTH)
      return setError(
        "Display names must have at least " +
          MIN_USERNAME_LENGTH +
          " characters."
      );

    const res = await progressAPI?.invokeAPIWithStatus(
      "Setting your display name...",
      "signed/set-display-name",
      {
        displayName: newDisplayName,
      }
    );

    if (!res || res.error) {
      return setError(
        "Could not perform request, this is a bug. please report it to miyuki@ane.jp.net with your inspector's logs."
      );
    }
    setSuccessful("Successfully updated your display name!");
  }
</script>

<svelte:head>
  <title>Account Settings</title>
  <meta name="title" content="Account Settings" />
  <meta name="description" content="Protected Resource." />
</svelte:head>

<div class="min-h-screen bg-zinc-900 font-kumbh">
  <div class="w-full flex flex-row gap-4 items-center bg-sky-700 px-8 py-2">
    <a class="text-white text-4xl" href="/">&equiv;</a>
    <div class=" text-white text-2xl">Account Settings</div>
  </div>
  <div class="flex flex-col gap-4 py-4 text-white p-8">
    <div class="">
      <p class="text-red-600 text-xl" id="error-msg">{errorMessage}</p>
      <p class="text-green-600 text-xl" id="success-msg">
        {successMessage}
      </p>
    </div>
    <!-- Profile Settings -->
    <div class="flex flex-col gap-2">
      <div transition:slide>
        <ProgressApi bind:this={progressAPI} />
      </div>
      <h2 class="font-bold text-4xl">Profile</h2>
      <p class="text-gray-200">
        Edit information such as your Display name or in the future, your
        profile picture.
        <br />
        Note that you're not allowed to change your user name (the name you use to
        log in).
      </p>

      <div class="w-full md:w-96">
        <Input
          type="text"
          maxLength={MAX_USERNAME_LENGTH}
          bind:text={newDisplayName}
          placeholder="Your new display name, or '{accountInfo?.name}'"
        />
      </div>

      <button
        class="{progressAPI?.isActive()
          ? 'bg-blue-950'
          : 'bg-blue-500'} w-fit rounded-md px-4 py-2"
        onclick={updateDisplayName}>Save</button
      >
    </div>
    <!-- Behond, security settings-->
    <div class="flex flex-col gap-2" id="safety">
      <h2 class="font-bold text-4xl">Account Safety</h2>
      {#if !data.accountSecurityInfo?.has2FA}
        <a
          class="bg-blue-600 w-fit rounded-md px-4 py-2"
          href="/home/settings/2fa-setup">2FA Setup</a
        >
      {:else}
        <p class="text-green-600">
          You have two factor authentication enabled, good!
        </p>
      {/if}
      <a
        class="bg-blue-600 w-fit rounded-md px-4 py-2"
        href="/home/settings/sessions">Manage Sessions</a
      >
      <button
        class="bg-blue-600 w-fit rounded-md px-4 py-2"
        onclick={() => {
          if (
            window.confirm(
              "Wait! Be aware this token grants FULL permission over your account. Are you sure you wish to proceed?"
            )
          ) {
            window.alert("Your Root Key: \n" + getCookie("AuthToken"));
          }
        }}>Get Root Key</button
      >
    </div>
    <!-- The daaaaanger zoneeee -->
    <div class="flex flex-col gap-2" id="danger-zone">
      <h2 class="font-bold text-4xl">Danger Zone</h2>

      {#if data.accountSecurityInfo?.has2FA}
        <a
          class="bg-red-600 w-fit rounded-md px-4 py-2"
          href="/home/settings/disable-2fa">Remove 2FA</a
        >
      {/if}
      <button
        class="bg-red-600 w-fit rounded-md px-4 py-2"
        onclick={async () => {
          await invalidateSession();
          window.location.href = "/";
        }}>Sign Out</button
      >
    </div>
  </div>
</div>
