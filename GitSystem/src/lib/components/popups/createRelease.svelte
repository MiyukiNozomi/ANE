<script lang="ts">
  import { getAccountInfo, invokeAPI } from "$lib/ANEAuthAPI/client";
  import {
    REPOSITORY_DESCRIPTION_MAX,
    GIT_OBJECT_NAME_MAX,
  } from "$lib/shared/constants";
  import { marked } from "marked";
  import PopupBase from "../stellar/popupBase.svelte";
  import StellarInput from "../stellar/stellarInput.svelte";
  import type { Project } from "$lib/server/db";

  let props: { project: Project } = $props();

  const accountInfo = getAccountInfo();

  let base: PopupBase;

  export function setVisible(b: boolean) {
    base.setVisible(b);
  }

  let markdownText = $state("");
  let files: FileList | null | undefined = $state(null);

  async function createRepository() {
    base.setError("");

    const formData = new FormData();
    formData.set("markdownDesc", markdownText);

    if (!files || files.length == 0) {
      if (!window.prompt("Are you sure to create a release with no builds?")) {
        return;
      }
    } else {
      for (const file of files) {
        formData.append("artifacts[]", file);
      }
    }

    const res = await invokeAPI(
      `projects/${props.project.authorUsername}/${props.project.name}/releases/create`,
      formData,
      "PUT",
    );

    if (!res || res.error) {
      return base.setError(
        res?.error ?? "Failed to contact API, try again later.",
      );
    }

    window.location.reload();
  }
</script>

<PopupBase
  title="New Release"
  bind:this={base}
  buttons={{
    CREATE: createRepository,
    CANCEL: () => setVisible(false),
  }}
>
  <div class="flex not-lg:flex-col flex-row gap-4 items-start">
    <StellarInput
      bind:text={markdownText}
      type={"textarea"}
      placeholder={"Markdown Description"}
      maxlength={GIT_OBJECT_NAME_MAX}
      isMultiline={false}
    />
    <div class="flex flex-col gap-8 items-start min-h-90 lg:min-w-90">
      <h1 class="font-baskervville text-orange-200 text-xl">Notes Preview</h1>

      <div id="markdown-ctn" class="overflow-auto">
        {@html marked(markdownText)}
      </div>
    </div>
  </div>
  <input accept="*" type="file" multiple bind:files />
</PopupBase>
