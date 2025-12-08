<script lang="ts">
  import { cn } from '$lib/utils';
  import { alertVariants, type Variant } from '.';
  import type { HTMLAttributes } from 'svelte/elements';

  type $$Props = HTMLAttributes<HTMLDivElement> & {
    variant?: Variant;
  };

  let className: $$Props['class'] = undefined;
  export let variant: $$Props['variant'] = 'default';
  export { className as class };
</script>

<div class={cn(alertVariants({ variant }), className)} role="alert" {...$$restProps}>
  <slot />
</div>

