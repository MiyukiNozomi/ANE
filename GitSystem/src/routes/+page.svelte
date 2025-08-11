<script lang="ts">
  import Footer from "$lib/components/footer.svelte";
  import Header from "$lib/components/header.svelte";
</script>

<svelte:head>
  <title>Projects</title>
  <meta name="title" content="Projects" />
  <meta
    name="description"
    content="The location of every public project I (miyuki) worked on :)"
  />
</svelte:head>

<div class="font-mplus2 min-h-screen bg-slate-900 text-white flex flex-col">
  <div class="flex flex-col h-screen z-20">
    <Header />
    <div class="h-fullflex flex-col text-center md:text-start relative">
      <p class="text-4xl font-mplus2 p-16 md:p-24">
        Work In Progress microservice
      </p>
    </div>
  </div>
  <Footer />
</div>
