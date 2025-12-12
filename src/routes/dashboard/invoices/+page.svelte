<script lang="ts">
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Badge } from '$lib/components/ui/badge';
  import { EmptyState } from '$lib/components/shared';
  import {
    FileText,
    Search,
    Download,
    Eye,
    Calendar,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    Filter
  } from 'lucide-svelte';

  
  interface Invoice {
    id: string;
    invoice_number: string;
    amount_usd: number;
    status: 'paid' | 'pending' | 'overdue';
    created: string;
    due_date: string;
    paid_at?: string;
    shipment_tracking?: string;
  }

  // Placeholder invoices (will come from PocketBase)
  let invoices: Invoice[] = [];
  let searchQuery = '';
  let statusFilter = 'all';
  let currentPage = 1;
  const itemsPerPage = 10;

  const statusOptions = [
    { value: 'all', label: 'All Invoices' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'overdue', label: 'Overdue' }
  ];

  const statusStyles = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    overdue: 'bg-red-100 text-red-700'
  };

  $: filteredInvoices = invoices
    .filter(inv => {
      const matchesSearch = inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());

  $: totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  $: paginatedInvoices = filteredInvoices.slice(
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

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  async function downloadInvoice(invoice: Invoice) {
    // PDF download would go here
    window.open(`/api/invoices/${invoice.id}/pdf`, '_blank');
  }
</script>

<svelte:head>
  <title>Invoices | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Invoices</h1>
      <p class="text-gray-600 mt-1">View and download your shipping invoices</p>
    </div>
  </div>

  <!-- Filters -->
  {#if invoices.length > 0}
    <Card>
      <CardContent class="p-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              bind:value={searchQuery}
              placeholder="Search by invoice number..."
              class="pl-10"
            />
          </div>
          <select
            bind:value={statusFilter}
            class="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {#each statusOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>
      </CardContent>
    </Card>
  {/if}

  <!-- Invoices List -->
  {#if invoices.length === 0}
    <Card>
      <CardContent class="p-8">
        <EmptyState
          title="No invoices yet"
          description="Invoices will appear here after you complete a shipment."
          icon="receipt"
        >
          <Button href="/dashboard/bookings/new">
            Book a Shipment
          </Button>
        </EmptyState>
      </CardContent>
    </Card>
  {:else if filteredInvoices.length === 0}
    <Card>
      <CardContent class="p-8 text-center">
        <Filter class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="font-medium text-gray-900">No matching invoices</h3>
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
                <th class="text-left p-4 font-medium text-gray-600">Invoice #</th>
                <th class="text-left p-4 font-medium text-gray-600">Amount</th>
                <th class="text-left p-4 font-medium text-gray-600">Status</th>
                <th class="text-left p-4 font-medium text-gray-600">Date</th>
                <th class="text-left p-4 font-medium text-gray-600">Due Date</th>
                <th class="text-right p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              {#each paginatedInvoices as invoice}
                <tr class="hover:bg-gray-50 transition-colors">
                  <td class="p-4">
                    <span class="font-mono font-medium text-gray-900">
                      {invoice.invoice_number}
                    </span>
                    {#if invoice.shipment_tracking}
                      <p class="text-xs text-gray-500 mt-1">
                        Tracking: {invoice.shipment_tracking}
                      </p>
                    {/if}
                  </td>
                  <td class="p-4 font-semibold text-gray-900">
                    {formatCurrency(invoice.amount_usd)}
                  </td>
                  <td class="p-4">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {statusStyles[invoice.status]}">
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td class="p-4 text-gray-600">{formatDate(invoice.created)}</td>
                  <td class="p-4 text-gray-600">{formatDate(invoice.due_date)}</td>
                  <td class="p-4">
                    <div class="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" href="/dashboard/invoices/{invoice.id}">
                        <Eye class="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" on:click={() => downloadInvoice(invoice)}>
                        <Download class="w-4 h-4" />
                      </Button>
                    </div>
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
      {#each paginatedInvoices as invoice}
        <Card>
          <CardContent class="p-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="font-mono text-sm font-medium text-gray-900">
                  {invoice.invoice_number}
                </span>
                <span class="inline-flex items-center ml-2 px-2 py-0.5 rounded-full text-xs font-medium {statusStyles[invoice.status]}">
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </span>
              </div>
              <span class="font-bold text-gray-900">{formatCurrency(invoice.amount_usd)}</span>
            </div>

            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <Calendar class="w-4 h-4" />
                <span>Created: {formatDate(invoice.created)}</span>
              </div>
              <div class="flex items-center gap-2">
                <DollarSign class="w-4 h-4" />
                <span>Due: {formatDate(invoice.due_date)}</span>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t flex gap-2">
              <Button variant="outline" size="sm" href="/dashboard/invoices/{invoice.id}" class="flex-1">
                <Eye class="w-4 h-4 mr-1" />
                View
              </Button>
              <Button variant="outline" size="sm" on:click={() => downloadInvoice(invoice)} class="flex-1">
                <Download class="w-4 h-4 mr-1" />
                Download
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
          Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length} invoices
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

