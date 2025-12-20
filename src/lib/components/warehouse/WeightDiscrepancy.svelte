<script lang="ts">
  /**
   * WeightDiscrepancy Component
   * 
   * Displays weight discrepancy alert when actual weight differs from estimated.
   * Allows staff to proceed (within threshold) or hold package for customer notification.
   */
  
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { Scale, AlertTriangle, DollarSign, Mail, Check, X } from 'lucide-svelte';
  import { formatCurrency } from '$lib/utils/format';

  interface ShipmentData {
    tracking_number: string;
    booking_id: string;
    estimated_weight: number;
    rate_per_lb: number;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
  }

  export let shipment: ShipmentData;
  export let actualWeight: number;
  export let onProceed: (actualWeight: number, additionalCost: number) => void;
  export let onHold: (discrepancyData: DiscrepancyData) => void;
  export let onCancel: () => void;

  export interface DiscrepancyData {
    bookingId: string;
    trackingNumber: string;
    estimatedWeight: number;
    actualWeight: number;
    weightDifference: number;
    percentageDifference: number;
    additionalCost: number;
    customerEmail: string;
    customerName: string;
  }

  // Configuration
  const THRESHOLD_PERCENT = 10; // Auto-approve if within 10%
  
  $: estimatedWeight = shipment.estimated_weight || 0;
  $: weightDifference = actualWeight - estimatedWeight;
  $: percentageDifference = estimatedWeight > 0 
    ? ((weightDifference / estimatedWeight) * 100)
    : 0;
  $: isOverweight = weightDifference > 0;
  $: additionalCost = isOverweight 
    ? weightDifference * (shipment.rate_per_lb || 3.50)
    : 0;

  // Threshold for auto-approval (within 10%)
  $: isWithinThreshold = Math.abs(percentageDifference) <= THRESHOLD_PERCENT;

  function handleProceed() {
    onProceed(actualWeight, additionalCost);
  }

  function handleHold() {
    const data: DiscrepancyData = {
      bookingId: shipment.booking_id,
      trackingNumber: shipment.tracking_number,
      estimatedWeight,
      actualWeight,
      weightDifference,
      percentageDifference,
      additionalCost,
      customerEmail: shipment.customer_email,
      customerName: shipment.customer_name
    };
    onHold(data);
  }
</script>

<Card class="p-6 border-amber-200 bg-amber-50/50">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
      <Scale class="w-5 h-5 text-amber-600" />
    </div>
    <div>
      <h3 class="font-semibold text-gray-900">Weight Discrepancy Detected</h3>
      <p class="text-sm text-gray-500">Package: {shipment.tracking_number}</p>
    </div>
  </div>

  <!-- Comparison -->
  <div class="grid grid-cols-2 gap-4 mb-6">
    <div class="p-4 bg-white rounded-lg border">
      <p class="text-sm text-gray-500 mb-1">Estimated Weight</p>
      <p class="text-2xl font-bold text-gray-900">
        {estimatedWeight > 0 ? `${estimatedWeight} lbs` : 'Not provided'}
      </p>
    </div>
    <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <p class="text-sm text-blue-600 mb-1">Actual Weight</p>
      <p class="text-2xl font-bold text-blue-900">{actualWeight} lbs</p>
    </div>
  </div>

  <!-- Difference -->
  <div class="p-4 rounded-lg mb-6 {isOverweight ? 'bg-amber-100 border border-amber-300' : 'bg-green-100 border border-green-300'}">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm {isOverweight ? 'text-amber-600' : 'text-green-600'}">
          Difference
        </p>
        <p class="text-lg font-bold {isOverweight ? 'text-amber-900' : 'text-green-900'}">
          {isOverweight ? '+' : ''}{weightDifference.toFixed(1)} lbs ({isOverweight ? '+' : ''}{percentageDifference.toFixed(1)}%)
        </p>
      </div>
      
      {#if isOverweight && additionalCost > 0}
        <div class="text-right">
          <p class="text-sm text-amber-600 flex items-center gap-1">
            <DollarSign class="w-3 h-3" />
            Additional Cost
          </p>
          <p class="text-lg font-bold text-amber-900">
            {formatCurrency(additionalCost)}
          </p>
        </div>
      {/if}
    </div>
  </div>

  <!-- Customer Info -->
  <div class="mb-6 p-3 bg-white rounded-lg border">
    <p class="text-sm text-gray-500 mb-1">Customer</p>
    <p class="font-medium">{shipment.customer_name}</p>
    <p class="text-sm text-gray-500">{shipment.customer_email}</p>
    {#if shipment.customer_phone}
      <p class="text-sm text-gray-500">{shipment.customer_phone}</p>
    {/if}
  </div>

  <!-- Actions based on threshold -->
  {#if isWithinThreshold}
    <Alert class="mb-4 bg-green-50 border-green-200">
      <Check class="w-4 h-4 text-green-600" />
      <AlertDescription class="text-green-800">
        Weight is within {THRESHOLD_PERCENT}% threshold. You can proceed with the updated weight.
      </AlertDescription>
    </Alert>
    
    <div class="flex gap-3">
      <Button variant="outline" class="flex-1" on:click={onCancel}>
        <X class="w-4 h-4 mr-2" />
        Cancel
      </Button>
      <Button class="flex-1" on:click={handleProceed}>
        <Check class="w-4 h-4 mr-2" />
        Proceed with {actualWeight} lbs
      </Button>
    </div>
  {:else}
    <Alert class="mb-4 bg-amber-100 border-amber-300">
      <AlertTriangle class="w-4 h-4 text-amber-600" />
      <AlertDescription class="text-amber-800">
        Weight exceeds {THRESHOLD_PERCENT}% threshold. Customer notification required before proceeding.
      </AlertDescription>
    </Alert>

    <div class="space-y-3">
      <Button class="w-full" on:click={handleHold}>
        <Mail class="w-4 h-4 mr-2" />
        Notify Customer & Hold Package
      </Button>
      
      <p class="text-xs text-gray-500 text-center">
        An email will be sent to the customer with the updated weight and cost.
        Package will be held until payment is received.
      </p>
      
      <Button variant="outline" class="w-full" on:click={onCancel}>
        <X class="w-4 h-4 mr-2" />
        Cancel & Re-weigh
      </Button>
    </div>
  {/if}
</Card>





