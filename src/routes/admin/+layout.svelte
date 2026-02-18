<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { tick } from 'svelte';
  import { navigationConfig, type NavItem } from '$lib/config/navigation';
  import { cn } from '$lib/utils';
  import { COMPANY } from '$lib/config/constants';
  import { 
    Search, 
    Bell, 
    LogOut, 
    ChevronDown,
    Menu,
    X,
    Command
  } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
  import { auth } from '$lib/stores/auth';

  export let data;

  $: user = data.user || { name: 'Admin', email: 'admin@qcscargo.com', role: 'admin' };
  $: navigationItems = navigationConfig.admin;
  $: currentPath = $page.url.pathname;

  let mobileMenuOpen = false;
  let searchOpen = false;
  let searchQuery = '';
  let logoutDialogOpen = false;
  let searchInput: HTMLInputElement | null = null;

  $: if (searchOpen) {
    tick().then(() => searchInput?.focus());
  }

  function handleSearch(e: KeyboardEvent) {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      searchOpen = true;
    }
    if (e.key === 'Escape') {
      searchOpen = false;
    }
  }

  function performSearch() {
    if (searchQuery.trim()) {
      goto(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
      searchOpen = false;
      searchQuery = '';
    }
  }

  async function handleLogout() {
    logoutDialogOpen = false;
    await auth.logout();
  }
</script>

<svelte:window on:keydown={handleSearch} />

<div class="min-h-screen bg-slate-50">
  <!-- Top Header -->
  <header class="sticky top-0 z-40 bg-slate-900 border-b border-slate-800">
    <div class="flex h-16 items-center justify-between px-4 md:px-6">
      <!-- Logo & Mobile Menu -->
      <div class="flex items-center gap-4">
        <button 
          class="md:hidden p-2 text-slate-400 hover:text-white"
          on:click={() => mobileMenuOpen = !mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {#if mobileMenuOpen}
            <X class="h-5 w-5" />
          {:else}
            <Menu class="h-5 w-5" />
          {/if}
        </button>
        
        <a href="/admin" class="flex items-center gap-3">
          <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2 2h6v6H2V2zm0 8h6v6H2v-6zm0 8h6v6H2v-6zM10 2h6v6h-6V2zm0 8h6v6h-6v-6zm0 8h6v6h-6v-6zM18 2h6v6h-6V2zm0 8h6v6h-6v-6zm0 8h6v6h-6v-2z"/>
            </svg>
          </div>
          <div class="hidden sm:block">
            <h1 class="text-lg font-semibold text-white">QCS Admin</h1>
          </div>
        </a>
      </div>

      <!-- Search (Desktop) -->
      <div class="hidden md:flex flex-1 max-w-xl mx-8">
        <button
          class="w-full flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:bg-slate-700 transition-colors"
          on:click={() => searchOpen = true}
        >
          <Search class="h-4 w-4" />
          <span class="flex-1 text-left text-sm">Search shipments, users, bookings...</span>
          <kbd class="hidden lg:flex items-center gap-1 px-1.5 py-0.5 bg-slate-700 rounded text-xs font-mono">
            <Command class="h-3 w-3" />K
          </kbd>
        </button>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-2">
        <button 
          class="md:hidden p-2 text-slate-400 hover:text-white"
          on:click={() => searchOpen = true}
          aria-label="Open search"
        >
          <Search class="h-5 w-5" />
        </button>
        
        <!-- Notifications -->
        <button class="relative p-2 text-slate-400 hover:text-white" aria-label="Notifications">
          <Bell class="h-5 w-5" />
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <!-- User Menu -->
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <button
                {...props}
                class="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div class="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div class="hidden md:block text-left">
                  <p class="text-sm font-medium text-white">{user.name || 'Admin'}</p>
                  <p class="text-xs text-slate-400 capitalize">{user.role}</p>
                </div>
                <ChevronDown class="hidden md:block h-4 w-4 text-slate-400" />
              </button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-56" align="end">
            <DropdownMenu.Group>
              <DropdownMenu.Label>My Account</DropdownMenu.Label>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>
              <a href="/admin/settings" class="flex items-center w-full">Settings</a>
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              <a href="/dashboard" class="flex items-center w-full">Switch to Customer View</a>
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item class="text-red-600" onSelect={() => logoutDialogOpen = true}>
              <LogOut class="mr-2 h-4 w-4" />
              Log out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    </div>
  </header>

  <div class="flex">
    <!-- Sidebar (Desktop) -->
    <aside class="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 md:pt-16">
      <div class="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-slate-900 border-r border-slate-800">
        <nav class="mt-2 flex-1 px-3 space-y-1">
          {#each navigationItems as item (item.id)}
            {#if !item.mobileOnly}
              <a
                href={item.href}
                class={cn(
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                  currentPath === item.href || (item.id !== 'dashboard' && currentPath.startsWith(item.href))
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <svelte:component
                  this={item.icon}
                  class={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    currentPath === item.href || (item.id !== 'dashboard' && currentPath.startsWith(item.href))
                      ? 'text-white'
                      : 'text-slate-400 group-hover:text-white'
                  )}
                />
                {item.label}
                {#if item.badge && item.badge > 0}
                  <span class="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                    {item.badge}
                  </span>
                {/if}
              </a>
            {/if}
          {/each}
        </nav>

        <!-- Sidebar Footer -->
        <div class="flex-shrink-0 px-3 py-4 border-t border-slate-800">
          <div class="text-xs text-slate-500">
            <p>{COMPANY.name}</p>
            <p class="mt-1">{COMPANY.phone}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Mobile Menu Overlay -->
    {#if mobileMenuOpen}
      <button
        type="button"
        class="md:hidden fixed inset-0 z-30 bg-black/50"
        on:click={() => mobileMenuOpen = false}
        aria-label="Close mobile menu"
      ></button>
      <aside class="md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 pt-16">
        <nav class="mt-4 px-3 space-y-1">
          {#each navigationItems as item (item.id)}
            <a
              href={item.href}
              class={cn(
                'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors',
                currentPath === item.href || (item.id !== 'dashboard' && currentPath.startsWith(item.href))
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
              on:click={() => mobileMenuOpen = false}
            >
              <svelte:component this={item.icon} class="mr-3 h-5 w-5" />
              {item.label}
            </a>
          {/each}
        </nav>
      </aside>
    {/if}

    <!-- Main Content -->
    <main class="flex-1 md:ml-64 min-h-[calc(100vh-4rem)]">
      <slot />
    </main>
  </div>

  <!-- Search Modal -->
  {#if searchOpen}
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="min-h-screen px-4 text-center">
        <button
          type="button"
          class="fixed inset-0 bg-black/60"
          on:click={() => searchOpen = false}
          aria-label="Close search"
        ></button>
        
        <div class="inline-block w-full max-w-2xl my-16 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl overflow-hidden">
          <div class="flex items-center px-4 border-b">
            <Search class="h-5 w-5 text-slate-400" />
            <input
              bind:this={searchInput}
              type="text"
              placeholder="Search shipments, users, bookings..."
              class="flex-1 px-4 py-4 text-lg outline-none"
              bind:value={searchQuery}
              on:keydown={(e) => e.key === 'Enter' && performSearch()}
            />
            <kbd class="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-500">ESC</kbd>
          </div>
          
          <div class="p-4">
            <p class="text-sm text-slate-500 mb-3">Quick Links</p>
            <div class="space-y-1">
              <button 
                class="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg text-left"
                on:click={() => { goto('/admin/shipments'); searchOpen = false; }}
              >
                <span class="text-slate-400">→</span>
                <span>View all shipments</span>
              </button>
              <button 
                class="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg text-left"
                on:click={() => { goto('/admin/bookings?status=pending'); searchOpen = false; }}
              >
                <span class="text-slate-400">→</span>
                <span>Pending bookings</span>
              </button>
              <button 
                class="w-full flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg text-left"
                on:click={() => { goto('/admin/users'); searchOpen = false; }}
              >
                <span class="text-slate-400">→</span>
                <span>Manage users</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Logout Confirmation Dialog -->
<Dialog bind:open={logoutDialogOpen}>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Confirm Logout</DialogTitle>
      <DialogDescription>
        Are you sure you want to logout? You'll need to sign in again to access the admin panel.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" on:click={() => (logoutDialogOpen = false)}>
        Cancel
      </Button>
      <Button variant="destructive" on:click={handleLogout}>
        <LogOut class="h-4 w-4 mr-2" />
        Logout
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
