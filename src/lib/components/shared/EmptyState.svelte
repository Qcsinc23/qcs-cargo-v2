<script lang="ts">
  import { cn } from '$lib/utils';
  import { Package, Search, FileText, Users } from 'lucide-svelte';
  import type { ComponentType } from 'svelte';

  export let title: string;
  export let description: string = '';
  export let icon: 'package' | 'search' | 'file' | 'users' | ComponentType = 'package';
  export let className: string = '';

  const icons = {
    package: Package,
    search: Search,
    file: FileText,
    users: Users
  };

  $: IconComponent = typeof icon === 'string' ? icons[icon] : icon;
</script>

<div
  class={cn('flex flex-col items-center justify-center gap-4 py-12 text-center', className)}
>
  <div class="rounded-full bg-muted p-4">
    <svelte:component this={IconComponent} class="h-8 w-8 text-muted-foreground" />
  </div>
  <div class="space-y-2">
    <h3 class="text-lg font-semibold">{title}</h3>
    {#if description}
      <p class="text-sm text-muted-foreground max-w-sm">{description}</p>
    {/if}
  </div>
  <slot />
</div>

