<script lang="ts">
  import LoadingSpinner from './LoadingSpinner.svelte';
  import { cn } from '$lib/utils';

  export let message: string = 'Loading...';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let className: string = '';
</script>

<div
  class={cn('flex flex-col items-center justify-center gap-4 py-12', className)}
  role="status"
  aria-live="polite"
>
  <LoadingSpinner {size} className="text-primary-500" />
  <p class="text-sm text-muted-foreground">{message}</p>
</div>

