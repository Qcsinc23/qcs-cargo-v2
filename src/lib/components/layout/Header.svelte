<script lang="ts">
  import { page } from '$app/stores';
  import { cn } from '$lib/utils';
  import { Button } from '$lib/components/ui/button';
  import { Menu, X, Phone, Package, User } from 'lucide-svelte';
  import MobileNav from './MobileNav.svelte';

  export let user: { name?: string; email: string } | null = null;

  let mobileMenuOpen = false;

  const navigation = [
    { name: 'Services', href: '/services' },
    { name: 'Get Quote', href: '/shipping-calculator' },
    { name: 'Track', href: '/tracking' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' }
  ];

  $: currentPath = $page.url.pathname;
</script>

<header class="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  <!-- Top bar with contact info -->
  <div class="hidden md:block border-b bg-primary-900 text-white">
    <div class="container flex h-8 items-center justify-between text-xs">
      <div class="flex items-center gap-4">
        <a href="tel:201-249-0929" class="flex items-center gap-1 hover:text-primary-200">
          <Phone class="h-3 w-3" />
          201-249-0929
        </a>
        <span>Mon-Fri: 9AM-6PM | Sat: 9AM-2PM</span>
      </div>
      <div class="flex items-center gap-2">
        <span>TSA Licensed Known Shipper</span>
        <span class="mx-2">|</span>
        <span>15+ Years Experience</span>
      </div>
    </div>
  </div>

  <!-- Main navigation -->
  <div class="container flex h-16 items-center justify-between">
    <div class="flex items-center gap-8">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2">
        <Package class="h-8 w-8 text-primary-600" />
        <span class="text-xl font-bold text-primary-800">QCS Cargo</span>
      </a>

      <!-- Desktop Navigation -->
      <nav class="hidden lg:flex items-center gap-6">
        {#each navigation as item}
          <a
            href={item.href}
            class={cn(
              'text-sm font-medium transition-colors hover:text-primary-600',
              currentPath === item.href
                ? 'text-primary-600'
                : 'text-muted-foreground'
            )}
          >
            {item.name}
          </a>
        {/each}
      </nav>
    </div>

    <!-- Right side actions -->
    <div class="flex items-center gap-4">
      {#if user}
        <a href="/dashboard" class="hidden sm:block">
          <Button variant="ghost" size="sm">
            <User class="h-4 w-4 mr-2" />
            Dashboard
          </Button>
        </a>
      {:else}
        <a href="/auth/login" class="hidden sm:block">
          <Button variant="ghost" size="sm">Login</Button>
        </a>
        <a href="/auth/register" class="hidden sm:block">
          <Button size="sm">Get Started</Button>
        </a>
      {/if}

      <!-- Mobile menu button -->
      <button
        type="button"
        class="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        on:click={() => (mobileMenuOpen = !mobileMenuOpen)}
        aria-expanded={mobileMenuOpen}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {#if mobileMenuOpen}
          <X class="h-6 w-6" />
        {:else}
          <Menu class="h-6 w-6" />
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Navigation -->
  <MobileNav bind:open={mobileMenuOpen} {navigation} {user} />
</header>

