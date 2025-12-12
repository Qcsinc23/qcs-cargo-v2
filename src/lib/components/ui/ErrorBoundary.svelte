<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';
  import { AlertCircle, RefreshCw } from 'lucide-svelte';

  export let fallback: 'default' | 'minimal' = 'default';
  export let reset: () => void = () => {};

  let hasError = false;
  let error: Error | null = null;
  let errorInfo: string = '';

  const dispatch = createEventDispatcher();

  // Error handling
  const handleError = (event: ErrorEvent) => {
    hasError = true;
    error = event.error || new Error(event.message);
    errorInfo = event.error?.stack || '';
    console.error('[ErrorBoundary]', error);
    dispatch('error', { error, errorInfo });
  };

  const handlePromiseRejection = (event: PromiseRejectionEvent) => {
    hasError = true;
    error = new Error(event.reason);
    errorInfo = 'Unhandled promise rejection';
    console.error('[ErrorBoundary]', error);
    dispatch('error', { error, errorInfo });
  };

  onMount(() => {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handlePromiseRejection);
  });

  function handleReset() {
    hasError = false;
    error = null;
    errorInfo = '';
    reset();
  }

  onDestroy(() => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handlePromiseRejection);
  });
</script>

{#if hasError}
  {#if fallback === 'minimal'}
    <div class="p-4 text-center">
      <p class="text-sm text-gray-500">Something went wrong</p>
      <button
        on:click={handleReset}
        class="mt-2 text-sm text-primary-600 hover:text-primary-700"
        type="button"
      >
        Try again
      </button>
    </div>
  {:else}
    <div class="min-h-[200px] flex items-center justify-center p-4">
      <div class="text-center max-w-md">
        <AlertCircle class="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 class="text-lg font-semibold text-gray-900 mb-2">Oops, something went wrong</h2>
        <p class="text-sm text-gray-600 mb-4">
          We're sorry for the inconvenience. Please try again or contact support if the problem persists.
        </p>
        <button
          on:click={handleReset}
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          type="button"
        >
          <RefreshCw class="w-4 h-4" />
          Try again
        </button>
        {#if import.meta.env.DEV && error}
          <details class="mt-4 text-left">
            <summary class="cursor-pointer text-xs text-gray-500">Error details</summary>
            <pre class="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">{error.message}</pre>
            {#if errorInfo}
              <pre class="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">{errorInfo}</pre>
            {/if}
          </details>
        {/if}
      </div>
    </div>
  {/if}
{:else}
  <slot />
{/if}