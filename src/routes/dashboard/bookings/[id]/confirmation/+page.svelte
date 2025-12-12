<script lang="ts">
  import { page } from '$app/stores';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { getDestinationLabel } from '$lib/config/destinations';
  import { COMPANY } from '$lib/config/constants';
  import {
    CheckCircle,
    Package,
    Calendar,
    MapPin,
    User,
    Clock,
    Download,
    Share2,
    Printer,
    Mail,
    ArrowRight,
    Copy,
    Check
  } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';

  export let data;

  $: bookingId = $page.params.id || '';

  // Placeholder booking confirmation data
  let booking = {
    id: bookingId,
    confirmationNumber: 'QCS-' + (bookingId || '').toUpperCase().slice(0, 8),
    status: 'confirmed',
    serviceType: 'standard',
    destination: 'guyana',
    packages: [
      { id: '1', trackingNumber: 'QCS2024001', weight: 15, contents: 'Clothing' },
      { id: '2', trackingNumber: 'QCS2024002', weight: 8, contents: 'Electronics' }
    ],
    recipient: {
      name: 'John Doe',
      phone: '+592 123 4567',
      address: '123 Main St, Georgetown',
      city: 'Georgetown'
    },
    schedule: {
      date: '2024-12-15',
      time: '10:00-11:00'
    },
    cost: {
      subtotal: 80.50,
      discount: 4.03,
      insurance: 5.00,
      total: 81.47
    },
    estimatedDelivery: '3-5 business days',
    createdAt: new Date().toISOString()
  };

  let copied = false;

  async function copyConfirmationNumber() {
    try {
      await navigator.clipboard.writeText(booking.confirmationNumber);
      copied = true;
      toast.success('Confirmation number copied!');
      setTimeout(() => { copied = false; }, 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
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

  function printConfirmation() {
    window.print();
  }
</script>

<svelte:head>
  <title>Booking Confirmed | QCS Cargo</title>
</svelte:head>

<div class="max-w-3xl mx-auto">
  <!-- Success Banner -->
  <div class="text-center mb-8">
    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
      <CheckCircle class="w-10 h-10 text-green-600" />
    </div>
    <h1 class="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
    <p class="text-gray-600 mt-2">Your shipment has been scheduled successfully.</p>
  </div>

  <!-- Confirmation Number -->
  <Card class="bg-primary-50 border-primary-200 mb-6">
    <CardContent class="p-6 text-center">
      <p class="text-sm text-primary-600 mb-1">Confirmation Number</p>
      <div class="flex items-center justify-center gap-3">
        <span class="text-2xl font-mono font-bold text-primary-700">
          {booking.confirmationNumber}
        </span>
        <button
          class="p-2 hover:bg-primary-100 rounded-lg transition-colors"
          on:click={copyConfirmationNumber}
        >
          {#if copied}
            <Check class="w-5 h-5 text-green-600" />
          {:else}
            <Copy class="w-5 h-5 text-primary-600" />
          {/if}
        </button>
      </div>
      <p class="text-sm text-primary-600 mt-2">
        Save this number for your records
      </p>
    </CardContent>
  </Card>

  <!-- Booking Details Grid -->
  <div class="grid md:grid-cols-2 gap-6 mb-6">
    <!-- Drop-off Details -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-lg">
          <Calendar class="w-5 h-5" />
          Drop-off Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div>
            <p class="font-medium text-gray-900">{formatDate(booking.schedule.date)}</p>
            <p class="text-gray-600">{booking.schedule.time}</p>
          </div>
          <div class="pt-3 border-t">
            <p class="text-sm text-gray-500 mb-1">Location</p>
            <p class="font-medium text-gray-900">{COMPANY.name}</p>
            <p class="text-gray-600 text-sm">{COMPANY.fullAddress}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Recipient -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2 text-lg">
          <User class="w-5 h-5" />
          Recipient
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <p class="font-medium text-gray-900">{booking.recipient.name}</p>
          <p class="text-gray-600">{booking.recipient.address}</p>
          <p class="text-gray-600">{booking.recipient.phone}</p>
          <p class="text-sm text-primary-600 mt-2">
            → {getDestinationLabel(booking.destination)}
          </p>
        </div>
      </CardContent>
    </Card>
  </div>

  <!-- Packages -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle class="flex items-center gap-2 text-lg">
        <Package class="w-5 h-5" />
        Packages ({booking.packages.length})
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="divide-y">
        {#each booking.packages as pkg, index}
          <div class="py-3 flex items-center justify-between {index === 0 ? '' : ''}">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                {index + 1}
              </div>
              <div>
                <p class="font-mono text-sm text-primary-600">{pkg.trackingNumber}</p>
                <p class="text-sm text-gray-600">{pkg.weight} lbs • {pkg.contents}</p>
              </div>
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-4 pt-4 border-t">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <Clock class="w-4 h-4" />
          <span>Estimated delivery: {booking.estimatedDelivery}</span>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Cost Summary -->
  <Card class="mb-6">
    <CardHeader>
      <CardTitle class="text-lg">Payment Summary</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Subtotal</span>
          <span>{formatCurrency(booking.cost.subtotal)}</span>
        </div>
        {#if booking.cost.discount > 0}
          <div class="flex justify-between text-sm text-green-600">
            <span>Multi-package discount</span>
            <span>-{formatCurrency(booking.cost.discount)}</span>
          </div>
        {/if}
        {#if booking.cost.insurance > 0}
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Insurance</span>
            <span>{formatCurrency(booking.cost.insurance)}</span>
          </div>
        {/if}
        <div class="pt-2 border-t flex justify-between font-semibold">
          <span>Total Paid</span>
          <span class="text-primary-600">{formatCurrency(booking.cost.total)}</span>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- What's Next -->
  <Alert class="mb-6">
    <Mail class="w-4 h-4" />
    <AlertDescription>
      A confirmation email has been sent to your registered email address with all booking details and package labels.
    </AlertDescription>
  </Alert>

  <!-- Actions -->
  <div class="grid sm:grid-cols-3 gap-4 mb-8">
    <Button variant="outline" on:click={printConfirmation}>
      <Printer class="w-4 h-4 mr-2" />
      Print
    </Button>
    <Button variant="outline" href="/dashboard/bookings/{booking.id}">
      <Package class="w-4 h-4 mr-2" />
      View Booking
    </Button>
    <Button href="/dashboard/shipments">
      Track Shipments
      <ArrowRight class="w-4 h-4 ml-2" />
    </Button>
  </div>

  <!-- Need Help -->
  <Card class="bg-gray-50">
    <CardContent class="p-4">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
          <Mail class="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h3 class="font-medium text-gray-900">Need Help?</h3>
          <p class="text-sm text-gray-600 mt-1">
            Contact us at <a href="mailto:{COMPANY.email}" class="text-primary-600 hover:underline">{COMPANY.email}</a> or call <a href="tel:{COMPANY.phone}" class="text-primary-600 hover:underline">{COMPANY.phone}</a>
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>

<style>
  @media print {
    /* Hide non-essential elements when printing */
    :global(nav),
    :global(aside),
    :global(footer),
    button {
      display: none !important;
    }
  }
</style>

