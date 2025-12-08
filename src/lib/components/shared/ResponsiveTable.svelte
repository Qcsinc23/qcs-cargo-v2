<script lang="ts">
  import { cn } from '$lib/utils';

  type Column<T> = {
    key: keyof T | string;
    label: string;
    class?: string;
    render?: (value: unknown, row: T) => string;
  };

  type T = $$Generic;

  export let columns: Column<T>[];
  export let data: T[];
  export let className: string = '';
  export let emptyMessage: string = 'No data available';

  function getValue(row: T, key: string): unknown {
    const keys = key.split('.');
    let value: unknown = row;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  }
</script>

<!-- Desktop Table -->
<div class={cn('hidden md:block overflow-x-auto', className)}>
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b">
        {#each columns as column}
          <th class={cn('text-left py-3 px-4 font-medium text-muted-foreground', column.class)}>
            {column.label}
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#if data.length === 0}
        <tr>
          <td colspan={columns.length} class="py-8 text-center text-muted-foreground">
            {emptyMessage}
          </td>
        </tr>
      {:else}
        {#each data as row}
          <tr class="border-b hover:bg-muted/50 transition-colors">
            {#each columns as column}
              <td class={cn('py-3 px-4', column.class)}>
                {#if column.render}
                  {@html column.render(getValue(row, String(column.key)), row)}
                {:else}
                  {getValue(row, String(column.key)) ?? '-'}
                {/if}
              </td>
            {/each}
          </tr>
        {/each}
      {/if}
    </tbody>
  </table>
</div>

<!-- Mobile Cards -->
<div class={cn('md:hidden space-y-4', className)}>
  {#if data.length === 0}
    <div class="py-8 text-center text-muted-foreground">
      {emptyMessage}
    </div>
  {:else}
    {#each data as row}
      <div class="rounded-lg border bg-card p-4 space-y-3">
        {#each columns as column}
          <div class="flex justify-between items-start gap-2">
            <span class="text-sm text-muted-foreground">{column.label}</span>
            <span class="text-sm font-medium text-right">
              {#if column.render}
                {@html column.render(getValue(row, String(column.key)), row)}
              {:else}
                {getValue(row, String(column.key)) ?? '-'}
              {/if}
            </span>
          </div>
        {/each}
        <slot name="row-actions" {row} />
      </div>
    {/each}
  {/if}
</div>

