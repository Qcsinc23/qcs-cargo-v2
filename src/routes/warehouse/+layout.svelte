<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import MobileWarehouseView from '$lib/components/warehouse/MobileWarehouseView.svelte';

  let isMobile = false;
  let isTablet = false;

  onMount(() => {
    function checkDevice() {
      const width = window.innerWidth;
      isMobile = width < 640;
      isTablet = width >= 640 && width < 1024;

      // Redirect to mobile view on small screens
      const currentPath = $page.url.pathname as string;
      if (isMobile && !currentPath.startsWith('/warehouse/mobile')) {
        goto('/warehouse/mobile', { replaceState: true });
      }
    }

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  });

  $: warehouseNav = [
    { href: '/warehouse', label: 'Dashboard', active: $page.url.pathname === '/warehouse' },
    { href: '/warehouse/receiving', label: 'Receiving', active: $page.url.pathname.startsWith('/warehouse/receiving') },
    { href: '/warehouse/staging', label: 'Staging', active: $page.url.pathname.startsWith('/warehouse/staging') },
    { href: '/warehouse/manifests', label: 'Shipping', active: $page.url.pathname.startsWith('/warehouse/manifests') },
    { href: '/warehouse/packages', label: 'All Packages', active: $page.url.pathname.startsWith('/warehouse/packages') }
  ];
</script>

{#if $page.url.pathname.includes('/warehouse/mobile')}
  <MobileWarehouseView />
{:else}
  <div class="min-h-screen bg-gray-50">
    <!-- Warehouse Sub-Navigation -->
    <nav class="bg-white shadow-sm border-b sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-8 overflow-x-auto">
          {#each warehouseNav as item}
            <a
              href={item.href}
              class="py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors {
                item.active
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }"
            >
              {item.label}
            </a>
          {/each}
        </div>
      </div>
    </nav>

    <!-- Page Content -->
    <main>
      <slot />
    </main>
  </div>
{/if}