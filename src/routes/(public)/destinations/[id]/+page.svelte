<script lang="ts">
  import { Shield, Clock, MapPin, Plane, ArrowRight, Calculator, CheckCircle2, Phone } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import type { PageData } from './$types';

  export let data: PageData;
  $: ({ destination } = data);
</script>

<svelte:head>
  <title>{destination.name} | Destinations | QCS Cargo</title>
  <meta name="description" content="Premium air freight services to {destination.name}. Transit times from {destination.transitDays.min}-{destination.transitDays.max} days. Reliable Caribbean shipping network." />
</svelte:head>

<main class="min-h-screen bg-background text-foreground">
  <!-- Hero Section -->
  <section class="relative overflow-hidden bg-gradient-to-r from-[#023E8A] via-[#0077B6] to-[#023E8A] py-32 sm:py-48">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute inset-0 opacity-30"
        style="background-image: linear-gradient(90deg, rgba(144, 224, 239, 0.12) 1px, transparent 1px), linear-gradient(0deg, rgba(144, 224, 239, 0.12) 1px, transparent 1px); background-size: 96px 96px;"
      ></div>
      <div class="absolute -top-32 left-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[#90E0EF]/20 blur-3xl"></div>
      <div class="absolute -bottom-40 right-[-12rem] h-[36rem] w-[36rem] rounded-full bg-[#CAF0F8]/15 blur-3xl"></div>
    </div>

    <div class="container relative mx-auto px-4">
      <div class="mx-auto max-w-4xl text-center">
        <div class="mb-8 inline-flex items-center gap-2 rounded-full border border-[#90E0EF]/25 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-[#CAF0F8]">
          <MapPin class="h-3 w-3 text-[#90E0EF]" />
          Direct Network Route
        </div>
        
        <h1 class="font-display text-6xl sm:text-7xl md:text-8xl leading-[0.95] text-[#F0F9FF] mb-8">
          {destination.name}
          <span class="block text-2xl sm:text-3xl font-light tracking-[0.4em] uppercase text-[#90E0EF]/70 mt-4">
            {destination.capital} ({destination.code})
          </span>
        </h1>
        
        <p class="mx-auto max-w-2xl text-lg sm:text-xl font-light leading-relaxed tracking-wide text-[#CAF0F8]/80">
          Seamless logistics and white‑glove handling for every shipment to {destination.name}.
          Experience Caribbean shipping redefined.
        </p>

        <div class="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            href={`/shipping-calculator?destination=${destination.id}`}
            class="ghost-cta h-14 px-10 bg-transparent border border-[#90E0EF]/50 text-[#F0F9FF] hover:bg-white/5 hover:border-[#CAF0F8]/60 tracking-[0.3em] uppercase text-xs font-semibold"
          >
            Get Instant Quote
            <ArrowRight class="ml-3 h-5 w-5 text-[#90E0EF]" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            href="/track"
            class="ghost-cta h-14 px-10 bg-transparent border border-[#90E0EF]/30 text-[#CAF0F8] hover:bg-white/5 hover:border-[#CAF0F8]/50 tracking-[0.3em] uppercase text-xs font-semibold"
          >
            Track Shipment
          </Button>
        </div>
      </div>
    </div>
  </section>

  <!-- Service Details -->
  <section class="py-24 sm:py-32 bg-background relative z-10">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-3 gap-8">
        <!-- Quick Stats -->
        <div class="lg:col-span-1 space-y-6">
          <div class="rounded-2xl border border-border/40 bg-muted/30 p-8">
            <h3 class="font-display text-2xl mb-6">Service Summary</h3>
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <div class="rounded-lg bg-primary/10 p-2">
                  <Clock class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div class="text-sm font-medium">Transit Time</div>
                  <div class="text-muted-foreground text-sm">{destination.transitDays.min}-{destination.transitDays.max} Business Days</div>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="rounded-lg bg-primary/10 p-2">
                  <Plane class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div class="text-sm font-medium">Base Rate</div>
                  <div class="text-muted-foreground text-sm">From ${destination.baseRate.toFixed(2)} / lb</div>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="rounded-lg bg-primary/10 p-2">
                  <Shield class="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div class="text-sm font-medium">Duty Free Threshold</div>
                  <div class="text-muted-foreground text-sm">Up to ${destination.customs.dutyFree} (Est.)</div>
                </div>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-border/40 bg-muted/30 p-8">
            <h3 class="font-display text-2xl mb-6">Required Docs</h3>
            <ul class="space-y-3">
              {#each destination.customs.documents as doc}
                <li class="flex items-center gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 class="h-4 w-4 text-primary" />
                  {doc}
                </li>
              {/each}
            </ul>
          </div>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-12">
          <div>
            <h2 class="font-display text-4xl mb-6">Premium Shipping to {destination.name}</h2>
            <p class="text-lg text-muted-foreground/85 font-light leading-relaxed mb-8">
              At QCS Cargo, we understand the unique requirements of shipping to {destination.name}. 
              Whether you're sending personal effects, commercial samples, or luxury goods, our 
              dedicated logistics team ensures your cargo moves efficiently through our New Jersey 
              hub directly to {destination.capital}.
            </p>
            <div class="grid sm:grid-cols-2 gap-6">
              <div class="p-6 rounded-xl border border-border/30 hover:border-primary/20 transition-colors">
                <h4 class="font-display text-xl mb-3">Air Freight Excellence</h4>
                <p class="text-sm text-muted-foreground font-light leading-relaxed">
                  Twice-weekly flights from our NJ hub ensure your packages never sit idle. 
                  We prioritize speed without compromising on safety.
                </p>
              </div>
              <div class="p-6 rounded-xl border border-border/30 hover:border-primary/20 transition-colors">
                <h4 class="font-display text-xl mb-3">Local Expertise</h4>
                <p class="text-sm text-muted-foreground font-light leading-relaxed">
                  Our agents in {destination.capital} possess deep knowledge of local customs 
                  regulations, expediting the clearance process for your peace of mind.
                </p>
              </div>
            </div>
          </div>

          <!-- FAQ / Guidelines -->
          <div class="space-y-6">
            <h3 class="font-display text-3xl">Shipping Guidelines</h3>
            <div class="space-y-4">
              <details class="group rounded-xl border border-border/30 p-4 transition-all hover:bg-muted/20">
                <summary class="flex cursor-pointer items-center justify-between font-medium">
                  What can I ship to {destination.name}?
                  <span class="transition-transform group-open:rotate-180">
                    <ArrowRight class="h-4 w-4 rotate-90" />
                  </span>
                </summary>
                <div class="mt-4 text-sm text-muted-foreground leading-relaxed font-light">
                  Most consumer goods can be shipped. However, hazardous materials, perishables, 
                  and restricted items (like weapons or specific electronics) require special handling 
                  or are prohibited. Please check our <a href="/prohibited-items" class="text-primary hover:underline">prohibited items list</a>.
                </div>
              </details>
              <details class="group rounded-xl border border-border/30 p-4 transition-all hover:bg-muted/20">
                <summary class="flex cursor-pointer items-center justify-between font-medium">
                  How are customs duties calculated?
                  <span class="transition-transform group-open:rotate-180">
                    <ArrowRight class="h-4 w-4 rotate-90" />
                  </span>
                </summary>
                <div class="mt-4 text-sm text-muted-foreground leading-relaxed font-light">
                  Customs duties in {destination.name} are typically based on the declared value 
                  plus shipping costs (CIF). While personal items under ${destination.customs.dutyFree} 
                  may be exempt, commercial goods are subject to standard tariffs.
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-24 sm:py-32 bg-muted/30">
    <div class="container mx-auto px-4 text-center">
      <h2 class="font-display text-4xl md:text-5xl mb-8">Ready to ship to {destination.name}?</h2>
      <div class="flex flex-col sm:flex-row gap-6 justify-center items-center">
        <Button size="lg" href={`/shipping-calculator?destination=${destination.id}`} class="h-14 px-10 bg-ocean-blue text-white hover:bg-ocean-blue/90 tracking-widest uppercase text-xs">
          <Calculator class="mr-2 h-4 w-4" />
          Calculate Rates
        </Button>
        <Button variant="outline" size="lg" href="/contact" class="h-14 px-10 border-ocean-blue/20 text-ocean-blue hover:bg-ocean-blue/5 tracking-widest uppercase text-xs">
          <Phone class="mr-2 h-4 w-4" />
          Contact Support
        </Button>
      </div>
    </div>
  </section>
</main>
