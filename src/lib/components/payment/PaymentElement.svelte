<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { CreditCard, AlertTriangle, Loader2, CheckCircle } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';
  import { PUBLIC_STRIPE_KEY } from '$env/static/public';
  import type { Stripe, StripeElements, StripePaymentElement } from '@stripe/stripe-js';

  export let clientSecret: string;
  export let bookingId: string;
  export let amount: number;
  export let onPaymentSuccess: (paymentIntentId: string) => void;
  export let onPaymentError: (error: Error) => void;

  let stripe: Stripe | null = null;
  let elements: StripeElements | null = null;
  let paymentElement: StripePaymentElement | null = null;
  let processing = false;
  let error: string | null = null;
  let mounted = false;

  onMount(() => {
    let disposed = false;

    async function initStripeElement() {
      if (!PUBLIC_STRIPE_KEY) {
        error = 'Payment configuration is missing. Please contact support.';
        onPaymentError(new Error('PUBLIC_STRIPE_KEY is not configured'));
        return;
      }

      try {
        const { loadStripe } = await import('@stripe/stripe-js');
        const stripeClient = await loadStripe(PUBLIC_STRIPE_KEY);
        if (!stripeClient) {
          throw new Error('Failed to initialize Stripe');
        }
        if (disposed) return;

        stripe = stripeClient;
        elements = stripe.elements({ clientSecret });
        paymentElement = elements.create('payment', {
          layout: 'tabs',
          fields: {
            billingDetails: {
              address: {
                country: 'never'
              }
            }
          }
        });

        paymentElement.mount('#payment-element');
        paymentElement.on('change', (event: any) => {
          error = event?.error?.message || null;
        });

        mounted = true;
      } catch (initErr) {
        const message =
          initErr instanceof Error ? initErr.message : 'Failed to initialize payment form.';
        error = message;
        onPaymentError(new Error(message));
      }
    }

    void initStripeElement();

    return () => {
      disposed = true;
      mounted = false;
      paymentElement?.destroy();
      paymentElement = null;
      elements = null;
      stripe = null;
    };
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!stripe || !elements || !mounted) {
      toast.error('Payment system is not ready. Please refresh the page.');
      return;
    }

    processing = true;
    error = null;

    try {
      const { error: submitError } = await elements.submit();

      if (submitError) {
        error = submitError.message || 'Payment validation failed';
        processing = false;
        return;
      }

      // Confirm the payment
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard/bookings/${bookingId}/confirmation`,
        },
        redirect: 'if_required' // Don't redirect by default, we'll handle it
      });

      if (confirmError) {
        error = confirmError.message || 'Payment failed';
        onPaymentError(new Error(confirmError.message || 'Payment failed'));
      } else if (paymentIntent?.status === 'succeeded') {
        toast.success('Payment successful!');
        onPaymentSuccess(paymentIntent.id);
      } else if (paymentIntent?.status === 'processing') {
        toast.info('Payment is processing. We will confirm shortly.');
        onPaymentSuccess(paymentIntent.id);
      } else if (paymentIntent?.status === 'requires_payment_method') {
        const message = 'Payment was not completed. Please try a different payment method.';
        error = message;
        onPaymentError(new Error(message));
      } else if (paymentIntent) {
        const message = `Payment is ${paymentIntent.status}. Please wait and refresh shortly.`;
        error = message;
        onPaymentError(new Error(message));
      } else {
        const message = 'Payment confirmation did not return a result.';
        error = message;
        onPaymentError(new Error(message));
      }
    } catch (err) {
      console.error('Payment error:', err);
      error = 'An unexpected error occurred. Please try again.';
      onPaymentError(err instanceof Error ? err : new Error('Payment failed'));
    } finally {
      processing = false;
    }
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
</script>

<Card class="w-full max-w-md mx-auto">
  <CardHeader>
    <CardTitle class="flex items-center gap-2">
      <CreditCard class="w-5 h-5" />
      Payment Details
    </CardTitle>
  </CardHeader>
  <CardContent>
    <form on:submit={handleSubmit} class="space-y-4">
      <div class="space-y-4">
        <div id="payment-element" class="min-h-[100px]"></div>
      </div>

      {#if error}
        <Alert class="border-red-200 bg-red-50">
          <AlertTriangle class="w-4 h-4 text-red-600" />
          <AlertDescription class="text-red-800">{error}</AlertDescription>
        </Alert>
      {/if}

      <Alert class="border-blue-200 bg-blue-50">
        <AlertTriangle class="w-4 h-4 text-blue-600" />
        <AlertDescription class="text-blue-800 text-sm">
          Your payment information is encrypted and secure. We never store your card details.
        </AlertDescription>
      </Alert>

      <Button
        type="submit"
        class="w-full h-12"
        disabled={processing || !mounted || !stripe}
      >
        {#if processing}
          <Loader2 class="w-4 h-4 mr-2 animate-spin" />
          Processing Payment...
        {:else}
          <CheckCircle class="w-4 h-4 mr-2" />
          Pay {formatCurrency(amount)}
        {/if}
      </Button>
    </form>
  </CardContent>
</Card>

<style>
  /* Customize Stripe Elements appearance */
  :global(#payment-element) {
    min-height: 100px;
  }

  :global(.StripeElement) {
    padding: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    background-color: white;
    transition: border-color 0.2s;
  }

  :global(.StripeElement--focus) {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  :global(.StripeElement--invalid) {
    border-color: #ef4444;
  }

  :global(.PaymentElement) {
    padding: 0;
  }
</style>
