<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';

  $: bookingId = $page.params.id;
</script>

<svelte:head>
  <title>Booking Details | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Booking Details</h1>
      <p class="text-slate-500">Booking ID: {bookingId}</p>
    </div>
    <Button variant="outline" href="/admin/bookings">Back to Bookings</Button>
  </div>

  <div class="rounded-lg border bg-white p-6">
    <p class="text-sm text-slate-600">
      Booking detail tools are being migrated into this route.
    </p>
  </div>
</div>
