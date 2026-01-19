<script>
  import { blur } from "svelte/transition";
</script>

<div transition:blur class="py-8 pt-12">
  <div class="gap-2 flex flex-col font-mplus2 text-md overflow-auto">
    <!-- <div class="text-8xl font-kumbh text-white">Handbook</div>
    <div class="text-4xl font-kumbh text-white">Authorization Flow</div>

    <ul class="list-disc ml-8">
      <li>Third party creates an authorization request;</li>
      <li>
        Third party gives the user the authorization URL given by the
        microservice;
      </li>
      <li>
        If the user approves, the third party's next pull of the authorization
        status will return a session token.
      </li>
      <li>
        If the user refuses or the URL expires, the authorization request is
        dropped.
      </li>
    </ul>
    <p>
      The given session token is <strong>read only</strong>. You cannot modify
      user information nor change security info.
    </p>

    <div class="text-4xl font-kumbh text-white">Endpoint abstraction layer</div>
    <p>
      There is internally a three TypeScript file library containing all public
      API functions at <a
        class="underline text-blue-300"
        href="https://git.ane.jp.net/u/miyuki/projects/ANE/fs/Authentication/src/lib/client/API?branch=master"
        >Compass</a
      >.
    </p>
    <p>
      <strong
        >It also has additional details on it, this handbook is mostly a very
        shallow look into how this ecosystem works.
      </strong>
    </p>
    <p class="text-red-600">
      <strong>WARNING</strong>: At the reverse proxy level, any attempts to
      access the Auth Service through plain HTTP will lead to a 403 Forbidden.
      <strong>never ever send credentials over unencrypted HTTP.</strong>
    </p>-->
    <div class="text-4xl font-bold overflow-hidden">ACCESS DENIED</div>
  </div>
</div>
