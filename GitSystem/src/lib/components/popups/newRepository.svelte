<script lang="ts">
  import { invokeAPI } from "$lib/client-account";
  import {
    REPOSITORY_DESCRIPTION_MAX,
    REPOSITORY_NAME_MAX,
    REPOSITORY_NAME_MIN,
  } from "$lib/shared/constants";
  import { boolean } from "zod";
  import PopupBase from "../stellar/popupBase.svelte";
  import StellarButton from "../stellar/stellarButton.svelte";
  import StellarInput from "../stellar/stellarInput.svelte";

  let base: PopupBase;

  export function setVisible(b: boolean) {
    base.setVisible(b);
  }

  let repoName = $state("");
  let repoDesc = $state("");

  async function createRepository() {
    base.setError("");
    const res = await invokeAPI("restricted/create/repository", {
      name: repoName,
      description: repoDesc,
    });

    if (!res || !res.ok) {
      return base.setError(
        res?.message ?? "Failed to contact API, try again later."
      );
    }
  }
</script>

<PopupBase
  title="New Repository"
  bind:this={base}
  buttons={{
    CREATE: createRepository,
    CANCEL: () => setVisible(false),
  }}
>
  <StellarInput
    bind:text={repoName}
    type={"text"}
    placeholder={"Repository Name"}
    maxlength={REPOSITORY_NAME_MAX}
    isMultiline={false}
  />
  <StellarInput
    bind:text={repoDesc}
    type={"text"}
    placeholder={"Repository Description"}
    maxlength={REPOSITORY_DESCRIPTION_MAX}
    isMultiline={true}
  />
</PopupBase>
