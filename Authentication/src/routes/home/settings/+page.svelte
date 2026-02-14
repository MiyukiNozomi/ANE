<script lang="ts">
  import DisplayNameSettings from "$lib/client/component/settings/displayNameSettings/displayNameSettings.svelte";
  import ProfilePictureSettings from "$lib/client/component/settings/profilePictureSettings/profilePictureSettings.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<svelte:head>
  <title>Account Settings</title>
  <meta name="title" content="Account Settings" />
  <meta name="description" content="Protected Resource." />
</svelte:head>

<div class="flex flex-col min-h-screen bg-gray-950">
  <div
    class="flex flex-row bg-linear-to-br px-4 py-2 from-blue-600 to-gray-950 text-white font-kumbh text-xl"
  >
    Account Settings
  </div>
  <div class="flex flex-col gap-4 p-8">
    <h1 class="font-kumbh text-white flex flex-col">
      <span class="text-xl font-bold">
        Hi, this is the legacy account settings screen.</span
      >
      <span>
        You are still in ane.jp.net, it just happens that the floating windows
        design has a few.. responsiveness problems that would require it to just
        be like the old account settings screen, hence why you might have been
        automatically redirected here.</span
      >
    </h1>
    <a
      class="bg-linear-240 text-white hover:from-blue-700 hover:to-blue-300 from-blue-600 to-blue-950 w-fit px-4 py-2 rounded-md"
      href="/">Go Back</a
    >
    <ProfilePictureSettings></ProfilePictureSettings>
    <DisplayNameSettings></DisplayNameSettings>
  </div>
</div>
