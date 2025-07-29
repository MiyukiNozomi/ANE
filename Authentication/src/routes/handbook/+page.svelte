<script lang="ts">
    import type { PageData } from "./$types";
    let { data }: { data: PageData } = $props();

    const endpoints = [
        {
            pathname: "/api/authorizations/new",
            description:
                "Creates a new Authorization Request and returns the authorization token used by the user. The realm is the name of the application.",
            inputParams: {
                sharedSecret: "String(min 16, max 256)",
                realm: "String(min 3, max 128)",
            },
            outputParams: {
                "request-code": "String",
            },
        },

        {
            pathname: "/api/authorizations/get-status",
            description:
                "Returns the status of a requested authorization by either the authorization request code, or by the shared secret.\nPlease note it will *NOT* return the session token if requested by the authorization request code.",
            inputParams: {
                sharedSecret: "String(min 16, max 256) | undefined",
                authRequestCode: "String | undefined",
            },
            outputParams: {
                reqCode: "String",
                realm: "String",
                createdAt: "Int (Unix Time)",
                session: "String",
                sessionStatus: "String",
            },
            onError: {
                error: "EXPIRED_OR_MISSING_AUTHORIZATION_REQUEST",
            },
        },

        {
            isProtected: true,
            pathname: "/api/signed/me",
            description:
                "Creates a new Authorization Request and returns the authorization token used by the user. The realm is the name of the application.",
            inputParams: undefined,
            outputParams: {
                id: "Int",
                displayName: "String",
                name: "String",
                createdAt: "Int (Unix Time)",
            },
        },
    ];
</script>

<div class="min-h-screen bg-gray-900 relative pb-2">
    <div
        class="w-full flex flex-col md:flex-row items-center bg-[#00000050] gap-8 z-40"
    >
        <div
            class="w-full h-24 md:w-fit md:border-r-white border-solid border-r-1 bg-black p-16 md:pr-8 py-4"
        >
            <a href="/">
                <img
                    src="https://galatea.ane.jp.net/dl/images/logos/miyuki-studio.webp"
                    alt=""
                    class="h-full m-auto"
                /></a
            >
        </div>
        <h1
            class="font-kumbh hidden md:block text-white text-4xl font-extralight"
        >
            Authorization Handbook
        </h1>
    </div>

    <div
        class="text-gray-200 font-kumbh text-xl p-6 m-4 bg-slate-800 rounded-lg gap-2 flex flex-col"
    >
        <h1 class="font-semibold text-4xl text-white" id="intro">
            Basics of this Subsystem
        </h1>
        <h2 class="font-semibold text-2xl text-gray-100" id="response-codes">
            HTTP Response Codes
        </h2>
        <p>
            The API will reply with the HTTP response code 200 even with errors
            related to the actual processing of a request; other API response
            codes such as 4xx indicate either missing JSON fields or incorrect
            JSON field types.
        </p>
        <p>
            Stumbling upon any 5xx error code indicates a Bug. Please report
            such occurrences with the payload and endpoint URL to the email <a
                class="text-red-500 underline"
                href="mailto:miyuki@ane.jp.net">miyuki@ane.jp.net</a
            >
        </p>
        <h2 class="font-semibold text-2xl text-gray-100" id="rate-limit">
            Rate limiting
        </h2>
        <p>
            You may not perform more than 500 requests a minute.
            <br />
            Side note, the Anemachi (yes, that's what ANE stands for, really I have
            a lack of creativity.) reverse proxy keeps track of IPs in a blacklist,
            if you do end up doing more than 500 requests (no matter the realm, if
            it's galatea.ane.jp.net or even ane.jp.net itself) it will refuse any
            future requests with a <span class="italic">payload-less</span> 429
            HTTP(s) response.
            <br />
            The same applies for multiple request failures, if you get more than
            20 4xx response codes it will also blacklist your IP address.
        </p>
        <h2 class="font-semibold text-2xl text-gray-100" id="ip-blacklist">
            What does it mean to have my IP be blacklisted?
        </h2>
        <p>
            Your requests will be ignored for an hour and will always receive a
            429 response code.
        </p>
        <h1
            class="font-semibold text-4xl text-white"
            id="sessions-and-authorizations"
        >
            Sessions and Authorizations
        </h1>
        <h2
            class="font-semibold text-2xl text-gray-100"
            id="understanding-sessions"
        >
            The Root Session
        </h2>
        <p>
            When you sign in through the Authentication Page, you're secretly
            given a long hex string like this one:
        </p>
        <div class="p-4 py-2 bg-slate-900 text-center rounded-lg">
            <p>
                fabfa533d4f54a13b091e8ac4edb7934b8de749163f0461ab5d2d573cae79f76
            </p>
        </div>
        <p>
            This "Root Key" is really, really important, it essentially holds
            the permission to change anything of your profile.
            <br />
            So let's say you want to log into a Chat application of some sort, you
            definitely don't want the application to have the permission to potentially
            re-setup 2FA without your consent.
        </p>
        <p>
            <strong><i> Technical note</i></strong>: This key lasts for 2 days,
            Regarding the authorization keys, they only last for a day. if you
            end up needing your root key, you can hit the 'Get Root Key' button
            inside of your account security page to get it.
        </p>
        <h2
            class="font-semibold text-2xl text-gray-100"
            id="understanding-authorizations"
        >
            Understanding Authorizations
        </h2>
        <p>
            To summarize, the application requests to have a user identity given
            by sharing a secret with the server.
            <br />
            The server provides a short-lived authorization code that the user receives
            and either agrees or ignores.
            <br />
            The application is then given a "Authorization Session", it's basically
            given a long hex number that has no permission to mutate anything.
        </p>
        <p>
            Now, all the application can do is use your profile to know what is
            yours and what isn't. No funny business.
        </p>
        <h1
            class="font-semibold text-4xl text-white"
            id="sessions-and-authorizations"
        >
            In Practice
        </h1>
        <h2
            class="font-semibold text-2xl text-gray-100"
            id="understanding-sessions"
        >
            Relevant Endpoints
        </h2>
        <p>
            Blue pathnames (and without the 'X') do not require authentication.
            token (see the Sessions and Authorizations section.)
        </p>
        <div class="flex flex-col gap-4">
            {#each endpoints as ed}
                <div
                    class="flex flex-col px-2 py-1 {ed.isProtected
                        ? 'border-l-red-700'
                        : 'border-l-blue-700'} border-solid border-l-4 gap-2"
                >
                    <div class="gap-0 w-fit flex flex-row">
                        <p
                            class="rounded-l-md {ed.isProtected
                                ? 'bg-red-900'
                                : 'bg-blue-900'} p-2"
                        >
                            POST
                        </p>
                        <p
                            class="rounded-r-md {ed.isProtected
                                ? 'bg-red-600'
                                : 'bg-blue-600'} p-2"
                        >
                            {ed.isProtected ? "[X]" : ""}
                            {ed.pathname}
                        </p>
                    </div>
                    <p>{ed.description}</p>
                    {#if ed.inputParams}
                        <h3 class="font-bold">Request Payload Type</h3>
                        <div
                            class="p-4 py-2 bg-slate-900 w-fit rounded-lg text-sm"
                        >
                            <pre>{JSON.stringify(ed.inputParams, null, 3)}</pre>
                        </div>
                    {/if}
                    <h3 class="font-bold">Response Payload Type</h3>
                    <div class="p-4 py-2 bg-slate-900 w-fit rounded-lg text-sm">
                        <pre>{JSON.stringify(ed.outputParams, null, 3)}</pre>
                    </div>
                    {#if ed.onError}
                        <h3 class="font-bold">
                            Response Payload Type (On error)
                        </h3>
                        <div
                            class="p-4 py-2 bg-slate-900 w-fit rounded-lg text-sm"
                        >
                            <pre>{JSON.stringify(ed.onError, null, 3)}</pre>
                        </div>
                    {/if}
                </div>
            {/each}
        </div>

        <h2
            class="font-semibold text-2xl text-gray-100"
            id="understanding-sessions"
        >
            An Example
        </h2>
        <p>
            Let's say our app named 'MSN Clone' generated a secret, named
            'banana'... <strong
                ><i
                    >(To be fair, you should use an UUID or something with a
                    decent level of entropy as a secret, but for the sake of
                    simplicity I will use a word)</i
                ></strong
            >
            <br />
            The next step is to inform the server of our intentions through the '/api/authorizations/new'
            endpoint.
            <br />On success, the server will give us a 'request-code', this is
            what we will give to the user in a URL of the following format:
        </p>
        <div class="p-4 py-2 bg-slate-900 text-center rounded-lg">
            <p>https://auth.ane.jp.net/sign/authorize/[request-code]</p>
        </div>
        <p>
            And now we wait!.. by requesting /api/authorizations/get-status
            every 2s using our shared secret until it either tells us the
            request expired, or the user authorized it.
        </p>
        <p>
            And that's it! you can now request /api/signed/me using the given
            session token!
        </p>
        <p>
            You can now either use the ID field or the Name field as those are
            immutable when linking data together.
        </p>
    </div>
</div>
