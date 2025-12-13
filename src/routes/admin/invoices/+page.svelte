<script lang="ts">
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
  import { 
    Search, 
    Download, 
    Plus,
    MoreHorizontal,
    Eye,
    Mail,
    Printer,
    Receipt,
    DollarSign,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    AlertTriangle
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { goto } from '$app/navigation';

  // Filter state
  let searchQuery = '';
  let statusFilter = 'all';
  let currentPage = 1;
  const perPage = 10;

  const invoiceStatuses = {
    draft: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-800' },
    pending: { label: 'Pending', bg: 'bg-amber-100', text: 'text-amber-800' },
    paid: { label: 'Paid', bg: 'bg-green-100', text: 'text-green-800' },
    overdue: { label: 'Overdue', bg: 'bg-red-100', text: 'text-red-800' },
    cancelled: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-800' }
  };

  // Mock invoices data
  const allInvoices = [
    { id: 'INV-2024-0089', customer: 'Maria G.', customerId: 'usr-3', email: 'maria.g@email.com', shipmentId: 'SH-2024-0160', amount: 234.50, status: 'paid', issued: '2024-12-09', due: '2024-12-16', paid: '2024-12-09' },
    { id: 'INV-2024-0088', customer: 'Devon T.', customerId: 'usr-2', email: 'devon.t@email.com', shipmentId: 'SH-2024-0161', amount: 86.25, status: 'paid', issued: '2024-12-10', due: '2024-12-17', paid: '2024-12-10' },
    { id: 'INV-2024-0087', customer: 'Patricia W.', customerId: 'usr-1', email: 'patricia.w@email.com', shipmentId: 'SH-2024-0162', amount: 157.50, status: 'pending', issued: '2024-12-10', due: '2024-12-17', paid: null },
    { id: 'INV-2024-0086', customer: 'James R.', customerId: 'usr-4', email: 'james.r@email.com', shipmentId: 'SH-2024-0159', amount: 48.00, status: 'paid', issued: '2024-12-08', due: '2024-12-15', paid: '2024-12-08' },
    { id: 'INV-2024-0085', customer: 'Lisa M.', customerId: 'usr-5', email: 'lisa.m@email.com', shipmentId: 'SH-2024-0158', amount: 119.00, status: 'overdue', issued: '2024-11-25', due: '2024-12-02', paid: null },
    { id: 'INV-2024-0084', customer: 'Michael B.', customerId: 'usr-6', email: 'michael.b@email.com', shipmentId: 'SH-2024-0157', amount: 311.50, status: 'paid', issued: '2024-12-06', due: '2024-12-13', paid: '2024-12-07' },
    { id: 'INV-2024-0083', customer: 'Sarah K.', customerId: 'usr-7', email: 'sarah.k@email.com', shipmentId: 'SH-2024-0156', amount: 56.25, status: 'draft', issued: '2024-12-07', due: '2024-12-14', paid: null },
    { id: 'INV-2024-0082', customer: 'John D.', customerId: 'usr-8', email: 'john.d@email.com', shipmentId: 'SH-2024-0155', amount: 119.00, status: 'pending', issued: '2024-12-07', due: '2024-12-14', paid: null }
  ];

  // Filter invoices
  $: filteredInvoices = allInvoices.filter(inv => {
    if (searchQuery && !inv.id.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !inv.customer.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !inv.shipmentId.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    return true;
  });

  $: totalPages = Math.ceil(filteredInvoices.length / perPage);
  $: paginatedInvoices = filteredInvoices.slice((currentPage - 1) * perPage, currentPage * perPage);

  // Stats
  $: totalRevenue = allInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0);
  $: pendingAmount = allInvoices.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0);
  $: overdueCount = allInvoices.filter(i => i.status === 'overdue').length;

  function getStatusStyle(status: string) {
    return invoiceStatuses[status as keyof typeof invoiceStatuses] || invoiceStatuses.draft;
  }

  async function exportCSV() {
    const headers = ['Invoice #', 'Customer', 'Shipment', 'Amount', 'Status', 'Issued', 'Due', 'Paid'];
    const rows = filteredInvoices.map(inv => [
      inv.id, inv.customer, inv.shipmentId, `$${inv.amount.toFixed(2)}`, 
      invoiceStatuses[inv.status as keyof typeof invoiceStatuses]?.label || inv.status,
      inv.issued, inv.due, inv.paid || '-'
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }
</script>

<svelte:head>
  <title>Invoices | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Invoices</h1>
      <p class="text-slate-500">Manage billing and payment records</p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="outline" size="sm" on:click={exportCSV}>
        <Download class="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button size="sm">
        <Plus class="h-4 w-4 mr-2" />
        Create Invoice
      </Button>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <Card class="p-4 flex items-center gap-4">
      <div class="p-3 bg-green-100 rounded-lg">
        <DollarSign class="h-5 w-5 text-green-600" />
      </div>
      <div>
        <p class="text-sm text-slate-500">Revenue (MTD)</p>
        <p class="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</p>
      </div>
    </Card>
    <Card class="p-4 flex items-center gap-4">
      <div class="p-3 bg-amber-100 rounded-lg">
        <Clock class="h-5 w-5 text-amber-600" />
      </div>
      <div>
        <p class="text-sm text-slate-500">Pending</p>
        <p class="text-2xl font-bold text-slate-900">${pendingAmount.toFixed(2)}</p>
      </div>
    </Card>
    <Card class="p-4 flex items-center gap-4">
      <div class="p-3 bg-red-100 rounded-lg">
        <AlertTriangle class="h-5 w-5 text-red-600" />
      </div>
      <div>
        <p class="text-sm text-slate-500">Overdue</p>
        <p class="text-2xl font-bold text-slate-900">{overdueCount}</p>
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
            placeholder="Search by invoice #, customer, or shipment..."
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
          {#each Object.entries(invoiceStatuses) as [key, val]}
            <option value={key}>{val.label}</option>
          {/each}
        </select>
      </div>
    </div>
  </Card>

  <!-- Invoices Table -->
  <Card class="overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-slate-50 border-b">
          <tr>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Invoice #</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Customer</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Shipment</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Amount</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
            <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Due Date</th>
            <th class="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y">
          {#each paginatedInvoices as invoice (invoice.id)}
            {@const statusStyle = getStatusStyle(invoice.status)}
            <tr class="hover:bg-slate-50">
              <td class="px-4 py-3">
                <a href="/admin/invoices/{invoice.id}" class="text-sm font-medium text-blue-600 hover:underline">
                  {invoice.id}
                </a>
              </td>
              <td class="px-4 py-3">
                <div>
                  <a href="/admin/users/{invoice.customerId}" class="text-sm font-medium text-slate-900 hover:underline">
                    {invoice.customer}
                  </a>
                  <p class="text-xs text-slate-500">{invoice.email}</p>
                </div>
              </td>
              <td class="px-4 py-3">
                <a href="/admin/shipments/{invoice.shipmentId}" class="text-sm text-blue-600 hover:underline">
                  {invoice.shipmentId}
                </a>
              </td>
              <td class="px-4 py-3 text-sm font-medium text-slate-900">${invoice.amount.toFixed(2)}</td>
              <td class="px-4 py-3">
                <span class={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  statusStyle.bg, statusStyle.text
                )}>
                  {statusStyle.label}
                </span>
              </td>
              <td class="px-4 py-3">
                <div>
                  <p class="text-sm text-slate-900">{new Date(invoice.due).toLocaleDateString()}</p>
                  {#if invoice.paid}
                    <p class="text-xs text-green-600">Paid {new Date(invoice.paid).toLocaleDateString()}</p>
                  {/if}
                </div>
              </td>
              <td class="px-4 py-3 text-right">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    {#snippet child({ props })}
                      <button
                        {...props}
                        type="button"
                        class="inline-flex items-center justify-center h-9 w-9 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                        aria-label="Invoice actions"
                      >
                        <MoreHorizontal class="h-4 w-4" />
                      </button>
                    {/snippet}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Item onSelect={() => goto(`/admin/invoices/${invoice.id}`)}>
                      <Eye class="mr-2 h-4 w-4" />
                      View Invoice
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <Printer class="mr-2 h-4 w-4" />
                      Print
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <Mail class="mr-2 h-4 w-4" />
                      Email to Customer
                    </DropdownMenu.Item>
                    {#if invoice.status === 'pending' || invoice.status === 'overdue'}
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item>
                        <CheckCircle2 class="mr-2 h-4 w-4" />
                        Mark as Paid
                      </DropdownMenu.Item>
                    {/if}
                    {#if invoice.status === 'draft'}
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item>
                        <Receipt class="mr-2 h-4 w-4" />
                        Send Invoice
                      </DropdownMenu.Item>
                    {/if}
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item class="text-red-600">
                      <XCircle class="mr-2 h-4 w-4" />
                      Void Invoice
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
          Showing <strong>{(currentPage - 1) * perPage + 1}</strong> to <strong>{Math.min(currentPage * perPage, filteredInvoices.length)}</strong> of <strong>{filteredInvoices.length}</strong> results
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
  </Card>
</div>

