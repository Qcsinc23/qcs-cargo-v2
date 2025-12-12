<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createIntersectionObserver } from '$lib/utils/lazy-loading';
  import LoadingState from './LoadingState.svelte';
  import ErrorBoundary from './ErrorBoundary.svelte';

  export let loader: () => Promise<{ default: any }>;
  export let rootMargin: string = '50px';
  export let fallbackType: 'card' | 'inline' | 'skeleton' = 'card';
  export let errorType: 'default' | 'minimal' = 'default';

  let Component: any = null;
  let loading = true;
  let error: Error | null = null;
  let container: HTMLElement;
  let observer: IntersectionObserver | null = null;

  onMount(() => {
    if (container) {
      observer = createIntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadComponent();
              observer?.unobserve(entry.target);
            }
          });
        },
        { rootMargin }
      );

      if (observer) {
        observer.observe(container);
      }
    }
  });

  onDestroy(() => {
    if (observer) {
      observer.disconnect();
    }
  });

  async function loadComponent() {
    try {
      loading = true;
      error = null;
      const module = await loader();
      Component = module.default;
      loading = false;
    } catch (err) {
      error = err as Error;
      loading = false;
      Component = null;
    }
  }

  function handleRetry() {
    loadComponent();
  }
</script>

<div bind:this={container} class="lazy-wrapper">
  {#if Component}
    <ErrorBoundary fallback={errorType} reset={handleRetry}>
      <svelte:component this={Component} {...$$restProps} />
    </ErrorBoundary>
  {:else if loading}
    <LoadingState type={fallbackType} />
  {:else if error}
    <ErrorBoundary fallback={errorType} reset={handleRetry} />
  {/if}
</div>