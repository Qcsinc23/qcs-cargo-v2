<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import {
    Search,
    Filter,
    Download,
    Plus,
    MoreHorizontal,
    Eye,
    Edit,
    Printer,
    CheckCircle2,
    XCircle,
    Package,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    RefreshCw,
    MessageSquare,
    Camera
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { STATUS_COLORS, STATUS_LABELS } from '$lib/config/constants';
  import { goto } from '$app/navigation';

  // Filter state
  let searchQuery = '';
  let statusFilter = 'all';
  let destinationFilter = 'all';
  let currentPage = 1;
  const perPage = 10;

  // Data state
  let shipments: any[] = [];
  let totalItems = 0;
  let totalPages = 1;
  let loading = true;

  const destinations = ['Guyana', 'Trinidad', 'Jamaica', 'Barbados', 'Suriname'];
  const statuses = Object.keys(STATUS_LABELS);

  // Selected shipments for bulk actions
  let selectedIds: string[] = [];
  $: allSelected = selectedIds.length === shipments.length && shipments.length > 0;

  async function loadShipments() {
    loading = true;
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        destination: destinationFilter,
        page: currentPage.toString(),
        perPage: perPage.toString()
      });

      const response = await fetch(`/api/admin/shipments?${params}`);
      if (response.ok) {
        const data = await response.json();
        shipments = data.shipments;
        totalItems = data.totalItems;
        totalPages = data.totalPages;
      }
    } catch (error) {
      console.error('Failed to load shipments:', error);
    } finally {
      loading = false;
    }
  }

  function toggleAll() {
    if (allSelected) {
      selectedIds = [];
    } else {
      selectedIds = shipments.map(s => s.id);
    }
  }

  function toggleOne(id: string) {
    if (selectedIds.includes(id)) {
      selectedIds = selectedIds.filter(i => i !== id);
    } else {
      selectedIds = [...selectedIds, id];
    }
  }

  async function exportCSV() {
    const headers = ['Tracking #', 'Customer', 'Destination', 'Weight (lbs)', 'Packages', 'Status', 'Created', 'Amount'];
    const rows = shipments.map(s => [
      s.id, s.customer, s.destination, s.weight || 0, s.packages || 0,
      STATUS_LABELS[s.status] || s.status, new Date(s.created).toLocaleDateString(), `$${s.amount?.toFixed(2) || '0.00'}`
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }

  async function updateShipmentStatus(shipmentId: string, status: string, note?: string) {
    try {
      const response = await fetch('/api/admin/shipments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shipmentId, status, note })
      });

      if (response.ok) {
        await loadShipments();
      }
    } catch (error) {
      console.error('Failed to update shipment status:', error);
    }
  }

  async function bulkUpdateStatus(status: string) {
    if (!confirm(`Update ${selectedIds.length} shipments to ${STATUS_LABELS[status]}?`)) return;

    try {
      await Promise.all(
        selectedIds.map(id => updateShipmentStatus(id, status))
      );
      selectedIds = [];
    } catch (error) {
      console.error('Failed to bulk update shipments:', error);
    }
  }

  async function printLabels() {
    // This would integrate with a label printing service
    alert(`Preparing labels for ${selectedIds.length} shipments...`);
  }

  // Load data when filters change
  $: if (currentPage, searchQuery, statusFilter, destinationFilter) {
    loadShipments();
  }

  onMount(() => {
    loadShipments();
  });
</script>

<svelte:head>
  <title>Shipments | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Shipments</h1>
      <p class="text-slate-500">Manage all shipments and update statuses</p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="outline" size="sm" on:click={loadShipments} disabled={loading}>
        <RefreshCw class={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
        Refresh
      </Button>
      <Button variant="outline" size="sm" on:click={exportCSV} disabled={shipments.length === 0}>
        <Download class="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <Button size="sm" href="/admin/shipments/new">
        <Plus class="h-4 w-4 mr-2" />
        New Shipment
      </Button>
    </div>
  </div>

  <!-- Filters -->
  <Card class="p-4">
    <div class="flex flex-col lg:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by tracking # or customer..."
            class="pl-10"
            bind:value={searchQuery}
          />
        </div>
      </div>
      <div class="flex flex-wrap gap-3">
        <select
          class="px-3 py-2 border rounded-md text-sm bg-white"
          bind:value={statusFilter}
        >
          <option value="all">All Statuses</option>
          {#each statuses as status}
            <option value={status}>{STATUS_LABELS[status]}</option>
          {/each}
        </select>
        <select
          class="px-3 py-2 border rounded-md text-sm bg-white"
          bind:value={destinationFilter}
        >
          <option value="all">All Destinations</option>
          {#each destinations as dest}
            <option value={dest}>{dest}</option>
          {/each}
        </select>
      </div>
    </div>
  </Card>

  <!-- Bulk Actions -->
  {#if selectedIds.length > 0}
    <Card class="p-4 bg-blue-50 border-blue-200">
      <div class="flex items-center justify-between">
        <p class="text-sm text-blue-700">
          <strong>{selectedIds.length}</strong> shipment{selectedIds.length > 1 ? 's' : ''} selected
        </p>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" on:click={printLabels}>
            <Printer class="h-4 w-4 mr-2" />
            Print Labels
          </Button>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              {#snippet child({ props })}
                <button
                  {...props}
                  type="button"
                  class="inline-flex items-center justify-center h-9 rounded-md px-3 text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Update Status
                </button>
              {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              {#each statuses as status}
                <DropdownMenu.Item onSelect={() => bulkUpdateStatus(status)}>
                  {STATUS_LABELS[status]}
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
      </div>
    </Card>
  {/if}

  <!-- Shipments Table -->
  <Card class="overflow-hidden">
    {#if loading}
      <div class="flex items-center justify-center h-64">
        <RefreshCw class="h-8 w-8 animate-spin text-slate-400" />
      </div>
    {:else if shipments.length === 0}
      <div class="p-8 text-center">
        <Package class="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <p class="text-slate-500">No shipments found</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b">
            <tr>
              <th class="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  on:change={toggleAll}
                  class="rounded border-slate-300"
                />
              </th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">
                <button class="flex items-center gap-1 hover:text-slate-700">
                  Tracking #
                  <ArrowUpDown class="h-3 w-3" />
                </button>
              </th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Customer</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Destination</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Weight</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Packages</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Amount</th>
              <th class="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each shipments as shipment (shipment.id)}
              {@const statusColor = STATUS_COLORS[shipment.status] || STATUS_COLORS.pending}
              <tr class={cn('hover:bg-slate-50', selectedIds.includes(shipment.id) && 'bg-blue-50')}>
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(shipment.id)}
                    on:change={() => toggleOne(shipment.id)}
                    class="rounded border-slate-300"
                  />
                </td>
                <td class="px-4 py-3">
                  <a href="/admin/shipments/{shipment.shipmentId}" class="text-sm font-medium text-blue-600 hover:underline">
                    {shipment.id}
                  </a>
                  {#if shipment.notes}
                    <div class="flex items-center gap-1 mt-1">
                      <MessageSquare class="h-3 w-3 text-amber-500" />
                      <span class="text-xs text-slate-500">Has notes</span>
                    </div>
                  {/if}
                </td>
                <td class="px-4 py-3">
                  <a href="/admin/users/{shipment.customerId}" class="text-sm text-slate-900 hover:underline">
                    {shipment.customer}
                  </a>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{shipment.destination}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{shipment.weight ? `${shipment.weight} lbs` : 'N/A'}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{shipment.packages || 'N/A'}</td>
                <td class="px-4 py-3">
                  <span class={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    statusColor.bg, statusColor.text
                  )}>
                    {STATUS_LABELS[shipment.status] || shipment.status}
                  </span>
                  {#if shipment.exceptionReason}
                    <p class="text-xs text-red-600 mt-1">{shipment.exceptionReason}</p>
                  {/if}
                </td>
                <td class="px-4 py-3 text-sm font-medium text-slate-900">${shipment.amount?.toFixed(2) || '0.00'}</td>
                <td class="px-4 py-3 text-right">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      {#snippet child({ props })}
                        <button
                          {...props}
                          type="button"
                          class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                          aria-label="Shipment actions"
                        >
                          <MoreHorizontal class="h-4 w-4" />
                        </button>
                      {/snippet}
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item onSelect={() => goto(`/admin/shipments/${shipment.shipmentId}`)}>
                        <Eye class="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenu.Item>
                      <DropdownMenu.Item>
                        <Edit class="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenu.Item>
                      <DropdownMenu.Item>
                        <Printer class="mr-2 h-4 w-4" />
                        Print Label
                      </DropdownMenu.Item>
                      {#if shipment.photos && shipment.photos.length > 0}
                        <DropdownMenu.Item>
                          <Camera class="mr-2 h-4 w-4" />
                          View Photos
                        </DropdownMenu.Item>
                      {/if}
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item onSelect={() => updateShipmentStatus(shipment.shipmentId, 'delivered')}>
                        <CheckCircle2 class="mr-2 h-4 w-4" />
                        Mark Delivered
                      </DropdownMenu.Item>
                      {#if shipment.status !== 'delivered' && shipment.status !== 'returned'}
                        <DropdownMenu.Item onSelect={() => {
                          const note = prompt('Add note for exception:');
                          if (note) updateShipmentStatus(shipment.shipmentId, 'exception', note);
                        }}>
                          <XCircle class="mr-2 h-4 w-4" />
                          Mark Exception
                        </DropdownMenu.Item>
                      {/if}
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      {#if totalPages > 1}
        <div class="p-4 border-t bg-slate-50 flex items-center justify-between">
          <p class="text-sm text-slate-600">
            Showing <strong>{(currentPage - 1) * perPage + 1}</strong> to <strong>{Math.min(currentPage * perPage, totalItems)}</strong> of <strong>{totalItems}</strong> results
          </p>
          <div class="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              on:click={() => currentPage--}
            >
              <ChevronLeft class="h-4 w-4" />
            </Button>
            {#each Array(totalPages) as _, i}
              <Button
                variant={currentPage === i + 1 ? 'default' : 'outline'}
                size="sm"
                on:click={() => currentPage = i + 1}
              >
                {i + 1}
              </Button>
            {/each}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              on:click={() => currentPage++}
            >
              <ChevronRight class="h-4 w-4" />
            </Button>
          </div>
        </div>
      {/if}
    {/if}
  </Card>
</div>

