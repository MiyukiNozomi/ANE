<script lang="ts">
  import type {
    AccountSession,
    ClientSideAccount,
  } from "$lib/client/API/apiTypes";
  import {
    getAccountInfo,
    setClientSideAccountInfo,
  } from "$lib/client/API/client";
  import Input from "$lib/client/component/basic/input.svelte";
  import ProgressAPI from "$lib/client/component/progressAPI.svelte";
  import SignPage from "$lib/client/component/signPage.svelte";
  import {
    MAX_PASSWORD_LENGTH,
    MAX_USERNAME_LENGTH,
    MIN_PASSWORD_LENGTH,
    MIN_USERNAME_LENGTH,
    USERNAME_SAFETY_REGEX,
  } from "$lib/shared/safetyConstants";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const StepsList = [
    "WAIT",
    "ALREADY_AUTHORIZED",
    "REQUESTING_AUTHORIZATION",
    "AUTHORIZATION_GRANTED",
  ] as const;
  type Steps = (typeof StepsList)[number];

  let currentStep: Steps = $state("WAIT");

  let shouldRememberMe = $state(false);

  let API: ProgressAPI | undefined = $state();
  let signPage: SignPage | undefined = $state();

  const accountInfo = getAccountInfo();

  onMount(() => {
    if (currentStep == "ALREADY_AUTHORIZED") {
      signPage?.setAllowNextButton(false);
      signPage?.setAllowBackButton(false);
    }

    currentStep =
      data.authRequest.sessionId == null
        ? "REQUESTING_AUTHORIZATION"
        : "ALREADY_AUTHORIZED";
  });

  async function onNextStep() {
    if (currentStep == "REQUESTING_AUTHORIZATION") {
      currentStep = "WAIT";

      let status = await API?.invokeAPIWithStatus<ClientSideAccount>(
        "Authorizing..",
        "accounts/authorize",
        {
          rememberMe: shouldRememberMe,
          ticketId: data.authRequest!.id,
        },
      );

      if (!status || status.error) return;
      signPage?.setAllowBackButton(false);

      signPage?.setAllowNextButton(Boolean(data.authRequest?.webhookURL));
      currentStep = "AUTHORIZATION_GRANTED";
    } else if (currentStep == "AUTHORIZATION_GRANTED") {
      window.location.href = (data.authRequest.webhookURL! ?? "/").replace(
        "[reqCode]",
        data.authRequest.id,
      );
    } else {
      currentStep = "WAIT";
      API?.setError(
        "Apologies! you haved ended in a unimplemented authentication pathway.",
      );
    }
  }
  async function onBackStep() {}
</script>

<svelte:head>
  <title>Sign In</title>
</svelte:head>

<SignPage bind:this={signPage} {onNextStep} {onBackStep}>
  <ProgressAPI bind:this={API} />
  {#if currentStep == "REQUESTING_AUTHORIZATION"}
    <p>Hi, {accountInfo?.displayName ?? accountInfo?.name}.</p>
    <p>
      You are about to grant authorization to "{data.authRequest?.realm}", who
      will have access to:
    </p>
    <ul class="list-disc pl-16">
      <li>Your profile name</li>
      <li>Your profile picture</li>
    </ul>
    <p class="font-bold">
      But not access to modifying any of your account information.
    </p>
    <p>Press "Next" to provide "{data.authRequest.realm}" an authorization.</p>
  {:else if currentStep == "AUTHORIZATION_GRANTED"}
    <p>
      You have given "{data.authRequest?.realm}" an authorization,
      {data.authRequest.webhookURL
        ? "By hitting 'Next', you will now be redirected to their system."
        : "You may now close this page. "}
      Have a great day!
    </p>
  {:else if currentStep == "ALREADY_AUTHORIZED"}
    <p>
      Hi {accountInfo?.displayName ?? accountInfo?.name}, it appears this ticket
      has already been given authorization, so therefore, I shall not let you
      authorize it again.
    </p>
  {:else if currentStep == "WAIT"}
    <p>...</p>
  {:else}
    <p>Unknown step, please reload the page.</p>
  {/if}
</SignPage>
