<script lang="ts">
  import { Destinations } from '$lib/components/landing';
</script>

<svelte:head>
  <title>Destinations | QCS Cargo - Caribbean Shipping Network</title>
  <meta name="description" content="Ship to Guyana, Jamaica, Trinidad & Tobago, Barbados, and Suriname. View transit times, rates, and service availability for each destination." />
</svelte:head>

<main class="min-h-screen">
  <!-- Hero -->
  <section class="bg-gradient-to-br from-primary-600 to-primary-800 py-16 text-white">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-4xl md:text-5xl font-bold mb-4">
        Our Caribbean Network
      </h1>
      <p class="text-xl text-primary-100 max-w-2xl mx-auto">
        Reliable shipping to the Caribbean's most popular destinations
      </p>
    </div>
  </section>

  <Destinations />
</main>





