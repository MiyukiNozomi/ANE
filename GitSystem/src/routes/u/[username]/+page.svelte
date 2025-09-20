<script lang="ts">
  import {
    getAccountInfo,
    invalidateSession,
  } from "$lib/client/client-account";
  import PageBody from "$lib/components/pageBody.svelte";
  import NewRepository from "$lib/components/popups/newRepository.svelte";
  import StellarButton from "$lib/components/stellar/stellarButton.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();

  const accountInfo = getAccountInfo();

  let newRepositoryPopup: NewRepository;
</script>

<NewRepository bind:this={newRepositoryPopup} />

<svelte:head>
  <title>{data.profile.displayName}'s Profile</title>
</svelte:head>

<PageBody>
  <div class="flex flex-row text-center md:text-start relative pt-0 p-6 gap-6">
    <!-- Profile Banner -->
    <div class="clip-notch-tl-br flex flex-col bg-black">
      <div class="clip-notch-tl-br p-[1px] bg-orange-200 w-64">
        <div
          class="clip-notch-tl-br p-4 bg-black flex flex-col items-center gap-2"
        >
          <img
            class="rounded-full"
            src="https://auth.ane.jp.net/home/u/{data.profile.name}/picture"
            alt=""
          />
          <p class="font-baskervville italic text-xl">
            {data.profile.displayName ?? data.profile.name}
          </p>
          <a
            class="font-mplus2 text-sm text-orange-100 hover:underline"
            href="https://auth.ane.jp.net/home/u/{data.profile.name}"
            >{data.profile.name}@ane.jp.net</a
          >
        </div>
      </div>
      {#if accountInfo?.name == data.profile.name}
        <div class="flex flex-col w-full items-center p-4 gap-4">
          {#if accountInfo.isAdmin || accountInfo.isDonator}
            <StellarButton
              onclick={() => newRepositoryPopup.setVisible(true)}
              label={"New Project"}
            />
          {/if}
          <StellarButton onclick={invalidateSession} label={"Sign Out"} />
        </div>
      {/if}
    </div>
    <!-- Projects -->
    <div class="flex flex-col p-4 gap-4 w-full">
      {#if data.projects.length > 0}
        <h1 class="font-baskervville text-4xl text-orange-300">Projects</h1>
        <div class="flex flex-col gap-6">
          {#each data.projects as project}
            <div class="clip-notch-tr p-[1px] bg-orange-300 text-orange-300">
              <div class="flex flex-row bg-black clip-notch-tr p-4 px-4">
                <a
                  href="/u/{project.authorUsername}/projects/{project.name}"
                  class="flex flex-col group"
                >
                  <span
                    class="font-baskervville text-xl italic group-hover:underline"
                    >{project.displayName ?? project.name}</span
                  >
                  <span class="font-mplus text-white"
                    >{project.description}</span
                  >
                </a>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-orange-200 font-baskervville text-2xl">
          {data.profile.displayName ?? data.profile.name} does not own any projects.
        </p>
      {/if}
      <!-- Contributions -->
      {#if data.involvedProjects.length > 0}
        <h1 class="font-baskervville text-4xl text-suisei-300">
          Projects with Contributions
        </h1>
        <div class="flex flex-col gap-6">
          {#each data.involvedProjects as project}
            <div class="clip-notch-tr p-[1px] bg-suisei-300 text-suisei-300">
              <div class="flex flex-row bg-black clip-notch-tr p-4 px-4">
                <a
                  href="/u/{project.authorUsername}/projects/{project.name}"
                  class="flex flex-col group"
                >
                  <span
                    class="font-baskervville text-xl italic group-hover:underline"
                    >{project.displayName ?? project.name}</span
                  >
                  <span class="font-mplus text-white"
                    >{project.description}</span
                  >
                </a>
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class="text-suisei-200 font-baskervville text-2xl">
          {data.profile.displayName ?? data.profile.name} has not made contributions
          in third party projects.
        </p>
      {/if}
    </div>

    <!--
    {#if accountInfo?.name == data.profile.name && accountInfo.isAdmin}
      <div class="flex flex-row">
        <StellarButton
          onclick={() => newRepositoryPopup.setVisible(true)}
          label={"New Repository!"}
        />
      </div>
    {/if}

    {#if accountInfo?.name == data.profile.name}
      <button onclick={invalidateSession}>Sign Out</button>
    {/if}-->
  </div>
</PageBody>
