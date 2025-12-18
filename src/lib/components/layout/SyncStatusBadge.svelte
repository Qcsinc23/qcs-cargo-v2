<script lang="ts">
  /**
   * SyncStatusBadge Component
   * 
   * Compact badge showing sync status for admin header/toolbar.
   */
  
  import { Cloud, CloudOff, RefreshCw, Check, WifiOff } from 'lucide-svelte';
  import { 
    isOnline, 
    pendingScans, 
    syncStatus,
    syncPendingScans
  } from '$lib/services/offlineScanner';
  import { cn } from '$lib/utils';

  export let showLabel = true;

  async function handleClick() {
    if ($isOnline && $pendingScans.length > 0) {
      await syncPendingScans();
    }
  }

  $: statusColor = !$isOnline 
    ? 'text-amber-500' 
    : $syncStatus === 'error' 
      ? 'text-red-500'
      : $syncStatus === 'syncing'
        ? 'text-blue-500'
        : $pendingScans.length > 0
          ? 'text-blue-500'
          : 'text-emerald-500';

  $: bgColor = !$isOnline 
    ? 'bg-amber-100' 
    : $syncStatus === 'error' 
      ? 'bg-red-100'
      : $syncStatus === 'syncing'
        ? 'bg-blue-100'
        : $pendingScans.length > 0
          ? 'bg-blue-100'
          : 'bg-emerald-100';
</script>

<button
  type="button"
  class={cn(
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
    bgColor,
    statusColor,
    $isOnline && $pendingScans.length > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
  )}
  on:click={handleClick}
  disabled={!$isOnline || $pendingScans.length === 0}
  aria-label={!$isOnline ? 'Offline' : $pendingScans.length > 0 ? 'Click to sync' : 'Synced'}
>
  {#if !$isOnline}
    <WifiOff class="w-4 h-4" />
    {#if showLabel}
      <span>Offline</span>
    {/if}
  {:else if $syncStatus === 'syncing'}
    <RefreshCw class="w-4 h-4 animate-spin" />
    {#if showLabel}
      <span>Syncing...</span>
    {/if}
  {:else if $syncStatus === 'error'}
    <CloudOff class="w-4 h-4" />
    {#if showLabel}
      <span>Sync Failed</span>
    {/if}
  {:else if $pendingScans.length > 0}
    <Cloud class="w-4 h-4" />
    {#if showLabel}
      <span>{$pendingScans.length} pending</span>
    {/if}
  {:else}
    <Check class="w-4 h-4" />
    {#if showLabel}
      <span>Synced</span>
    {/if}
  {/if}
</button>


