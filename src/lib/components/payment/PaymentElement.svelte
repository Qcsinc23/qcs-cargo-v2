<script lang="ts">
  import { onMount } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { CreditCard, AlertTriangle, Loader2, CheckCircle } from 'lucide-svelte';
  import { toast } from '$lib/stores/toast';

  export let clientSecret: string;
  export let paymentIntentId: string;
  export let amount: number;
  export let onPaymentSuccess: (paymentIntentId: string) => void;
  export let onPaymentError: (error: Error) => void;

  let stripe: any;
  let elements: any;
  let processing = false;
  let error: string | null = null;
  let mounted = false;

  onMount(async () => {
    // Dynamically import Stripe to avoid SSR issues
    const { loadStripe } = await import('@stripe/stripe-js');

    if (!window.Stripe) {
      // Load Stripe script if not already loaded
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = async () => {
        stripe = loadStripe(import.meta.env.PUBLIC_STRIPE_KEY);
        elements = stripe.elements({ clientSecret });

        const paymentElement = elements.create('payment', {
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

        // Handle real-time validation errors
        paymentElement.on('change', (event: any) => {
          if (event.error) {
            error = event.error.message;
          } else {
            error = null;
          }
        });

        mounted = true;
      };
      document.head.appendChild(script);
    }
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
          return_url: `${window.location.origin}/dashboard/bookings/${paymentIntentId}/confirmation`,
        },
        redirect: 'if_required' // Don't redirect by default, we'll handle it
      });

      if (confirmError) {
        error = confirmError.message || 'Payment failed';
        onPaymentError(new Error(confirmError.message || 'Payment failed'));
      } else if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        toast.success('Payment successful!');
        onPaymentSuccess(paymentIntent.id);
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
