<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import { EmptyState } from '$lib/components/shared';
  import { STATUS_COLORS, STATUS_LABELS } from '$lib/config/constants';
  import { getDestinationLabel } from '$lib/config/destinations';
  import {
    Package,
    Search,
    Filter,
    ArrowUpDown,
    Eye,
    Calendar,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Plus
  } from 'lucide-svelte';

  export let data;

  // Shipments from server (placeholder - will come from PocketBase)
  let shipments: Array<{
    id: string;
    tracking_number: string;
    status: string;
    destination: string;
    weight_lbs: number;
    created: string;
    recipient_name: string;
    estimated_delivery?: string;
  }> = [];

  let searchQuery = '';
  let statusFilter = 'all';
  let sortBy = 'created';
  let sortOrder: 'asc' | 'desc' = 'desc';
  let currentPage = 1;
  const itemsPerPage = 10;

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'received', label: 'Received' },
    { value: 'processing', label: 'Processing' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'customs', label: 'Customs' },
    { value: 'delivered', label: 'Delivered' }
  ];

  // Filter and sort shipments
  $: filteredShipments = shipments
    .filter(s => {
      const matchesSearch = 
        s.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.recipient_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      const modifier = sortOrder === 'desc' ? -1 : 1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal) * modifier;
      }
      return 0;
    });

  $: totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  $: paginatedShipments = filteredShipments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function toggleSort(column: string) {
    if (sortBy === column) {
      sortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    } else {
      sortBy = column;
      sortOrder = 'desc';
    }
  }
</script>

<svelte:head>
  <title>My Shipments | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">My Shipments</h1>
      <p class="text-gray-600 mt-1">Track and manage all your shipments</p>
    </div>
    <Button href="/dashboard/bookings/new">
      <Plus class="w-4 h-4 mr-2" />
      New Shipment
    </Button>
  </div>

  <!-- Filters -->
  <Card>
    <CardContent class="p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            bind:value={searchQuery}
            placeholder="Search by tracking number or recipient..."
            class="pl-10"
          />
        </div>
        <div class="flex gap-2">
          <select
            bind:value={statusFilter}
            class="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {#each statusOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
          <Button variant="outline" size="icon" on:click={() => toggleSort('created')}>
            <ArrowUpDown class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Shipments List -->
  {#if shipments.length === 0}
    <Card>
      <CardContent class="p-8">
        <EmptyState
          title="No shipments yet"
          description="You haven't shipped anything yet. Create your first booking to get started."
          icon="package"
        >
          <Button href="/dashboard/bookings/new">
            <Plus class="w-4 h-4 mr-2" />
            Create First Shipment
          </Button>
        </EmptyState>
      </CardContent>
    </Card>
  {:else if filteredShipments.length === 0}
    <Card>
      <CardContent class="p-8 text-center">
        <Filter class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="font-medium text-gray-900">No matching shipments</h3>
        <p class="text-gray-500 mt-1">Try adjusting your search or filters</p>
      </CardContent>
    </Card>
  {:else}
    <!-- Desktop Table -->
    <div class="hidden md:block">
      <Card>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th class="text-left p-4 font-medium text-gray-600">Tracking #</th>
                <th class="text-left p-4 font-medium text-gray-600">Status</th>
                <th class="text-left p-4 font-medium text-gray-600">Destination</th>
                <th class="text-left p-4 font-medium text-gray-600">Recipient</th>
                <th class="text-left p-4 font-medium text-gray-600">Weight</th>
                <th class="text-left p-4 font-medium text-gray-600">Created</th>
                <th class="text-right p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              {#each paginatedShipments as shipment}
                {@const statusStyle = STATUS_COLORS[shipment.status] || STATUS_COLORS.pending}
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="p-4">
                    <span class="font-mono font-medium text-primary-600">
                      {shipment.tracking_number}
                    </span>
                  </td>
                  <td class="p-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {statusStyle.bg} {statusStyle.text}">
                      {STATUS_LABELS[shipment.status] || shipment.status}
                    </span>
                  </td>
                  <td class="p-4 text-gray-600">
                    {getDestinationLabel(shipment.destination)}
                  </td>
                  <td class="p-4 text-gray-900">{shipment.recipient_name}</td>
                  <td class="p-4 text-gray-600">{shipment.weight_lbs} lbs</td>
                  <td class="p-4 text-gray-600">{formatDate(shipment.created)}</td>
                  <td class="p-4 text-right">
                    <Button variant="ghost" size="sm" href="/dashboard/shipments/{shipment.id}">
                      <Eye class="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </Card>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-4">
      {#each paginatedShipments as shipment}
        {@const statusStyle = STATUS_COLORS[shipment.status] || STATUS_COLORS.pending}
        <Card>
          <CardContent class="p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="font-mono text-sm font-medium text-primary-600">
                  {shipment.tracking_number}
                </span>
                <span class="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium {statusStyle.bg} {statusStyle.text}">
                  {STATUS_LABELS[shipment.status] || shipment.status}
                </span>
              </div>
            </div>

            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <MapPin class="w-4 h-4" />
                <span>{getDestinationLabel(shipment.destination)}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <Package class="w-4 h-4" />
                <span>{shipment.weight_lbs} lbs • {shipment.recipient_name}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-500">
                <Calendar class="w-4 h-4" />
                <span>{formatDate(shipment.created)}</span>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" href="/dashboard/shipments/{shipment.id}" class="w-full">
                <Eye class="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-600">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredShipments.length)} of {filteredShipments.length} shipments
        </p>
        <div class="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            on:click={() => currentPage--}
          >
            <ChevronLeft class="w-4 h-4" />
          </Button>
          <span class="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            on:click={() => currentPage++}
          >
            <ChevronRight class="w-4 h-4" />
          </Button>
        </div>
      </div>
    {/if}
  {/if}
</div>

