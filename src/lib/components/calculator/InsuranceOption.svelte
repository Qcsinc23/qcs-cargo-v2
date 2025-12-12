<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Shield } from 'lucide-svelte';
  import { UNIFIED_PRICING } from '$lib/config/pricing-unified';
  import { Label } from '$lib/components/ui';

  export let includeInsurance: boolean;
  export let declaredValue: number | null;
  export let estimatedFee: number = 0;

  const dispatch = createEventDispatcher();

  function handleToggle() {
    includeInsurance = !includeInsurance;
    dispatch('toggle', { includeInsurance });
  }
</script>

<div class="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
  <input
    type="checkbox"
    id="insurance"
    bind:checked={includeInsurance}
    on:change={handleToggle}
    class="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
  />
  <div class="flex-1">
    <Label for="insurance" class="flex items-center gap-2 cursor-pointer">
      <Shield size={16} class="text-green-600" />
      Add Shipping Insurance
    </Label>
    <p class="text-xs text-muted-foreground mt-1">
      Coverage: ${UNIFIED_PRICING.insurance.rate.toFixed(2)} per $100 value
      (min. ${UNIFIED_PRICING.insurance.minimum})
      {#if declaredValue && includeInsurance && estimatedFee > 0}
        — Est. ${estimatedFee.toFixed(2)}
      {/if}
    </p>
    <p class="text-xs text-slate-500 mt-1">
      First ${UNIFIED_PRICING.insurance.deductible} not covered
    </p>
  </div>
</div>