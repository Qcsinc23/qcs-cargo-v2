<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { lazyLoadImage } from '$lib/utils/lazy-loading';
  import { lazyLoadPerformance } from '$lib/performance';

  export let src: string;
  export let alt: string = '';
  export let width: number | string = 'auto';
  export let height: number | string = 'auto';
  export let className: string = '';
  export { className as class };
  export let placeholder: string = '';
  export let fadeIn: boolean = true;

  let imgElement: HTMLImageElement;
  let isLoaded = false;
  let isError = false;
  let observer: IntersectionObserver | null = null;

  onMount(() => {
    if (imgElement) {
      // Use placeholder as initial src if provided
      if (placeholder && !isLoaded) {
        imgElement.src = placeholder;
      }

      // Lazy load the actual image
      observer = lazyLoadImage(imgElement, src);

      // Handle load and error events
      imgElement.addEventListener('load', handleLoad);
      imgElement.addEventListener('error', handleError);
    }
  });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
    if (imgElement) {
      imgElement.removeEventListener('load', handleLoad);
      imgElement.removeEventListener('error', handleError);
    }
  });

  function handleLoad() {
    isLoaded = true;
    isError = false;
  }

  function handleError() {
    isLoaded = false;
    isError = true;
  }
</script>

<div class={`relative overflow-hidden ${className}`}>
  <img
    bind:this={imgElement}
    {alt}
    {width}
    {height}
    class={`w-full h-full object-cover ${fadeIn ? 'transition-opacity duration-300' : ''} ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
    loading="lazy"
    use:lazyLoadPerformance={{
      type: 'image',
      options: {
        rootMargin: '50px',
        threshold: 0.1
      }
    }}
  />

  {#if !isLoaded && !isError && placeholder}
    <div class="absolute inset-0 bg-gray-200 animate-pulse" />
  {/if}

  {#if isError}
    <div class="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-500">
      <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  {/if}
</div>