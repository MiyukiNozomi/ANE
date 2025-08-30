<script lang="ts">
  import {
    REPOSITORY_DESCRIPTION_MAX,
    REPOSITORY_NAME_MAX,
    REPOSITORY_NAME_MIN,
  } from "$lib/shared/constants";
  import PopupBase from "../stellar/popupBase.svelte";
  import StellarButton from "../stellar/stellarButton.svelte";
  import StellarInput from "../stellar/stellarInput.svelte";

  let base: PopupBase;
  export function setVisible(b: boolean) {
    base.setVisible(b);
  }

  let repoName = $state("");
  let repoDesc = $state("");
</script>

<PopupBase title="New Repository" bind:this={base}>
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

  <div class="flex flex-row">
    <StellarButton label="CREATE" onclick={() => {}} />
  </div>
</PopupBase>
