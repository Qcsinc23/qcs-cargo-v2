<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import {
    Search,
    Download,
    Calendar,
    MoreHorizontal,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    DollarSign,
    RefreshCw
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { goto } from '$app/navigation';

  // Filter state
  let searchQuery = '';
  let statusFilter = 'all';
  let dateFilter = 'all';
  let currentPage = 1;
  const perPage = 10;

  // Data state
  let bookings: any[] = [];
  let totalItems = 0;
  let totalPages = 1;
  let loading = true;
  let stats = {
    today: 0,
    pending: 0,
    paymentFailed: 0
  };

  const bookingStatuses = {
    draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-800' },
    pending_payment: { label: 'Pending Payment', bg: 'bg-amber-100', text: 'text-amber-800' },
    confirmed: { label: 'Confirmed', bg: 'bg-blue-100', text: 'text-blue-800' },
    payment_failed: { label: 'Payment Failed', bg: 'bg-red-100', text: 'text-red-800' },
    in_progress: { label: 'In Progress', bg: 'bg-purple-100', text: 'text-purple-800' },
    completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-800' },
    canceled: { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-800' }
  };

  async function loadBookings() {
    loading = true;
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        date: dateFilter,
        page: currentPage.toString(),
        perPage: perPage.toString()
      });

      const response = await fetch(`/api/admin/bookings?${params}`);
      if (response.ok) {
        const data = await response.json();
        bookings = data.bookings;
        totalItems = data.totalItems;
        totalPages = data.totalPages;
        stats = data.stats;
      }
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      loading = false;
    }
  }

  function getStatusStyle(status: string) {
    return bookingStatuses[status as keyof typeof bookingStatuses] || bookingStatuses.draft;
  }

  async function updateBookingStatus(bookingId: string, status: string) {
    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingId, status })
      });

      if (response.ok) {
        await loadBookings();
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  }

  async function cancelBooking(bookingId: string) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingId })
      });

      if (response.ok) {
        await loadBookings();
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  }

  // Load data when filters change
  $: if (currentPage, searchQuery, statusFilter, dateFilter) {
    loadBookings();
  }

  onMount(() => {
    loadBookings();
  });
</script>

<svelte:head>
  <title>Bookings | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Bookings</h1>
      <p class="text-slate-500">Manage customer drop-off appointments</p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="outline" size="sm" on:click={loadBookings} disabled={loading}>
        <RefreshCw class={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
        Refresh
      </Button>
      <Button variant="outline" size="sm">
        <Download class="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button variant="outline" size="sm">
        <Calendar class="h-4 w-4 mr-2" />
        Calendar View
      </Button>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <Card class="p-4 flex items-center gap-4">
      <div class="p-3 bg-blue-100 rounded-lg">
        <Calendar class="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <p class="text-sm text-slate-500">Today's Bookings</p>
        <p class="text-2xl font-bold text-slate-900">{stats.today}</p>
      </div>
    </Card>
    <Card class="p-4 flex items-center gap-4">
      <div class="p-3 bg-amber-100 rounded-lg">
        <Clock class="h-5 w-5 text-amber-600" />
      </div>
      <div>
        <p class="text-sm text-slate-500">Pending Confirmation</p>
        <p class="text-2xl font-bold text-slate-900">{stats.pending}</p>
      </div>
    </Card>
    <Card class="p-4 flex items-center gap-4">
      <div class="p-3 bg-red-100 rounded-lg">
        <AlertTriangle class="h-5 w-5 text-red-600" />
      </div>
      <div>
        <p class="text-sm text-slate-500">Payment Issues</p>
        <p class="text-2xl font-bold text-slate-900">{stats.paymentFailed}</p>
      </div>
    </Card>
  </div>

  <!-- Filters -->
  <Card class="p-4">
    <div class="flex flex-col lg:flex-row gap-4">
      <div class="flex-1">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by booking #, customer, or email..."
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
          {#each Object.entries(bookingStatuses) as [key, val]}
            <option value={key}>{val.label}</option>
          {/each}
        </select>
        <select
          class="px-3 py-2 border rounded-md text-sm bg-white"
          bind:value={dateFilter}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="upcoming">Upcoming</option>
        </select>
      </div>
    </div>
  </Card>

  <!-- Bookings Table -->
  <Card class="overflow-hidden">
    {#if loading}
      <div class="flex items-center justify-center h-64">
        <RefreshCw class="h-8 w-8 animate-spin text-slate-400" />
      </div>
    {:else if bookings.length === 0}
      <div class="p-8 text-center">
        <Calendar class="h-12 w-12 text-slate-400 mx-auto mb-3" />
        <p class="text-slate-500">No bookings found</p>
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b">
            <tr>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Booking #</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Customer</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Scheduled</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Destination</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Packages</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Amount</th>
              <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
              <th class="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each bookings as booking (booking.id)}
              {@const statusStyle = getStatusStyle(booking.status)}
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3">
                  <a href="/admin/bookings/{booking.id}" class="text-sm font-medium text-blue-600 hover:underline">
                    {booking.id.substring(0, 8)}...
                  </a>
                </td>
                <td class="px-4 py-3">
                  <div>
                    <a href="/admin/users/{booking.customerId}" class="text-sm font-medium text-slate-900 hover:underline">
                      {booking.customer}
                    </a>
                    <p class="text-xs text-slate-500">{booking.email}</p>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div>
                    <p class="text-sm text-slate-900">{new Date(booking.scheduledDate).toLocaleDateString()}</p>
                    <p class="text-xs text-slate-500">{booking.timeSlot}</p>
                  </div>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{booking.destination}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{booking.packages}</td>
                <td class="px-4 py-3">
                  <div>
                    <p class="text-sm font-medium text-slate-900">${booking.amount?.toFixed(2) || '0.00'}</p>
                    <p class={cn(
                      'text-xs',
                      booking.paymentStatus === 'paid' ? 'text-green-600' :
                      booking.paymentStatus === 'failed' ? 'text-red-600' :
                      booking.paymentStatus === 'refunded' ? 'text-slate-500' :
                      'text-amber-600'
                    )}>
                      {booking.paymentStatus ? booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1) : 'Pending'}
                    </p>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    statusStyle.bg, statusStyle.text
                  )}>
                    {statusStyle.label}
                  </span>
                </td>
                <td class="px-4 py-3 text-right">
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild let:builder>
                      <button
                        type="button"
                        {...builder}
                        use:builder.action
                        class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        aria-label="Booking actions"
                      >
                        <MoreHorizontal class="h-4 w-4" />
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item on:click={() => goto(`/admin/bookings/${booking.id}`)}>
                        <Eye class="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenu.Item>
                      {#if booking.status === 'pending_payment' || booking.status === 'draft'}
                        <DropdownMenu.Item on:click={() => updateBookingStatus(booking.id, 'confirmed')}>
                          <CheckCircle2 class="mr-2 h-4 w-4" />
                          Confirm Booking
                        </DropdownMenu.Item>
                      {/if}
                      {#if booking.status === 'payment_failed'}
                        <DropdownMenu.Item>
                          <DollarSign class="mr-2 h-4 w-4" />
                          Resend Payment Link
                        </DropdownMenu.Item>
                      {/if}
                      {#if booking.status === 'confirmed'}
                        <DropdownMenu.Item on:click={() => updateBookingStatus(booking.id, 'in_progress')}>
                          <Clock class="mr-2 h-4 w-4" />
                          Mark In Progress
                        </DropdownMenu.Item>
                      {/if}
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item class="text-red-600" on:click={() => cancelBooking(booking.id)}>
                        <XCircle class="mr-2 h-4 w-4" />
                        Cancel Booking
                      </DropdownMenu.Item>
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

