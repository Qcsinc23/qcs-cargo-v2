<script lang="ts">
  import { PricingTable } from '$lib/components/landing';
</script>

<svelte:head>
  <title>Pricing | QCS Cargo - Transparent Caribbean Shipping Rates</title>
  <meta name="description" content="View our competitive shipping rates to Guyana, Jamaica, Trinidad, Barbados, and Suriname. Volume discounts available. No hidden fees." />
</svelte:head>

<main class="min-h-screen bg-background text-foreground">
  <!-- Hero -->
  <section class="relative overflow-hidden bg-gradient-to-r from-[#023E8A] via-[#0077B6] to-[#023E8A] py-32 sm:py-40">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute inset-0 opacity-30"
        style="background-image: linear-gradient(90deg, rgba(144, 224, 239, 0.12) 1px, transparent 1px), linear-gradient(0deg, rgba(144, 224, 239, 0.12) 1px, transparent 1px); background-size: 96px 96px;"
      ></div>
      <div class="absolute -top-32 left-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[#90E0EF]/20 blur-3xl"></div>
      <div class="absolute -bottom-40 right-[-12rem] h-[36rem] w-[36rem] rounded-full bg-[#CAF0F8]/15 blur-3xl"></div>
    </div>
    <div class="container mx-auto px-4 text-center relative">
      <h1 class="font-display text-4xl md:text-6xl text-[#F0F9FF] mb-6">
        Simple, Transparent Pricing
      </h1>
      <p class="text-base sm:text-lg text-[#CAF0F8]/75 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
        Competitive rates with no hidden fees—presented clearly, so you can ship with confidence.
      </p>
    </div>
  </section>

  <PricingTable />
</main>






