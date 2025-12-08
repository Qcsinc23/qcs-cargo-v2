<script lang="ts">
  import { cn } from '$lib/utils';
  import { Button } from '$lib/components/ui/button';
  import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  export let currentPage: number = 1;
  export let totalPages: number = 1;
  export let totalItems: number = 0;
  export let itemsPerPage: number = 10;
  export let className: string = '';
  export let showInfo: boolean = true;

  const dispatch = createEventDispatcher<{
    pageChange: number;
  }>();

  $: startItem = (currentPage - 1) * itemsPerPage + 1;
  $: endItem = Math.min(currentPage * itemsPerPage, totalItems);

  $: visiblePages = getVisiblePages(currentPage, totalPages);

  function getVisiblePages(current: number, total: number): number[] {
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (current >= total - 2) {
      return [total - 4, total - 3, total - 2, total - 1, total];
    }

    return [current - 2, current - 1, current, current + 1, current + 2];
  }

  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      dispatch('pageChange', page);
    }
  }
</script>

<nav
  class={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}
  aria-label="Pagination"
>
  {#if showInfo}
    <p class="text-sm text-muted-foreground">
      Showing <span class="font-medium">{startItem}</span> to
      <span class="font-medium">{endItem}</span> of
      <span class="font-medium">{totalItems}</span> results
    </p>
  {/if}

  <div class="flex items-center gap-1">
    <Button
      variant="outline"
      size="icon"
      disabled={currentPage === 1}
      on:click={() => goToPage(1)}
      aria-label="Go to first page"
    >
      <ChevronsLeft class="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      disabled={currentPage === 1}
      on:click={() => goToPage(currentPage - 1)}
      aria-label="Go to previous page"
    >
      <ChevronLeft class="h-4 w-4" />
    </Button>

    {#each visiblePages as page}
      <Button
        variant={page === currentPage ? 'default' : 'outline'}
        size="icon"
        on:click={() => goToPage(page)}
        aria-label="Go to page {page}"
        aria-current={page === currentPage ? 'page' : undefined}
      >
        {page}
      </Button>
    {/each}

    <Button
      variant="outline"
      size="icon"
      disabled={currentPage === totalPages}
      on:click={() => goToPage(currentPage + 1)}
      aria-label="Go to next page"
    >
      <ChevronRight class="h-4 w-4" />
    </Button>
    <Button
      variant="outline"
      size="icon"
      disabled={currentPage === totalPages}
      on:click={() => goToPage(totalPages)}
      aria-label="Go to last page"
    >
      <ChevronsRight class="h-4 w-4" />
    </Button>
  </div>
</nav>

