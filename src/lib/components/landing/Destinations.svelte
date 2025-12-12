<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { DESTINATIONS } from '$lib/config/destinations';
  import { MapPin, Clock, Plane, ArrowRight } from 'lucide-svelte';
</script>

<section class="py-16 bg-white">
  <div class="container mx-auto px-4">
    <div class="text-center mb-12">
      <Badge variant="secondary" class="mb-4">Our Network</Badge>
      <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
        Destinations We Serve
      </h2>
      <p class="text-lg text-slate-600 max-w-2xl mx-auto">
        Reliable shipping to the Caribbean's most popular destinations with competitive rates and fast transit times.
      </p>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each DESTINATIONS as dest}
        <Card class="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div class="h-32 bg-gradient-to-br from-primary-500 to-primary-700 relative overflow-hidden">
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-8xl opacity-30">{dest.flag}</span>
            </div>
            <div class="absolute bottom-4 left-4">
              <h3 class="text-xl font-bold text-white">{dest.name}</h3>
              <p class="text-primary-100 text-sm">{dest.code}</p>
            </div>
          </div>
          <CardContent class="pt-4">
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-sm">
                <MapPin class="w-4 h-4 text-slate-400" />
                <span class="text-slate-600">Capital: {dest.capital}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <Clock class="w-4 h-4 text-slate-400" />
                <span class="text-slate-600">
                  {dest.base_transit_days}-{dest.base_transit_days + 2} days transit
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <Plane class="w-4 h-4 text-slate-400" />
                <span class="text-slate-600">
                  From ${(3.50 * dest.rate_multiplier).toFixed(2)}/lb
                </span>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t">
              <a 
                href="/shipping-calculator?destination={dest.id}" 
                class="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                Get Quote
                <ArrowRight class="w-4 h-4" />
              </a>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>

    <div class="mt-12 text-center">
      <p class="text-slate-600 mb-4">
        Don't see your destination? Contact us for custom shipping solutions.
      </p>
      <Button variant="outline" href="/contact">
        Contact Us
      </Button>
    </div>
  </div>
</section>





