<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { DESTINATIONS } from '$lib/config/destinations';
  import { SERVICES } from '$lib/config/services';
  import { Check, Plane, Zap, Home, Info } from 'lucide-svelte';

  // Get base rate for display (Guyana standard rate as baseline)
  const baseRate = 3.50;
  
  function getServiceIcon(icon: string) {
    const icons: Record<string, typeof Plane> = {
      plane: Plane,
      zap: Zap,
      home: Home
    };
    return icons[icon] || Plane;
  }
</script>

<section class="py-16 bg-gradient-to-b from-white to-slate-50">
  <div class="container mx-auto px-4">
    <div class="text-center mb-12">
      <Badge variant="secondary" class="mb-4">Transparent Pricing</Badge>
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
        Simple, Competitive Rates
      </h2>
      <p class="text-lg text-slate-600 max-w-2xl mx-auto">
        No hidden fees. Rates based on weight with volume discounts available.
      </p>
    </div>

    <!-- Service Tiers -->
    <div class="grid md:grid-cols-3 gap-6 mb-16">
      {#each SERVICES as service, index}
        {@const ServiceIcon = getServiceIcon(service.icon)}
        <Card class="relative {index === 0 ? 'border-primary-500 border-2' : ''}">
          {#if index === 0}
            <div class="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge class="bg-primary-600">Most Popular</Badge>
            </div>
          {/if}
          <CardHeader class="text-center pb-2">
            <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-primary-100 flex items-center justify-center">
              <svelte:component this={ServiceIcon} class="w-6 h-6 text-primary-600" />
            </div>
            <CardTitle class="text-xl">{service.name}</CardTitle>
            <CardDescription>{service.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-center mb-6">
              <div class="text-3xl font-bold text-slate-900">
                ${(baseRate * service.rate_multiplier).toFixed(2)}
                <span class="text-base font-normal text-slate-500">/lb</span>
              </div>
              <p class="text-sm text-slate-500 mt-1">
                {service.delivery_days}-{service.delivery_days + 2} business days
              </p>
              {#if service.additionalFee}
                <p class="text-sm text-amber-600 mt-1">
                  + ${service.additionalFee} pickup fee
                </p>
              {/if}
            </div>
            <ul class="space-y-3">
              {#each service.features as feature}
                <li class="flex items-start gap-2">
                  <Check class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span class="text-sm text-slate-600">{feature}</span>
                </li>
              {/each}
            </ul>
          </CardContent>
        </Card>
      {/each}
    </div>

    <!-- Destination Rates -->
    <div class="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div class="p-6 border-b bg-slate-50">
        <h3 class="text-xl font-semibold text-slate-900">Rates by Destination</h3>
        <p class="text-sm text-slate-600 mt-1">Standard air freight rates (per pound)</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50">
            <tr>
              <th class="text-left py-4 px-6 font-semibold text-slate-700">Destination</th>
              <th class="text-center py-4 px-6 font-semibold text-slate-700">Standard</th>
              <th class="text-center py-4 px-6 font-semibold text-slate-700">Express (+50%)</th>
              <th class="text-center py-4 px-6 font-semibold text-slate-700">Transit Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            {#each DESTINATIONS as dest}
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{dest.flag}</span>
                    <div>
                      <p class="font-medium text-slate-900">{dest.name}</p>
                      <p class="text-sm text-slate-500">{dest.code}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-center">
                  <span class="font-semibold text-slate-900">
                    ${(baseRate * dest.rate_multiplier).toFixed(2)}/lb
                  </span>
                </td>
                <td class="py-4 px-6 text-center">
                  <span class="font-semibold text-amber-600">
                    ${(baseRate * dest.rate_multiplier * 1.5).toFixed(2)}/lb
                  </span>
                </td>
                <td class="py-4 px-6 text-center">
                  <span class="text-slate-600">
                    {dest.base_transit_days}-{dest.base_transit_days + 2} days
                  </span>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Volume Discounts -->
    <div class="mt-12 grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Volume Discounts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2 text-sm">
            <li class="flex justify-between py-2 border-b">
              <span class="text-slate-600">100-249 lbs</span>
              <span class="font-semibold text-green-600">5% off</span>
            </li>
            <li class="flex justify-between py-2 border-b">
              <span class="text-slate-600">250-499 lbs</span>
              <span class="font-semibold text-green-600">10% off</span>
            </li>
            <li class="flex justify-between py-2 border-b">
              <span class="text-slate-600">500-999 lbs</span>
              <span class="font-semibold text-green-600">15% off</span>
            </li>
            <li class="flex justify-between py-2">
              <span class="text-slate-600">1000+ lbs</span>
              <span class="font-semibold text-green-600">20% off</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-lg">Additional Services</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2 text-sm">
            <li class="flex justify-between py-2 border-b">
              <span class="text-slate-600">Insurance (per $100 value)</span>
              <span class="font-semibold">$1.00</span>
            </li>
            <li class="flex justify-between py-2 border-b">
              <span class="text-slate-600">Door-to-Door Pickup (NJ area)</span>
              <span class="font-semibold">$25.00</span>
            </li>
            <li class="flex justify-between py-2 border-b">
              <span class="text-slate-600">Customs Clearance</span>
              <span class="font-semibold text-green-600">Included</span>
            </li>
            <li class="flex justify-between py-2">
              <span class="text-slate-600">Packaging Materials</span>
              <span class="font-semibold">At cost</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>

    <!-- Note -->
    <div class="mt-8 flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
      <Info class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
      <div class="text-sm text-blue-800">
        <p class="font-medium">Dimensional Weight</p>
        <p class="mt-1">
          For lightweight but bulky items, we charge based on dimensional weight: 
          (Length × Width × Height) ÷ 166. You pay the greater of actual or dimensional weight.
        </p>
      </div>
    </div>
  </div>
</section>





