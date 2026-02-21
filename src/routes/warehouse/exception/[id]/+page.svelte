<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { toast } from '$lib/stores/toast';
  import {
    ArrowLeft, AlertTriangle, Package, Scale, Camera, Ban,
    HelpCircle, Clock, CheckCircle, Loader2, User, MapPin
  } from 'lucide-svelte';

  $: exceptionId = $page.params.id;

  interface ExceptionDetail {
    id: string;
    tracking_number: string;
    exception_type: string;
    exception_severity: 'minor' | 'major' | 'reject';
    exception_description: string;
    exception_photos: string[];
    exception_resolved_at?: string;
    status: string;
    booking?: {
      id: string;
      customer_name: string;
      destination: string;
    };
    created: string;
    updated: string;
  }

  let exception: ExceptionDetail | null = null;
  let loading = true;
  let resolving = false;
  let resolutionNote = '';

  const EXCEPTION_LABELS: Record<string, string> = {
    damage: 'Package Damaged',
    wrong_weight: 'Weight Discrepancy',
    prohibited_item: 'Prohibited Item',
    incomplete_info: 'Missing Information',
    other: 'Other Issue'
  };

  const SEVERITY_COLORS = {
    minor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    major: 'bg-orange-100 text-orange-800 border-orange-200',
    reject: 'bg-red-100 text-red-800 border-red-200'
  };

  onMount(async () => {
    try {
      const res = await fetch(`/api/warehouse/exceptions/${exceptionId}`);
      if (!res.ok) {
        toast.error('Exception not found');
        goto('/warehouse');
        return;
      }
      exception = await res.json();
    } catch (err) {
      toast.error('Failed to load exception');
      goto('/warehouse');
    } finally {
      loading = false;
    }
  });

  async function resolveException() {
    if (!exception) return;
    resolving = true;
    try {
      const res = await fetch(`/api/warehouse/exceptions/${exceptionId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: resolutionNote })
      });
      if (!res.ok) throw new Error('Failed to resolve');
      toast.success('Exception marked as resolved');
      goto('/warehouse/exceptions');
    } catch {
      toast.error('Failed to resolve exception');
    } finally {
      resolving = false;
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
</script>

<svelte:head>
  <title>Exception Detail | Warehouse | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center gap-3">
    <Button variant="ghost" size="sm" href="/warehouse/exceptions">
      <ArrowLeft class="w-4 h-4 mr-1" />
      All Exceptions
    </Button>
  </div>

  {#if loading}
    <div class="flex items-center justify-center h-48">
      <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
    </div>
  {:else if exception}
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Exception Report</h1>
        <p class="text-gray-500 font-mono mt-1">{exception.tracking_number}</p>
      </div>
      <span class="self-start inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium {SEVERITY_COLORS[exception.exception_severity] || ''}">
        <AlertTriangle class="w-4 h-4" />
        {exception.exception_severity?.toUpperCase()} — {EXCEPTION_LABELS[exception.exception_type] || exception.exception_type}
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main detail -->
      <div class="lg:col-span-2 space-y-4">
        <Card>
          <div class="p-4 border-b bg-gray-50">
            <h2 class="font-semibold text-gray-900">Exception Details</h2>
          </div>
          <CardContent class="p-4 space-y-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p class="text-gray-500">Type</p>
                <p class="font-medium text-gray-900 mt-0.5">{EXCEPTION_LABELS[exception.exception_type] || exception.exception_type}</p>
              </div>
              <div>
                <p class="text-gray-500">Severity</p>
                <p class="font-medium capitalize mt-0.5">{exception.exception_severity}</p>
              </div>
              <div>
                <p class="text-gray-500">Reported</p>
                <p class="font-medium mt-0.5">{formatDate(exception.created)}</p>
              </div>
              <div>
                <p class="text-gray-500">Package Status</p>
                <p class="font-medium capitalize mt-0.5">{exception.status.replace('_', ' ')}</p>
              </div>
            </div>

            <div>
              <p class="text-gray-500 text-sm mb-1">Description</p>
              <p class="text-gray-900 bg-gray-50 rounded-lg p-3 text-sm">{exception.exception_description}</p>
            </div>

            {#if exception.exception_photos?.length > 0}
              <div>
                <p class="text-gray-500 text-sm mb-2">Photos ({exception.exception_photos.length})</p>
                <div class="grid grid-cols-3 gap-2">
                  {#each exception.exception_photos as photo, i}
                    <a href={photo} target="_blank" rel="noopener">
                      <img src={photo} alt="Exception photo {i+1}" class="rounded-lg aspect-square object-cover hover:opacity-90 transition-opacity" />
                    </a>
                  {/each}
                </div>
              </div>
            {/if}
          </CardContent>
        </Card>

        <!-- Resolution -->
        {#if !exception.exception_resolved_at}
          <Card>
            <div class="p-4 border-b bg-gray-50">
              <h2 class="font-semibold text-gray-900">Resolve Exception</h2>
            </div>
            <CardContent class="p-4 space-y-4">
              <div>
                <label for="resolution-note" class="text-sm font-medium text-gray-700 block mb-2">Resolution Note</label>
                <textarea
                  id="resolution-note"
                  bind:value={resolutionNote}
                  rows={3}
                  placeholder="Describe how the exception was resolved..."
                  class="w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                ></textarea>
              </div>
              <Button on:click={resolveException} disabled={resolving} class="w-full">
                {#if resolving}
                  <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                {:else}
                  <CheckCircle class="w-4 h-4 mr-2" />
                {/if}
                Mark as Resolved
              </Button>
            </CardContent>
          </Card>
        {:else}
          <Card class="border-green-200">
            <CardContent class="p-4 flex items-center gap-3">
              <CheckCircle class="w-6 h-6 text-green-500 flex-shrink-0" />
              <div>
                <p class="font-medium text-green-800">Exception Resolved</p>
                <p class="text-sm text-green-600">{formatDate(exception.exception_resolved_at)}</p>
              </div>
            </CardContent>
          </Card>
        {/if}
      </div>

      <!-- Sidebar -->
      <div class="space-y-4">
        {#if exception.booking}
          <Card>
            <div class="p-4 border-b bg-gray-50">
              <h2 class="font-semibold text-gray-900 text-sm">Package Info</h2>
            </div>
            <CardContent class="p-4 space-y-3">
              <div class="flex items-center gap-2 text-sm">
                <User class="w-4 h-4 text-gray-400" />
                <span>{exception.booking.customer_name}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <MapPin class="w-4 h-4 text-gray-400" />
                <span class="capitalize">{exception.booking.destination}</span>
              </div>
              <Button variant="outline" size="sm" class="w-full" href="/admin/bookings/{exception.booking.id}">
                View Booking
              </Button>
            </CardContent>
          </Card>
        {/if}

        <Card>
          <div class="p-4 border-b bg-gray-50">
            <h2 class="font-semibold text-gray-900 text-sm">Quick Actions</h2>
          </div>
          <CardContent class="p-4 space-y-2">
            <Button variant="outline" size="sm" class="w-full" href="/warehouse/receiving?scan={exception.tracking_number}">
              <Package class="w-4 h-4 mr-2" />
              Re-process Package
            </Button>
            <Button variant="outline" size="sm" class="w-full text-red-600 border-red-200 hover:bg-red-50" href="/warehouse/exceptions">
              <ArrowLeft class="w-4 h-4 mr-2" />
              Back to Exceptions
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  {/if}
</div>
