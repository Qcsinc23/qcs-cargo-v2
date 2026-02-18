<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import PaymentElement from '$lib/components/payment/PaymentElement.svelte';
  import { ArrowLeft, Package, Calendar, MapPin, User, DollarSign, CheckCircle, AlertTriangle } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';

  
  const bookingId = $page.params.id ?? '';
  let booking: any = null;
  let loading = true;
  let paymentLoading = false;
  let clientSecret: string | null = null;
  let paymentIntentId: string | null = null;

  onMount(async () => {
    await Promise.all([fetchBooking(), createPaymentIntent()]);
  });

  async function fetchBooking() {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`);
      const result = await response.json();

      if (result.status !== 'success') {
        throw new Error(result.message || 'Failed to load booking');
      }

      booking = result.data.booking;
    } catch (err) {
      console.error('Failed to fetch booking:', err);
      toast.error('Failed to load booking details');
      goto('/dashboard/bookings');
    }
  }

  async function createPaymentIntent() {
    try {
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          description: `QCS Cargo Booking ${bookingId}`
        })
      });

      const result = await response.json();

      if (result.status !== 'success') {
        throw new Error(result.message || 'Failed to initialize payment');
      }

      clientSecret = result.data.clientSecret;
      paymentIntentId = result.data.paymentIntentId;
    } catch (err) {
      console.error('Failed to create payment intent:', err);
      toast.error('Failed to initialize payment');
    } finally {
      loading = false;
    }
  }

  async function handlePaymentSuccess(intentId: string) {
    paymentLoading = true;
    try {
      const reconcileResponse = await fetch('/api/payments/reconcile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, paymentIntentId: intentId })
      });

      const reconcileResult = await reconcileResponse.json().catch(() => null);
      if (!reconcileResponse.ok || reconcileResult?.status !== 'success') {
        console.warn('[payment_reconcile] Deferred to webhook processing', reconcileResult);
        toast.warning('Payment received. Confirmation may take a few moments.');
      } else {
        toast.success('Payment successful! Redirecting...');
      }
    } catch (reconcileErr) {
      console.warn('[payment_reconcile] Failed', reconcileErr);
      toast.warning('Payment received. Confirmation may take a few moments.');
    }

    // Give a moment for the user to see the success message
    setTimeout(() => {
      goto(`/dashboard/bookings/${bookingId}/confirmation`);
    }, 1500);
  }

  function handlePaymentError(error: Error) {
    paymentLoading = false;
    toast.error(error.message || 'Payment failed');
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }
</script>

<svelte:head>
  <title>Complete Payment | QCS Cargo</title>
</svelte:head>

<div class="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
  <!-- Payment Form -->
  <div>
    <div class="mb-6">
      <Button variant="ghost" href={`/dashboard/bookings/${bookingId}`} class="mb-4">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Back to Booking
      </Button>
      <h1 class="text-3xl font-bold text-gray-900">Complete Payment</h1>
      <p class="text-gray-600 mt-1">Securely pay for your shipment</p>
    </div>

    {#if loading}
      <div class="flex items-center justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    {:else if clientSecret && paymentIntentId}
      <PaymentElement
        {clientSecret}
        {bookingId}
        amount={booking?.total_cost || 0}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    {:else}
      <Alert class="border-red-200 bg-red-50">
        <AlertTriangle class="w-4 h-4 text-red-600" />
        <AlertDescription class="text-red-800">
          Unable to initialize payment. Please refresh the page or contact support.
        </AlertDescription>
      </Alert>
    {/if}
  </div>

  <!-- Booking Summary -->
  <div class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle>Booking Summary</CardTitle>
      </CardHeader>
      <CardContent class="space-y-4">
        {#if booking}
          <!-- Service -->
          <div class="flex items-center gap-3">
            <Package class="w-5 h-5 text-gray-400" />
            <div>
              <p class="font-medium text-gray-900">{booking.service_type?.replace('_', ' ') || 'Standard'}</p>
              <p class="text-sm text-primary-600">→ {booking.destination}</p>
            </div>
          </div>

          <!-- Schedule -->
          <div class="flex items-center gap-3">
            <Calendar class="w-5 h-5 text-gray-400" />
            <div>
              <p class="font-medium text-gray-900">
                {formatDate(booking.scheduled_date)}
              </p>
              <p class="text-sm text-gray-500">{booking.time_slot}</p>
            </div>
          </div>

          <!-- Recipient -->
          {#if booking.expand?.recipient}
            <div class="flex items-center gap-3">
              <User class="w-5 h-5 text-gray-400" />
              <div>
                <p class="font-medium text-gray-900">{booking.expand.recipient.name}</p>
                <p class="text-sm text-gray-500">{booking.expand.recipient.city}</p>
              </div>
            </div>
          {/if}
        {/if}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <DollarSign class="w-5 h-5" />
          Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        {#if booking}
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Subtotal</span>
            <span>{formatCurrency(booking.subtotal || 0)}</span>
          </div>

          {#if booking.discount > 0}
            <div class="flex justify-between text-sm text-green-600">
              <span>Multi-package discount</span>
              <span>-{formatCurrency(booking.discount)}</span>
            </div>
          {/if}

          {#if booking.insurance_cost > 0}
            <div class="flex justify-between text-sm">
              <span>Insurance</span>
              <span>{formatCurrency(booking.insurance_cost)}</span>
            </div>
          {/if}

          <div class="pt-3 border-t flex justify-between font-semibold text-lg">
            <span>Total Amount</span>
            <span class="text-primary-600">{formatCurrency(booking.total_cost || 0)}</span>
          </div>
        {/if}
      </CardContent>
    </Card>

    <Alert class="border-green-200 bg-green-50">
      <CheckCircle class="w-4 h-4 text-green-600" />
      <AlertDescription class="text-green-800">
        <strong>Secure Payment:</strong> Your payment is processed by Stripe, a leader in online security.
        Your card details are never stored on our servers.
      </AlertDescription>
    </Alert>

    <div class="text-center text-sm text-gray-500">
      <p>Need help? Contact us at support@qcscargo.com</p>
    </div>
  </div>
</div>
