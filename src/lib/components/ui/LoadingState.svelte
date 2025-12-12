<script lang="ts">
  import LoadingSpinner from './LoadingSpinner.svelte';

  export let type: 'page' | 'card' | 'inline' | 'skeleton' = 'page';
  export let message: string = 'Loading...';
  export let size: 'sm' | 'md' | 'lg' = 'md';

  $: skeletonItems = type === 'card' ? 3 : type === 'page' ? 5 : 1;
</script>

{#if type === 'skeleton'}
  <div class="space-y-3">
    {#each Array(skeletonItems) as _, i}
      <div class="animate-pulse">
        <div class="h-4 bg-gray-200 rounded w-3/4" class:w-={i % 3 === 0 ? 'full' : i % 3 === 1 ? '5/6' : '4/6'}></div>
      </div>
    {/each}
  </div>
{:else if type === 'inline'}
  <div class="flex items-center gap-2">
    <LoadingSpinner {size} />
    <span class="text-sm text-gray-600">{message}</span>
  </div>
{:else if type === 'card'}
  <div class="flex flex-col items-center justify-center p-8 min-h-[200px]">
    <LoadingSpinner size="lg" />
    <p class="mt-4 text-sm text-gray-600">{message}</p>
  </div>
{:else}
  <div class="flex flex-col items-center justify-center min-h-screen">
    <div class="text-center">
      <LoadingSpinner size="lg" />
      <h2 class="sr-only">Loading content</h2>
      <p class="mt-4 text-lg text-gray-600">{message}</p>
    </div>
  </div>
{/if}