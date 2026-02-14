<script lang="ts">
  import { getAccountInfo } from "$lib/client/API/client";
  import { blur, fly, scale, slide } from "svelte/transition";
  import type { PageData } from "./$types";
  import Handbook from "$lib/client/component/panels/handbook.svelte";
  import { onDestroy, onMount } from "svelte";
  import OverlayWindow from "$lib/client/component/overlayWindow.svelte";
  import AccountSettings from "$lib/client/component/panels/accountSettings.svelte";

  let {}: PageData = $props();

  let account = getAccountInfo();

  const tabOptions = ["SYSTEM", "HANDBOOK"];
  if (account) tabOptions.push("ACCOUNT");
  let activeTab: (typeof tabOptions)[number] = $state(tabOptions[0]);

  let messagesStack = $state(new Array<String>());

  const backgroundLogText =
    `Feb 11 09:05:33 hoshimachi sshd[57120]: Server listening on 0.0.0.0 port 22.
Feb 11 09:11:04 hoshimachi PackageKit[23603]: uid 1001 is trying to obtain org.freedesktop.packagekit.system-sources-refresh auth (only_trusted:0)
Feb 11 09:11:04 hoshimachi PackageKit[23603]: uid 1001 failed to obtain auth
Feb 11 11:46:44 hoshimachi doas[45483]: suisei ran command sysctl security.bsd.unprivileged_chroot=1 as root from /home/suisei
Feb 11 18:39:13 hoshimachi doas[35899]: suisei ran command pkg install libimobiledevice as root from /home/suisei
Feb 11 18:41:36 hoshimachi su[62583]: suisei to root on /dev/pts/2
Feb 11 22:17:42 hoshimachi sshd-session[65706]: Connection closed by authenticating user root 2804:388:905e:a985:7988:d8b8:ea95:fd1d port 49850 [preauth]
Feb 12 09:06:04 hoshimachi PackageKit[94734]: uid 1001 is trying to obtain org.freedesktop.packagekit.system-sources-refresh auth (only_trusted:0)
Feb 12 09:06:04 hoshimachi PackageKit[94734]: uid 1001 failed to obtain auth
Feb 13 09:06:04 hoshimachi PackageKit[11954]: uid 1001 is trying to obtain org.freedesktop.packagekit.system-sources-refresh auth (only_trusted:0)
Feb 13 09:06:04 hoshimachi PackageKit[11954]: uid 1001 failed to obtain auth
Feb 13 11:06:49 hoshimachi doas[22664]: suisei ran command poweroff as root from /home/suisei/Documents/Projects/Web/nautilus
Feb 13 11:06:49 hoshimachi shutdown[23088]: power-down by suisei: 
Feb 13 11:06:52 hoshimachi sshd[57120]: Received signal 15; terminating.
Feb 13 14:50:52 hoshimachi sshd[17168]: Server listening on :: port 22.
Feb 13 14:50:52 hoshimachi sshd[17168]: Server listening on 0.0.0.0 port 22.
Feb 13 14:56:13 hoshimachi PackageKit[48522]: uid 1001 is trying to obtain org.freedesktop.packagekit.system-sources-refresh auth (only_trusted:0)
Feb 13 14:56:13 hoshimachi PackageKit[48522]: uid 1001 failed to obtain auth
Feb 13 23:48:58 hoshimachi polkitd[78330]: Operator of unix-session:Session1 FAILED to authenticate to gain authorization for action org.freedesktop.packagekit.clear-offline-update for system-bus-name::1.80 [<unknown>] (owned by unix-user:suisei)
Feb 13 23:48:58 hoshimachi PackageKit[79390]: uid 1001 is trying to obtain org.freedesktop.packagekit.system-sources-refresh auth (only_trusted:0)
Feb 13 23:48:58 hoshimachi polkitd[78330]: Operator of unix-session:Session1 FAILED to authenticate to gain authorization for action org.freedesktop.packagekit.system-sources-refresh for system-bus-name::1.80 [<unknown>] (owned by unix-user:suisei)
Feb 13 23:48:58 hoshimachi PackageKit[79390]: uid 1001 failed to obtain auth
Feb 13 23:49:00 hoshimachi polkitd[78330]: Operator of unix-session:Session1 FAILED to authenticate to gain authorization for action org.freedesktop.packagekit.clear-offline-update for system-bus-name::1.80 [<unknown>] (owned by unix-user:suisei)
Feb 13 23:49:03 hoshimachi syslogd: last message repeated 5 times
Feb 14 14:51:13 hoshimachi PackageKit[76709]: uid 1001 is trying to obtain org.freedesktop.packagekit.system-sources-refresh auth (only_trusted:0)
Feb 14 14:51:13 hoshimachi PackageKit[76709]: uid 1001 failed to obtain auth
Feb 14 18:10:30 hoshimachi PackageKit[87068]: uid 1001 is trying to obtain org.freedesktop.packagekit.system-sources-refresh auth (only_trusted:0)
Feb 14 18:10:30 hoshimachi polkitd[78330]: Operator of unix-session:Session1 FAILED to authenticate to gain authorization for action org.freedesktop.packagekit.clear-offline-update for system-bus-name::1.158 [<unknown>] (owned by unix-user:suisei)
Feb 14 18:10:30 hoshimachi polkitd[78330]: Operator of unix-session:Session1 FAILED to authenticate to gain authorization for action org.freedesktop.packagekit.system-sources-refresh for system-bus-name::1.158 [<unknown>] (owned by unix-user:suisei)
Feb 14 18:10:30 hoshimachi PackageKit[87068]: uid 1001 failed to obtain auth
Feb 14 18:10:33 hoshimachi polkitd[78330]: Operator of unix-session:Session1 FAILED to authenticate to gain authorization for action org.freedesktop.packagekit.clear-offline-update for system-bus-name::1.158 [<unknown>] (owned by unix-user:suisei)
Feb 14 18:10:36 hoshimachi syslogd: last message repeated 4 times
Feb 14 18:11:36 hoshimachi syslogd: last message repeated 1 times
Feb 14 20:40:11 hoshimachi su[32564]: suisei to root on /dev/pts/6`.split("\n");
  var interval: any;

  onMount(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const panel = searchParams.get("panel");
    console.log(panel);

    if (panel && tabOptions.includes(panel.toUpperCase()))
      activeTab = panel.toUpperCase();

    interval = setInterval(() => {
      if (messagesStack.length > 1000) messagesStack.shift();

      messagesStack.push(
        Math.random() > 0.7
          ? Math.random() > 0.5
            ? "}"
            : "ERR!"
          : backgroundLogText[
              Math.floor(Math.random() * backgroundLogText.length)
            ],
      );
    }, 350);
  });

  onDestroy(() => clearInterval(interval));
</script>

<svelte:head>
  <title>ANE Auth</title>
  <meta name="title" content="ANE Auth" />
  <meta
    name="description"
    content="ANE Authorization microservice for every website under ane.jp.net"
  />
</svelte:head>

<div
  class="min-h-screen bg-linear-to-br from-red-950 to-blue-900 flex flex-col overflow-hidden"
>
  <div
    class="h-screen max-h-screen flex flex-row items-center relative overflow-hidden"
  >
    <div class="absolute flex flex-row top-0 left-0 w-full z-20">
      <div
        class="px-4 bg-black/40 w-full text-white border-b-4 border-white/60 h-11"
      >
        {#each tabOptions as option}
          <button
            onclick={() => (activeTab = option)}
            class="font-kumbh mt-1 px-3 lg:px-8 lg:py-2 not-lg:py-1 lg:max-h-9 hover:bg-white/20 pb-1 {activeTab ==
            option
              ? 'text-black bg-linear-0 from-white/60 to-white rounded-t-lg not-md:hiddenff'
              : ''}">{option}</button
          >
        {/each}
      </div>
      <div
        class="h-11 w-30 not-lg:hidden"
        style="background: linear-gradient(162deg, rgba(0, 0, 0, 0.40) 0%, rgba(0, 0, 0, 0.40) 58.5%, rgba(255, 255, 255, 0.60) 58.5%, rgba(255, 255, 255, 0.60) 64%, rgba(0, 0, 0, 0) 65%);"
      ></div>
      <div
        class="flex flex-row w-2/4 bg-black/40 h-5 border-b-4 border-white/60 not-lg:hidden"
      ></div>
    </div>

    <div
      class="flex flex-col absolute z-0 text-white/50 px-4 bottom-4 left-4 text-left blur-xs text-sm select-none"
    >
      {#each messagesStack as message}
        <p transition:slide>{message}</p>
      {/each}
    </div>

    <div class="w-full grow flex flex-col m-8 z-10 text-indigo-200 font-mplus2">
      {#if activeTab == "SYSTEM"}
        <div transition:blur class="">
          <div class="text-8xl font-kumbh text-white">Auth</div>
          <p class="text-lg lg:text-2xl">
            The authorization microservice of Miyuki Studio / ANE
          </p>
          {#if account}
            <a
              href="/home/settings"
              class="text-2xl text-blue-400 underline hover:cursor-pointer"
              >Account Settings</a
            >
          {:else}
            <a
              href="/sign"
              class="text-2xl text-blue-400 underline hover:cursor-pointer"
              >Sign in</a
            >
          {/if}
        </div>
      {:else if activeTab == "HANDBOOK"}
        <Handbook />
      {:else if activeTab == "ACCOUNT"}
        <AccountSettings />
      {/if}
    </div>
    <img
      src="/favicon.webp"
      alt=""
      style="-webkit-user-drag: none; animation: spin 320s infinite linear;"
      class="select-none not-lg:top-2/4 not-lg:w-[120vh] not-lg:-right-1/4
      absolute lg:top-1/6 lg:-right-1/4 rotate-45 lg:w-5/6 grayscale opacity-20 brightness-200"
    />
  </div>
</div>

<style>
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
