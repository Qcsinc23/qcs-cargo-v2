<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { EmptyState } from '$lib/components/shared';
  import { getDestinationLabel } from '$lib/config/destinations';
  import {
    Plus,
    Calendar,
    Package,
    MapPin,
    ChevronLeft,
    ChevronRight,
    Filter,
    Eye,
    Edit,
    AlertTriangle
  } from 'lucide-svelte';

  
  interface Booking {
    id: string;
    status: 'draft' | 'pending' | 'confirmed' | 'canceled' | 'cancelled' | 'pending_payment' | 'payment_failed';
    destination: string;
    package_count: number;
    total_weight_lbs: number;
    total_cost_usd: number;
    scheduled_date?: string;
    created: string;
  }

  export let data: { bookings: Booking[] };

  let bookings: Booking[] = data.bookings || [];
  $: bookings = data.bookings || [];
  let statusFilter = 'all';
  let currentPage = 1;
  const itemsPerPage = 10;

  const statusOptions = [
    { value: 'all', label: 'All Bookings' },
    { value: 'draft', label: 'Drafts' },
    { value: 'pending', label: 'Pending' },
    { value: 'pending_payment', label: 'Payment Required' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'canceled', label: 'Cancelled' }
  ];

  const statusStyles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    pending: 'bg-amber-100 text-amber-700',
    pending_payment: 'bg-red-100 text-red-700',
    payment_failed: 'bg-red-100 text-red-700',
    confirmed: 'bg-green-100 text-green-700',
    canceled: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  function normalizeBookingStatus(status: string): string {
    return status === 'cancelled' ? 'canceled' : status;
  }

  $: filteredBookings = bookings
    .filter(b => {
      const normalizedStatus = normalizeBookingStatus(b.status);
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
      return matchesStatus;
    })
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  $: totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  $: paginatedBookings = filteredBookings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Check for incomplete drafts
  $: draftCount = bookings.filter(b => b.status === 'draft').length;
  $: failedPaymentCount = bookings.filter(b => b.status === 'pending_payment' || b.status === 'payment_failed').length;

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
</script>

<svelte:head>
  <title>My Bookings | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">My Bookings</h1>
      <p class="text-gray-600 mt-1">Manage your shipping bookings</p>
    </div>
    <Button href="/dashboard/bookings/new">
      <Plus class="w-4 h-4 mr-2" />
      New Booking
    </Button>
  </div>

  <!-- Draft Alert -->
  {#if draftCount > 0}
    <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
      <AlertTriangle class="w-5 h-5 text-amber-600 flex-shrink-0" />
      <div class="flex-1">
        <p class="font-medium text-amber-800">
          You have {draftCount} incomplete booking{draftCount > 1 ? 's' : ''}
        </p>
        <p class="text-sm text-amber-600">Continue where you left off to complete your shipment</p>
      </div>
      <Button variant="outline" size="sm" on:click={() => statusFilter = 'draft'}>
        View Drafts
      </Button>
    </div>
  {/if}

  <!-- Payment Failed Alert -->
  {#if failedPaymentCount > 0}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
      <AlertTriangle class="w-5 h-5 text-red-600 flex-shrink-0" />
      <div class="flex-1">
        <p class="font-medium text-red-800">
          {failedPaymentCount} booking{failedPaymentCount > 1 ? 's need' : ' needs'} payment
        </p>
        <p class="text-sm text-red-600">Complete payment to confirm your shipment{failedPaymentCount > 1 ? 's' : ''}</p>
      </div>
      <Button variant="destructive" size="sm" on:click={() => statusFilter = 'pending_payment'}>
        View Pending
      </Button>
    </div>
  {/if}

  <!-- Filters -->
  {#if bookings.length > 0}
    <Card>
      <CardContent class="p-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <select
            bind:value={statusFilter}
            class="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 flex-1 sm:flex-none"
          >
            {#each statusOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Bookings List -->
  {#if bookings.length === 0}
    <Card>
      <CardContent class="p-8">
        <EmptyState
          title="No bookings yet"
          description="Create your first booking to ship packages to the Caribbean."
          icon="calendar"
        >
          <Button href="/dashboard/bookings/new">
            <Plus class="w-4 h-4 mr-2" />
            Create First Booking
          </Button>
        </EmptyState>
      </CardContent>
    </Card>
  {:else if filteredBookings.length === 0}
    <Card>
      <CardContent class="p-8 text-center">
        <Filter class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="font-medium text-gray-900">No matching bookings</h3>
        <p class="text-gray-500 mt-1">Try selecting a different filter</p>
      </CardContent>
    </Card>
  {:else}
    <div class="space-y-4">
      {#each paginatedBookings as booking}
        <Card class={booking.status === 'draft' ? 'border-amber-200 bg-amber-50/50' : ''}>
          <CardContent class="p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <!-- Booking Info -->
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {statusStyles[booking.status]}">
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  <span class="text-sm text-gray-500">
                    Created {formatDate(booking.created)}
                  </span>
                </div>

                <div class="grid sm:grid-cols-4 gap-4 text-sm">
                  <div class="flex items-center gap-2">
                    <MapPin class="w-4 h-4 text-gray-400" />
                    <span class="text-gray-900">{getDestinationLabel(booking.destination)}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Package class="w-4 h-4 text-gray-400" />
                    <span class="text-gray-600">
                      {booking.package_count} package{booking.package_count !== 1 ? 's' : ''} • {booking.total_weight_lbs} lbs
                    </span>
                  </div>
                  {#if booking.scheduled_date}
                    <div class="flex items-center gap-2">
                      <Calendar class="w-4 h-4 text-gray-400" />
                      <span class="text-gray-600">{formatDate(booking.scheduled_date)}</span>
                    </div>
                  {/if}
                  <div class="text-lg font-semibold text-gray-900">
                    {formatCurrency(booking.total_cost_usd)}
                  </div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 sm:flex-col sm:items-end">
                {#if booking.status === 'draft'}
                  <Button href={`/dashboard/bookings/${booking.id}/modify`} size="sm">
                    <Edit class="w-4 h-4 mr-1" />
                    Continue
                  </Button>
                {:else}
                  <Button variant="outline" href={`/dashboard/bookings/${booking.id}`} size="sm">
                    <Eye class="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                {/if}
              </div>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>

    <!-- Pagination -->
    {#if totalPages > 1}
      <div class="flex items-center justify-between">
        <p class="text-sm text-gray-600">
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
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
