<script lang="ts">
    import type { PageData } from "./$types";
</script>

<div class="min-h-screen bg-gray-900 relative">
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
        class="text-gray-200 font-kumbh text-xl p-6 m-4 bg-slate-800 gap-2 flex flex-col"
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
            such occurances with the payload and endpoint URL to the email <a
                class="text-blue-500 underline"
                href="mailto:miyuki@ane.jp.net">miyuki@ane.jp.net</a
            >
        </p>
        <h2 class="font-semibold text-2xl text-gray-100" id="rate-limit">
            On Rate limiting
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
    </div>
</div>
