<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLAttributes } from 'svelte/elements';

  type $$Props = HTMLAttributes<HTMLHeadingElement> & {
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  };

  let className: $$Props['class'] = undefined;
  export let tag: $$Props['tag'] = 'h3';
  export { className as class };
</script>

<svelte:element
  this={tag}
  class={cn('text-2xl font-semibold leading-none tracking-tight', className)}
  {...$$restProps}
>
  <slot />
</svelte:element>

