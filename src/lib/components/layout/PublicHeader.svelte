<script lang="ts">
  import { Logo } from '$lib/components/shared';
  import { Button } from '$lib/components/ui/button';
  import { Menu, X, User } from 'lucide-svelte';
  import { page } from '$app/stores';
  import type { AuthModel } from 'pocketbase';

  export let user: AuthModel | null = null;

  let mobileMenuOpen = false;

  const navLinks = [
    { href: '/shipping-calculator', label: 'Calculator' },
    { href: '/tracking', label: 'Track' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' }
  ];

  $: activePath = $page.url.pathname;
</script>

<header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
  <div class="container flex h-16 items-center justify-between">
    <a href="/" class="mr-6 flex items-center space-x-2">
      <Logo class="h-8 w-auto" />
    </a>
    <nav class="hidden items-center space-x-6 text-sm font-medium md:flex">
      {#each navLinks as link}
        <a
          href={link.href}
          class="transition-colors hover:text-gray-900 dark:hover:text-white {activePath === link.href
            ? 'text-gray-900 dark:text-white'
            : 'text-gray-700 dark:text-gray-200'}"
        >
          {link.label}
        </a>
      {/each}
    </nav>
    <div class="hidden items-center gap-4 md:flex">
      {#if user}
        <Button variant="ghost" href="/dashboard">
          <User class="mr-2 h-4 w-4" />
          Dashboard
        </Button>
      {:else}
        <Button variant="ghost" href="/auth/login">Login</Button>
        <Button href="/auth/register">Sign Up</Button>
      {/if}
    </div>
    <div class="md:hidden">
      <Button
        variant="ghost"
        size="icon"
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
    <div class="border-t md:hidden">
      <nav class="container flex flex-col space-y-4 py-4">
        {#each navLinks as link}
          <a
            href={link.href}
            class="text-lg font-medium transition-colors hover:text-gray-900 dark:hover:text-white {activePath === link.href
              ? 'text-gray-900 dark:text-white'
              : 'text-gray-700 dark:text-gray-200'}"
            on:click={() => (mobileMenuOpen = false)}
          >
            {link.label}
          </a>
        {/each}
        <div class="flex flex-col gap-4 pt-4">
          {#if user}
            <Button variant="outline" href="/dashboard" on:click={() => (mobileMenuOpen = false)}>
              Dashboard
            </Button>
          {:else}
            <Button variant="outline" href="/auth/login" on:click={() => (mobileMenuOpen = false)}>
              Login
            </Button>
            <Button href="/auth/register" on:click={() => (mobileMenuOpen = false)}>
              Sign Up
            </Button>
          {/if}
        </div>
      </nav>
    </div>
  {/if}
</header>
