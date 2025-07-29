<script lang="ts">
    import { getAccountInfo, invalidateSession } from "$lib/client-api";
    import type { PageData } from "./$types";

    const accountInfo = getAccountInfo();
</script>

<div class="min-h-screen bg-gray-900 relative">
    <div
        class="absolute w-full flex flex-col md:flex-row items-center bg-[#00000050] md:gap-8 z-40"
    >
        <div
            class="w-full h-24 md:w-fit md:border-r-white border-solid border-r-1 bg-black p-16 md:pr-8 py-4"
        >
            <img
                src="https://galatea.ane.jp.net/dl/images/logos/miyuki-studio.webp"
                alt=""
                class="h-full m-auto"
            />
        </div>
        <h1
            class="font-kumbh hidden md:block text-white text-4xl font-extralight"
        >
            Authorization
        </h1>
        <div
            class="md:ml-auto py-4 px-8 md:py-0 flex flex-row gap-4 text-white font-kumbh underline text-2xl"
        >
            {#if !accountInfo}
                <a
                    href="/sign?redir=/"
                    onclick={async () => {
                        await invalidateSession();
                    }}>Sign In</a
                >
            {:else}
                <a href="/home/settings">Account</a>
            {/if}
            <a href="/handbook">Handbook</a>
        </div>
    </div>
    <div
        class="absolute top-20 text-center md:text-start w-full md:m-0 z-20 pt-40 md:p-18 md:px-32 flex flex-col gap-2"
    >
        <p class="font-kumbh text-4xl md:text-6xl text-white">
            ANE Account &<br />
            Authorization System
        </p>
        <p class="font-kumbh text-1xl md:text-2xl font-light text-white">
            The Authorization system of *.ane.jp.net
        </p>
    </div>
    <!-- The orange lines -->
    <div
        class="absolute left-40 -top-40 w-24 -rotate-45 h-screen flex flex-col items-end z-10"
    >
        <div class="w-8/12 h-full" style="background-color: #128AE0;"></div>
        <div
            class="w-16 h-24"
            style="background: linear-gradient(-225deg,rgba(18, 138, 224, 1) 0%, rgba(18, 138, 224, 1) 44%, rgba(0, 0, 0, 0) 44%, rgba(0, 0, 0, 0) 100%)"
        ></div>
    </div>
    <div
        class="absolute left-12 -top-10 w-24 -rotate-45 h-screen flex flex-col items-end z-10"
    >
        <div class="w-8/12 h-full" style="background-color: #128AE0;"></div>
        <div
            class="w-16 h-24"
            style="background: linear-gradient(-225deg,rgba(18, 138, 224, 1) 0%, rgba(18, 138, 224, 1) 44%, rgba(0, 0, 0, 0) 44%, rgba(0, 0, 0, 0) 100%)"
        ></div>
    </div>
    <!-- The actual page content -->
    <div class="absolute bottom-2 w-full">
        <p class="font-kumbh text-2xl text-white text-center">
            <span aria-hidden="true">&downarrow;</span> Scroll down for details
            <span aria-hidden="true">&downarrow;</span>
        </p>
    </div>
    <div
        class="font-kumbh text-lg font-light absolute top-[100vh] w-full px-10 p-12 text-gray-300 bg-zinc-900 flex flex-col gap-4"
    >
        <div class="">
            <h1 class="text-3xl font-extralight italic text-gray-50">
                <span aria-hidden="true">&RightArrow;</span> How does it work?
            </h1>
            <p>
                Similar to how the Microsoft System works (At least
                superficially), in a nutshell:
            </p>
            <ol class="list-decimal px-6 text-sm">
                <li>
                    Microservice requests a custom authentication URL with its
                    own secret
                </li>
                <li>User opens said custom authorization URL</li>
                <li>
                    Microservice checks every 2 seconds or so regarding the
                    status of its secret
                </li>
                <li>
                    If user agrees to giving account access to said
                    microservice, the service gains an authentication token
                </li>
                <li>Otherwise, the secret is deleted.</li>
                <li>
                    If the user never opens the authentication URL after 2
                    minutes, or if the user never confirms or denies the
                    request, the system automatically denies the secret.
                </li>
            </ol>
        </div>
        <div class="">
            <h1 class="text-3xl font-extralight italic text-gray-50">
                <span aria-hidden="true">&RightArrow;</span> How secure is this monstrosity?
            </h1>
            <p>
                I would rate security on this a 7/10, there's probably something
                here that I missed, but you don't need to worry about your data
                being lost, as the database is managed by a separate
                microservice that is not accessible from the public.
            </p>
            <p>
                Also, passwords are hashed using <a
                    href="https://en.wikipedia.org/wiki/Argon2"
                    class="text-blue-500 underline">Argon2</a
                >, the database is SQLite3 but I ensured nothing suspicious will
                ever get to it unsanitized.
            </p>
            <p>
                But overall, don't fear any evil. I've had a database leak in
                the past and I have not forgotten such trauma.
            </p>
        </div>
        <div class="">
            <h1 class="text-3xl font-extralight italic text-gray-50">
                <span aria-hidden="true">&RightArrow;</span> Why does this page exist?
            </h1>
            <p>
                I needed something to put in the root path of this microservice.
            </p>
        </div>

        <div
            class="font-kumbh flex flex-col md:flex-row p-4 gap-8 items-center"
        >
            <img
                src="https://galatea.ane.jp.net/dl/images/logos/ane-logo-final.webp"
                class="w-42"
                alt=""
            />
            <div class="ml-auto flex flex-col text-center md:text-start">
                <h1 class="text-2xl">Miyuki Nozomi</h1>
                <p>
                    <span class="font-bold">Contact Email</span> miyuki@ane.jp.net
                </p>
                <p>
                    <span class="font-bold">Address</span>
                    Shimotoba Nishiserikawacho, Fushimi Ward, Kyoto, 612-8394, Japan
                </p>
            </div>
        </div>
    </div>
</div>
