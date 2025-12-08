<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { Package, Weight, Ruler, DollarSign, Truck, AlertCircle } from 'lucide-svelte';
  import { DESTINATIONS, SERVICES } from '$lib/config';

  // Form state
  let destination: string = '';
  let weight: number | null = null;
  let length: number | null = null;
  let width: number | null = null;
  let height: number | null = null;
  let declaredValue: number | null = null;
  let selectedService: string = '';

  // Calculation state
  let isCalculating = false;
  let calculationResult: {
    baseRate: number;
    insurance: number;
    total: number;
    estimatedDelivery: string;
  } | null = null;
  let calculationError: string | null = null;

  // Helpers
  function calculateVolumetricWeight(): number | null {
    if (!length || !width || !height) return null;
    // Volumetric weight formula: (L × W × H) / 166
    return (length * width * height) / 166;
  }

  function getBillableWeight(): number {
    const actualWeight = weight || 0;
    const volumetricWeight = calculateVolumetricWeight() || 0;
    return Math.max(actualWeight, volumetricWeight);
  }

  async function calculateShipping() {
    // Reset state
    calculationError = null;
    calculationResult = null;

    // Validation
    if (!destination) {
      calculationError = 'Please select a destination';
      return;
    }
    if (!weight || weight <= 0) {
      calculationError = 'Please enter a valid weight';
      return;
    }
    if (!selectedService) {
      calculationError = 'Please select a service level';
      return;
    }

    isCalculating = true;

    try {
      // Simulate API call (will be replaced with actual API)
      await new Promise(resolve => setTimeout(resolve, 800));

      const billableWeight = getBillableWeight();
      const service = SERVICES.find(s => s.id === selectedService);
      const destinationData = DESTINATIONS.find(d => d.id === destination);

      if (!service || !destinationData) {
        throw new Error('Invalid service or destination');
      }

      // Basic rate calculation: weight × destination base rate × service multiplier
      const baseRate = billableWeight * destinationData.baseRate * service.rate_multiplier;
      
      // Insurance calculation (1% of declared value, minimum $2)
      const insurance = declaredValue ? Math.max(declaredValue * 0.01, 2) : 0;

      // Calculate estimated delivery date
      const daysToDeliver = service.delivery_days + destinationData.base_transit_days;
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + daysToDeliver);
      
      calculationResult = {
        baseRate: Math.round(baseRate * 100) / 100,
        insurance: Math.round(insurance * 100) / 100,
        total: Math.round((baseRate + insurance) * 100) / 100,
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

  function resetCalculator() {
    destination = '';
    weight = null;
    length = null;
    width = null;
    height = null;
    declaredValue = null;
    selectedService = '';
    calculationResult = null;
    calculationError = null;
  }

  // Reactive volumetric weight display
  $: volumetricWeight = calculateVolumetricWeight();
  $: showVolumetricWarning = volumetricWeight && weight && volumetricWeight > weight;
</script>

<Card class="w-full max-w-4xl mx-auto">
  <CardHeader>
    <CardTitle class="flex items-center gap-2">
      <Package class="h-6 w-6" />
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
            {dest.flag} {dest.name}
          </option>
        {/each}
      </select>
    </div>

    <!-- Package Dimensions -->
    <div class="grid gap-4 sm:grid-cols-2">
      <!-- Weight -->
      <div class="space-y-2">
        <Label for="weight" class="flex items-center gap-2">
          <Weight class="h-4 w-4" />
          Weight (lbs) <span class="text-destructive">*</span>
        </Label>
        <Input
          id="weight"
          type="number"
          min="0.1"
          max="150"
          step="0.1"
          bind:value={weight}
          placeholder="e.g., 5.5"
          required
        />
      </div>

      <!-- Declared Value -->
      <div class="space-y-2">
        <Label for="declaredValue" class="flex items-center gap-2">
          <DollarSign class="h-4 w-4" />
          Declared Value (USD)
        </Label>
        <Input
          id="declaredValue"
          type="number"
          min="0"
          max="10000"
          step="1"
          bind:value={declaredValue}
          placeholder="Optional"
        />
      </div>
    </div>

    <!-- Dimensions (Optional) -->
    <div class="space-y-2">
      <Label class="flex items-center gap-2">
        <Ruler class="h-4 w-4" />
        Dimensions (inches) - Optional
      </Label>
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
      {#if volumetricWeight}
        <p class="text-sm text-muted-foreground">
          Volumetric weight: {volumetricWeight.toFixed(2)} lbs
        </p>
      {/if}
      {#if showVolumetricWarning}
        <Alert>
          <AlertCircle class="h-4 w-4" />
          <AlertDescription>
            Volumetric weight ({volumetricWeight?.toFixed(2)} lbs) is higher than actual weight. 
            Billing will be based on volumetric weight.
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
        <option value="">Select service</option>
        {#each SERVICES as service}
          <option value={service.id}>
            {service.name} - {service.delivery_days}-{service.delivery_days + 2} days
          </option>
        {/each}
      </select>
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
      <Card class="bg-primary-50 border-primary-200">
        <CardHeader>
          <CardTitle class="text-lg">Estimated Shipping Cost</CardTitle>
        </CardHeader>
        <CardContent class="space-y-3">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Base Rate</span>
            <span class="font-medium">${calculationResult.baseRate.toFixed(2)}</span>
          </div>
          {#if calculationResult.insurance > 0}
            <div class="flex justify-between">
              <span class="text-muted-foreground">Insurance</span>
              <span class="font-medium">${calculationResult.insurance.toFixed(2)}</span>
            </div>
          {/if}
          <div class="flex justify-between border-t pt-3">
            <span class="text-lg font-semibold">Total</span>
            <span class="text-2xl font-bold text-primary-600">
              ${calculationResult.total.toFixed(2)}
            </span>
          </div>
          <p class="text-sm text-muted-foreground text-center pt-2">
            Estimated delivery: {calculationResult.estimatedDelivery}
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
        <Button variant="default" class="sm:flex-1">
          Book Shipment
        </Button>
      {/if}
    </div>

    <p class="text-xs text-center text-muted-foreground">
      * Required fields | Rates are estimates and may vary based on final inspection
    </p>
  </CardContent>
</Card>

