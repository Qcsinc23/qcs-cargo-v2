<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import { Ruler, AlertCircle, Info } from 'lucide-svelte';
  import { UNIFIED_PRICING } from '$lib/config/pricing-unified';

  export let length: number | null;
  export let width: number | null;
  export let height: number | null;
  export let errors: Record<string, string> = {};
  export let dimensionalWeight: number | null;
  export let actualWeight: number | null;
  export let billableWeight: number | null;

  const dispatch = createEventDispatcher();

  function handleDimensionChange(dimension: string, value: string) {
    dispatch('change', { dimension, value });
  }

  $: showDimWarning = dimensionalWeight && actualWeight && dimensionalWeight > actualWeight;
  $: showHeavyWarning = billableWeight && billableWeight > UNIFIED_PRICING.fees.heavyWeight.threshold;
</script>

<div class="space-y-2">
  <Label class="flex items-center gap-2">
    <Ruler class="h-4 w-4" />
    Package Dimensions (inches)
  </Label>
  <p class="text-xs text-muted-foreground">
    Dimensional Weight = (L × W × H) ÷ {UNIFIED_PRICING.dimensionalWeight.divisor}
  </p>
  <div class="grid gap-2 sm:grid-cols-3">
    <Input
      type="number"
      min="1"
      max="100"
      bind:value={length}
      on:input={() => handleDimensionChange('length', length?.toString() || '')}
      placeholder="Length"
      class={errors.length ? 'border-red-500' : ''}
    />
    <Input
      type="number"
      min="1"
      max="100"
      bind:value={width}
      on:input={() => handleDimensionChange('width', width?.toString() || '')}
      placeholder="Width"
      class={errors.width ? 'border-red-500' : ''}
    />
    <Input
      type="number"
      min="1"
      max="100"
      bind:value={height}
      on:input={() => handleDimensionChange('height', height?.toString() || '')}
      placeholder="Height"
      class={errors.height ? 'border-red-500' : ''}
    />
  </div>

  <!-- Dimension Errors -->
  {#if errors.length || errors.width || errors.height}
    <div class="space-y-1">
      {#if errors.length}
        <p class="text-sm text-destructive flex items-center gap-1">
          <AlertCircle size={12} />
          {errors.length}
        </p>
      {/if}
      {#if errors.width}
        <p class="text-sm text-destructive flex items-center gap-1">
          <AlertCircle size={12} />
          {errors.width}
        </p>
      {/if}
      {#if errors.height}
        <p class="text-sm text-destructive flex items-center gap-1">
          <AlertCircle size={12} />
          {errors.height}
        </p>
      {/if}
    </div>
  {/if}

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
      <Info size={16} class="text-blue-600" />
      <AlertDescription class="text-blue-700">
        Heavy package (&gt;{UNIFIED_PRICING.fees.heavyWeight.threshold} lbs): ${UNIFIED_PRICING.fees.heavyWeight.fee} handling fee applies.
      </AlertDescription>
    </Alert>
  {/if}
</div>