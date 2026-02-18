<script lang="ts">
  import { SERVICES_INFO, COMPANY, TRUST_SIGNALS } from '$lib/config/constants';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { 
    Plane, 
    Zap, 
    Truck, 
    Layers, 
    FileCheck, 
    Shield,
    Check,
    ArrowRight,
    Phone,
    Calculator
  } from 'lucide-svelte';

  const iconMap: Record<string, typeof Plane> = {
    plane: Plane,
    zap: Zap,
    truck: Truck,
    layers: Layers,
    'file-check': FileCheck,
    shield: Shield
  };

  function getIcon(iconName: string) {
    return iconMap[iconName] || Plane;
  }

  function formatPrice(service: typeof SERVICES_INFO[0]): string {
    if (service.startingPrice) {
      return `$${service.startingPrice}${service.priceUnit || ''}`;
    }
    return service.priceNote || 'Custom quote';
  }
</script>

<svelte:head>
  <title>Our Services | QCS Cargo - Caribbean Air Freight Solutions</title>
  <meta name="description" content="Explore QCS Cargo's comprehensive shipping services: Standard Air Freight, Express Delivery, Door-to-Door, Consolidated Cargo, Customs Clearance, and Special Handling." />
</svelte:head>

<main class="min-h-screen bg-background text-foreground">
  <!-- Hero Section -->
  <section class="relative overflow-hidden bg-gradient-to-r from-[#023E8A] via-[#0077B6] to-[#023E8A] py-32 sm:py-40">
    <!-- Background pattern -->
    <div class="pointer-events-none absolute inset-0">
      <div
        class="absolute inset-0 opacity-30"
        style="background-image: linear-gradient(90deg, rgba(144, 224, 239, 0.12) 1px, transparent 1px), linear-gradient(0deg, rgba(144, 224, 239, 0.12) 1px, transparent 1px); background-size: 96px 96px;"
        aria-hidden="true"
      ></div>
      <div class="absolute -top-32 left-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[#90E0EF]/20 blur-3xl" aria-hidden="true"></div>
      <div class="absolute -bottom-40 right-[-12rem] h-[36rem] w-[36rem] rounded-full bg-[#CAF0F8]/15 blur-3xl" aria-hidden="true"></div>
    </div>
    
    <div class="container mx-auto px-4 relative">
      <div class="max-w-3xl mx-auto text-center">
        <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#90E0EF]/25 bg-white/5 text-xs uppercase tracking-[0.35em] text-[#CAF0F8]/80 mb-8">
          White‑Glove Services
        </span>
        <h1 class="font-display text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight text-[#F0F9FF]">
          Shipping Solutions for
          <span class="block text-transparent bg-clip-text bg-gradient-to-r from-[#CAF0F8] via-[#90E0EF] to-[#CAF0F8]">
            Every Need
          </span>
        </h1>
        <p class="text-base sm:text-lg text-[#CAF0F8]/75 mb-10 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
          From standard air freight to specialized handling, we have the perfect service for your Caribbean shipping requirements.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            href="/shipping-calculator"
            size="lg"
            class="h-14 px-10 bg-transparent border border-[#90E0EF]/50 text-[#F0F9FF] hover:bg-white/5 hover:border-[#CAF0F8]/60 tracking-[0.3em] uppercase text-xs font-semibold"
          >
            <Calculator class="w-5 h-5 mr-2" />
            Get a Quote
          </Button>
          <Button
            href="/contact"
            variant="outline"
            size="lg"
            class="h-14 px-10 bg-transparent border border-[#90E0EF]/30 text-[#CAF0F8] hover:bg-white/5 hover:border-[#CAF0F8]/50 tracking-[0.3em] uppercase text-xs font-semibold"
          >
            <Phone class="w-5 h-5 mr-2" />
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  </section>

  <!-- Trust Signals Bar -->
  <section class="bg-background border-b border-border/25 py-10">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {#each TRUST_SIGNALS as signal}
          <div>
            <div class="font-display text-2xl md:text-3xl text-foreground">{signal.value}</div>
            <div class="text-xs uppercase tracking-[0.22em] text-muted-foreground/85 mt-2">{signal.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Services Grid -->
  <section class="py-32 sm:py-40 bg-background">
    <div class="container mx-auto px-4">
      <div class="text-center mb-20">
        <h2 class="font-display text-3xl md:text-5xl text-foreground mb-6">Our Services</h2>
        <p class="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
          Choose the service that best fits your shipping needs. All services include real-time tracking and dedicated customer support.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each SERVICES_INFO as service, index}
          {@const Icon = getIcon(service.icon)}
          <Card
            class="group overflow-hidden bg-card border-border/30 shadow-sm transition-colors hover:border-[#0077B6]/25 {index === 0
              ? 'ring-1 ring-[#90E0EF]/35'
              : ''}"
          >
            {#if index === 0}
              <div class="bg-[#E6F6FB] text-[#023E8A] text-center py-2 text-xs uppercase tracking-[0.28em]">
                Most Popular
              </div>
            {/if}
            <CardHeader class="pb-4">
              <div class="flex items-start justify-between">
                <div class="p-3 bg-[#E6F6FB] rounded-xl border border-[#0077B6]/15 group-hover:border-[#0077B6]/25 transition-colors">
                  <Icon class="w-6 h-6 text-[#023E8A]" />
                </div>
                <div class="text-right">
                  <div class="text-2xl font-semibold text-foreground">
                    {formatPrice(service)}
                  </div>
                  {#if service.priceNote && service.startingPrice}
                    <div class="text-xs text-muted-foreground/80">{service.priceNote}</div>
                  {/if}
                </div>
              </div>
              <CardTitle class="font-display text-xl mt-4">{service.name}</CardTitle>
              <CardDescription class="text-[#001D3D]/60 font-light tracking-wide">
                {service.tagline}
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <p class="text-muted-foreground/80 text-sm leading-relaxed tracking-wide font-light">
                {service.description}
              </p>
              
              <div class="space-y-2">
                {#each service.features as feature}
                  <div class="flex items-center gap-2 text-sm">
                    <Check class="w-4 h-4 text-[#90E0EF] flex-shrink-0" />
                    <span class="text-muted-foreground/85 font-light tracking-wide">{feature}</span>
                  </div>
                {/each}
              </div>

              {#if service.transitTime !== 'N/A' && service.transitTime !== 'Varies'}
                <div class="pt-5 border-t border-border/30">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-muted-foreground/80 uppercase tracking-[0.22em] text-xs">Transit Time</span>
                    <span class="font-semibold text-foreground">{service.transitTime}</span>
                  </div>
                </div>
              {/if}

              <Button
                href="/shipping-calculator"
                variant="outline"
                class="w-full mt-8 bg-transparent border border-[#0077B6]/25 hover:bg-black/5 hover:border-[#0077B6]/35 tracking-[0.3em] uppercase text-xs font-semibold"
              >
                Get Quote
                <ArrowRight class="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- How It Works -->
  <section class="py-32 sm:py-40 bg-background">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="font-display text-3xl md:text-5xl text-foreground mb-6">How It Works</h2>
        <p class="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
          Shipping with QCS Cargo is simple. Follow these four easy steps.
        </p>
      </div>

      <div class="grid md:grid-cols-4 gap-8">
        {#each [
          { step: 1, title: 'Get a Quote', description: 'Use our calculator for instant pricing based on weight, dimensions, and destination.', icon: Calculator },
          { step: 2, title: 'Book Online', description: 'Select your service, schedule a drop-off time, and provide package details.', icon: FileCheck },
          { step: 3, title: 'Drop Off', description: 'Bring your packages to our Kearny, NJ warehouse during your scheduled time.', icon: Truck },
          { step: 4, title: 'Track & Receive', description: 'Follow your shipment in real-time until it\'s safely delivered.', icon: Plane }
        ] as step}
          <div class="text-center group">
            <div class="relative inline-flex items-center justify-center w-16 h-16 bg-muted/60 border border-border/30 rounded-full mb-7 group-hover:border-[#0077B6]/25 transition-colors">
              <svelte:component this={step.icon} class="w-7 h-7 text-[#023E8A] transition-colors" />
              <div class="absolute -top-2 -right-2 w-8 h-8 bg-[#D6B15E] border border-[#D6B15E]/60 rounded-full flex items-center justify-center text-[#001D3D] font-bold text-sm">
                {step.step}
              </div>
            </div>
            <h3 class="font-display text-lg text-foreground mb-3">{step.title}</h3>
            <p class="text-muted-foreground/80 text-sm font-light leading-relaxed tracking-wide">{step.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="relative overflow-hidden py-32 sm:py-40 bg-gradient-to-r from-[#023E8A] via-[#0077B6] to-[#023E8A]">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(circle at 20% 30%, rgba(144,224,239,0.25), transparent 55%), radial-gradient(circle at 80% 60%, rgba(202,240,248,0.18), transparent 55%);"></div>
    </div>
    <div class="container mx-auto px-4 text-center">
      <h2 class="font-display text-3xl md:text-5xl text-[#F0F9FF] mb-6">Ready to Ship?</h2>
      <p class="text-base sm:text-lg text-[#CAF0F8]/75 mb-12 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
        Get an instant quote or speak with our team about your shipping needs.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          href="/shipping-calculator"
          size="lg"
          class="h-14 px-10 bg-transparent border border-[#90E0EF]/50 text-[#F0F9FF] hover:bg-white/5 hover:border-[#CAF0F8]/60 tracking-[0.3em] uppercase text-xs font-semibold"
        >
          <Calculator class="w-5 h-5 mr-2" />
          Calculate Shipping Cost
        </Button>
        <Button
          href={`tel:${COMPANY.phone}`}
          variant="outline"
          size="lg"
          class="h-14 px-10 bg-transparent border border-white/20 text-[#FFF1D6] hover:bg-white/5 hover:border-[#D6B15E]/55 tracking-[0.3em] uppercase text-xs font-semibold"
        >
          <Phone class="w-5 h-5 mr-2" />
          Call {COMPANY.phone}
        </Button>
      </div>
    </div>
  </section>
</main>
