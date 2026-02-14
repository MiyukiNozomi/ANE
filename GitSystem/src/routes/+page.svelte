<script lang="ts">
  import Footer from "$lib/components/footer.svelte";
  import Header from "$lib/components/header.svelte";
  import SplitPanel from "$lib/components/stellar/splitPanel.svelte";
  import { onMount } from "svelte";
  import type { PageProps } from "./$types";
  import Compass from "$lib/components/compass/compass.svelte";

  let data: PageProps = $props();

  let backgroundImage: HTMLImageElement;
  let foregroundImage: HTMLImageElement;

  onMount(() => {
    backgroundImage = new Image();
    foregroundImage = new Image();

    backgroundImage.src =
      "https://galatea.ane.jp.net/dl/images/backgrounds/compass/compass-static.webp";
    foregroundImage.src =
      "https://galatea.ane.jp.net/dl/images/backgrounds/compass/compass-main.webp";
  });

  export function gitAge(d: Date): string {
    const s = Math.floor((Date.now() - d.getTime()) / 1000);
    const v = (n: number, u: string) =>
      (n === 1 ? `${n} ${u}` : `${n} ${u}s`) + " ago";

    if (s < 60) return "just now";
    if (s < 3600) return v(Math.floor(s / 60), "minute");
    if (s < 86400) return v(Math.floor(s / 3600), "hour");
    if (s < 604800) return v(Math.floor(s / 86400), "day");
    if (s < 2592000) return v(Math.floor(s / 604800), "week");
    if (s < 31536000) return v(Math.floor(s / 2592000), "month");

    return v(Math.floor(s / 31536000), "year") + " ago";
  }
</script>

<svelte:head>
  <title>Projects</title>
  <meta name="title" content="Projects" />
  <meta
    name="description"
    content="The location of every public project I (miyuki) worked on :)"
  />
</svelte:head>

<div
  class="font-mplus2 min-h-screen bg-index-bg text-white flex flex-col overflow-y-scroll no-scrollbar"
>
  <div class="relative flex flex-col h-[93vh] z-20">
    <Header />
    <Compass />
  </div>

  <div class="flex flex-col gap-8 bg-black pb-8">
    <SplitPanel label="ABOUT">
      <h1 class="font-baskervville text-orange-200">
        The homepage of hopes and dreams
      </h1>
      <p class="font-kumbh text-sm">
        Welcome to Miyuki's online git repository, a compass into the crazy
        ideas I've written and maintain.
        <br />
        For a long time, I have no longer seen my projects as just software, I see
        them as an artistic medium.
        <br />
        The word "impossible" in my head has no meaning until I can see with my own
        eyes that said idea cannot be executed in reality.
      </p>
    </SplitPanel>
    <SplitPanel label="PROJECTS" extraContainerClasses={"gap-4"}>
      <h1 class="font-baskervville text-orange-200">Current active projects</h1>
      {#each data.data.latestProjects as project}
        <a
          href="/u/{project.authorUsername}/projects/{project.name}"
          class="cursor-pointer text-start flex flex-row gap-4 group items-center group hover:bg-orange-400/20 px-2 w-full"
        >
          <div class="self-start w-2 flex flex-row text-orange-200 gap-2 grow">
            <h2 class="mx-auto no-underline">⯌</h2>
            <p
              class="flex flex-col group-hover:text-md group-hover:text-orange-200 w-full grow"
            >
              <span class="group-hover:underline">{project.name}</span>
              <span class="text-white font-kumbh text-md no-underline">
                {project.description}
              </span>
            </p>
          </div>
        </a>
      {/each}
    </SplitPanel>
    <SplitPanel label="UPDATES" extraContainerClasses={"gap-4"}>
      <h1 class="font-baskervville text-orange-200">List of recent changes</h1>
      {#each data.data.newestCommits as commit}
        <div
          class="text-start flex flex-row gap-4 group items-center cursor-default group hover:bg-orange-400/20 px-2"
        >
          <div class="self-start w-2 flex flex-row text-orange-200">
            <h2 class="mx-auto">⯌</h2>
          </div>
          <p
            class="flex flex-col group-hover:text-md group-hover:text-orange-200 grow"
          >
            <span class="font-baskervville italic text-orange-100"
              >{commit.message}</span
            >
            <span class="flex flex-row gap-2 items-center">
              <a
                href="/u/{commit.project.authorUsername}/projects/{commit
                  .project.name}"
                class="font-kumbh hover:underline"
              >
                Commit on [{commit.project.authorUsername} / {commit.project
                  .name}]
              </a>
              <a
                href="/u/{commit.author}"
                class="font-kumbh text-xs hover:underline"
              >
                by
                {commit.author}
                <span class="text-orange-200 opacity-60"
                  >&lt;{commit.authorEmail}&gt;</span
                ></a
              >
            </span>
          </p>

          <div class="ml-auto w-fit flex-col flex">
            <p class="font-mplus2 text-xs">
              {new Date(commit.date).toDateString()}
            </p>
            <p class="font-baskervville text-xs text-orange-200/80">
              {gitAge(new Date(commit.date))}
            </p>
          </div>
        </div>
      {/each}
    </SplitPanel>
  </div>

  <Footer />
</div>
