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

<section class="py-24 sm:py-32 bg-gradient-to-b from-background via-background to-[#DDE8DF]/55">
  <div class="container mx-auto px-4">
    <div class="text-center mb-16">
      <Badge variant="secondary" class="mb-5">Transparent Pricing</Badge>
      <h2 class="font-display text-4xl md:text-5xl text-foreground mb-5">
        Simple, Competitive Rates
      </h2>
      <p class="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
        No hidden fees. Rates based on weight with volume discounts available.
      </p>
    </div>

    <!-- Service Tiers -->
    <div class="grid md:grid-cols-3 gap-6 mb-20">
      {#each SERVICES as service, index}
        {@const ServiceIcon = getServiceIcon(service.icon)}
        <Card class="relative border-border/30 shadow-sm {index === 0 ? 'border-[#0077B6]/35 border-2' : ''}">
          {#if index === 0}
            <div class="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge class="bg-[#FFF7E6] text-[#001D3D] border border-[#D6B15E]/45">Most Popular</Badge>
            </div>
          {/if}
          <CardHeader class="text-center pb-2">
            <div class="w-12 h-12 mx-auto mb-4 rounded-full bg-[#E6F6FB] border border-[#0077B6]/15 flex items-center justify-center">
              <svelte:component this={ServiceIcon} class="w-6 h-6 text-[#023E8A]" />
            </div>
            <CardTitle class="text-xl font-display">{service.name}</CardTitle>
            <CardDescription class="text-muted-foreground/80 font-light">{service.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="text-center mb-6">
              <div class="text-3xl font-bold text-foreground">
                ${(baseRate * service.rate_multiplier).toFixed(2)}
                <span class="text-base font-normal text-muted-foreground/70">/lb</span>
              </div>
              <p class="text-sm text-muted-foreground/75 mt-1">
                {service.delivery_days}-{service.delivery_days + 2} business days
              </p>
              {#if service.additionalFee}
                <p class="text-sm text-muted-foreground/80 mt-1">
                  + ${service.additionalFee} pickup fee
                </p>
              {/if}
            </div>
            <ul class="space-y-3">
              {#each service.features as feature}
                <li class="flex items-start gap-2">
                  <Check class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span class="text-sm text-muted-foreground/85">{feature}</span>
                </li>
              {/each}
            </ul>
          </CardContent>
        </Card>
      {/each}
    </div>

    <!-- Destination Rates -->
    <div class="bg-card rounded-2xl shadow-sm border border-border/30 overflow-hidden">
      <div class="p-7 border-b border-border/30 bg-muted/40">
        <h3 class="font-display text-2xl text-foreground">Rates by Destination</h3>
        <p class="text-sm text-muted-foreground/80 mt-2">Standard air freight rates (per pound)</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted/40">
            <tr>
              <th class="text-left py-4 px-6 font-semibold text-muted-foreground/80 uppercase tracking-[0.24em] text-xs">Destination</th>
              <th class="text-center py-4 px-6 font-semibold text-muted-foreground/80 uppercase tracking-[0.24em] text-xs">Standard</th>
              <th class="text-center py-4 px-6 font-semibold text-muted-foreground/80 uppercase tracking-[0.24em] text-xs">Express (+50%)</th>
              <th class="text-center py-4 px-6 font-semibold text-muted-foreground/80 uppercase tracking-[0.24em] text-xs">Transit Time</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border/30">
            {#each DESTINATIONS as dest}
              <tr class="hover:bg-muted/40 transition-colors">
                <td class="py-4 px-6">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">{dest.flag}</span>
                    <div>
                      <p class="font-medium text-foreground">{dest.name}</p>
                      <p class="text-sm text-muted-foreground/70 tracking-[0.2em] uppercase">{dest.code}</p>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 text-center">
                  <span class="font-semibold text-foreground">
                    ${(baseRate * dest.rate_multiplier).toFixed(2)}/lb
                  </span>
                </td>
                <td class="py-4 px-6 text-center">
                  <span class="font-semibold text-[#023E8A]">
                    ${(baseRate * dest.rate_multiplier * 1.5).toFixed(2)}/lb
                  </span>
                </td>
                <td class="py-4 px-6 text-center">
                  <span class="text-muted-foreground/85">
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
    <div class="mt-16 grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle class="text-lg font-display">Volume Discounts</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2 text-sm">
            <li class="flex justify-between py-2 border-b">
              <span class="text-muted-foreground/85">100-249 lbs</span>
              <span class="font-semibold text-green-600">5% off</span>
            </li>
            <li class="flex justify-between py-2 border-b">
              <span class="text-muted-foreground/85">250-499 lbs</span>
              <span class="font-semibold text-green-600">10% off</span>
            </li>
            <li class="flex justify-between py-2 border-b">
              <span class="text-muted-foreground/85">500-999 lbs</span>
              <span class="font-semibold text-green-600">15% off</span>
            </li>
            <li class="flex justify-between py-2">
              <span class="text-muted-foreground/85">1000+ lbs</span>
              <span class="font-semibold text-green-600">20% off</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle class="text-lg font-display">Additional Services</CardTitle>
        </CardHeader>
        <CardContent>
          <ul class="space-y-2 text-sm">
            <li class="flex justify-between py-2 border-b">
              <span class="text-muted-foreground/85">Insurance (per $100 value)</span>
              <span class="font-semibold">$1.00</span>
            </li>
            <li class="flex justify-between py-2 border-b">
              <span class="text-muted-foreground/85">Door-to-Door Pickup (NJ area)</span>
              <span class="font-semibold">$25.00</span>
            </li>
            <li class="flex justify-between py-2 border-b">
              <span class="text-muted-foreground/85">Customs Clearance</span>
              <span class="font-semibold text-green-600">Included</span>
            </li>
            <li class="flex justify-between py-2">
              <span class="text-muted-foreground/85">Packaging Materials</span>
              <span class="font-semibold">At cost</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>

    <!-- Note -->
    <div class="mt-10 flex items-start gap-3 p-5 bg-[#E6F6FB] rounded-xl border border-[#0077B6]/15">
      <Info class="w-5 h-5 text-[#023E8A] flex-shrink-0 mt-0.5" />
      <div class="text-sm text-[#001D3D]/80">
        <p class="font-medium">Dimensional Weight</p>
        <p class="mt-1">
          For lightweight but bulky items, we charge based on dimensional weight: 
          (Length × Width × Height) ÷ 166. You pay the greater of actual or dimensional weight.
        </p>
      </div>
    </div>
  </div>
</section>






