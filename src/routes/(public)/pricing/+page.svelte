<script lang="ts">
  import { PricingTable } from '$lib/components/landing';
</script>

<svelte:head>
  <title>Pricing | QCS Cargo - Transparent Caribbean Shipping Rates</title>
  <meta name="description" content="View our competitive shipping rates to Guyana, Jamaica, Trinidad, Barbados, and Suriname. Volume discounts available. No hidden fees." />
</svelte:head>

<main class="min-h-screen">
  <!-- Hero -->
  <section class="bg-gradient-to-br from-primary-600 to-primary-800 py-16 text-white">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">
        Simple, Transparent Pricing
      </h1>
      <p class="text-xl text-primary-100 max-w-2xl mx-auto">
        Competitive rates with no hidden fees. Pay only for what you ship.
      </p>
    </div>
  </section>

  <PricingTable />
</main>

