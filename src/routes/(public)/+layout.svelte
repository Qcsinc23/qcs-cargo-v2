<script lang="ts">
  import '../app.css';
  import { Toaster } from 'svelte-sonner';
  import { SkipLink, OfflineIndicator } from '$lib/components/layout';

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export let data;
</script>

<SkipLink />

<slot />

<OfflineIndicator />
<Toaster position="top-right" richColors />