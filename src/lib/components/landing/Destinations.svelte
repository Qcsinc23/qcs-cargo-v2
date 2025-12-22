<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { DESTINATIONS } from '$lib/config/destinations';
  import { MapPin, Clock, Plane, ArrowRight, Calculator } from 'lucide-svelte';
</script>

<section class="py-24 sm:py-32 bg-background">
  <div class="container mx-auto px-4">
    <div class="text-center mb-16">
      <Badge variant="secondary" class="mb-5">Our Network</Badge>
      <h2 class="font-display text-4xl md:text-5xl text-foreground mb-5">
        Destinations We Serve
      </h2>
      <p class="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
        Reliable shipping to the Caribbean's most popular destinations with competitive rates and fast transit times.
      </p>
    </div>

    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each DESTINATIONS as dest}
        <Card class="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden border-border/30">
          <div class="h-32 bg-gradient-to-br from-[#023E8A] to-[#0077B6] relative overflow-hidden">
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-8xl opacity-30">{dest.flag}</span>
            </div>
            <div class="absolute bottom-4 left-4">
              <h3 class="text-xl font-bold text-white">{dest.name}</h3>
              <p class="text-[#CAF0F8]/85 text-sm tracking-[0.2em] uppercase">{dest.code}</p>
            </div>
          </div>
          <CardContent class="pt-4">
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-sm">
                <MapPin class="w-4 h-4 text-[#023E8A]/50" />
                <span class="text-muted-foreground/85">Capital: {dest.capital}</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <Clock class="w-4 h-4 text-[#023E8A]/50" />
                <span class="text-muted-foreground/85">
                  {dest.base_transit_days}-{dest.base_transit_days + 2} days transit
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <Plane class="w-4 h-4 text-[#023E8A]/50" />
                <span class="text-muted-foreground/85">
                  From ${(3.50 * dest.rate_multiplier).toFixed(2)}/lb
                </span>
              </div>
            </div>
            
            <div class="mt-4 pt-4 border-t flex items-center justify-between">
              <a 
                href="/destinations/{dest.id}" 
                class="text-[#023E8A] hover:text-[#0077B6] text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all"
              >
                View Details
                <ArrowRight class="w-4 h-4" />
              </a>
              <a 
                href="/shipping-calculator?destination={dest.id}" 
                class="text-muted-foreground hover:text-[#023E8A] text-xs font-medium inline-flex items-center gap-1 transition-all"
              >
                <Calculator class="w-3.5 h-3.5" />
                Quote
              </a>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>

    <div class="mt-12 text-center">
      <p class="text-muted-foreground/80 mb-6 font-light tracking-wide">
        Don't see your destination? Contact us for custom shipping solutions.
      </p>
      <Button variant="outline" href="/contact">
        Contact Us
      </Button>
    </div>
  </div>
</section>






