<script lang="ts">
  // Home page - to be implemented per PRD
</script>

<svelte:head>
  <title>QCS Cargo - Trusted Air Freight to the Caribbean</title>
  <meta
    name="description"
    content="Ship packages to Guyana, Jamaica, Trinidad, Barbados, and Suriname from New Jersey. TSA licensed, 3-5 day transit, 99% satisfaction rate."
  />
</svelte:head>

<main id="main-content" class="flex min-h-screen flex-col items-center justify-center p-4">
  <div class="text-center">
    <h1 class="text-4xl font-bold text-primary-800">QCS Cargo 2.0</h1>
    <p class="mt-4 text-lg text-gray-600">
      Application scaffolding complete. See <code class="rounded bg-gray-100 px-2 py-1">docs/PRD.md</code> for implementation details.
    </p>
    <div class="mt-8 space-x-4">
      <a
        href="/auth/login"
        class="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
      >
        Login
      </a>
      <a
        href="/shipping-calculator"
        class="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
      >
        Get Quote
      </a>
    </div>
  </div>
</main>