<script lang="ts">
  import { page } from '$app/stores';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { ArrowLeft, Plane, Clock, Package, DollarSign, CheckCircle, MapPin } from 'lucide-svelte';

  interface DestinationInfo {
    id: string;
    flag: string;
    name: string;
    capital: string;
    description: string;
    highlights: string[];
    standardTransit: string;
    expressTransit: string;
    standardRate: string;
    expressRate: string;
    services: string[];
    restrictions: string[];
    localAgent?: string;
  }

  const DESTINATION_DATA: Record<string, DestinationInfo> = {
    guyana: {
      id: 'guyana', flag: '🇬🇾', name: 'Guyana', capital: 'Georgetown',
      description: 'Ship to Guyana with reliable, affordable air cargo service from the US. QCS Cargo serves Georgetown and surrounding regions through our trusted local network.',
      highlights: ['Lowest rates to Guyana', 'Door-to-door available', 'Temperature-sensitive cargo handled', 'Customs clearance assistance'],
      standardTransit: '7–10 business days', expressTransit: '3–5 business days',
      standardRate: '$4.50/lb', expressRate: '$7.00/lb',
      services: ['Air Cargo', 'Express Delivery', 'Door-to-Door', 'Consolidated Cargo', 'Customs Brokerage'],
      restrictions: ['No firearms or ammunition', 'No perishables without documentation', 'Currency >$10,000 requires declaration'],
      localAgent: 'QCS Cargo Georgetown'
    },
    jamaica: {
      id: 'jamaica', flag: '🇯🇲', name: 'Jamaica', capital: 'Kingston',
      description: 'Fast, reliable shipping to Jamaica. QCS Cargo serves Kingston, Montego Bay, and major parishes across the island.',
      highlights: ['Island-wide delivery', 'Customs expertise', 'Competitive rates', 'Weekly departures'],
      standardTransit: '5–8 business days', expressTransit: '2–4 business days',
      standardRate: '$4.75/lb', expressRate: '$7.50/lb',
      services: ['Air Cargo', 'Express Delivery', 'Parish Delivery', 'Consolidated Cargo'],
      restrictions: ['No prohibited agricultural products', 'Firearms require special permits', 'Some electronics require import licenses'],
      localAgent: 'QCS Cargo Kingston'
    },
    trinidad: {
      id: 'trinidad', flag: '🇹🇹', name: 'Trinidad & Tobago', capital: 'Port of Spain',
      description: 'Shipping to Trinidad & Tobago. QCS Cargo provides reliable service to Port of Spain, San Fernando, and across both islands.',
      highlights: ['Both islands served', 'Competitive pricing', 'Regular departures', 'Experienced customs team'],
      standardTransit: '6–9 business days', expressTransit: '3–5 business days',
      standardRate: '$4.75/lb', expressRate: '$7.25/lb',
      services: ['Air Cargo', 'Express Delivery', 'Island-to-Island Transfer', 'Consolidated Cargo'],
      restrictions: ['Agricultural items require TTMA permit', 'Medicines require prescription', 'No Styrofoam packing material'],
      localAgent: 'QCS Cargo PoS'
    },
    barbados: {
      id: 'barbados', flag: '🇧🇧', name: 'Barbados', capital: 'Bridgetown',
      description: 'Reliable cargo service to Barbados. QCS Cargo delivers to Bridgetown and all parish districts across the island.',
      highlights: ['Parish-wide delivery', 'Strict quality standards', 'Efficient customs clearance', 'Weekly flights'],
      standardTransit: '7–10 business days', expressTransit: '3–5 business days',
      standardRate: '$5.00/lb', expressRate: '$7.75/lb',
      services: ['Air Cargo', 'Express Delivery', 'Door-to-Door', 'Consolidated Cargo'],
      restrictions: ['CARICOM rules apply', 'Agricultural products require permits', 'No live animals'],
      localAgent: 'QCS Cargo Bridgetown'
    },
    suriname: {
      id: 'suriname', flag: '🇸🇷', name: 'Suriname', capital: 'Paramaribo',
      description: 'QCS Cargo ships to Suriname with competitive rates and reliable service to Paramaribo and surrounding areas.',
      highlights: ['Competitive rates', 'Experienced customs team', 'Reliable departures', 'Tracking included'],
      standardTransit: '8–12 business days', expressTransit: '4–6 business days',
      standardRate: '$5.00/lb', expressRate: '$8.00/lb',
      services: ['Air Cargo', 'Express Delivery', 'Consolidated Cargo'],
      restrictions: ['Documentation requirements vary by item type', 'Electrical equipment may need certification', 'Certain food items restricted'],
      localAgent: 'QCS Cargo Paramaribo'
    }
  };

  $: destId = ($page.params.id as string) || '';
  $: dest = (DESTINATION_DATA[destId] || null) as DestinationInfo | null;
  $: isValid = dest !== null;
</script>

<svelte:head>
  {#if dest}
    <title>Shipping to {dest.name} | QCS Cargo</title>
    <meta name="description" content="Ship to {dest.name} with QCS Cargo. {dest.standardTransit} standard transit, starting at {dest.standardRate}/lb. Trusted Caribbean air cargo service." />
  {:else}
    <title>Destination Not Found | QCS Cargo</title>
  {/if}
</svelte:head>

{#if !isValid}
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="text-6xl mb-4">🌍</p>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Destination not found</h1>
      <p class="text-gray-600 mb-6">We don't currently ship to that location.</p>
      <Button href="/destinations">View All Destinations</Button>
    </div>
  </div>
{:else}
  {@const d = dest as DestinationInfo}
  <!-- Hero -->
  <section class="relative overflow-hidden bg-gradient-to-r from-[#023E8A] via-[#0077B6] to-[#023E8A] py-24 sm:py-32">
    <div class="pointer-events-none absolute inset-0 opacity-20" style="background-image: linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(0deg, rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 80px 80px;"></div>
    <div class="container mx-auto px-4 text-center relative">
      <a href="/destinations" class="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-8 text-sm transition-colors">
        <ArrowLeft class="w-4 h-4" />
        All Destinations
      </a>
      <div class="text-7xl mb-4">{d.flag}</div>
      <h1 class="font-display text-4xl md:text-6xl text-white mb-4">Shipping to {d.name}</h1>
      <p class="text-blue-200 text-lg max-w-2xl mx-auto">{d.description}</p>
      <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
        <Button href="/calculator?destination={d.id}" size="lg" class="bg-white text-blue-900 hover:bg-blue-50">
          Get a Rate Quote
        </Button>
        <Button href="/dashboard/bookings/new?destination={d.id}" size="lg" variant="outline" class="border-white text-white hover:bg-white/10">
          Book a Shipment
        </Button>
      </div>
    </div>
  </section>

  <div class="max-w-5xl mx-auto px-4 py-16 space-y-12">
    <!-- Key Stats -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each [
        { icon: Clock, label: 'Standard Transit', value: d.standardTransit },
        { icon: Plane, label: 'Express Transit', value: d.expressTransit },
        { icon: DollarSign, label: 'Standard Rate', value: d.standardRate },
        { icon: DollarSign, label: 'Express Rate', value: d.expressRate }
      ] as stat}
        <Card class="text-center p-4">
          <svelte:component this={stat.icon} class="w-6 h-6 text-primary-600 mx-auto mb-2" />
          <p class="text-xs text-gray-500">{stat.label}</p>
          <p class="font-bold text-gray-900 mt-1">{stat.value}</p>
        </Card>
      {/each}
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Services -->
      <Card>
        <div class="p-4 border-b bg-gray-50">
          <h2 class="font-semibold text-gray-900 flex items-center gap-2">
            <Package class="w-4 h-4 text-primary-600" />
            Available Services
          </h2>
        </div>
        <CardContent class="p-4 space-y-2">
          {#each d.services as service}
            <div class="flex items-center gap-3">
              <CheckCircle class="w-4 h-4 text-green-500 flex-shrink-0" />
              <span class="text-sm text-gray-700">{service}</span>
            </div>
          {/each}
        </CardContent>
      </Card>

      <!-- Highlights -->
      <Card>
        <div class="p-4 border-b bg-gray-50">
          <h2 class="font-semibold text-gray-900 flex items-center gap-2">
            <MapPin class="w-4 h-4 text-primary-600" />
            Why Ship With Us?
          </h2>
        </div>
        <CardContent class="p-4 space-y-2">
          {#each d.highlights as highlight}
            <div class="flex items-center gap-3">
              <CheckCircle class="w-4 h-4 text-primary-500 flex-shrink-0" />
              <span class="text-sm text-gray-700">{highlight}</span>
            </div>
          {/each}
        </CardContent>
      </Card>
    </div>

    <!-- Restrictions -->
    <Card>
      <div class="p-4 border-b bg-amber-50 border-amber-100">
        <h2 class="font-semibold text-amber-900">Import Restrictions & Notes</h2>
        <p class="text-sm text-amber-700 mt-1">Please review before booking</p>
      </div>
      <CardContent class="p-4">
        <ul class="space-y-2">
          {#each d.restrictions as r}
            <li class="flex items-start gap-3 text-sm text-gray-700">
              <span class="text-amber-500 font-bold mt-0.5">•</span>
              {r}
            </li>
          {/each}
        </ul>
        <p class="text-xs text-gray-500 mt-4">
          For a complete list of prohibited items, visit our
          <a href="/prohibited-items" class="text-primary-600 underline">Prohibited Items page</a>.
        </p>
      </CardContent>
    </Card>

    <!-- CTA -->
    <div class="text-center bg-gradient-to-r from-primary-600 to-blue-700 rounded-2xl p-10 text-white">
      <h2 class="text-2xl font-bold mb-3">Ready to ship to {d.name}?</h2>
      <p class="text-blue-200 mb-6">Get an instant quote or book your shipment online in minutes.</p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button href="/calculator?destination={d.id}" class="bg-white text-blue-900 hover:bg-blue-50">
          Calculate Rates
        </Button>
        <Button href="/contact" variant="outline" class="border-white text-white hover:bg-white/10">
          Contact Us
        </Button>
      </div>
    </div>
  </div>
{/if}
