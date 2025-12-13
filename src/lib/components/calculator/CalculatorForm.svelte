<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { NumericInput } from '$lib/components/ui/numeric-input';
  import { Label } from '$lib/components/ui/label';
  import { Truck, Weight, DollarSign, AlertCircle, Package, ShieldCheck } from 'lucide-svelte';
  import { UNIFIED_PRICING } from '$lib/config/pricing-unified';
  import type { NumberInputOptions } from 'intl-number-input';

  export let destination: string;
  export let actualWeight: number | null;
  export let length: number | null;
  export let width: number | null;
  export let height: number | null;
  export let declaredValue: number | null;
  export let selectedService: string;
  export let includeInsurance: boolean;
  export let isCalculating: boolean;
  export let errors: Record<string, string> = {};

  const dispatch = createEventDispatcher();

  const weightValueRange = { min: 0.1, max: 500 } as const;
  const declaredValueRange = { min: 0, max: 50000 } as const;
  const dimensionMin0Range = { min: 0 } as const;

  const actualWeightOptions: Partial<NumberInputOptions> = {
    precision: 1,
    valueRange: weightValueRange
  };

  const declaredValueOptions: Partial<NumberInputOptions> = {
    precision: 0,
    valueRange: declaredValueRange
  };

  const dimensionOptions: Partial<NumberInputOptions> = {
    precision: 1,
    valueRange: dimensionMin0Range
  };

  function handleInput(field: string, value: string | number | boolean | null) {
    dispatch('input', { field, value });
  }
</script>

<div class="space-y-6">
  <!-- Destination Selection -->
  <div class="space-y-2">
    <Label for="destination" class="flex items-center gap-2">
      <Truck size={16} aria-hidden="true" />
      Destination <span class="text-destructive" aria-label="required field">*</span>
    </Label>
    <select
      id="destination"
      bind:value={destination}
      on:change={() => handleInput('destination', destination)}
      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      class:border-red-500={errors.destination}
      disabled={isCalculating}
      required
    >
      <option value="">Select destination</option>
      <option value="guyana">🇬🇾 Guyana — $3.50/lb</option>
      <option value="jamaica">🇯🇲 Jamaica — $3.75/lb</option>
      <option value="trinidad">🇹🇹 Trinidad & Tobago — $3.50/lb</option>
      <option value="barbados">🇧🇧 Barbados — $4.00/lb</option>
      <option value="suriname">🇸🇷 Suriname — $4.25/lb</option>
    </select>
    {#if errors.destination}
      <p class="text-sm text-destructive flex items-center gap-1">
        <AlertCircle size={12} />
        {errors.destination}
      </p>
    {/if}
  </div>

  <!-- Weight Section -->
  <div class="grid gap-4 sm:grid-cols-2">
    <div class="space-y-2">
      <Label for="weight" class="flex items-center gap-2">
        <Weight size={16} aria-hidden="true" />
        Actual Weight (lbs) <span class="text-destructive" aria-label="required field">*</span>
      </Label>
      <NumericInput
        id="weight"
        bind:value={actualWeight}
        options={actualWeightOptions}
        onInput={(raw) => handleInput('actualWeight', raw)}
        placeholder="e.g., 72"
        required
        disabled={isCalculating}
        class={errors.actualWeight ? 'border-red-500' : ''}
        aria-describedby={errors.actualWeight ? 'weight-error' : undefined}
      />
      {#if errors.actualWeight}
        <p id="weight-error" class="text-sm text-destructive flex items-center gap-1">
          <AlertCircle size={12} />
          {errors.actualWeight}
        </p>
      {/if}
    </div>

    <div class="space-y-2">
      <Label for="declaredValue" class="flex items-center gap-2">
        <DollarSign size={16} aria-hidden="true" />
        Declared Value (USD)
      </Label>
      <NumericInput
        id="declaredValue"
        bind:value={declaredValue}
        options={declaredValueOptions}
        onInput={(raw) => handleInput('declaredValue', raw)}
        placeholder="e.g., 550"
        disabled={isCalculating}
        class={errors.declaredValue ? 'border-red-500' : ''}
        aria-describedby={errors.declaredValue ? 'value-error' : undefined}
      />
      {#if errors.declaredValue}
        <p id="value-error" class="text-sm text-destructive flex items-center gap-1">
          <AlertCircle size={12} />
          {errors.declaredValue}
        </p>
      {/if}
    </div>
  </div>

  <!-- Dimensions -->
  <div class="space-y-2">
    <Label class="flex items-center gap-2">
      <Package size={16} aria-hidden="true" />
      Package Dimensions (inches)
    </Label>
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="space-y-2">
        <Label for="length">Length</Label>
        <NumericInput
          id="length"
          bind:value={length}
          options={dimensionOptions}
          onInput={(raw) => handleInput('length', raw)}
          placeholder="e.g., 20"
          disabled={isCalculating}
          class={errors.length ? 'border-red-500' : ''}
        />
      </div>
      <div class="space-y-2">
        <Label for="width">Width</Label>
        <NumericInput
          id="width"
          bind:value={width}
          options={dimensionOptions}
          onInput={(raw) => handleInput('width', raw)}
          placeholder="e.g., 14"
          disabled={isCalculating}
          class={errors.width ? 'border-red-500' : ''}
        />
      </div>
      <div class="space-y-2">
        <Label for="height">Height</Label>
        <NumericInput
          id="height"
          bind:value={height}
          options={dimensionOptions}
          onInput={(raw) => handleInput('height', raw)}
          placeholder="e.g., 12"
          disabled={isCalculating}
          class={errors.height ? 'border-red-500' : ''}
        />
      </div>
    </div>
  </div>

  <!-- Service Level -->
  <div class="space-y-2">
    <Label for="service">Service Level <span class="text-destructive" aria-label="required field">*</span></Label>
    <select
      id="service"
      bind:value={selectedService}
      on:change={() => handleInput('service', selectedService)}
      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      disabled={isCalculating}
      required
    >
      <option value="standard">Standard — 3-5 days</option>
      <option value="express">Express — 1-2 days (+{UNIFIED_PRICING.service.express.surcharge}%)</option>
      <option value="door_to_door">Door-to-Door — 3-5 days (+${UNIFIED_PRICING.fees.doorToDoor.fee} pickup)</option>
    </select>
  </div>

  <!-- Insurance -->
  <div class="space-y-2">
    <Label class="flex items-center gap-2">
      <ShieldCheck size={16} aria-hidden="true" />
      Insurance
    </Label>
    <label class="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        bind:checked={includeInsurance}
        on:change={() => handleInput('includeInsurance', includeInsurance)}
        disabled={isCalculating}
      />
      Include insurance (recommended)
    </label>
  </div>
</div>