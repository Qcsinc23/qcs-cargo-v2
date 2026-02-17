<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Logo } from '$lib/components/shared';
  import { Button } from '$lib/components/ui/button';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
  import { Breadcrumbs } from '$lib/components/ui/breadcrumbs';
  import { auth } from '$lib/stores/auth';
  import { User, LogOut, Menu, Bell, Search } from 'lucide-svelte';
  import { page } from '$app/stores';

  export let user: { name: string; email: string; avatar?: string; role: string } | null = null;
  export let showBreadcrumbs = true;
  export let showMobileMenu = true;

  let logoutDialogOpen = false;
  let mobileMenuOpen = false;
  let notificationsOpen = false;
  let userMenuOpen = false;
  const dispatch = createEventDispatcher();

  $: activePath = $page.url.pathname;

  async function handleLogout() {
    logoutDialogOpen = false;
    userMenuOpen = false;
    await auth.logout();
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function toggleNotifications() {
    notificationsOpen = !notificationsOpen;
  }

  function toggleUserMenu() {
    userMenuOpen = !userMenuOpen;
    notificationsOpen = false;
  }

  // Close mobile menu when clicking outside
  function handleMobileMenuClick() {
    mobileMenuOpen = false;
  }

  // Close dropdowns when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      userMenuOpen = false;
      notificationsOpen = false;
    }
  }
</script>

<svelte:window on:click={handleClickOutside} />

<header class="sticky top-0 z-40 w-full bg-white border-b shadow-sm">
  <div class="px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <!-- Left side - Logo and Mobile Menu -->
      <div class="flex items-center gap-4">
        {#if showMobileMenu}
          <Button
            variant="ghost"
            size="icon"
            class="md:hidden"
            on:click={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu class="h-5 w-5" />
          </Button>
        {/if}
        <a href="/dashboard" class="flex items-center gap-2">
          <Logo class="h-8 w-auto" />
          <span class="hidden sm:inline text-lg font-semibold">QCS Cargo</span>
        </a>
      </div>

      <!-- Center - Search Bar (desktop only) -->
      <div class="hidden md:flex flex-1 max-w-lg mx-8">
        <div class="relative w-full">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings, shipments..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Right side - User actions -->
      <div class="flex items-center gap-3">
        <!-- Notifications (desktop only) -->
        <Button
          variant="ghost"
          size="icon"
          class="hidden md:flex"
          on:click={toggleNotifications}
          aria-label="Notifications"
        >
          <Bell class="h-5 w-5" />
          {#if notificationsOpen}
            <div class="absolute top-full mt-2 w-80 bg-white rounded-lg shadow-lg border p-4 right-4">
              <h3 class="font-medium mb-2">Notifications</h3>
              <p class="text-sm text-gray-500">No new notifications</p>
            </div>
          {/if}
        </Button>

        <!-- User Menu -->
        {#if user}
          <div class="relative user-menu-container">
            <Button
              variant="ghost"
              class="flex items-center gap-2 px-3 py-2"
              on:click={toggleUserMenu}
              aria-expanded={userMenuOpen}
              aria-haspopup="menu"
            >
              {#if user.avatar}
                <img
                  src={user.avatar}
                  alt={user.name}
                  class="h-8 w-8 rounded-full object-cover"
                />
              {:else}
                <div class="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <User class="h-5 w-5 text-primary-600" />
                </div>
              {/if}
              <span class="hidden sm:inline text-sm font-medium">{user.name}</span>
            </Button>

            <!-- Dropdown Menu -->
            {#if userMenuOpen}
              <div class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                <a
                  href="/dashboard/profile"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </a>
                <a
                  href="/dashboard/settings"
                  class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </a>
                <hr class="my-1" />
                <button
                  type="button"
                  on:click={() => (logoutDialogOpen = true)}
                  class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut class="h-4 w-4" />
                  Logout
                </button>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <!-- Breadcrumbs -->
    {#if showBreadcrumbs}
      <div class="py-3">
        <Breadcrumbs />
      </div>
    {/if}
  </div>

  <!-- Mobile Search Bar -->
  {#if showMobileMenu}
    <div class="md:hidden border-t px-4 py-3">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
    </div>
  {/if}
</header>

<!-- Logout Confirmation Dialog -->
<Dialog bind:open={logoutDialogOpen}>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Confirm Logout</DialogTitle>
      <DialogDescription>
        Are you sure you want to logout? You'll need to sign in again to access your dashboard.
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

<!-- Mobile Menu Overlay -->
{#if mobileMenuOpen}
  <div class="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Mobile menu">
    <button
      type="button"
      class="fixed inset-0 bg-black bg-opacity-50"
      on:click={handleMobileMenuClick}
      aria-label="Close mobile menu"
    ></button>
    <div class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
      <div class="p-4">
        <h2 class="text-lg font-semibold mb-4">Menu</h2>
        <!-- Mobile menu items will be handled by the Sidebar component -->
      </div>
    </div>
  </div>
{/if}
