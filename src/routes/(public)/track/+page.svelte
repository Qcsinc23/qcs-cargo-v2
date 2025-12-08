<script lang="ts">
  import { page } from '$app/stores';
  import { PublicTracker } from '$lib/components/tracking';

  // Get tracking number from URL if present
  $: trackingNumber = $page.url.searchParams.get('number') || '';
</script>

<svelte:head>
  <title>Track Shipment | QCS Cargo</title>
  <meta name="description" content="Track your QCS Cargo shipment in real-time. Get updates on your package's location and estimated delivery date." />
</svelte:head>

<main class="min-h-screen bg-slate-50">
  <!-- Hero -->
  <section class="bg-gradient-to-br from-primary-600 to-primary-800 py-12 text-white">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-3xl md:text-4xl font-bold mb-2">
        Track Your Shipment
      </h1>
      <p class="text-primary-100">
        Real-time updates on your package's journey
      </p>
    </div>
  </section>

  <section class="py-12">
    <div class="container mx-auto px-4">
      <PublicTracker initialTrackingNumber={trackingNumber} />
    </div>
  </section>
</main>

