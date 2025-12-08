<script lang="ts">
  import { page } from '$app/stores';
  import { cn } from '$lib/utils';
  import { Home, Package, Search, User, Plus } from 'lucide-svelte';

  export let user: { name?: string; email: string } | null = null;

  $: currentPath = $page.url.pathname;

  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Shipments', href: '/dashboard/shipments', icon: Package },
    { name: 'Book', href: '/dashboard/book', icon: Plus, primary: true },
    { name: 'Track', href: '/tracking', icon: Search },
    { name: 'Account', href: '/dashboard/settings', icon: User }
  ];
</script>

{#if user}
  <nav
    class="fixed bottom-0 left-0 right-0 z-40 border-t bg-background md:hidden"
    aria-label="Mobile navigation"
  >
    <div class="flex items-center justify-around h-16">
      {#each navItems as item}
        <a
          href={item.href}
          class={cn(
            'flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[64px]',
            item.primary && 'relative -top-3'
          )}
          aria-current={currentPath === item.href || currentPath.startsWith(item.href + '/') ? 'page' : undefined}
        >
          {#if item.primary}
            <div class="flex items-center justify-center w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg">
              <svelte:component this={item.icon} class="h-6 w-6" />
            </div>
            <span class="text-[10px] font-medium text-primary-600">{item.name}</span>
          {:else}
            <svelte:component
              this={item.icon}
              class={cn(
                'h-5 w-5',
                currentPath === item.href || currentPath.startsWith(item.href + '/')
                  ? 'text-primary-600'
                  : 'text-muted-foreground'
              )}
            />
            <span
              class={cn(
                'text-[10px] font-medium',
                currentPath === item.href || currentPath.startsWith(item.href + '/')
                  ? 'text-primary-600'
                  : 'text-muted-foreground'
              )}
            >
              {item.name}
            </span>
          {/if}
        </a>
      {/each}
    </div>
  </nav>
{/if}

