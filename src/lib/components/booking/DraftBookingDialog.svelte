<script lang="ts">
  import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { booking, hasDraft } from '$lib/stores/booking';
  import { Clock, FileText, Trash2 } from 'lucide-svelte';
  import { onMount } from 'svelte';

  let open = false;
  let draftInfo: { step: number; serviceType: string | null; destination: string | null; lastUpdated: string } | null = null;

  onMount(() => {
    // Check for existing draft on mount
    const state = booking.getState();
    
    if ($hasDraft) {
      draftInfo = {
        step: state.step,
        serviceType: state.serviceType,
        destination: state.destination,
        lastUpdated: state.lastUpdated
      };
      open = true;
    }
  });

  function handleResume() {
    open = false;
    // Booking store already has the draft loaded
  }

  function handleStartFresh() {
    booking.reset();
    open = false;
  }

  function formatTimeAgo(isoString: string): string {
    const now = new Date();
    const then = new Date(isoString);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return then.toLocaleDateString();
  }

  function getStepName(step: number): string {
    const steps = ['', 'Service & Destination', 'Package Details', 'Recipient', 'Schedule', 'Review'];
    return steps[step] || 'Unknown';
  }
</script>

<Dialog bind:open>
  <DialogContent class="sm:max-w-md">
    <DialogHeader>
      <DialogTitle class="flex items-center gap-2">
        <FileText class="w-5 h-5 text-primary-600" />
        Draft Booking Found
      </DialogTitle>
      <DialogDescription>
        You have an incomplete booking from {draftInfo ? formatTimeAgo(draftInfo.lastUpdated) : 'earlier'}.
      </DialogDescription>
    </DialogHeader>

    {#if draftInfo}
      <div class="space-y-4">
        <Alert>
          <Clock class="w-4 h-4" />
          <AlertDescription>
            <div class="space-y-1 text-sm">
              <p><strong>Progress:</strong> {getStepName(draftInfo.step)} (Step {draftInfo.step}/5)</p>
              {#if draftInfo.serviceType}
                <p><strong>Service:</strong> {draftInfo.serviceType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              {/if}
              {#if draftInfo.destination}
                <p><strong>Destination:</strong> {draftInfo.destination}</p>
              {/if}
            </div>
          </AlertDescription>
        </Alert>

        <div class="text-sm text-muted-foreground">
          <p>Would you like to continue where you left off or start fresh?</p>
          <p class="mt-2 text-xs text-amber-600">
            💡 Drafts are automatically saved for 24 hours
          </p>
        </div>
      </div>
    {/if}

    <DialogFooter class="sm:justify-between">
      <Button
        variant="outline"
        on:click={handleStartFresh}
        class="gap-2"
      >
        <Trash2 class="w-4 h-4" />
        Start Fresh
      </Button>
      <Button
        on:click={handleResume}
        class="gap-2"
      >
        <FileText class="w-4 h-4" />
        Resume Draft
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

