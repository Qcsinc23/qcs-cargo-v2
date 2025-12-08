<script lang="ts">
  import * as Dialog from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { AlertTriangle } from 'lucide-svelte';
  import { createEventDispatcher } from 'svelte';

  export let open: boolean = false;
  export let title: string = 'Are you sure?';
  export let description: string = 'This action cannot be undone.';
  export let confirmText: string = 'Confirm';
  export let cancelText: string = 'Cancel';
  export let variant: 'default' | 'destructive' = 'default';
  export let loading: boolean = false;

  const dispatch = createEventDispatcher<{
    confirm: void;
    cancel: void;
  }>();

  function handleConfirm() {
    dispatch('confirm');
  }

  function handleCancel() {
    open = false;
    dispatch('cancel');
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="sm:max-w-md">
    <Dialog.Header>
      <div class="flex items-center gap-4">
        {#if variant === 'destructive'}
          <div class="rounded-full bg-destructive/10 p-2">
            <AlertTriangle class="h-5 w-5 text-destructive" />
          </div>
        {/if}
        <div>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description>{description}</Dialog.Description>
        </div>
      </div>
    </Dialog.Header>
    <Dialog.Footer class="mt-4">
      <Button variant="outline" on:click={handleCancel} disabled={loading}>
        {cancelText}
      </Button>
      <Button
        variant={variant === 'destructive' ? 'destructive' : 'default'}
        on:click={handleConfirm}
        disabled={loading}
      >
        {#if loading}
          <span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        {/if}
        {confirmText}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

