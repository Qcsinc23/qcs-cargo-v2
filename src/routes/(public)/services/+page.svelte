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

<main class="min-h-screen">
  <!-- Hero Section -->
  <section class="relative bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 py-20 text-white overflow-hidden">
    <!-- Background pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fill-opacity=&quot;0.4&quot;%3E%3Cpath d=&quot;M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>
    </div>
    
    <div class="container mx-auto px-4 relative">
      <div class="max-w-3xl mx-auto text-center">
        <span class="inline-block px-4 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium mb-6">
          Trusted Since 2009
        </span>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Shipping Solutions for 
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Every Need</span>
        </h1>
        <p class="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          From standard air freight to specialized handling, we have the perfect service for your Caribbean shipping requirements.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button href="/shipping-calculator" size="lg" class="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold">
            <Calculator class="w-5 h-5 mr-2" />
            Get a Quote
          </Button>
          <Button href="/contact" variant="outline" size="lg" class="bg-transparent border-white/30 text-white hover:bg-white/10">
            <Phone class="w-5 h-5 mr-2" />
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  </section>

  <!-- Trust Signals Bar -->
  <section class="bg-white border-b py-6">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {#each TRUST_SIGNALS as signal}
          <div>
            <div class="text-2xl md:text-3xl font-bold text-primary-600">{signal.value}</div>
            <div class="text-sm text-slate-600">{signal.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Services Grid -->
  <section class="py-20 bg-slate-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Services</h2>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto">
          Choose the service that best fits your shipping needs. All services include real-time tracking and dedicated customer support.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each SERVICES_INFO as service, index}
          {@const Icon = getIcon(service.icon)}
          <Card class="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden {index === 0 ? 'ring-2 ring-primary-500 ring-offset-2' : ''}">
            {#if index === 0}
              <div class="bg-primary-500 text-white text-center py-1 text-sm font-medium">
                Most Popular
              </div>
            {/if}
            <CardHeader class="pb-4">
              <div class="flex items-start justify-between">
                <div class="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-500 group-hover:text-white transition-colors">
                  <Icon class="w-6 h-6 text-primary-600 group-hover:text-white" />
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-slate-900">
                    {formatPrice(service)}
                  </div>
                  {#if service.priceNote && service.startingPrice}
                    <div class="text-xs text-slate-500">{service.priceNote}</div>
                  {/if}
                </div>
              </div>
              <CardTitle class="text-xl mt-4">{service.name}</CardTitle>
              <CardDescription class="text-primary-600 font-medium">
                {service.tagline}
              </CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <p class="text-slate-600 text-sm leading-relaxed">
                {service.description}
              </p>
              
              <div class="space-y-2">
                {#each service.features as feature}
                  <div class="flex items-center gap-2 text-sm">
                    <Check class="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span class="text-slate-700">{feature}</span>
                  </div>
                {/each}
              </div>

              {#if service.transitTime !== 'N/A' && service.transitTime !== 'Varies'}
                <div class="pt-4 border-t">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-500">Transit Time</span>
                    <span class="font-semibold text-slate-900">{service.transitTime}</span>
                  </div>
                </div>
              {/if}

              <Button href="/shipping-calculator" variant="outline" class="w-full mt-4 group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-colors">
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
  <section class="py-20 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How It Works</h2>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto">
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
            <div class="relative inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6 group-hover:bg-primary-500 transition-colors">
              <svelte:component this={step.icon} class="w-7 h-7 text-primary-600 group-hover:text-white transition-colors" />
              <div class="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {step.step}
              </div>
            </div>
            <h3 class="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
            <p class="text-slate-600 text-sm">{step.description}</p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
    <div class="container mx-auto px-4 text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-4">Ready to Ship?</h2>
      <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
        Get an instant quote or speak with our team about your shipping needs.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button href="/shipping-calculator" size="lg" class="bg-white text-primary-600 hover:bg-slate-100">
          <Calculator class="w-5 h-5 mr-2" />
          Calculate Shipping Cost
        </Button>
        <Button href="tel:{COMPANY.phone}" variant="outline" size="lg" class="bg-transparent border-white/30 text-white hover:bg-white/10">
          <Phone class="w-5 h-5 mr-2" />
          Call {COMPANY.phone}
        </Button>
      </div>
    </div>
  </section>
</main>
