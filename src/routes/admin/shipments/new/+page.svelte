<script lang="ts">
  import { Button } from '$lib/components/ui/button';
</script>

<svelte:head>
  <title>New Shipment | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Create Shipment</h1>
      <p class="text-slate-500">Start a new shipment from an approved booking.</p>
    </div>
    <Button variant="outline" href="/admin/shipments">Back to Shipments</Button>
  </div>

  <div class="rounded-lg border bg-white p-6">
    <p class="text-sm text-slate-600">
      Shipment creation workflow is being migrated to this dedicated route.
    </p>
  </div>
</div>
