<script lang="ts">
  import { goto } from '$app/navigation';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { STATUS_COLORS, STATUS_LABELS, COMPANY } from '$lib/config/constants';
  import { getDestinationLabel } from '$lib/config/destinations';
  import {
    ArrowLeft,
    Package,
    Calendar,
    MapPin,
    User,
    Clock,
    DollarSign,
    Phone,
    FileText,
    Edit,
    XCircle,
    AlertTriangle,
    Copy,
    Check,
    ExternalLink,
    Loader2
  } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';

  interface BookingDetail {
    id: string;
    confirmationNumber: string;
    status: 'draft' | 'pending' | 'confirmed' | 'canceled' | 'cancelled' | 'pending_payment' | 'payment_failed';
    serviceType: string;
    destination: string;
    packages: Array<{
      id: string;
      trackingNumber: string;
      weight: number;
      dimensions?: string;
      declaredValue: number;
      contents: string;
    }>;
    recipient: {
      name: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
    };
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
    paidAt?: string;
  }

  export let data: { booking: BookingDetail | null };

  let booking: BookingDetail | null = data.booking || null;
  $: booking = data.booking || null;

  $: currentBooking = booking as BookingDetail | null;
  $: statusStyle = currentBooking ? (STATUS_COLORS[currentBooking.status] || STATUS_COLORS.pending) : STATUS_COLORS.pending;
  $: hasFailedPayment = currentBooking?.status === 'pending_payment' || (currentBooking?.status === 'payment_failed');

  function isCanceledStatus(status: string | undefined): boolean {
    return status === 'canceled' || status === 'cancelled';
  }

  let copied = false;
  let isRetryingPayment = false;

  async function copyConfirmationNumber() {
    if (!currentBooking) return;
    try {
      await navigator.clipboard.writeText(currentBooking.confirmationNumber);
      copied = true;
      toast.success('Confirmation number copied!');
      setTimeout(() => { copied = false; }, 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
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

  async function cancelBooking() {
    if (!currentBooking) return;
    if (!confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${currentBooking.id}`, {
        method: 'DELETE'
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.status !== 'success') {
        throw new Error(result?.message || 'Failed to cancel booking');
      }

      booking = {
        ...currentBooking,
        status: 'canceled'
      };
      toast.success('Booking canceled');
      await goto('/dashboard/bookings');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel booking');
    }
  }

  async function retryPayment() {
    if (!currentBooking) return;
    
    isRetryingPayment = true;
    try {
      // Redirect to payment page with existing booking ID
      window.location.href = `/dashboard/bookings/${currentBooking.id}/pay`;
    } catch (error) {
      console.error('Error retrying payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
      isRetryingPayment = false;
    }
  }
</script>

<svelte:head>
  <title>Booking Details | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <!-- Back Link -->
  <a
    href="/dashboard/bookings"
    class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
  >
    <ArrowLeft class="w-4 h-4 mr-1" />
    Back to Bookings
  </a>

  {#if !currentBooking}
    <!-- Not Found -->
    <Card>
      <CardContent class="p-12 text-center">
        <FileText class="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
        <p class="text-gray-600 mb-6">This booking doesn't exist or you don't have access to it.</p>
        <Button href="/dashboard/bookings">View All Bookings</Button>
      </CardContent>
    </Card>
  {:else}
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-2xl font-bold text-gray-900">Booking Details</h1>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {statusStyle.bg} {statusStyle.text}">
            {STATUS_LABELS[currentBooking.status] || currentBooking.status}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-mono text-primary-600">{currentBooking.confirmationNumber}</span>
          <button
            class="p-1 hover:bg-gray-100 rounded"
            on:click={copyConfirmationNumber}
          >
            {#if copied}
              <Check class="w-4 h-4 text-green-600" />
            {:else}
              <Copy class="w-4 h-4 text-gray-400" />
            {/if}
          </button>
        </div>
      </div>

      <div class="flex gap-2">
        {#if currentBooking.status === 'draft'}
          <Button href={`/dashboard/bookings/${currentBooking.id}/modify`}>
            <Edit class="w-4 h-4 mr-2" />
            Continue Booking
          </Button>
        {:else if currentBooking.status === 'pending_payment' || currentBooking.status === 'confirmed'}
          <Button variant="outline" href={`/dashboard/bookings/${currentBooking.id}/modify`}>
            <Edit class="w-4 h-4 mr-2" />
            Modify Booking
          </Button>
          <Button variant="outline" on:click={cancelBooking}>
            <XCircle class="w-4 h-4 mr-2" />
            Cancel Booking
          </Button>
        {/if}
      </div>
    </div>

    <!-- Alerts -->
    {#if currentBooking.status === 'draft'}
      <Alert class="bg-amber-50 border-amber-200">
        <AlertTriangle class="w-4 h-4 text-amber-600" />
        <AlertDescription class="text-amber-800">
          This booking is incomplete. <a href={`/dashboard/bookings/${currentBooking.id}/modify`} class="underline font-medium">Continue your booking</a> to confirm.
        </AlertDescription>
      </Alert>
    {:else if hasFailedPayment}
      <Alert class="bg-red-50 border-red-200">
        <AlertTriangle class="w-4 h-4 text-red-600" />
        <AlertDescription class="text-red-800">
          Payment failed or pending. <button on:click={retryPayment} class="underline font-medium hover:no-underline" disabled={isRetryingPayment}>
            {isRetryingPayment ? 'Redirecting...' : 'Retry payment'}
          </button> to complete your booking.
        </AlertDescription>
      </Alert>
    {/if}

    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Drop-off Details -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Calendar class="w-5 h-5" />
              Drop-off Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">Date & Time</p>
                <p class="font-medium text-gray-900">{formatDate(currentBooking.schedule.date)}</p>
                <p class="text-gray-600">{currentBooking.schedule.time}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">Location</p>
                <p class="font-medium text-gray-900">{COMPANY.name}</p>
                <p class="text-sm text-gray-600">{COMPANY.fullAddress}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(COMPANY.fullAddress)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline mt-1"
                >
                  Get Directions
                  <ExternalLink class="w-3 h-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Packages -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Package class="w-5 h-5" />
              Packages ({currentBooking.packages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              {#each currentBooking.packages as pkg, index}
                <div class="p-4 bg-gray-50 rounded-lg">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span class="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-sm font-medium flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span class="font-mono text-sm text-primary-600">{pkg.trackingNumber}</span>
                    </div>
                  </div>
                  <div class="grid sm:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span class="text-gray-500">Weight:</span>
                      <span class="ml-1 text-gray-900">{pkg.weight} lbs</span>
                    </div>
                    {#if pkg.dimensions}
                      <div>
                        <span class="text-gray-500">Dimensions:</span>
                        <span class="ml-1 text-gray-900">{pkg.dimensions}</span>
                      </div>
                    {/if}
                    {#if pkg.declaredValue}
                      <div>
                        <span class="text-gray-500">Value:</span>
                        <span class="ml-1 text-gray-900">{formatCurrency(pkg.declaredValue)}</span>
                      </div>
                    {/if}
                  </div>
                  <p class="text-sm text-gray-600 mt-2">
                    <span class="text-gray-500">Contents:</span> {pkg.contents}
                  </p>
                </div>
              {/each}
            </div>

            <div class="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-gray-600">
              <Clock class="w-4 h-4" />
              <span>Estimated delivery: {currentBooking.estimatedDelivery}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Recipient -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <User class="w-5 h-5" />
              Recipient
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div>
                <p class="font-medium text-gray-900">{currentBooking.recipient.name}</p>
                <p class="text-sm text-primary-600">{getDestinationLabel(currentBooking.destination)}</p>
              </div>
              <div class="flex items-start gap-2 text-sm text-gray-600">
                <MapPin class="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{currentBooking.recipient.addressLine1}</p>
                  {#if currentBooking.recipient.addressLine2}
                    <p>{currentBooking.recipient.addressLine2}</p>
                  {/if}
                  <p>{currentBooking.recipient.city}</p>
                </div>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <Phone class="w-4 h-4" />
                <span>{currentBooking.recipient.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Cost Summary -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <DollarSign class="w-5 h-5" />
              Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal</span>
                <span>{formatCurrency(currentBooking.cost.subtotal)}</span>
              </div>
              {#if currentBooking.cost.discount > 0}
                <div class="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(currentBooking.cost.discount)}</span>
                </div>
              {/if}
              {#if currentBooking.cost.insurance > 0}
                <div class="flex justify-between">
                  <span class="text-gray-600">Insurance</span>
                  <span>{formatCurrency(currentBooking.cost.insurance)}</span>
                </div>
              {/if}
              <div class="pt-2 border-t flex justify-between font-semibold">
                <span>Total</span>
                <span class="text-primary-600">{formatCurrency(currentBooking.cost.total)}</span>
              </div>
              {#if currentBooking.paidAt}
                <p class="text-xs text-green-600 pt-2">
                  ✓ Paid on {formatDate(currentBooking.paidAt)}
                </p>
              {:else if hasFailedPayment}
                <div class="pt-2">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    class="w-full"
                    on:click={retryPayment}
                    disabled={isRetryingPayment}
                  >
                    {#if isRetryingPayment}
                      <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    {:else}
                      <DollarSign class="w-4 h-4 mr-2" />
                      Retry Payment
                    {/if}
                  </Button>
                  <p class="text-xs text-red-600 mt-2">
                    Payment required to confirm booking
                  </p>
                </div>
              {:else if !isCanceledStatus(currentBooking.status)}
                <p class="text-xs text-amber-600 pt-2">
                  Payment pending
                </p>
              {/if}
            </div>
          </CardContent>
        </Card>

        <!-- Booking Info -->
        <Card>
          <CardContent class="p-4">
            <dl class="space-y-2 text-sm">
              <div class="flex justify-between">
                <dt class="text-gray-500">Created</dt>
                <dd class="text-gray-900">{formatDate(currentBooking.createdAt)}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-500">Service</dt>
                <dd class="text-gray-900 capitalize">{currentBooking.serviceType}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  {/if}
</div>
