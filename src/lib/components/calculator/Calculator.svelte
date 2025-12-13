<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  // import SkipLink from '$lib/components/ui/SkipLink.svelte';
  import { Calculator as CalcIcon, AlertCircle } from 'lucide-svelte';
  import CalculatorForm from './CalculatorForm.svelte';
  import DimensionInput from './DimensionInput.svelte';
  import InsuranceOption from './InsuranceOption.svelte';
  import CalculationResult from './CalculationResult.svelte';
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
  // ============================================
  // Event handlers
  function handleFormInput(e: CustomEvent<{ field: string; value: string | number | boolean | null }>) {
    const { field, value } = e.detail;
    formErrors[field] = '';
    calculationError = null;

    const toNumber = (v: string | number | boolean | null): number | null => {
      if (typeof v === 'number') return Number.isFinite(v) ? v : null;
      if (typeof v === 'string') {
        const n = v ? parseFloat(v) : NaN;
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };

    switch (field) {
      case 'destination':
        destination = typeof value === 'string' ? value : '';
        break;
      case 'service':
        selectedService = typeof value === 'string' ? value : 'standard';
        break;
      case 'includeInsurance':
        includeInsurance = typeof value === 'boolean' ? value : value === 'true';
        break;
      case 'actualWeight':
        actualWeight = toNumber(value);
        break;
      case 'declaredValue':
        declaredValue = toNumber(value);
        break;
      case 'length':
        length = toNumber(value);
        break;
      case 'width':
        width = toNumber(value);
        break;
      case 'height':
        height = toNumber(value);
        break;
      default:
        break;
    }
  }

  function handleDimensionChange(e: CustomEvent<{ dimension: string; value: number | null }>) {
    const { dimension, value } = e.detail;
    formErrors[dimension] = '';
    calculationError = null;

    switch (dimension) {
      case 'length':
        length = value;
        break;
      case 'width':
        width = value;
        break;
      case 'height':
        height = value;
        break;
      default:
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
        ...result,
        serviceName: selectedService === 'standard' ? 'Standard Air Freight' :
                    selectedService === 'express' ? 'Express Delivery' :
                    'Door-to-Door Service',
        estimatedDelivery: deliveryDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        declaredValue: declaredValue || 0
      };
    } catch (error) {
      calculationError = error instanceof Error ? error.message : 'Failed to calculate shipping rate';
    } finally {
      isCalculating = false;
    }
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
    formErrors = {};
  }

  // Reactive calculations for live preview
  $: dimensionalWeight = calculateDimensionalWeight();
  $: billableWeight = actualWeight ? getBillableWeight() : null;
  $: estimatedInsuranceFee = declaredValue ? calculateInsuranceFee(declaredValue, includeInsurance) : 0;
</script>

<!-- Skip link for keyboard users -->
<!-- <SkipLink target="#calculator-form" label="Skip to calculator form" /> -->

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
          Shipping quote calculated successfully. Total cost: ${calculationResult.total.toFixed(2)}
        {/if}
      </div>

      <!-- Calculator Form Component -->
      <CalculatorForm
        {destination}
        {actualWeight}
        {length}
        {width}
        {height}
        {declaredValue}
        {selectedService}
        {isCalculating}
        includeInsurance={includeInsurance}
        errors={formErrors}
        on:input={handleFormInput}
      />

      <!-- Dimension Input Component -->
      <DimensionInput
        {length}
        {width}
        {height}
        errors={formErrors}
        {dimensionalWeight}
        {actualWeight}
        {billableWeight}
        on:change={handleDimensionChange}
      />

      <!-- Insurance Option Component -->
      <InsuranceOption
        {includeInsurance}
        {declaredValue}
        estimatedFee={estimatedInsuranceFee}
        on:toggle={() => includeInsurance = !includeInsurance}
      />

      <!-- Error Message -->
      {#if calculationError}
        <Alert variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>{calculationError}</AlertDescription>
        </Alert>
      {/if}

      <!-- Submit Button -->
      <div class="flex justify-center">
        <Button
          type="submit"
          disabled={isCalculating}
          class="w-full sm:w-auto px-8"
        >
          {#if isCalculating}
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Calculating...
          {:else}
            Calculate Shipping
          {/if}
        </Button>
      </div>
    </form>

    <!-- Calculation Result -->
    {#if calculationResult}
      <CalculationResult result={calculationResult} onReset={resetCalculator} />
    {/if}

    <!-- Formula Reference -->
    <details class="text-xs text-slate-500">
      <summary class="cursor-pointer hover:text-slate-700">View calculation formulas</summary>
      <div class="mt-2 p-3 bg-slate-50 rounded-lg space-y-1 font-mono">
        <p>1. Dimensional Weight = (L × W × H) ÷ {UNIFIED_PRICING.dimensionalWeight.divisor}</p>
        <p>2. Billable Weight = Max(Actual, Dimensional)</p>
        <p>3. Base Cost = Billable × Rate</p>
        <p>4. Express Fee = Base × {UNIFIED_PRICING.service.express.surcharge}%</p>
        <p>5. Handling Fee = Max(${UNIFIED_PRICING.fees.handling.minimum}, (${UNIFIED_PRICING.fees.handling.perPackage} × packages) + (weight &gt; {UNIFIED_PRICING.fees.heavyWeight.threshold} ? ${UNIFIED_PRICING.fees.heavyWeight.fee} : $0))</p>
        <p>6. Insurance = Max(${UNIFIED_PRICING.insurance.minimum}, (Value-{UNIFIED_PRICING.insurance.deductible})÷100 × ${UNIFIED_PRICING.insurance.rate})</p>
        <p class="font-bold pt-1 border-t">Total = Base + Express + Handling + Insurance + Door-to-Door</p>
      </div>
    </details>
  </CardContent>
</Card>