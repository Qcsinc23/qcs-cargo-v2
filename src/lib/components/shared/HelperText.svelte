<script lang="ts">
  import { cn } from '$lib/utils';
  import { Info, AlertCircle, CheckCircle } from 'lucide-svelte';

  export let variant: 'info' | 'error' | 'success' = 'info';
  export let className: string = '';

  const variants = {
    info: {
      icon: Info,
      class: 'text-muted-foreground'
    },
    error: {
      icon: AlertCircle,
      class: 'text-destructive'
    },
    success: {
      icon: CheckCircle,
      class: 'text-success-600'
    }
  };

  $: config = variants[variant];
</script>

<p class={cn('flex items-center gap-1.5 text-xs', config.class, className)}>
  <svelte:component this={config.icon} class="h-3.5 w-3.5 flex-shrink-0" />
  <slot />
</p>

