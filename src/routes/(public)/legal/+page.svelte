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

<div class="text-center py-12">
  <p class="text-slate-500">Redirecting to Terms of Service...</p>
</div>

