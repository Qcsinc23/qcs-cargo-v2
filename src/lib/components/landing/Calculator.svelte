<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { Label } from '$lib/components/ui/label';
  import { NumericInput } from '$lib/components/ui/numeric-input';
  import SkipLink from '$lib/components/ui/SkipLink.svelte';
  import CalculatorForm from '$lib/components/calculator/CalculatorForm.svelte';
  import DimensionInput from '$lib/components/calculator/DimensionInput.svelte';
  import InsuranceOption from '$lib/components/calculator/InsuranceOption.svelte';
  import CalculationResult from '$lib/components/calculator/CalculationResult.svelte';
  import { Calculator as CalcIcon, Shield, Package, Truck, Weight, DollarSign, Ruler, AlertCircle, Info, Zap } from 'lucide-svelte';
  import { DESTINATIONS, SERVICES } from '$lib/config';
  import { UNIFIED_PRICING, PricingCalculator } from '$lib/config/pricing-unified';
  import type { CalculationBreakdown } from '$lib/types/calculator';

  // Form state
  let destination: string = '';
  let actualWeight: number | null = null;
  let length: number | null = null;
  let width: number | null = null;
  let height: number | null = null;
  let declaredValue: number | null = null;
  let selectedService: string = 'standard';
  let includeInsurance: boolean = false;

  // Calculation state
  let isCalculating = false;
  let calculationResult: CalculationBreakdown | null = null;
  let calculationError: string | null = null;
  let formErrors: Record<string, string> = {};

  // ============================================
  // CALCULATION HELPERS - Using unified pricing
  // ============================================
  function calculateDimensionalWeight(): number | null {
    if (!length || !width || !height) return null;
    return PricingCalculator.calculateDimensionalWeight({ length, width, height });
  }

  function getBillableWeight(): number {
    if (!actualWeight) return 0;
    const dimensions = length && width && height ? { length, width, height } : undefined;
    return PricingCalculator.calculateBillableWeight(actualWeight, dimensions);
  }

  function calculateInsuranceFee(value: number | null, include: boolean): number {
    return PricingCalculator.calculateInsuranceFee(value || 0, include);
  }

  // ============================================
  // MAIN CALCULATION FUNCTION
  // Total = Base + Express + Handling + Insurance + Door-to-Door
  // ============================================
  // Event handlers
  function handleFormInput({ field, value }: { field: string; value: string }) {
    formErrors[field] = '';
    calculationError = null;

    // Convert string values to numbers
    switch (field) {
      case 'actualWeight':
        actualWeight = value ? parseFloat(value) : null;
        break;
      case 'declaredValue':
        declaredValue = value ? parseFloat(value) : null;
        break;
      case 'length':
        length = value ? parseFloat(value) : null;
        break;
      case 'width':
        width = value ? parseFloat(value) : null;
        break;
      case 'height':
        height = value ? parseFloat(value) : null;
        break;
    }
  }

  function handleDimensionChange({ dimension, value }: { dimension: string; value: string }) {
    formErrors[dimension] = '';
    calculationError = null;

    switch (dimension) {
      case 'length':
        length = value ? parseFloat(value) : null;
        break;
      case 'width':
        width = value ? parseFloat(value) : null;
        break;
      case 'height':
        height = value ? parseFloat(value) : null;
        break;
    }
  }

  async function calculateShipping() {
    // Reset errors
    formErrors = {};
    calculationError = null;
    calculationResult = null;

    // Validation
    if (!destination) {
      formErrors.destination = 'Please select a destination';
      return;
    }
    if (!actualWeight || actualWeight <= 0 || actualWeight > 500) {
      formErrors.actualWeight = 'Weight must be between 0.1 and 500 lbs';
      return;
    }
    if (length && (length < 1 || length > 100)) {
      formErrors.length = 'Length must be between 1 and 100 inches';
      return;
    }
    if (width && (width < 1 || width > 100)) {
      formErrors.width = 'Width must be between 1 and 100 inches';
      return;
    }
    if (height && (height < 1 || height > 100)) {
      formErrors.height = 'Height must be between 1 and 100 inches';
      return;
    }
    if (declaredValue && declaredValue < 0) {
      formErrors.declaredValue = 'Declared value cannot be negative';
      return;
    }
    if (!selectedService) {
      calculationError = 'Please select a service level';
      return;
    }

    isCalculating = true;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const service = SERVICES.find(s => s.id === selectedService);
      if (!service) {
        throw new Error('Invalid service level');
      }

      // Use the unified pricing calculator
      const dimensions = length && width && height ? { length, width, height } : undefined;
      const serviceLevel = selectedService as 'standard' | 'express' | 'door_to_door';

      const result = PricingCalculator.calculateShipping({
        destination,
        weight: actualWeight,
        dimensions,
        serviceLevel,
        declaredValue: declaredValue || undefined,
        includeInsurance,
        packageCount: 1
      });

      // Calculate estimated delivery date
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + result.estimatedDeliveryDays);

      calculationResult = {
        actualWeight: result.actualWeight,
        dimensionalWeight: result.dimensionalWeight,
        billableWeight: result.billableWeight,
        baseCost: result.baseCost,
        expressFee: result.expressFee,
        handlingFee: result.handlingFee,
        insuranceFee: result.insuranceFee,
        doorToDoorFee: result.doorToDoorFee,
        subtotal: result.subtotal,
        total: result.total,
        ratePerLb: result.ratePerLb,
        destinationName: result.destinationName,
        serviceName: service.name,
        estimatedDelivery: deliveryDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      };
    } catch (error) {
      calculationError = error instanceof Error ? error.message : 'Failed to calculate shipping rate';
    } finally {
      isCalculating = false;
    }
  }

  function round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  function resetCalculator() {
    destination = '';
    actualWeight = null;
    length = null;
    width = null;
    height = null;
    declaredValue = null;
    selectedService = 'standard';
    includeInsurance = false;
    calculationResult = null;
    calculationError = null;
  }

  // Reactive calculations for live preview
  $: dimensionalWeight = calculateDimensionalWeight();
  $: billableWeight = actualWeight ? getBillableWeight() : null;
  $: showDimWarning = dimensionalWeight && actualWeight && dimensionalWeight > actualWeight;
  $: showHeavyWarning = billableWeight && billableWeight > UNIFIED_PRICING.fees.heavyWeight.threshold;
  $: estimatedInsuranceFee = declaredValue ? calculateInsuranceFee(declaredValue, includeInsurance) : 0;
</script>

<!-- Skip link for keyboard users -->
<SkipLink target="#calculator-form" label="Skip to calculator form" />

<Card class="w-full max-w-4xl mx-auto">
  <CardHeader>
    <CardTitle class="flex items-center gap-2" id="calculator-heading">
      <CalcIcon class="h-6 w-6" aria-hidden="true" />
      Shipping Calculator
    </CardTitle>
    <CardDescription>
      Get an instant quote for your shipment to the Caribbean
    </CardDescription>
  </CardHeader>
  
  <CardContent class="space-y-6">
  <form id="calculator-form" on:submit|preventDefault={calculateShipping} aria-labelledby="calculator-heading">
    <!-- Error Announcement -->
    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {#if calculationError}
        Error: {calculationError}
      {/if}
    </div>

    <!-- Success Announcement -->
    <div aria-live="assertive" aria-atomic="true" class="sr-only">
      {#if calculationResult}
        Shipping quote calculated successfully. Total cost: {'$'}{calculationResult.total.toFixed(2)}
      {/if}
    </div>

    <!-- Destination Selection -->
    <div class="space-y-2">
      <Label for="destination" class="flex items-center gap-2">
        <Truck class="h-4 w-4" aria-hidden="true" />
        Destination <span class="text-destructive" aria-label="required field">*</span>
      </Label>
      <select
        id="destination"
        bind:value={destination}
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        required
      >
        <option value="">Select destination</option>
        {#each DESTINATIONS as dest}
          <option value={dest.id}>
            {dest.flag} {dest.name} — {'$'}{dest.baseRate.toFixed(2)}/lb
          </option>
        {/each}
      </select>
    </div>

    <!-- Weight Section -->
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-2">
        <Label for="weight" class="flex items-center gap-2">
          <Weight class="h-4 w-4" aria-hidden="true" />
          Actual Weight (lbs) <span class="text-destructive" aria-label="required field">*</span>
        </Label>
        <NumericInput
          id="weight"
          bind:value={actualWeight}
          options={{ precision: 1, valueRange: { min: 0.1, max: 500 } }}
          placeholder="e.g., 72"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="declaredValue" class="flex items-center gap-2">
          <DollarSign class="h-4 w-4" />
          Declared Value (USD)
        </Label>
        <NumericInput
          id="declaredValue"
          bind:value={declaredValue}
          options={{ precision: 0, valueRange: { min: 0, max: 50000 } }}
          placeholder="e.g., 550"
        />
      </div>
    </div>

    <!-- Dimensions -->
    <div class="space-y-2">
      <Label class="flex items-center gap-2">
        <Ruler class="h-4 w-4" />
        Package Dimensions (inches)
      </Label>
      <p class="text-xs text-muted-foreground">
        Dimensional Weight = (L × W × H) ÷ {UNIFIED_PRICING.dimensionalWeight.divisor}
      </p>
      <div class="grid gap-2 sm:grid-cols-3">
        <NumericInput
          bind:value={length}
          options={{ precision: 1, valueRange: { min: 1, max: 100 } }}
          placeholder="Length"
        />
        <NumericInput
          bind:value={width}
          options={{ precision: 1, valueRange: { min: 1, max: 100 } }}
          placeholder="Width"
        />
        <NumericInput
          bind:value={height}
          options={{ precision: 1, valueRange: { min: 1, max: 100 } }}
          placeholder="Height"
        />
      </div>
      
      <!-- Live Weight Preview -->
      {#if dimensionalWeight || actualWeight}
        <div class="mt-3 p-3 bg-slate-50 rounded-lg text-sm space-y-1">
          {#if actualWeight}
            <div class="flex justify-between">
              <span class="text-slate-600">Actual Weight:</span>
              <span class="font-medium">{actualWeight.toFixed(2)} lbs</span>
            </div>
          {/if}
          {#if dimensionalWeight}
            <div class="flex justify-between">
              <span class="text-slate-600">Dimensional Weight:</span>
              <span class="font-medium">{dimensionalWeight.toFixed(2)} lbs</span>
            </div>
          {/if}
          {#if billableWeight}
            <div class="flex justify-between border-t pt-1 mt-1">
              <span class="text-slate-700 font-medium">Billable Weight:</span>
              <span class="font-bold text-primary-600">{billableWeight.toFixed(2)} lbs</span>
            </div>
          {/if}
        </div>
      {/if}

      {#if showDimWarning}
        <Alert class="bg-amber-50 border-amber-200">
          <AlertCircle class="h-4 w-4 text-amber-600" />
          <AlertDescription class="text-amber-700">
            Dimensional weight ({dimensionalWeight?.toFixed(2)} lbs) exceeds actual weight. 
            Billing based on dimensional weight.
          </AlertDescription>
        </Alert>
      {/if}

      {#if showHeavyWarning}
        <Alert class="bg-blue-50 border-blue-200">
          <Info class="h-4 w-4 text-blue-600" />
          <AlertDescription class="text-blue-700">
            Heavy package (&gt;{UNIFIED_PRICING.fees.heavyWeight.threshold} lbs): {'$'}{UNIFIED_PRICING.fees.heavyWeight.fee} handling fee applies.
          </AlertDescription>
        </Alert>
      {/if}
    </div>

    <!-- Service Level -->
    <div class="space-y-2">
      <Label for="service">Service Level <span class="text-destructive">*</span></Label>
      <select
        id="service"
        bind:value={selectedService}
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        required
      >
        {#each SERVICES as service}
          <option value={service.id}>
            {service.name} — {service.delivery_days}-{service.delivery_days + 2} days
            {#if service.id === 'express'}(+{UNIFIED_PRICING.service.express.surcharge}%){/if}
            {#if service.id === 'door_to_door'}(+{'$'}{UNIFIED_PRICING.fees.doorToDoor.fee} pickup){/if}
          </option>
        {/each}
      </select>
    </div>

    <!-- Insurance Option -->
    <div class="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
      <input
        type="checkbox"
        id="insurance"
        bind:checked={includeInsurance}
        class="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
      />
      <div class="flex-1">
        <Label for="insurance" class="flex items-center gap-2 cursor-pointer">
          <Shield class="h-4 w-4 text-green-600" />
          Add Shipping Insurance
        </Label>
        <p class="text-xs text-muted-foreground mt-1">
          Coverage: {'$'}{UNIFIED_PRICING.insurance.rate.toFixed(2)} per $100 value
          (min. {'$'}{UNIFIED_PRICING.insurance.minimum})
          {#if declaredValue && includeInsurance}
            — Est. {'$'}{calculateInsuranceFee(declaredValue, true).toFixed(2)}
          {/if}
        </p>
      </div>
    </div>

    <!-- Error Message -->
    {#if calculationError}
      <Alert variant="destructive">
        <AlertCircle class="h-4 w-4" />
        <AlertDescription>{calculationError}</AlertDescription>
      </Alert>
    {/if}

    <!-- Calculation Result -->
    {#if calculationResult}
      <Card class="bg-gradient-to-br from-primary-50 to-blue-50 border-primary-200">
        <CardHeader class="pb-2">
          <CardTitle class="text-lg flex items-center gap-2">
            <Package class="h-5 w-5" />
            Shipping Quote Breakdown
          </CardTitle>
          <CardDescription>
            {calculationResult.destinationName} via {calculationResult.serviceName}
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Weight Summary -->
          <div class="grid grid-cols-3 gap-2 p-3 bg-white/60 rounded-lg text-sm">
            <div class="text-center">
              <p class="text-slate-500">Actual</p>
              <p class="font-semibold">{calculationResult.actualWeight.toFixed(1)} lbs</p>
            </div>
            {#if calculationResult.dimensionalWeight}
              <div class="text-center border-x">
                <p class="text-slate-500">Dimensional</p>
                <p class="font-semibold">{calculationResult.dimensionalWeight.toFixed(1)} lbs</p>
              </div>
            {:else}
              <div class="text-center border-x">
                <p class="text-slate-500">Dimensional</p>
                <p class="text-slate-400">N/A</p>
              </div>
            {/if}
            <div class="text-center">
              <p class="text-slate-500">Billable</p>
              <p class="font-bold text-primary-600">{calculationResult.billableWeight.toFixed(1)} lbs</p>
            </div>
          </div>

          <!-- Cost Breakdown -->
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-600">
                Base Cost ({calculationResult.billableWeight.toFixed(1)} lbs × {'$'}{calculationResult.ratePerLb.toFixed(2)})
              </span>
              <span class="font-medium">{'$'}{calculationResult.baseCost.toFixed(2)}</span>
            </div>
            
            {#if calculationResult.expressFee > 0}
              <div class="flex justify-between text-amber-700">
                <span class="flex items-center gap-1">
                  <Zap class="h-3 w-3" />
                  Express Surcharge (+{UNIFIED_PRICING.service.express.surcharge}%)
                </span>
                <span class="font-medium">{'$'}{calculationResult.expressFee.toFixed(2)}</span>
              </div>
            {/if}

            {#if calculationResult.doorToDoorFee > 0}
              <div class="flex justify-between text-blue-700">
                <span class="flex items-center gap-1">
                  <Truck class="h-3 w-3" />
                  Door-to-Door Pickup
                </span>
                <span class="font-medium">{'$'}{calculationResult.doorToDoorFee.toFixed(2)}</span>
              </div>
            {/if}
            
            {#if calculationResult.handlingFee > 0}
              <div class="flex justify-between text-orange-700">
                <span class="flex items-center gap-1">
                  <Package class="h-3 w-3" />
                  Heavy Package Handling (&gt;{UNIFIED_PRICING.fees.heavyWeight.threshold} lbs)
                </span>
                <span class="font-medium">{'$'}{calculationResult.handlingFee.toFixed(2)}</span>
              </div>
            {/if}

            <div class="flex justify-between border-t pt-2">
              <span class="text-slate-700">Subtotal</span>
              <span class="font-semibold">{'$'}{calculationResult.subtotal.toFixed(2)}</span>
            </div>
            
            {#if calculationResult.insuranceFee > 0}
              <div class="flex justify-between text-green-700">
                <span class="flex items-center gap-1">
                  <Shield class="h-3 w-3" />
                  Insurance (${'$'}{declaredValue} value)
                </span>
                <span class="font-medium">{'$'}{calculationResult.insuranceFee.toFixed(2)}</span>
              </div>
            {/if}
          </div>

          <!-- Total -->
          <div class="flex justify-between items-center border-t-2 border-primary-300 pt-4">
            <span class="text-xl font-bold text-slate-800">Total</span>
            <span class="text-3xl font-bold text-primary-600">
              ${calculationResult.total.toFixed(2)}
            </span>
          </div>
          
          <p class="text-sm text-slate-500 text-center">
            Estimated delivery: <span class="font-medium">{calculationResult.estimatedDelivery}</span>
          </p>
        </CardContent>
      </Card>
    {/if}

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-3">
      <Button
        type="submit"
        disabled={isCalculating}
        class="flex-1"
        aria-describedby="calc-status"
      >
        {#if isCalculating}
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Calculating...
        {:else}
          Calculate Shipping
        {/if}
      </Button>
      {#if calculationResult}
        <Button
          variant="outline"
          on:click={resetCalculator}
          type="button"
        >
          Reset
        </Button>
        <Button
          variant="default"
          class="sm:flex-1"
          href="/api/auth/register"
        >
          Book Shipment
        </Button>
      {/if}
    </div>
  </form>

    <!-- Formula Reference -->
    <details class="text-xs text-slate-500">
      <summary class="cursor-pointer hover:text-slate-700">View calculation formulas</summary>
      <div class="mt-2 p-3 bg-slate-50 rounded-lg space-y-1 font-mono">
        <p>1. Dimensional Weight = (L × W × H) ÷ {UNIFIED_PRICING.dimensionalWeight.divisor}</p>
        <p>2. Billable Weight = Max(Actual, Dimensional)</p>
        <p>3. Base Cost = Billable × Rate</p>
        <p>4. Express Fee = Base × {UNIFIED_PRICING.service.express.surcharge}%</p>
        <p>5. Handling Fee = {'$'}{UNIFIED_PRICING.fees.heavyWeight.fee} if weight &gt; {UNIFIED_PRICING.fees.heavyWeight.threshold} lbs</p>
        <p>6. Insurance = Max({'$'}{UNIFIED_PRICING.insurance.minimum}, (Value-{UNIFIED_PRICING.insurance.deductible})÷100 × {'$'}{UNIFIED_PRICING.insurance.rate})</p>
        <p class="font-bold pt-1 border-t">Total = Base + Express + Handling + Insurance + Door-to-Door</p>
      </div>
    </details>
  </CardContent>
</Card>
