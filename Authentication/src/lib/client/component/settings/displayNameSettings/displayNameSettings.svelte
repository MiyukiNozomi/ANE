<script lang="ts">
  import type { APIOk } from "$lib/client/API/apiTypes";
  import {
    getAccountInfo,
    setClientSideAccountInfo,
  } from "$lib/client/API/client";
  import {
    MAX_USERNAME_LENGTH,
    MIN_USERNAME_LENGTH,
  } from "$lib/shared/safetyConstants";
  import { slide } from "svelte/transition";
  import Input from "../../basic/input.svelte";
  import ProgressAPI from "../../progressAPI.svelte";

  // literally will never be null due to the restriction in page.server.ts
  const accountInfo = getAccountInfo();

  let progressAPI: ProgressAPI | undefined = $state(undefined);

  let isValid = $state(true);
  let displayName = $state(accountInfo?.displayName ?? accountInfo?.name ?? "");
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

  async function updateDisplayName() {
    if (!isValid) return;

    const res = await progressAPI?.invokeAPIWithStatus<APIOk>(
      "Sending your name..",
      "accounts/cfg/update-displayname",
      {
        displayName,
      },
    );

    if (!res || res.error) {
      return setError("Failed to properly contact backend.");
    }

    setClientSideAccountInfo({
      ...accountInfo!,
      displayName,
    });

    setSuccessful("Successfully set your display name!");
  }
</script>

<div class="flex flex-col gap-4 text-white font-mplus2">
  <div class="">
    <p class="text-red-600 text-xl" id="error-msg">{errorMessage}</p>
    <p class="text-green-600 text-xl" id="success-msg">
      {successMessage}
    </p>
  </div>

  <div class="flex flex-col gap-2">
    <h1 class="text-4xl font-kumbh font-bold">Display Name</h1>

    <p class="text-gray-200">The public version of your username.</p>
    <div class="" transition:slide>
      <ProgressAPI bind:this={progressAPI} />
    </div>

    <div class="flex flex-col gap-4 w-full lg:max-w-2/4">
      <Input
        type="text"
        bind:text={displayName}
        maxLength={MAX_USERNAME_LENGTH}
        minLength={MIN_USERNAME_LENGTH}
        placeholder={accountInfo?.displayName ?? accountInfo?.name ?? ""}
        onErrorChange={(e) => (isValid = !Boolean(e))}
      />
      <button
        class="bg-blue-500 rounded-md px-4 py-2 w-fit mx-auto md:m-0"
        onclick={updateDisplayName}>Save</button
      >
    </div>
  </div>
</div>
