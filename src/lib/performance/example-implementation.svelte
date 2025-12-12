<script lang="ts">
  import { onMount } from 'svelte';
  import { initializeSvelteKitPerformance } from '$lib/performance';
  import { trackComponent, createReactiveTracker } from '$lib/performance';
  import { apiGet } from '$lib/performance';
  import PerformanceWidget from '$lib/performance/PerformanceWidget.svelte';
  import PerformanceErrorBoundary from '$lib/performance/PerformanceErrorBoundary.svelte';

  // Initialize performance tracking
  onMount(() => {
    // Initialize the performance system
    const cleanup = initializeSvelteKitPerformance();

    // Track component performance
    const { trackUpdate } = trackComponent('ExamplePage');

    // Track reactive updates
    const tracker = createReactiveTracker('ExamplePage');

    // Example API call with performance tracking
    loadShipments();

    // Cleanup on destroy
    return cleanup;
  });

  // Track API calls
  async function loadShipments() {
    try {
      // Using performance-tracked API wrapper
      const shipments = await apiGet('/api/shipments');
      console.log('Loaded shipments:', shipments);
    } catch (error) {
      console.error('Failed to load shipments:', error);
    }
  }
</script>

<!-- Use performance-enhanced error boundary -->
<PerformanceErrorBoundary
  context="ExamplePage"
  showPerformanceDetails={true}
>
  <!-- Your page content here -->
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Performance Monitoring Example</h1>
    <p>This page demonstrates the performance monitoring system in action.</p>

    <!-- Content that would be tracked -->
    <div class="mt-6 space-y-4">
      <h2 class="text-xl font-semibold">Features being tracked:</h2>
      <ul class="list-disc list-inside space-y-2">
        <li>Page load performance and Core Web Vitals</li>
        <li>Component render times and re-renders</li>
        <li>API response times</li>
        <li>Error occurrences with performance context</li>
        <li>Navigation timing between routes</li>
      </ul>
    </div>
  </div>
</PerformanceErrorBoundary>

<!-- Performance widget (visible in development) -->
{#if import.meta.env.DEV}
  <PerformanceWidget
    position="bottom-right"
    showScore={true}
    showVitals={true}
    showAlerts={true}
    collapsible={true}
  />
{/if}