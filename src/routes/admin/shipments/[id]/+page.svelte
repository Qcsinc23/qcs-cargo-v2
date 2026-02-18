<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';

  $: shipmentId = $page.params.id;
</script>

<svelte:head>
  <title>Shipment Details | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Shipment Details</h1>
      <p class="text-slate-500">Shipment ID: {shipmentId}</p>
    </div>
    <Button variant="outline" href="/admin/shipments">Back to Shipments</Button>
  </div>

  <div class="rounded-lg border bg-white p-6">
    <p class="text-sm text-slate-600">
      Shipment detail controls are being migrated into this route.
    </p>
  </div>
</div>
