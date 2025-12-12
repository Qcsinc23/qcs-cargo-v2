<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { navigationConfig, type NavItem } from '$lib/config/navigation';
  import { cn } from '$lib/utils';
  import { COMPANY } from '$lib/config/constants';

  export let role: string = 'customer';

  $: navigationItems = navigationConfig[role as keyof typeof navigationConfig] || [];
  $: currentPath = $page.url.pathname;
</script>

<aside class="hidden md:flex md:flex-shrink-0">
  <div class="flex flex-col w-64">
    <!-- Sidebar Header -->
    <div class="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
      <div class="flex items-center flex-shrink-0 px-4">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 2h6v6H2V2zm0 8h6v6H2v-6zm0 8h6v6H2v-6zM10 2h6v6h-6V2zm0 8h6v6h-6v-6zm0 8h6v6h-6v-6zM18 2h6v6h-6V2zm0 8h6v6h-6v-6zm0 8h6v6h-6v-2z"/>
              </svg>
            </div>
          </div>
          <div class="ml-3">
            <h2 class="text-lg font-semibold text-gray-900">QCS Cargo</h2>
            <p class="text-sm text-gray-500">{role === 'admin' ? 'Admin' : role === 'staff' ? 'Staff' : 'Customer'}</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="mt-8 flex-1 px-2 space-y-1" aria-label="Sidebar">
        {#each navigationItems as item (item.id)}
          {#if !item.mobileOnly}
            <a
              href={item.href}
              class={cn(
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                currentPath === item.href || (item.id !== 'dashboard' && currentPath.startsWith(item.href))
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              on:click|preventDefault={() => goto(item.href)}
            >
              <svelte:component
                this={item.icon}
                class={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  currentPath === item.href || (item.id !== 'dashboard' && currentPath.startsWith(item.href))
                    ? 'text-primary-500'
                    : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.label}
              {#if item.badge && item.badge > 0}
                <span class="ml-auto inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {item.badge}
                </span>
              {/if}
            </a>
          {/if}
        {/each}
      </nav>

      <!-- Sidebar Footer -->
      <div class="flex-shrink-0 flex border-t border-gray-200 p-4">
        <a href="/support" class="flex-shrink-0 w-full group block">
          <div class="flex items-center">
            <div>
              <svg class="h-6 w-6 text-gray-400 group-hover:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-gray-700 group-hover:text-gray-900">Need help?</p>
              <p class="text-xs font-medium text-gray-500 group-hover:text-gray-700">{COMPANY.phone}</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  </div>
</aside>
