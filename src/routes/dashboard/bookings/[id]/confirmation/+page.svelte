<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { getDestinationLabel } from '$lib/config/destinations';
  import { COMPANY, SERVICES_INFO } from '$lib/config/constants';
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
    Check,
    Loader2,
    QrCode
  } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';

  export let data: any;
  $: void data;

  $: bookingId = $page.params.id || '';

  interface PackageData {
    id: string;
    tracking_number: string;
    qr_code: string;
    weight: number | null;
    contents_description: string;
    billable_weight: number | null;
    cost: number;
  }

  interface BookingData {
    id: string;
    confirmationNumber: string;
    status: string;
    serviceType: string;
    destination: string;
    packages: PackageData[];
    recipient: {
      name: string;
      phone: string;
      address: string;
      city: string;
    } | null;
    schedule: {
      date: string;
      time: string;
    };
    cost: {
      subtotal: number;
      discount: number;
      insurance: number;
      total: number;
    };
    estimatedDelivery: string;
    createdAt: string;
  }

  let booking: BookingData | null = null;
  let loading = true;
  let error: string | null = null;

  onMount(async () => {
    await fetchBookingData();
  });

  async function fetchBookingData() {
    if (!bookingId) {
      error = 'Booking ID not found';
      loading = false;
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const result = await response.json();

      if (result.status !== 'success') {
        throw new Error(result.message || 'Failed to load booking');
      }

      const { booking: bookingData, packages } = result.data;
      const recipient = bookingData.expand?.recipient;

      // Determine estimated delivery based on service type
      const service = SERVICES_INFO.find(s => s.id === bookingData.service_type);
      const transitDays = service?.transitTime || '5-7 business days';

      booking = {
        id: bookingData.id,
        confirmationNumber: 'QCS-' + bookingData.id.toUpperCase().slice(0, 8),
        status: bookingData.status,
        serviceType: bookingData.service_type,
        destination: bookingData.destination,
        packages: packages.map((pkg: PackageData) => ({
          id: pkg.id,
          tracking_number: pkg.tracking_number,
          qr_code: pkg.qr_code,
          weight: pkg.billable_weight || pkg.weight,
          contents_description: pkg.contents_description || 'Package',
          cost: pkg.cost
        })),
        recipient: recipient ? {
          name: recipient.name,
          phone: recipient.phone,
          address: `${recipient.address_line1}${recipient.address_line2 ? ', ' + recipient.address_line2 : ''}`,
          city: recipient.city
        } : null,
        schedule: {
          date: bookingData.scheduled_date,
          time: bookingData.time_slot
        },
        cost: {
          subtotal: bookingData.subtotal || 0,
          discount: bookingData.discount || 0,
          insurance: bookingData.insurance_cost || 0,
          total: bookingData.total_cost || 0
        },
        estimatedDelivery: transitDays,
        createdAt: bookingData.created
      };
    } catch (err) {
      console.error('Failed to fetch booking:', err);
      error = err instanceof Error ? err.message : 'Failed to load booking';
    } finally {
      loading = false;
    }
  }

  let copied = false;

  async function copyConfirmationNumber() {
    if (!booking?.confirmationNumber) {
      toast.error('Confirmation number not available');
      return;
    }
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

{#if loading}
  <div class="flex items-center justify-center py-16">
    <Loader2 class="w-8 h-8 animate-spin text-primary-600" />
  </div>
{:else if error}
  <div class="max-w-md mx-auto text-center py-16">
    <div class="text-red-500 mb-4">
      <Package class="w-12 h-12 mx-auto" />
    </div>
    <h2 class="text-xl font-semibold text-gray-900 mb-2">Failed to Load Booking</h2>
    <p class="text-gray-600 mb-4">{error}</p>
    <Button href="/dashboard/bookings">Return to Bookings</Button>
  </div>
{:else if booking}
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
        {#if booking.recipient}
          <div class="space-y-2">
            <p class="font-medium text-gray-900">{booking.recipient.name}</p>
            <p class="text-gray-600">{booking.recipient.address}</p>
            <p class="text-gray-600">{booking.recipient.phone}</p>
            <p class="text-sm text-primary-600 mt-2">
              → {getDestinationLabel(booking.destination)}
            </p>
          </div>
        {:else}
          <p class="text-gray-500 text-sm">Recipient details will be confirmed</p>
          <p class="text-sm text-primary-600 mt-2">
            → {getDestinationLabel(booking.destination)}
          </p>
        {/if}
      </CardContent>
    </Card>
  </div>

  <!-- Packages with QR Codes -->
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
          <div class="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-medium text-primary-700">
                {index + 1}
              </div>
              <div>
                <p class="font-mono text-sm text-primary-600">{pkg.tracking_number}</p>
                <p class="text-sm text-gray-600">
                  {pkg.weight ? `${pkg.weight} lbs` : 'Weight TBD'} • {pkg.contents_description}
                </p>
              </div>
            </div>
            <!-- QR Code -->
            {#if pkg.qr_code}
              <div class="flex-shrink-0 text-center">
                <img 
                  src={pkg.qr_code} 
                  alt="QR code for {pkg.tracking_number}" 
                  class="w-20 h-20 border rounded"
                />
                <p class="text-xs text-gray-500 mt-1">Scan for tracking</p>
              </div>
            {:else}
              <div class="flex-shrink-0 w-20 h-20 border rounded bg-gray-50 flex items-center justify-center">
                <QrCode class="w-8 h-8 text-gray-300" />
              </div>
            {/if}
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
{/if}

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
