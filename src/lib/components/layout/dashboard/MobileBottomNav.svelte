<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { navigationConfig, type NavItem } from '$lib/config/navigation';
  import { cn } from '$lib/utils';

  export let user: { name: string; email: string; avatar?: string; role: string } | null = null;

  $: navigationItems = user ? navigationConfig[user.role as keyof typeof navigationConfig] || [] : [];
  $: currentPath = $page.url.pathname;

  // Filter items for mobile: prefer mobileOnly items, exclude desktopOnly items
  $: mobileItems = navigationItems.filter(item => !item.desktopOnly);
</script>

<nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40" aria-label="Main navigation">
  <ul class="flex justify-around items-center h-16 px-2">
    {#each mobileItems as item (item.id)}
        <li>
          <a
            href={item.href}
            class={cn(
              'flex flex-col items-center justify-center w-full h-full px-3 py-2 text-xs font-medium rounded-lg transition-colors',
              currentPath === item.href || (item.id !== 'dashboard' && currentPath.startsWith(item.href))
                ? 'text-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
            )}
            on:click|preventDefault={() => goto(item.href)}
          >
            <svelte:component this={item.icon} class="w-5 h-5 mb-1" />
            <span class="truncate">{item.label}</span>
            {#if item.badge && item.badge > 0}
              <span class="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge > 9 ? '9+' : item.badge}
              </span>
            {/if}
          </a>
        </li>
      {/if}
    {/each}
  </ul>
</nav>

<style>
  /* Add safe area padding for iOS devices */
  nav {
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
</style>
