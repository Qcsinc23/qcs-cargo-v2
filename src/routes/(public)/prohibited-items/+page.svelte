<script lang="ts">
  import { ProhibitedChecker } from '$lib/components/landing';
</script>

<svelte:head>
  <title>Prohibited Items | QCS Cargo - Shipping Restrictions</title>
  <meta name="description" content="Check what items can and cannot be shipped. Learn about prohibited and restricted items for Caribbean air freight." />
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <!-- Hero -->
  <section class="bg-gradient-to-br from-primary-600 to-primary-800 py-12 text-white">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-3xl md:text-4xl font-bold mb-2">
        Prohibited & Restricted Items
      </h1>
      <p class="text-primary-100">
        Know before you ship - check if your items can be sent
      </p>
    </div>
  </section>

  <section class="py-12">
    <div class="container mx-auto px-4">
      <ProhibitedChecker />
    </div>
  </section>
</main>

