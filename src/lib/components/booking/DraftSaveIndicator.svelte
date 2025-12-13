<script lang="ts">
  import { hasDraft } from '$lib/stores/booking';
  import { Check, Cloud } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  let lastSaveTime = new Date();
  let showSaved = false;

  // Watch for draft changes and show "Saved" indicator
  $: if ($hasDraft) {
    lastSaveTime = new Date();
    showSaved = true;
    
    // Hide after 2 seconds
    setTimeout(() => {
      showSaved = false;
    }, 2000);
  }

  function formatSaveTime(): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaveTime.getTime()) / 1000);
    
    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return lastSaveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
</script>

{#if $hasDraft}
  <div class="flex items-center gap-2 text-sm text-muted-foreground">
    {#if showSaved}
      <div transition:fade class="flex items-center gap-1.5 text-green-600">
        <Check class="w-4 h-4" />
        <span>Draft saved</span>
      </div>
    {:else}
      <div class="flex items-center gap-1.5">
        <Cloud class="w-4 h-4" />
        <span>Last saved {formatSaveTime()}</span>
      </div>
    {/if}
  </div>
{/if}

