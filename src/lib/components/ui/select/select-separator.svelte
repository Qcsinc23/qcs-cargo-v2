<script lang="ts">
  import { cn } from '$lib/utils';
  import type { HTMLAttributes } from 'svelte/elements';

  type $$Props = HTMLAttributes<HTMLDivElement>;

  let className: $$Props['class'] = undefined;
  export { className as class };
</script>

<div
  role="separator"
  class={cn('-mx-1 my-1 h-px bg-muted', className)}
  {...$$restProps}
></div>

