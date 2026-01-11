<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Package, Zap, Truck, Shield, AlertCircle } from 'lucide-svelte';
  import { UNIFIED_PRICING } from '$lib/config/pricing-unified';
  import type { CalculationBreakdown } from '$lib/types/calculator';
  import { booking } from '$lib/stores/booking';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  export let result: CalculationBreakdown;
  export let onReset: () => void;
  export let destination: string = '';
  export let serviceType: string = 'standard';
  export let dimensions: { length: number | null; width: number | null; height: number | null } | undefined = undefined;

  const heavyThreshold = UNIFIED_PRICING.fees.heavyWeight.threshold;
  const handlingMinimum = UNIFIED_PRICING.fees.handling.minimum;

  function handleBookNow() {
    // 1. Initialize booking store from this result
    booking.initFromCalculatorResult(result, destination, serviceType, dimensions);

    // 2. Redirect to booking page (which will handle auth if needed)
    const target = '/dashboard/bookings/new';
    
    if ($page.data.user) {
      goto(target);
    } else {
      // Redirect to register with return path
      goto(`/register?redirectTo=${encodeURIComponent(target)}`);
    }
  }
</script>

<Card class="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
  <CardHeader class="pb-2">
    <CardTitle class="text-lg flex items-center gap-2">
      <Package class="h-5 w-5" />
      Shipping Quote Breakdown
    </CardTitle>
    <CardDescription>
      {result.destinationName} via {result.serviceName}
    </CardDescription>
  </CardHeader>
  <CardContent class="space-y-4">
    <!-- Weight Summary -->
    <div class="grid grid-cols-3 gap-2 p-3 bg-white/60 rounded-lg text-sm">
      <div class="text-center">
        <p class="text-slate-500">Actual</p>
        <p class="font-semibold">{result.actualWeight.toFixed(1)} lbs</p>
      </div>
      {#if result.dimensionalWeight}
        <div class="text-center border-x">
          <p class="text-slate-500">Dimensional</p>
          <p class="font-semibold">{result.dimensionalWeight.toFixed(1)} lbs</p>
        </div>
      {:else}
        <div class="text-center border-x">
          <p class="text-slate-500">Dimensional</p>
          <p class="text-slate-400">N/A</p>
        </div>
      {/if}
      <div class="text-center">
        <p class="text-slate-500">Billable</p>
        <p class="font-bold text-primary-600">{result.billableWeight.toFixed(1)} lbs</p>
      </div>
    </div>

    <!-- Cost Breakdown -->
    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-slate-600">
          Base Cost ({result.billableWeight.toFixed(1)} lbs × ${result.ratePerLb.toFixed(2)})
        </span>
        <span class="font-medium">${result.baseCost.toFixed(2)}</span>
      </div>

      {#if result.expressFee > 0}
        <div class="flex justify-between text-amber-700">
          <span class="flex items-center gap-1">
            <Zap class="h-3 w-3" />
            Express Surcharge (+50%)
          </span>
          <span class="font-medium">${result.expressFee.toFixed(2)}</span>
        </div>
      {/if}

      {#if result.doorToDoorFee > 0}
        <div class="flex justify-between text-blue-700">
          <span class="flex items-center gap-1">
            <Truck class="h-3 w-3" />
            Door-to-Door Pickup
          </span>
          <span class="font-medium">${result.doorToDoorFee.toFixed(2)}</span>
        </div>
      {/if}

      {#if result.handlingFee > 0}
        <div class="flex justify-between text-orange-700">
          <span class="flex items-center gap-1">
            <Package class="h-3 w-3" />
            {#if result.billableWeight > heavyThreshold}
              Heavy Package Handling (&gt;{heavyThreshold} lbs)
            {:else if result.handlingFee === handlingMinimum}
              Handling Fee (min ${handlingMinimum})
            {:else}
              Handling Fee
            {/if}
          </span>
          <span class="font-medium">${result.handlingFee.toFixed(2)}</span>
        </div>
      {/if}

      <div class="flex justify-between border-t pt-2">
        <span class="text-slate-700">Subtotal</span>
        <span class="font-semibold">${result.subtotal.toFixed(2)}</span>
      </div>

      {#if result.insuranceFee > 0}
        <div class="flex justify-between text-green-700">
          <span class="flex items-center gap-1">
            <Shield class="h-3 w-3" />
            Insurance (${result.declaredValue || 0} value)
          </span>
          <span class="font-medium">${result.insuranceFee.toFixed(2)}</span>
        </div>
      {/if}
    </div>

    <!-- Total -->
    <div class="flex justify-between items-center border-t-2 border-primary-300 pt-4">
      <span class="text-xl font-bold text-slate-800">Total</span>
      <span class="text-3xl font-bold text-primary-600">
        ${result.total.toFixed(2)}
      </span>
    </div>

    <p class="text-sm text-slate-500 text-center">
      Estimated delivery: <span class="font-medium">{result.estimatedDelivery}</span>
    </p>

    <!-- Actions -->
    <div class="flex gap-3 pt-4">
      <Button variant="outline" on:click={onReset} class="flex-1">
        New Quote
      </Button>
      <Button variant="default" class="flex-1" on:click={handleBookNow}>
        Book Shipment
      </Button>
    </div>
  </CardContent>
</Card>