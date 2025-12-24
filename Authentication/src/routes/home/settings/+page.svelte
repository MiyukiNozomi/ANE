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
  <div class="flex flex-col gap-4">
    <ProfilePictureSettings></ProfilePictureSettings>
    <DisplayNameSettings></DisplayNameSettings>
  </div>
</div>
