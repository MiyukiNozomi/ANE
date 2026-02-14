<script lang="ts">
    import { browser } from "$app/environment";
    import OverlayWindow from "../overlayWindow.svelte";
    import DisplayNameSettings from "./displayNameSettings/displayNameSettings.svelte";
    import ProfilePictureSettings from "./profilePictureSettings/profilePictureSettings.svelte";

    let props: { openWindows: string[] } = $props();

    let isMobile = browser && window.innerWidth < window.innerHeight;
</script>

<OverlayWindow
    title="Basic Information"
    isPopup={false}
    initialWidth={isMobile ? window.innerWidth - 8 : window.innerWidth / 2}
    initialHeight={isMobile ? window.innerWidth : window.innerHeight * 0.8}
    onClosing={() =>
        props.openWindows.splice(
            props.openWindows.indexOf("Basic Information"),
        )}
>
    <DisplayNameSettings></DisplayNameSettings>
    <ProfilePictureSettings></ProfilePictureSettings>
</OverlayWindow>
