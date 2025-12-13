<script lang="ts">
  /**
   * OfflineIndicator Component
   * 
   * Displays a banner when the user is offline or has pending scans to sync.
   * Shows sync status and provides manual sync trigger.
   */
  
  import { onMount, onDestroy } from 'svelte';
  import { fade, slide } from 'svelte/transition';
  import { WifiOff, Wifi, RefreshCw, Cloud, CloudOff, Check, AlertTriangle } from 'lucide-svelte';
  import { 
    isOnline, 
    pendingScans, 
    syncStatus, 
    initConnectivityMonitor,
    syncPendingScans,
    getSyncStatusMessage
  } from '$lib/services/offlineScanner';
  import { Button } from '$lib/components/ui/button';

  let showReconnected = false;
  let cleanup: (() => void) | null = null;

  onMount(() => {
    cleanup = initConnectivityMonitor();
  });

  onDestroy(() => {
    cleanup?.();
  });

  // Show "reconnected" message briefly when coming back online
  let wasOffline = false;
  $: {
    if ($isOnline && wasOffline) {
      showReconnected = true;
      setTimeout(() => {
        showReconnected = false;
      }, 3000);
    }
    wasOffline = !$isOnline;
  }

  async function handleManualSync() {
    await syncPendingScans();
  }
</script>

<!-- Offline Banner -->
{#if !$isOnline}
  <div 
    transition:slide={{ duration: 200 }}
    class="fixed bottom-0 left-0 right-0 bg-amber-700 text-white py-3 px-4 z-50
           flex items-center justify-center gap-3 text-sm font-medium shadow-lg"
    role="alert"
    aria-live="assertive"
  >
    <WifiOff class="w-5 h-5 flex-shrink-0" />
    <span>You're offline. Scans will be saved locally and synced when you reconnect.</span>
    {#if $pendingScans.length > 0}
      <span class="bg-amber-800 px-2 py-0.5 rounded-full text-xs">
        {$pendingScans.length} pending
      </span>
    {/if}
  </div>
{/if}

<!-- Reconnected Banner -->
{#if showReconnected && $isOnline}
  <div 
    transition:fade={{ duration: 200 }}
    class="fixed bottom-0 left-0 right-0 bg-emerald-500 text-white py-3 px-4 z-50
           flex items-center justify-center gap-3 text-sm font-medium shadow-lg"
    role="alert"
    aria-live="polite"
  >
    <Wifi class="w-5 h-5 flex-shrink-0" />
    <span>You're back online!</span>
    {#if $pendingScans.length > 0}
      <span>Syncing {$pendingScans.length} scan{$pendingScans.length > 1 ? 's' : ''}...</span>
    {/if}
  </div>
{/if}

<!-- Pending Scans Banner (when online but have pending) -->
{#if $isOnline && !showReconnected && $pendingScans.length > 0}
  <div 
    transition:slide={{ duration: 200 }}
    class="fixed bottom-0 left-0 right-0 z-50 shadow-lg
           {$syncStatus === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white"
    role="status"
    aria-live="polite"
  >
    <div class="py-3 px-4 flex items-center justify-center gap-3 text-sm font-medium">
      {#if $syncStatus === 'syncing'}
        <RefreshCw class="w-5 h-5 flex-shrink-0 animate-spin" />
        <span>Syncing {$pendingScans.length} scan{$pendingScans.length > 1 ? 's' : ''}...</span>
      {:else if $syncStatus === 'error'}
        <CloudOff class="w-5 h-5 flex-shrink-0" />
        <span>{getSyncStatusMessage()}</span>
        <Button 
          size="sm" 
          variant="secondary"
          class="ml-2 h-7 px-2 text-xs"
          on:click={handleManualSync}
        >
          <RefreshCw class="w-3 h-3 mr-1" />
          Retry
        </Button>
      {:else if $syncStatus === 'success'}
        <Check class="w-5 h-5 flex-shrink-0" />
        <span>All scans synced!</span>
      {:else}
        <Cloud class="w-5 h-5 flex-shrink-0" />
        <span>{$pendingScans.length} scan{$pendingScans.length > 1 ? 's' : ''} pending sync</span>
        <Button 
          size="sm" 
          variant="secondary"
          class="ml-2 h-7 px-2 text-xs"
          on:click={handleManualSync}
        >
          <RefreshCw class="w-3 h-3 mr-1" />
          Sync Now
        </Button>
      {/if}
    </div>
  </div>
{/if}
