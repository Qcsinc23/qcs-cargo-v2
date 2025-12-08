<script lang="ts">
  import { page } from '$app/stores';
  import { cn } from '$lib/utils';
  import { Button } from '$lib/components/ui/button';
  import { slide } from 'svelte/transition';
  import { User } from 'lucide-svelte';

  export let open = false;
  export let navigation: { name: string; href: string }[] = [];
  export let user: { name?: string; email: string } | null = null;

  $: currentPath = $page.url.pathname;

  function handleNavClick() {
    open = false;
  }
</script>

{#if open}
  <div
    class="lg:hidden border-t"
    transition:slide={{ duration: 200 }}
  >
    <nav class="container py-4 space-y-2">
      {#each navigation as item}
        <a
          href={item.href}
          class={cn(
            'block px-4 py-2 rounded-md text-base font-medium transition-colors',
            currentPath === item.href
              ? 'bg-primary-50 text-primary-600'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}
          on:click={handleNavClick}
        >
          {item.name}
        </a>
      {/each}

      <div class="border-t pt-4 mt-4 space-y-2">
        {#if user}
          <a href="/dashboard" on:click={handleNavClick}>
            <Button variant="outline" class="w-full justify-start">
              <User class="h-4 w-4 mr-2" />
              Dashboard
            </Button>
          </a>
        {:else}
          <a href="/auth/login" on:click={handleNavClick}>
            <Button variant="outline" class="w-full">Login</Button>
          </a>
          <a href="/auth/register" on:click={handleNavClick}>
            <Button class="w-full">Get Started</Button>
          </a>
        {/if}
      </div>
    </nav>
  </div>
{/if}

