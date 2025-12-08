<script lang="ts">
  import '../app.css';
  import { Toaster } from 'svelte-sonner';
  import { SkipLink, OfflineIndicator } from '$lib/components/layout';

  export let data;
  // Suppress unused warning - data is passed to child routes via slot
  void data;
</script>

<SkipLink />

<slot />

<OfflineIndicator />

<Toaster position="top-right" richColors />

