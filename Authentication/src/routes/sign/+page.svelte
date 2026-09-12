<script lang="ts">
  import type { ClientSideAccount } from "$lib/client/API/apiTypes";
  import {
    getAccountInfo,
    invalidateSession,
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
  import type { PageData } from "./$types";

  let pageData: PageData = $props();

  const StepsList = [
    "WAIT",
    "ALREADY_SIGNED_IN",
    "USERNAME_INPUT",
    "LOGIN_PASSWORD_INPUT",
    "TWO_FACTOR_INPUT",
    "REGISTRATION_PASSWORD_INPUT",
    "POST_REGISTRATION",
    "POST_LOGIN",
  ] as const;
  type Steps = (typeof StepsList)[number];

  let currentStep = $state<Steps>("USERNAME_INPUT");
  let previousSteps = new Array<Steps>();

  let API: ProgressAPI | undefined = $state();
  let signPage: SignPage | undefined = $state();
  let repeatPasswordField: Input | undefined = $state();

  let blockAdvances = $state(false);

  let data = $state({
    username: "",
    inputPassword: "",
    repeatPassword: "",
    totpCode: "",
  });

  onMount(() => {
    currentStep = pageData.isSignedIn ? "ALREADY_SIGNED_IN" : "USERNAME_INPUT";
    blockAdvances = !pageData.isSignedIn;
  });

  async function onNextStep() {
    if (blockAdvances) return;

    if (previousSteps[previousSteps.length - 1] != currentStep)
      previousSteps.push(currentStep);

    if (currentStep == "ALREADY_SIGNED_IN") {
      currentStep = "USERNAME_INPUT";
      blockAdvances = true;
      await invalidateSession();
    } else if (currentStep == "USERNAME_INPUT") {
      currentStep = "WAIT";

      let accountInfo = await API?.invokeAPIWithStatus<ClientSideAccount>(
        "Locating ID..",
        "accounts/getinfo",
        {
          username: data.username,
        },
      );

      if (!accountInfo) return;
      blockAdvances = true;
      if (accountInfo.error == "ERR_ACCOUNT_DOES_NOT_EXIST") {
        signPage?.setAllowBackButton(true);
        currentStep = "REGISTRATION_PASSWORD_INPUT";
      } else if (accountInfo.data) {
        signPage?.setAllowBackButton(true);
        currentStep = "LOGIN_PASSWORD_INPUT";
      } else {
        console.log("API response: ", accountInfo);
        API?.setError(
          "Improper response by backend, check your inspector logs and report this as a bug.",
        );
      }
    } else if (currentStep == "REGISTRATION_PASSWORD_INPUT") {
      if (data.repeatPassword != data.inputPassword) {
        return;
      }

      currentStep = "WAIT";
      let sessionInfo = await API?.invokeAPIWithStatus<ClientSideAccount>(
        "Creating account...",
        "accounts/create",
        {
          username: data.username,
          password: data.inputPassword,
        },
      );

      if (!sessionInfo || sessionInfo.error) {
        return API?.setError(
          sessionInfo?.error ?? "Failed to contact backend!",
        );
      }

      installSession(sessionInfo.data!);
      currentStep = "POST_REGISTRATION";
    } else if (currentStep == "POST_REGISTRATION") {
      window.location.href = "/home/settings";
    } else if (
      currentStep == "LOGIN_PASSWORD_INPUT" ||
      currentStep == "TWO_FACTOR_INPUT"
    ) {
      let entranceStep = currentStep;

      currentStep = "WAIT";
      let sessionInfo = await API?.invokeAPIWithStatus<ClientSideAccount>(
        "Signing In...",
        "accounts/login",
        {
          username: data.username,
          password: data.inputPassword,
          totpCode: data.totpCode,
        },
      );

      if (!sessionInfo || sessionInfo.error) {
        if (sessionInfo?.error == "ERR_ACCOUNT_TWOFACTOR_REQUIRED") {
          currentStep = "TWO_FACTOR_INPUT";
          return;
        } else if (
          sessionInfo?.error == "ERR_ACCOUNT_INCORRECT_PASSWORD" ||
          sessionInfo?.error == "ERR_ACCOUNT_INCORRECT_TWOFACTOR"
        ) {
          currentStep = entranceStep;

          return API?.setError(sessionInfo.error);
        }
        return API?.setError(
          sessionInfo?.error ?? "Failed to contact backend!",
        );
      }

      installSession(sessionInfo.data!);
      currentStep = "POST_LOGIN";
    } else if (currentStep == "POST_LOGIN") {
      window.location.pathname = decodeURI(
        new URLSearchParams(window.location.search).get("for") ?? "/",
      );
    } else if (currentStep != "WAIT") {
      currentStep = "WAIT";
      API?.setError(
        "Apologies! you haved ended in a unimplemented authentication pathway: " +
          currentStep +
          ".",
      );
    }
  }

  function installSession(authSession: ClientSideAccount) {
    setClientSideAccountInfo(authSession);
  }

  async function onBackStep() {
    let last = previousSteps.pop();
    if (last) {
      currentStep = last;
    }
    if (previousSteps.length > 0) signPage?.setAllowBackButton(false);
  }

  function handleInputError(error: string | undefined) {
    blockAdvances = Boolean(error);
  }
</script>

<svelte:head>
  <title>Sign In</title>
</svelte:head>

<SignPage bind:this={signPage} {onNextStep} {onBackStep}>
  <ProgressAPI bind:this={API} />
  {#if currentStep == "ALREADY_SIGNED_IN"}
    <p>Hi, {getAccountInfo()?.name}.</p>
    <p>
      You are already signed in, you might choose to return to the main page, or
      hit "Next" to sign in again.
    </p>
  {:else if currentStep == "USERNAME_INPUT"}
    <Input
      type="text"
      placeholder="Enter your username"
      minLength={MIN_USERNAME_LENGTH}
      maxLength={MAX_USERNAME_LENGTH}
      bind:text={data.username}
      onErrorChange={handleInputError}
      validate={(text) => {
        if (!USERNAME_SAFETY_REGEX.test(text)) {
          return "Invalid username.";
        }
      }}
    />
  {:else if currentStep == "REGISTRATION_PASSWORD_INPUT"}
    <p>It appears you currently lack an account.</p>
    <Input
      type="password"
      placeholder="Create a memorable password."
      minLength={MIN_PASSWORD_LENGTH}
      maxLength={MAX_PASSWORD_LENGTH}
      bind:text={data.inputPassword}
      onErrorChange={handleInputError}
      validate={(t) => {
        repeatPasswordField?.changeEvent();
        return undefined;
      }}
    />
    <Input
      bind:this={repeatPasswordField}
      type="password"
      bind:text={data.repeatPassword}
      placeholder="Repeat your chosen password"
      minLength={MIN_PASSWORD_LENGTH}
      maxLength={MAX_PASSWORD_LENGTH}
      onErrorChange={handleInputError}
      validate={(text) => {
        if (text != data.inputPassword) return "Passwords must match.";
      }}
    />
  {:else if currentStep == "POST_REGISTRATION"}
    <p>Hi {data.username}, Welcome to ANE Software!</p>
    <p>
      I will now redirect you to your account's settings page so you can change
      a few details about your profile.
    </p>
  {:else if currentStep == "LOGIN_PASSWORD_INPUT"}
    <p>Welcome back, {data.username}</p>
    <Input
      type="password"
      placeholder="Input your password."
      minLength={MIN_PASSWORD_LENGTH}
      maxLength={MAX_PASSWORD_LENGTH}
      bind:text={data.inputPassword}
      onErrorChange={handleInputError}
    />
  {:else if currentStep == "TWO_FACTOR_INPUT"}
    <p>Sorry, {data.username}. But as a safety measure,</p>
    <Input
      type="password"
      placeholder="Input your one time password."
      minLength={MIN_PASSWORD_LENGTH}
      maxLength={MAX_PASSWORD_LENGTH}
      bind:text={data.totpCode}
      onErrorChange={handleInputError}
    />
  {:else if currentStep == "POST_LOGIN"}
    <p>Hi {data.username}, Welcome back!</p>
    <p>
      I will now redirect you to your requested resourc (or the main page),
      thank you and have a nice day!.
    </p>
  {:else if currentStep == "WAIT"}
    <p>...</p>
  {:else}
    <p>Unknown step, please reload the page.</p>
  {/if}
</SignPage>
