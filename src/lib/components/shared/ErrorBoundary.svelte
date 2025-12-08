<script lang="ts">
  import { cn } from '$lib/utils';
  import { AlertTriangle, RefreshCw } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';

  export let error: Error | null = null;
  export let title: string = 'Something went wrong';
  export let className: string = '';

  function handleRetry() {
    window.location.reload();
  }
</script>

{#if error}
  <div
    class={cn('flex flex-col items-center justify-center gap-4 py-12 text-center', className)}
    role="alert"
  >
    <div class="rounded-full bg-destructive/10 p-4">
      <AlertTriangle class="h-8 w-8 text-destructive" />
    </div>
    <div class="space-y-2">
      <h3 class="text-lg font-semibold">{title}</h3>
      <p class="text-sm text-muted-foreground max-w-sm">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
    </div>
    <Button variant="outline" on:click={handleRetry}>
      <RefreshCw class="h-4 w-4 mr-2" />
      Try again
    </Button>
  </div>
{:else}
  <slot />
{/if}

