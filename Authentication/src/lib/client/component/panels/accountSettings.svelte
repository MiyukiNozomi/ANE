<script lang="ts">
    import { blur, fade, slide } from "svelte/transition";
    import { getAccountInfo, invalidateSession } from "../../API/client";
    import DisplayNameSettings from "../settings/displayNameSettings/displayNameSettings.svelte";
    import { tick } from "svelte";
    import BasicInformationWindow from "$lib/client/component/settings/basicInformationWindow.svelte";

    const account = getAccountInfo();

    const Options = [
        {
            title: "Basic Information",
            icon: "https://galatea.ane.jp.net/dl/images/default-profile.webp",
            component: BasicInformationWindow,
        },
        {
            title: "Legacy Settings (if you are having problems)",
            icon: "https://galatea.ane.jp.net/dl/images/default-profile.webp",
            component: undefined,
            onClose: () => (window.location.pathname = "/home/settings"),
        },
        {
            title: "Sign Out",
            icon: "https://galatea.ane.jp.net/dl/images/default-profile.webp",
            component: undefined,
            onClose: () =>
                invalidateSession().then((v) => (window.location.href = "/")),
        },
    ] as const;
    let openWindows: string[] = $state([]);
</script>

<div transition:blur>
    <div class="p-8 flex flex-col flex-wrap items-start gap-4 h-screen py-22">
        {#each Options as option}
            <button
                onclick={() => {
                    if (!openWindows.includes(option.title)) {
                        if ("onClose" in option) option.onClose();
                        openWindows.push(option.title);
                    }
                }}
                class="flex flex-col items-center font-mplus2 opacity-70 hover:opacity-100 hover:bg-white/10 hover:bg-blur-4xl rounded-lg p-1
                cursor-pointer select-none w-32 min-h-32"
            >
                <img src={option.icon} alt="" class="h-24 w-24 p-4" />
                <p class="text-white text-sm">{option.title}</p>
            </button>
        {/each}
    </div>

    {#each Options as option}
        {#if openWindows.includes(option.title)}
            <div transition:blur class="h-full">
                {#if option.component}
                    <option.component {openWindows} />
                {/if}
            </div>
        {/if}
    {/each}
</div>
