<script lang="ts">
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  onMount(() => {
    goto('/legal/terms', { replaceState: true });
  });
</script>

<svelte:head>
  <title>Legal | QCS Cargo</title>
</svelte:head>

<main class="min-h-screen bg-background text-foreground">
  <div class="container mx-auto px-4 py-20 sm:py-28 text-center">
    <p class="text-sm text-muted-foreground/75 tracking-wide">Redirecting to Terms of Service...</p>
  </div>
</main>

