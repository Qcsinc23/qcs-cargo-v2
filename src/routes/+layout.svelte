<script lang="ts">
  import '../app.css';
  import { Toaster } from 'svelte-sonner';
  import { SkipLink, OfflineIndicator } from '$lib/components/layout';
  import ErrorBoundary from '$lib/components/ui/ErrorBoundary.svelte';
  import { auth } from '$lib/stores/auth';

  export let data;

  // Keep the client auth store in sync with the server session (cookie-based auth).
  $: auth.initialize(data.user);

  // Function to reload the page on error reset
  function handleGlobalError() {
    window.location.reload();
  }
</script>

<SkipLink />

<slot />

<OfflineIndicator />

<Toaster position="top-right" richColors />

