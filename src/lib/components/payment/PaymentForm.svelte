<script lang="ts">
  import { onMount } from 'svelte';
  import { loadStripe } from '@stripe/stripe-js';
  import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { CreditCard, AlertTriangle, Loader2, CheckCircle } from 'lucide-svelte';
  import { PUBLIC_STRIPE_KEY } from '$env/static/public';
  import { toast } from '$lib/stores/toast';

  export let clientSecret: string;
  export let paymentIntentId: string;
  export let amount: number;
  export let onPaymentSuccess: (paymentIntentId: string) => void;
  export let onPaymentError: (error: Error) => void;

  // Load Stripe instance
  let stripePromise = loadStripe(PUBLIC_STRIPE_KEY);

  // Component for the actual payment form
  const CheckoutForm: typeof svelte.Component = create_svelte_component({
    // This will be defined inline
  });

  let processing = false;
  let error: string | null = null;

  // Inner checkout component that uses Stripe hooks
  const InnerCheckoutForm = () => {
    const stripe = useStripe();
    const elements = useElements();

    async function handleSubmit(e: Event) {
      e.preventDefault();

      if (!stripe || !elements) {
        return;
      }

      processing = true;
      error = null;

      const { error: submitError } = await elements.submit();

      if (submitError) {
        error = submitError.message || 'Payment failed';
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
        processing = false;
        onPaymentError(new Error(confirmError.message || 'Payment failed'));
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess(paymentIntent.id);
      }

      processing = false;
    }

    return {
      handleSubmit,
      stripe,
      elements
    };
  };

  const checkoutForm = InnerCheckoutForm();
</script>

<Elements stripe={stripePromise} options={{ clientSecret }}>
  <Card class="w-full max-w-md mx-auto">
    <CardHeader>
      <CardTitle class="flex items-center gap-2">
        <CreditCard class="w-5 h-5" />
        Payment Details
      </CardTitle>
    </CardHeader>
    <CardContent>
      <form on:submit={checkoutForm.handleSubmit} class="space-y-4">
        <div class="space-y-4">
          <PaymentElement
            options={{
              layout: 'tabs',
              fields: {
                billingDetails: {
                  address: {
                    country: 'never'
                  }
                }
              }
            }}
          />
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
          class="w-full"
          disabled={processing || !checkoutForm.stripe || !checkoutForm.elements}
        >
          {#if processing}
            <Loader2 class="w-4 h-4 mr-2 animate-spin" />
            Processing Payment...
          {:else}
            <CheckCircle class="w-4 h-4 mr-2" />
            Pay ${amount.toFixed(2)}
          {/if}
        </Button>
      </form>
    </CardContent>
  </Card>
</Elements>

<style>
  /* Customize Stripe Elements appearance */
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