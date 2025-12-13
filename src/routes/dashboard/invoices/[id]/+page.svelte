<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { ArrowLeft, Download, Loader2 } from 'lucide-svelte';
  import { downloadInvoicePDF } from '$lib/utils/pdf-generator';
  import { toast } from 'svelte-sonner';

  export let data;

  const invoice = data.invoice as Record<string, any>;
  let isGeneratingPDF = false;

  const statusStyles: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-amber-100 text-amber-700',
    overdue: 'bg-red-100 text-red-700',
    draft: 'bg-gray-100 text-gray-700',
    canceled: 'bg-gray-100 text-gray-700',
    refunded: 'bg-purple-100 text-purple-700'
  };

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }

  function getLineItems(): Array<{ description: string; amount?: number; quantity?: number }> {
    const items = invoice?.line_items;
    if (!Array.isArray(items)) return [];
    return items
      .filter((i) => i && typeof i === 'object')
      .map((i) => ({
        description: typeof i.description === 'string' ? i.description : 'Line item',
        amount: typeof i.amount === 'number' ? i.amount : undefined,
        quantity: typeof i.quantity === 'number' ? i.quantity : undefined
      }));
  }

  async function downloadPdf() {
    isGeneratingPDF = true;
    try {
      const id = $page.params.id;
      const response = await fetch(`/api/invoices/${id}/pdf`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoice data');
      }

      const invoiceData = await response.json();
      
      // Generate and download PDF
      downloadInvoicePDF(invoiceData);
      
      toast.success('Invoice PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      isGeneratingPDF = false;
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <Button variant="ghost" href="/dashboard/invoices">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back
      </Button>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Invoice</h1>
        <p class="text-gray-600">{invoice.invoice_number || invoice.id}</p>
      </div>
    </div>
    <Button on:click={downloadPdf} disabled={isGeneratingPDF}>
      {#if isGeneratingPDF}
        <Loader2 class="w-4 h-4 mr-2 animate-spin" />
        Generating...
      {:else}
        <Download class="w-4 h-4 mr-2" />
        Download PDF
      {/if}
    </Button>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>Details</CardTitle>
    </CardHeader>
    <CardContent class="space-y-3">
      <div class="flex items-center justify-between">
        <span class="text-gray-600">Status</span>
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {statusStyles[invoice.status] || 'bg-gray-100 text-gray-700'}">
          {invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Unknown'}
        </span>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-gray-600">Created</span>
        <span class="text-gray-900">{invoice.created ? formatDate(invoice.created) : '—'}</span>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-gray-600">Due</span>
        <span class="text-gray-900">{invoice.due_date ? formatDate(invoice.due_date) : '—'}</span>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-gray-600">Paid</span>
        <span class="text-gray-900">{invoice.paid_at ? formatDate(invoice.paid_at) : '—'}</span>
      </div>

      <div class="flex items-center justify-between pt-2 border-t">
        <span class="text-gray-600">Total</span>
        <span class="text-gray-900 font-semibold">{formatCurrency(Number(invoice.amount || 0), invoice.currency || 'USD')}</span>
      </div>

      {#if invoice.notes}
        <div class="pt-2 border-t">
          <p class="text-gray-600 text-sm">Notes</p>
          <p class="text-gray-900 whitespace-pre-wrap">{invoice.notes}</p>
        </div>
      {/if}
    </CardContent>
  </Card>

  {#if getLineItems().length > 0}
    <Card>
      <CardHeader>
        <CardTitle>Line Items</CardTitle>
      </CardHeader>
      <CardContent class="space-y-2">
        {#each getLineItems() as item}
          <div class="flex items-start justify-between gap-4 py-2 border-b last:border-b-0">
            <div>
              <p class="text-gray-900 font-medium">{item.description}</p>
              {#if item.quantity}
                <p class="text-gray-600 text-sm">Qty: {item.quantity}</p>
              {/if}
            </div>
            {#if item.amount !== undefined}
              <p class="text-gray-900 font-semibold">{formatCurrency(item.amount, invoice.currency || 'USD')}</p>
            {/if}
          </div>
        {/each}
      </CardContent>
    </Card>
  {/if}
</div>


