<script lang="ts">
  import { getAccountInfo, invokeAPI } from "$lib/ANEAuthAPI/client";
  import { type GitAPIResponse } from "$lib/server/api/types";
  import {
    REPOSITORY_DESCRIPTION_MAX,
    GIT_OBJECT_NAME_MAX,
  } from "$lib/shared/constants";
  import PopupBase from "../stellar/popupBase.svelte";
  import StellarInput from "../stellar/stellarInput.svelte";

  const accountInfo = getAccountInfo();

  let base: PopupBase;

  export function setVisible(b: boolean) {
    base.setVisible(b);
  }

  let repoName = $state("");
  let repoDesc = $state("");

  async function createRepository() {
    base.setError("");
    const res = await invokeAPI<GitAPIResponse<boolean>>(
      "restricted/create/repository",
      {
        name: repoName,
        description: repoDesc,
      },
    );

    if (!res || res.error) {
      return base.setError(
        res?.error ?? "Failed to contact API, try again later.",
      );
    }

    window.location.href = `/u/${accountInfo!.name}/projects/${repoName}`;
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
    maxlength={GIT_OBJECT_NAME_MAX}
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
