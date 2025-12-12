<script lang="ts">
  import '../app.css';
  import { Toaster } from 'svelte-sonner';
  import { SkipLink, OfflineIndicator } from '$lib/components/layout';
  import ErrorBoundary from '$lib/components/ui/ErrorBoundary.svelte';

  // Function to reload the page on error reset
  function handleGlobalError() {
    window.location.reload();
  }
</script>

<SkipLink />

<slot />

<OfflineIndicator />

<Toaster position="top-right" richColors />

