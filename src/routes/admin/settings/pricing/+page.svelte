<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { toast } from '$lib/stores/toast';
  import { Loader2, Save, Package, DollarSign, Plane, Globe, Plus, Trash2, AlertTriangle } from 'lucide-svelte';

  interface DestinationRate {
    destination: string;
    flag: string;
    standard_rate_per_lb: number;
    express_rate_per_lb: number;
    standard_min_charge: number;
    express_min_charge: number;
    door_to_door_rate: number;
    transit_days_standard: string;
    transit_days_express: string;
  }

  let rates: DestinationRate[] = [];
  let loading = true;
  let saving = false;
  let hasChanges = false;

  const DESTINATIONS = [
    { id: 'guyana', flag: '🇬🇾', name: 'Guyana' },
    { id: 'jamaica', flag: '🇯🇲', name: 'Jamaica' },
    { id: 'trinidad', flag: '🇹🇹', name: 'Trinidad & Tobago' },
    { id: 'barbados', flag: '🇧🇧', name: 'Barbados' },
    { id: 'suriname', flag: '🇸🇷', name: 'Suriname' }
  ];

  onMount(async () => {
    try {
      const res = await fetch('/api/admin/settings/pricing');
      if (res.ok) {
        const data = await res.json();
        rates = data.rates || getDefaultRates();
      } else {
        rates = getDefaultRates();
      }
    } catch {
      rates = getDefaultRates();
    } finally {
      loading = false;
    }
  });

  function getDefaultRates(): DestinationRate[] {
    return DESTINATIONS.map(d => ({
      destination: d.id,
      flag: d.flag,
      standard_rate_per_lb: 4.50,
      express_rate_per_lb: 7.00,
      standard_min_charge: 25.00,
      express_min_charge: 45.00,
      door_to_door_rate: 12.00,
      transit_days_standard: '7-10',
      transit_days_express: '3-5'
    }));
  }

  async function saveRates() {
    saving = true;
    try {
      const res = await fetch('/api/admin/settings/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rates })
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('Pricing updated successfully');
      hasChanges = false;
    } catch {
      toast.error('Failed to save pricing');
    } finally {
      saving = false;
    }
  }

  function markChanged() { hasChanges = true; }

  function getDestName(id: string) {
    return DESTINATIONS.find(d => d.id === id)?.name || id;
  }
</script>

<svelte:head>
  <title>Pricing Settings | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Pricing Configuration</h1>
      <p class="text-slate-500">Set shipping rates per destination and service type</p>
    </div>
    {#if hasChanges}
      <Button on:click={saveRates} disabled={saving} class="flex items-center gap-2">
        {#if saving}
          <Loader2 class="w-4 h-4 animate-spin" />
          Saving...
        {:else}
          <Save class="w-4 h-4" />
          Save Changes
        {/if}
      </Button>
    {:else}
      <Button on:click={saveRates} variant="outline" disabled={saving}>
        <Save class="w-4 h-4 mr-2" />
        Save
      </Button>
    {/if}
  </div>

  {#if hasChanges}
    <div class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
      <AlertTriangle class="w-4 h-4 flex-shrink-0" />
      You have unsaved changes. Click "Save Changes" to apply them.
    </div>
  {/if}

  {#if loading}
    <div class="flex items-center justify-center h-48">
      <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
    </div>
  {:else}
    <div class="space-y-6">
      {#each rates as rate (rate.destination)}
        <Card>
          <div class="p-4 border-b bg-slate-50 flex items-center gap-3">
            <span class="text-2xl">{rate.flag}</span>
            <h2 class="font-semibold text-slate-900">{getDestName(rate.destination)}</h2>
          </div>
          <CardContent class="p-4">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Package class="w-3.5 h-3.5" /> Standard Rate (per lb)
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    bind:value={rate.standard_rate_per_lb}
                    class="pl-7"
                    on:input={markChanged}
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Plane class="w-3.5 h-3.5" /> Express Rate (per lb)
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    bind:value={rate.express_rate_per_lb}
                    class="pl-7"
                    on:input={markChanged}
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Globe class="w-3.5 h-3.5" /> Door-to-Door Rate (per lb)
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    bind:value={rate.door_to_door_rate}
                    class="pl-7"
                    on:input={markChanged}
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <DollarSign class="w-3.5 h-3.5" /> Standard Min Charge
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    bind:value={rate.standard_min_charge}
                    class="pl-7"
                    on:input={markChanged}
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <DollarSign class="w-3.5 h-3.5" /> Express Min Charge
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    bind:value={rate.express_min_charge}
                    class="pl-7"
                    on:input={markChanged}
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label for="transit-standard-{rate.destination}" class="text-sm font-medium text-gray-700">Transit Days (Standard)</label>
                <Input
                  id="transit-standard-{rate.destination}"
                  bind:value={rate.transit_days_standard}
                  placeholder="e.g. 7-10"
                  on:input={markChanged}
                />
              </div>

              <div class="space-y-2">
                <label for="transit-express-{rate.destination}" class="text-sm font-medium text-gray-700">Transit Days (Express)</label>
                <Input
                  id="transit-express-{rate.destination}"
                  bind:value={rate.transit_days_express}
                  placeholder="e.g. 3-5"
                  on:input={markChanged}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  {/if}
</div>
