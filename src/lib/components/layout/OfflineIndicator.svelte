<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { fade } from 'svelte/transition';
  import { WifiOff, Wifi } from 'lucide-svelte';
  import { browser } from '$app/environment';

  const isOnline = writable(true);
  let showReconnected = false;

  onMount(() => {
    if (!browser) return;

    isOnline.set(navigator.onLine);

    const handleOnline = () => {
      isOnline.set(true);
      showReconnected = true;
      setTimeout(() => (showReconnected = false), 3000);
    };

    const handleOffline = () => {
      isOnline.set(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });
</script>

{#if !$isOnline}
  <div
    transition:fade
    class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white"
    role="alert"
    aria-live="assertive"
  >
    <WifiOff class="h-4 w-4" />
    <span>You're offline. Some features may not work.</span>
  </div>
{/if}

{#if showReconnected}
  <div
    transition:fade
    class="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-green-500 px-4 py-2 text-sm font-medium text-white"
    role="status"
    aria-live="polite"
  >
    <Wifi class="h-4 w-4" />
    <span>Back online!</span>
  </div>
{/if}