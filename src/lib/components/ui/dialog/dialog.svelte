<script lang="ts">
  import { Dialog as DialogPrimitive } from 'bits-ui';

  type $$Props = DialogPrimitive.RootProps;

  export let open: $$Props['open'] = undefined;
  export let onOpenChange: $$Props['onOpenChange'] = undefined;
</script>

<DialogPrimitive.Root bind:open {onOpenChange} {...$$restProps}>
  <slot />
</DialogPrimitive.Root>

