<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { 
    Package, Weight, Ruler, DollarSign, Truck, AlertCircle, 
    Shield, Zap, Info, Calculator as CalcIcon 
  } from 'lucide-svelte';
  import { DESTINATIONS, SERVICES } from '$lib/config';

  // ============================================
  // PRICING CONSTANTS (The 6 Core Calculations)
  // ============================================
  const PRICING = {
    DIM_DIVISOR: 166,           // Dimensional weight divisor
    HEAVY_WEIGHT_THRESHOLD: 70, // lbs - triggers handling fee
    HANDLING_FEE: 20,           // Heavy package handling fee
    INSURANCE_MIN: 15,          // Minimum insurance charge
    INSURANCE_RATE: 7.50,       // Per $100 of declared value
    INSURANCE_DEDUCTIBLE: 100,  // First $100 not covered
    EXPRESS_PERCENTAGE: 50,     // Express surcharge (50% over standard)
    DOOR_TO_DOOR_FEE: 25,       // Door-to-door pickup fee
  };

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

  // Result type with full breakdown
  interface CalculationBreakdown {
    // Weight calculations
    actualWeight: number;
    dimensionalWeight: number | null;
    billableWeight: number;
    
    // Cost breakdown
    baseCost: number;
    expressFee: number;
    handlingFee: number;
    insuranceFee: number;
    doorToDoorFee: number;
    
    // Totals
    subtotal: number;
    total: number;
    
    // Rate info
    ratePerLb: number;
    destinationName: string;
    serviceName: string;
    estimatedDelivery: string;
  }

  // ============================================
  // CALCULATION #1: Dimensional Weight
  // Formula: (L × W × H) ÷ 166
  // ============================================
  function calculateDimensionalWeight(): number | null {
    if (!length || !width || !height) return null;
    return (length * width * height) / PRICING.DIM_DIVISOR;
  }

  // ============================================
  // CALCULATION #2: Billable Weight
  // Formula: Max(Actual, Dimensional)
  // ============================================
  function getBillableWeight(): number {
    const actual = actualWeight || 0;
    const dimensional = calculateDimensionalWeight() || 0;
    return Math.max(actual, dimensional);
  }

  // ============================================
  // CALCULATION #3: Base Cost
  // Formula: Billable × Rate
  // ============================================
  function calculateBaseCost(billableWeight: number, rate: number): number {
    return billableWeight * rate;
  }

  // ============================================
  // CALCULATION #4: Express Fee
  // Formula: Base × (% ÷ 100)
  // ============================================
  function calculateExpressFee(baseCost: number, isExpress: boolean): number {
    if (!isExpress) return 0;
    return baseCost * (PRICING.EXPRESS_PERCENTAGE / 100);
  }

  // ============================================
  // CALCULATION #5: Handling Fee
  // Formula: If weight > 70: $20
  // ============================================
  function calculateHandlingFee(billableWeight: number): number {
    return billableWeight > PRICING.HEAVY_WEIGHT_THRESHOLD ? PRICING.HANDLING_FEE : 0;
  }

  // ============================================
  // CALCULATION #6: Insurance Fee
  // Formula: Max($15, (Value-100)÷100 × $7.50)
  // ============================================
  function calculateInsuranceFee(value: number | null, include: boolean): number {
    if (!include || !value || value <= 0) return 0;
    
    // Calculate: (Value ÷ 100) × $7.50
    const calculatedInsurance = (value / 100) * PRICING.INSURANCE_RATE;
    
    // Return Max($15, calculated)
    return Math.max(PRICING.INSURANCE_MIN, calculatedInsurance);
  }

  // ============================================
  // MAIN CALCULATION FUNCTION
  // Total = Base + Express + Handling + Insurance + Door-to-Door
  // ============================================
  async function calculateShipping() {
    calculationError = null;
    calculationResult = null;

    // Validation
    if (!destination) {
      calculationError = 'Please select a destination';
      return;
    }
    if (!actualWeight || actualWeight <= 0) {
      calculationError = 'Please enter a valid weight';
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
      const destinationData = DESTINATIONS.find(d => d.id === destination);

      if (!service || !destinationData) {
        throw new Error('Invalid service or destination');
      }

      // Step 1 & 2: Calculate weights
      const dimWeight = calculateDimensionalWeight();
      const billable = getBillableWeight();

      // Step 3: Base Cost = Billable × Rate
      const baseCost = calculateBaseCost(billable, destinationData.baseRate);

      // Step 4: Express Fee (50% surcharge for express service)
      const isExpress = selectedService === 'express';
      const expressFee = calculateExpressFee(baseCost, isExpress);

      // Step 5: Handling Fee (if > 70 lbs)
      const handlingFee = calculateHandlingFee(billable);

      // Step 6: Insurance Fee
      const insuranceFee = calculateInsuranceFee(declaredValue, includeInsurance);

      // Door-to-door fee
      const isDoorToDoor = selectedService === 'door_to_door';
      const doorToDoorFee = isDoorToDoor ? PRICING.DOOR_TO_DOOR_FEE : 0;

      // Calculate Total
      const subtotal = baseCost + expressFee + handlingFee + doorToDoorFee;
      const total = subtotal + insuranceFee;

      // Calculate estimated delivery
      const daysToDeliver = service.delivery_days + destinationData.base_transit_days;
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + daysToDeliver);

      calculationResult = {
        actualWeight: actualWeight,
        dimensionalWeight: dimWeight,
        billableWeight: billable,
        baseCost: round(baseCost),
        expressFee: round(expressFee),
        handlingFee: round(handlingFee),
        insuranceFee: round(insuranceFee),
        doorToDoorFee: round(doorToDoorFee),
        subtotal: round(subtotal),
        total: round(total),
        ratePerLb: destinationData.baseRate,
        destinationName: destinationData.name,
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
  $: showHeavyWarning = billableWeight && billableWeight > PRICING.HEAVY_WEIGHT_THRESHOLD;
</script>

<Card class="w-full max-w-4xl mx-auto">
  <CardHeader>
    <CardTitle class="flex items-center gap-2">
      <CalcIcon class="h-6 w-6" />
      Shipping Calculator
    </CardTitle>
    <CardDescription>
      Get an instant quote for your shipment to the Caribbean
    </CardDescription>
  </CardHeader>
  
  <CardContent class="space-y-6">
    <!-- Destination Selection -->
    <div class="space-y-2">
      <Label for="destination" class="flex items-center gap-2">
        <Truck class="h-4 w-4" />
        Destination <span class="text-destructive">*</span>
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
            {dest.flag} {dest.name} — ${dest.baseRate.toFixed(2)}/lb
          </option>
        {/each}
      </select>
    </div>

    <!-- Weight Section -->
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="space-y-2">
        <Label for="weight" class="flex items-center gap-2">
          <Weight class="h-4 w-4" />
          Actual Weight (lbs) <span class="text-destructive">*</span>
        </Label>
        <Input
          id="weight"
          type="number"
          min="0.1"
          max="500"
          step="0.1"
          bind:value={actualWeight}
          placeholder="e.g., 72"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="declaredValue" class="flex items-center gap-2">
          <DollarSign class="h-4 w-4" />
          Declared Value (USD)
        </Label>
        <Input
          id="declaredValue"
          type="number"
          min="0"
          max="50000"
          step="1"
          bind:value={declaredValue}
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
        Dimensional Weight = (L × W × H) ÷ {PRICING.DIM_DIVISOR}
      </p>
      <div class="grid gap-2 sm:grid-cols-3">
        <Input
          type="number"
          min="1"
          max="100"
          bind:value={length}
          placeholder="Length"
        />
        <Input
          type="number"
          min="1"
          max="100"
          bind:value={width}
          placeholder="Width"
        />
        <Input
          type="number"
          min="1"
          max="100"
          bind:value={height}
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
            Heavy package (>{PRICING.HEAVY_WEIGHT_THRESHOLD} lbs): ${PRICING.HANDLING_FEE} handling fee applies.
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
            {#if service.id === 'express'}(+{PRICING.EXPRESS_PERCENTAGE}%){/if}
            {#if service.id === 'door_to_door'}(+${PRICING.DOOR_TO_DOOR_FEE} pickup){/if}
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
          Coverage: ${PRICING.INSURANCE_RATE.toFixed(2)} per $100 value 
          (min. ${PRICING.INSURANCE_MIN})
          {#if declaredValue && includeInsurance}
            — Est. ${calculateInsuranceFee(declaredValue, true).toFixed(2)}
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
                Base Cost ({calculationResult.billableWeight.toFixed(1)} lbs × ${calculationResult.ratePerLb.toFixed(2)})
              </span>
              <span class="font-medium">${calculationResult.baseCost.toFixed(2)}</span>
            </div>
            
            {#if calculationResult.expressFee > 0}
              <div class="flex justify-between text-amber-700">
                <span class="flex items-center gap-1">
                  <Zap class="h-3 w-3" />
                  Express Surcharge (+{PRICING.EXPRESS_PERCENTAGE}%)
                </span>
                <span class="font-medium">${calculationResult.expressFee.toFixed(2)}</span>
              </div>
            {/if}

            {#if calculationResult.doorToDoorFee > 0}
              <div class="flex justify-between text-blue-700">
                <span class="flex items-center gap-1">
                  <Truck class="h-3 w-3" />
                  Door-to-Door Pickup
                </span>
                <span class="font-medium">${calculationResult.doorToDoorFee.toFixed(2)}</span>
              </div>
            {/if}
            
            {#if calculationResult.handlingFee > 0}
              <div class="flex justify-between text-orange-700">
                <span class="flex items-center gap-1">
                  <Package class="h-3 w-3" />
                  Heavy Package Handling (>{PRICING.HEAVY_WEIGHT_THRESHOLD} lbs)
                </span>
                <span class="font-medium">${calculationResult.handlingFee.toFixed(2)}</span>
              </div>
            {/if}

            <div class="flex justify-between border-t pt-2">
              <span class="text-slate-700">Subtotal</span>
              <span class="font-semibold">${calculationResult.subtotal.toFixed(2)}</span>
            </div>
            
            {#if calculationResult.insuranceFee > 0}
              <div class="flex justify-between text-green-700">
                <span class="flex items-center gap-1">
                  <Shield class="h-3 w-3" />
                  Insurance (${declaredValue} value)
                </span>
                <span class="font-medium">${calculationResult.insuranceFee.toFixed(2)}</span>
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
        on:click={calculateShipping} 
        disabled={isCalculating}
        class="flex-1"
      >
        {isCalculating ? 'Calculating...' : 'Calculate Shipping'}
      </Button>
      {#if calculationResult}
        <Button variant="outline" on:click={resetCalculator}>
          Reset
        </Button>
        <Button variant="default" class="sm:flex-1" href="/auth/register">
          Book Shipment
        </Button>
      {/if}
    </div>

    <!-- Formula Reference -->
    <details class="text-xs text-slate-500">
      <summary class="cursor-pointer hover:text-slate-700">View calculation formulas</summary>
      <div class="mt-2 p-3 bg-slate-50 rounded-lg space-y-1 font-mono">
        <p>1. Dimensional Weight = (L × W × H) ÷ {PRICING.DIM_DIVISOR}</p>
        <p>2. Billable Weight = Max(Actual, Dimensional)</p>
        <p>3. Base Cost = Billable × Rate</p>
        <p>4. Express Fee = Base × {PRICING.EXPRESS_PERCENTAGE}%</p>
        <p>5. Handling Fee = ${PRICING.HANDLING_FEE} if weight > {PRICING.HEAVY_WEIGHT_THRESHOLD} lbs</p>
        <p>6. Insurance = Max(${PRICING.INSURANCE_MIN}, Value÷100 × ${PRICING.INSURANCE_RATE})</p>
        <p class="font-bold pt-1 border-t">Total = Base + Express + Handling + Insurance + Door-to-Door</p>
      </div>
    </details>
  </CardContent>
</Card>
