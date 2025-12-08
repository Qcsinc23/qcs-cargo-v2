<script lang="ts">
  import { FAQ } from '$lib/components/landing';
</script>

<svelte:head>
  <title>FAQ | QCS Cargo - Frequently Asked Questions</title>
  <meta name="description" content="Find answers to common questions about shipping rates, tracking, prohibited items, customs, and payment options." />
</svelte:head>

<main class="min-h-screen">
  <!-- Hero -->
  <section class="bg-gradient-to-br from-primary-600 to-primary-800 py-12 text-white">
    <div class="container mx-auto px-4 text-center">
      <h1 class="text-3xl md:text-4xl font-bold mb-2">
        Frequently Asked Questions
      </h1>
      <p class="text-primary-100">
        Everything you need to know about shipping with QCS Cargo
      </p>
    </div>
  </section>

  <FAQ />
</main>

