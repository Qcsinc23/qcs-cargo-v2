<script lang="ts">
  import { Logo } from '$lib/components/shared';
  import { Button } from '$lib/components/ui/button';
  import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
  import { auth } from '$lib/stores/auth';
  import { Menu, X, User, LogOut } from 'lucide-svelte';
  import { page } from '$app/stores';
  import type { AuthModel } from 'pocketbase';

  export let user: AuthModel | null = null;

  let mobileMenuOpen = false;
  let logoutDialogOpen = false;

  const navLinks = [
    { href: '/services', label: 'Services' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/track', label: 'Track' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' }
  ];

  $: activePath = $page.url.pathname;

  async function handleLogout() {
    logoutDialogOpen = false;
    mobileMenuOpen = false;
    // Kinde handles logout via API route
    window.location.href = '/api/auth/logout';
  }
</script>

<header class="sticky top-0 z-40 w-full border-b border-border/40 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
  <div class="container flex h-16 items-center justify-between">
    <a href="/" class="mr-6 flex items-center space-x-2">
      <Logo class="h-8 w-auto" />
    </a>
    <nav class="hidden items-center space-x-7 text-xs font-medium uppercase tracking-[0.28em] md:flex">
      {#each navLinks as link}
        <a
          href={link.href}
          class="transition-colors hover:text-[#023E8A] {activePath === link.href
            ? 'text-[#001D3D]'
            : 'text-[#001D3D]/70'}"
        >
          {link.label}
        </a>
      {/each}
    </nav>
    <div class="hidden items-center gap-4 md:flex">
      {#if user}
        <span class="text-sm text-[#001D3D]/70">Welcome, {user.name || user.email}</span>
        <Button
          variant="ghost"
          href="/dashboard"
          class="uppercase tracking-[0.24em] text-xs hover:bg-black/5 hover:text-[#001D3D]"
        >
          <User class="mr-2 h-4 w-4" />
          Dashboard
        </Button>
        <Button
          variant="outline"
          class="border-[#0077B6]/25 bg-transparent hover:bg-black/5 hover:text-[#001D3D] uppercase tracking-[0.24em] text-xs"
          on:click={() => (logoutDialogOpen = true)}
        >
          <LogOut class="mr-2 h-4 w-4" />
          Logout
        </Button>
      {:else}
        <Button
          variant="ghost"
          href="/api/auth/login"
          class="uppercase tracking-[0.28em] text-xs hover:bg-black/5 hover:text-[#001D3D]"
        >
          Login
        </Button>
        <Button
          variant="outline"
          href="/api/auth/register"
          class="border border-[#0077B6]/25 bg-transparent text-[#001D3D] hover:bg-black/5 hover:text-[#001D3D] uppercase tracking-[0.28em] text-xs"
        >
          Sign Up
        </Button>
      {/if}
    </div>
    <div class="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        class="hover:bg-black/5"
        on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
      >
        {#if mobileMenuOpen}
          <X class="h-6 w-6" />
        {:else}
          <Menu class="h-6 w-6" />
        {/if}
        <span class="sr-only">Toggle Menu</span>
      </Button>
    </div>
  </div>

  {#if mobileMenuOpen}
    <div class="border-t border-border/30 md:hidden">
      <nav class="container flex flex-col space-y-5 py-6">
        {#each navLinks as link}
          <a
            href={link.href}
            class="text-sm font-medium uppercase tracking-[0.28em] transition-colors hover:text-[#023E8A] {activePath === link.href
              ? 'text-[#001D3D]'
              : 'text-[#001D3D]/70'}"
            on:click={() => (mobileMenuOpen = false)}
          >
            {link.label}
          </a>
        {/each}
        <div class="flex flex-col gap-4 pt-4">
          {#if user}
            <div class="px-3 py-2 text-sm text-[#001D3D]/70">
              Welcome, {user.name || user.email}
            </div>
            <Button
              variant="outline"
              class="border-[#0077B6]/25 bg-transparent hover:bg-black/5 hover:text-[#001D3D] uppercase tracking-[0.28em] text-xs"
              href="/dashboard"
              on:click={() => (mobileMenuOpen = false)}
            >
              Dashboard
            </Button>
            <Button
              variant="outline"
              class="border-[#0077B6]/25 bg-transparent hover:bg-black/5 hover:text-[#001D3D] uppercase tracking-[0.28em] text-xs"
              on:click={() => (logoutDialogOpen = true)}
            >
              <LogOut class="mr-2 h-4 w-4" />
              Logout
            </Button>
          {:else}
            <Button
              variant="outline"
              class="border-[#0077B6]/25 bg-transparent hover:bg-black/5 hover:text-[#001D3D] uppercase tracking-[0.28em] text-xs"
              href="/api/auth/login"
              on:click={() => (mobileMenuOpen = false)}
            >
              Login
            </Button>
            <Button
              variant="outline"
              class="border border-[#0077B6]/25 bg-transparent text-[#001D3D] hover:bg-black/5 hover:text-[#001D3D] uppercase tracking-[0.28em] text-xs"
              href="/api/auth/register"
              on:click={() => (mobileMenuOpen = false)}
            >
              Sign Up
            </Button>
          {/if}
        </div>
      </nav>
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
