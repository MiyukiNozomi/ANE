<script lang="ts">
  import { getAccountInfo } from "$lib/client-account";
  import type { AccountInfo } from "node-aneauthapi";
  import { tick } from "svelte";
  import { fade, slide } from "svelte/transition";

  let showLoginPanel = $state(false);
  let currentRequestCode: string | undefined = $state(undefined);
  let status: "PRE_REQUEST" | "WAITING" | "AUTHORIZED" | "ERRORED" =
    $state("PRE_REQUEST");

  async function requestAuthorization() {
    const reqRes = await fetch("/api/ext/authorizations/new", {
      method: "POST",
    });
    const json = await reqRes.json();

    currentRequestCode = json.rawRequestCode;
    window.open(json["request-url"]);
    status = "WAITING";

    setInterval(checkIfAuthorized, 1000);
  }

  async function checkIfAuthorized() {
    if (!currentRequestCode) return;
    try {
      const reqRes = await fetch("/api/ext/authorizations/check", {
        method: "POST",
        body: JSON.stringify({ "request-code": currentRequestCode }),
      });
      const json = (await reqRes.json()) as {
        accountInfo?: AccountInfo;
        session?: string;
        sessionStatus: "AUTHORIZED" | "AWAITING_AUTHORIZATION";
      };

      if (json.sessionStatus == "AUTHORIZED") {
        // directly stolen from auth.ane.jp.net
        document.cookie = `AuthToken=${json.session}; SameSite=Lax; Path=/`;
        document.cookie = `AccountInfo=${btoa(JSON.stringify(json.accountInfo))}; SameSite=Lax; Path=/`;
        status = "AUTHORIZED";
      } else if (json.sessionStatus == "AWAITING_AUTHORIZATION") {
        if (status != "WAITING") status = "WAITING";
      } else {
        throw "Unknown status: " + json.sessionStatus;
      }
    } catch (err) {
      console.log(err);
    }
  }

  export async function showPanel() {
    onAuthorizationRestart();
    showLoginPanel = true;
  }

  export async function onAuthorizationRestart() {
    status = "PRE_REQUEST";
    currentRequestCode = undefined;
  }
</script>

{#if showLoginPanel}
  <div
    class="fixed top-0 left-0 w-screen h-screen flex flex-row items-center bg-[#000000AA] backdrop-blur-md z-90"
    transition:fade
  >
    <div
      class="bg-gray-900 mx-auto p-4 rounded-lg flex flex-col gap-4 text-white font-kumbh"
      transition:slide
    >
      {#if status == "PRE_REQUEST"}
        <button
          onclick={requestAuthorization}
          class="flex flex-row items-center rounded-md px-4 py-2 w-fit bg-black border-2 border-blue-600 border-solid gap-2"
          >Sign in with your <img
            src="/favicon.png"
            alt="ANE Logo"
            class="h-12"
          /> ANE Account</button
        >
      {:else if status == "WAITING"}
        <h1>Awaiting for your Authorization</h1>
        <p>
          Didn't work? <button
            class="underline text-blue-600"
            onclick={onAuthorizationRestart}>restart here</button
          >.
        </p>
      {:else if status == "AUTHORIZED"}
        <h1 class="text-2xl font-semibold">
          Welcome {getAccountInfo()!.displayName}!
        </h1>

        <button
          onclick={() => {
            window.location.reload();
          }}
          class="w-full rounded-md px-4 py-2 w-fit bg-black border-2 border-blue-600 border-solid gap-2"
          >Okay</button
        >
      {:else if status == "ERRORED"}
        <h1>
          Something went wrong, please try <button
            class="underline text-blue-600"
            onclick={onAuthorizationRestart}>again later</button
          >.
        </h1>
      {/if}
    </div>
  </div>
{/if}
