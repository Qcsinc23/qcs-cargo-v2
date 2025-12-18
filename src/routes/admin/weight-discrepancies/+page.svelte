<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { 
    Scale, 
    AlertTriangle, 
    Check, 
    X, 
    RefreshCw,
    Mail,
    Clock,
    DollarSign,
    User,
    Package
  } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';
  import { formatCurrency } from '$lib/utils/format';
  import { cn } from '$lib/utils';

  interface WeightDiscrepancy {
    id: string;
    trackingNumber: string;
    customerName: string;
    customerEmail: string;
    estimatedWeight: number;
    actualWeight: number;
    weightDifference: number;
    additionalCost: number;
    status: string;
    createdAt: string;
  }

  let discrepancies: WeightDiscrepancy[] = [];
  let isLoading = false;
  let processingId: string | null = null;

  onMount(() => {
    loadDiscrepancies();
  });

  async function loadDiscrepancies() {
    isLoading = true;
    try {
      const response = await fetch('/api/admin/packages/weight-discrepancy');
      if (response.ok) {
        const result = await response.json();
        if (result.status === 'success') {
          discrepancies = result.data.items || [];
        }
      }
    } catch (error) {
      console.error('Error loading discrepancies:', error);
      toast.error('Failed to load weight discrepancies');
    } finally {
      isLoading = false;
    }
  }

  async function handleApprove(discrepancy: WeightDiscrepancy) {
    processingId = discrepancy.id;
    try {
      const response = await fetch('/api/admin/packages/weight-discrepancy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          bookingId: discrepancy.id,
          trackingNumber: discrepancy.trackingNumber,
          actualWeight: discrepancy.actualWeight,
          additionalCost: discrepancy.additionalCost
        })
      });

      if (response.ok) {
        toast.success('Weight adjustment approved');
        await loadDiscrepancies();
      } else {
        toast.error('Failed to approve weight adjustment');
      }
    } catch (error) {
      console.error('Error approving:', error);
      toast.error('Failed to approve weight adjustment');
    } finally {
      processingId = null;
    }
  }

  async function handleReject(discrepancy: WeightDiscrepancy) {
    processingId = discrepancy.id;
    try {
      const response = await fetch('/api/admin/packages/weight-discrepancy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          bookingId: discrepancy.id,
          trackingNumber: discrepancy.trackingNumber,
          notes: 'Rejected by admin'
        })
      });

      if (response.ok) {
        toast.success('Weight adjustment rejected');
        await loadDiscrepancies();
      } else {
        toast.error('Failed to reject weight adjustment');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      toast.error('Failed to reject weight adjustment');
    } finally {
      processingId = null;
    }
  }

  async function handleResendNotification(discrepancy: WeightDiscrepancy) {
    processingId = discrepancy.id;
    try {
      // In production, this would resend the notification email
      toast.info(`Notification resent to ${discrepancy.customerEmail}`);
    } finally {
      processingId = null;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'weight_hold':
        return { color: 'bg-amber-100 text-amber-700', label: 'Pending Customer' };
      case 'weight_disputed':
        return { color: 'bg-red-100 text-red-700', label: 'Disputed' };
      case 'confirmed':
        return { color: 'bg-green-100 text-green-700', label: 'Resolved' };
      default:
        return { color: 'bg-gray-100 text-gray-700', label: status };
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  $: pendingCount = discrepancies.filter(d => d.status === 'weight_hold').length;
  $: disputedCount = discrepancies.filter(d => d.status === 'weight_disputed').length;
</script>

<svelte:head>
  <title>Weight Discrepancies | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Weight Discrepancies</h1>
      <p class="text-slate-500">Review and resolve weight differences from receiving</p>
    </div>
    <Button variant="outline" on:click={loadDiscrepancies} disabled={isLoading}>
      <RefreshCw class="h-4 w-4 mr-2 {isLoading ? 'animate-spin' : ''}" />
      Refresh
    </Button>
  </div>

  <!-- Stats -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <Card class="p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
          <Clock class="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <p class="text-sm text-slate-500">Pending</p>
          <p class="text-2xl font-bold">{pendingCount}</p>
        </div>
      </div>
    </Card>
    <Card class="p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <AlertTriangle class="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p class="text-sm text-slate-500">Disputed</p>
          <p class="text-2xl font-bold">{disputedCount}</p>
        </div>
      </div>
    </Card>
    <Card class="p-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
          <Scale class="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <p class="text-sm text-slate-500">Total Cases</p>
          <p class="text-2xl font-bold">{discrepancies.length}</p>
        </div>
      </div>
    </Card>
  </div>

  <!-- Discrepancy List -->
  {#if isLoading}
    <Card class="p-8">
      <div class="flex items-center justify-center gap-3 text-slate-500">
        <RefreshCw class="w-5 h-5 animate-spin" />
        <span>Loading discrepancies...</span>
      </div>
    </Card>
  {:else if discrepancies.length === 0}
    <Card class="p-8">
      <div class="text-center text-slate-500">
        <Scale class="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <h3 class="font-medium mb-1">No Weight Discrepancies</h3>
        <p class="text-sm">All packages have been weighed and verified.</p>
      </div>
    </Card>
  {:else}
    <div class="space-y-4">
      {#each discrepancies as discrepancy (discrepancy.id)}
        {@const badge = getStatusBadge(discrepancy.status)}
        <Card class="p-4 {discrepancy.status === 'weight_disputed' ? 'border-red-200 bg-red-50/50' : ''}">
          <div class="flex flex-col lg:flex-row lg:items-center gap-4">
            <!-- Package Info -->
            <div class="flex items-start gap-3 lg:w-1/4">
              <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Package class="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p class="font-medium text-slate-900">{discrepancy.trackingNumber}</p>
                <p class="text-sm text-slate-500">{formatDate(discrepancy.createdAt)}</p>
              </div>
            </div>

            <!-- Customer Info -->
            <div class="lg:w-1/5">
              <div class="flex items-center gap-2 text-sm text-slate-500">
                <User class="w-4 h-4" />
                <span>{discrepancy.customerName}</span>
              </div>
              <p class="text-xs text-slate-400 truncate">{discrepancy.customerEmail}</p>
            </div>

            <!-- Weight Comparison -->
            <div class="lg:w-1/4 flex items-center gap-4">
              <div class="text-center">
                <p class="text-xs text-slate-500">Estimated</p>
                <p class="font-medium">{discrepancy.estimatedWeight} lbs</p>
              </div>
              <div class="text-slate-300">→</div>
              <div class="text-center">
                <p class="text-xs text-blue-600">Actual</p>
                <p class="font-medium text-blue-700">{discrepancy.actualWeight} lbs</p>
              </div>
              <div class="text-center">
                <p class="text-xs text-amber-600">Diff</p>
                <p class="font-medium text-amber-700">
                  {discrepancy.weightDifference > 0 ? '+' : ''}{discrepancy.weightDifference.toFixed(1)} lbs
                </p>
              </div>
            </div>

            <!-- Cost & Status -->
            <div class="lg:w-1/6 flex items-center gap-3">
              {#if discrepancy.additionalCost > 0}
                <div class="flex items-center gap-1 text-amber-700">
                  <DollarSign class="w-4 h-4" />
                  <span class="font-medium">{formatCurrency(discrepancy.additionalCost)}</span>
                </div>
              {/if}
              <span class={cn('px-2 py-1 rounded-full text-xs font-medium', badge.color)}>
                {badge.label}
              </span>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-2 lg:ml-auto">
              {#if discrepancy.status === 'weight_hold'}
                <Button 
                  size="sm" 
                  variant="outline"
                  on:click={() => handleResendNotification(discrepancy)}
                  disabled={processingId === discrepancy.id}
                >
                  <Mail class="w-4 h-4 mr-1" />
                  Resend
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  on:click={() => handleReject(discrepancy)}
                  disabled={processingId === discrepancy.id}
                >
                  <X class="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  size="sm"
                  on:click={() => handleApprove(discrepancy)}
                  disabled={processingId === discrepancy.id}
                >
                  {#if processingId === discrepancy.id}
                    <RefreshCw class="w-4 h-4 mr-1 animate-spin" />
                  {:else}
                    <Check class="w-4 h-4 mr-1" />
                  {/if}
                  Approve
                </Button>
              {:else if discrepancy.status === 'weight_disputed'}
                <Button 
                  size="sm"
                  on:click={() => handleApprove(discrepancy)}
                  disabled={processingId === discrepancy.id}
                >
                  Force Approve
                </Button>
              {:else}
                <span class="text-sm text-slate-500">Resolved</span>
              {/if}
            </div>
          </div>
        </Card>
      {/each}
    </div>
  {/if}

  <!-- Info -->
  <Alert>
    <Scale class="w-4 h-4" />
    <AlertDescription>
      Packages with weight differences greater than 10% are automatically held for customer approval.
      Customers receive an email with the updated cost and can approve or dispute the change.
    </AlertDescription>
  </Alert>
</div>


