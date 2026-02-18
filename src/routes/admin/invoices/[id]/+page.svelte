<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';

  $: invoiceId = $page.params.id;
</script>

<svelte:head>
  <title>Invoice Details | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Invoice Details</h1>
      <p class="text-slate-500">Invoice ID: {invoiceId}</p>
    </div>
    <Button variant="outline" href="/admin/invoices">Back to Invoices</Button>
  </div>

  <div class="rounded-lg border bg-white p-6">
    <p class="text-sm text-slate-600">
      Admin invoice detail controls are available here as the invoice tools are expanded.
    </p>
  </div>
</div>
