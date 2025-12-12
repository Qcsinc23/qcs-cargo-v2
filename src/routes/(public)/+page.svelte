<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte';
  import { ArrowRight, Package, Shield, Timer, TrendingUp, Users, CheckCircle } from 'lucide-svelte';
  import { goto } from '$app/navigation';

  // Scroll to calculator section
  function scrollToCalculator() {
    const element = document.getElementById('calculator-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<svelte:head>
  <title>QCS Cargo - Trusted Air Freight to the Caribbean</title>
  <meta
    name="description"
    content="Ship packages to Guyana, Jamaica, Trinidad, Barbados, and Suriname from New Jersey. TSA licensed, 3-5 day transit, 99% satisfaction rate."
  />
</svelte:head>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white overflow-hidden">
  <!-- Background pattern -->
  <div class="absolute inset-0 opacity-10">
    <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%3E%3C/path%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
  </div>

  <div class="relative mx-auto max-w-7xl px-4 py-24 md:py-32 sm:px-6 lg:px-8">
    <div class="max-w-4xl">
      <div class="mb-6 bg-white/20 text-white border border-white/30 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold">
        <Shield class="w-4 h-4" />
        TSA Licensed & Fully Insured
      </div>
      <h1 class="text-4xl md:text-6xl font-bold mb-6 leading-tight">
        Fast, Reliable Air Freight to the Caribbean
      </h1>
      <p class="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl">
        Ship from New Jersey to Guyana, Jamaica, Trinidad, Barbados & Suriname.
        3-5 day transit with 99% customer satisfaction.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 mb-12">
        <Button
          size="lg"
          on:click={scrollToCalculator}
          class="h-14 px-8 bg-white text-primary-600 hover:bg-gray-100 text-lg font-semibold"
        >
          Get Instant Quote
          <ArrowRight class="ml-2 w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="lg"
          href="/track"
          class="h-14 px-8 bg-transparent border-white text-white hover:bg-white hover:text-primary-600 text-lg font-semibold"
        >
          Track Shipment
        </Button>
      </div>

      <!-- Trust indicators -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div class="text-center">
          <div class="text-3xl font-bold text-white mb-2">15+</div>
          <div class="text-sm text-primary-100">Years in Business</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-white mb-2">50K+</div>
          <div class="text-sm text-primary-100">Packages Delivered</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-white mb-2">99%</div>
          <div class="text-sm text-primary-100">Satisfaction Rate</div>
        </div>
        <div class="text-center">
          <div class="text-3xl font-bold text-white mb-2">24/7</div>
          <div class="text-sm text-primary-100">Tracking Available</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="py-20 bg-gray-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Why Choose QCS Cargo?
      </h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        We provide reliable, fast, and secure shipping services with transparent pricing
      </p>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
        <div class="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
          <Timer class="w-7 h-7 text-primary-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Fast Delivery</h3>
        <p class="text-gray-600">
          3-5 day transit time to all Caribbean destinations with regular flights
        </p>
      </div>

      <div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
        <div class="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
          <Package class="w-7 h-7 text-primary-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Secure Shipping</h3>
        <p class="text-gray-600">
          Full insurance coverage and real-time tracking for all shipments
        </p>
      </div>

      <div class="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
        <div class="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-6">
          <TrendingUp class="w-7 h-7 text-primary-600" />
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-3">Transparent Pricing</h3>
        <p class="text-gray-600">
          No hidden fees with our clear per-pound pricing structure
        </p>
      </div>
    </div>
  </div>
</section>

<!-- Destinations Preview -->
<section class="py-20 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        We Ship To
      </h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Serving major Caribbean destinations with reliable air freight
      </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {#each [
        { name: 'Guyana', code: 'GY' },
        { name: 'Jamaica', code: 'JM' },
        { name: 'Trinidad', code: 'TT' },
        { name: 'Barbados', code: 'BB' },
        { name: 'Suriname', code: 'SR' }
      ] as destination}
        <div class="text-center p-6 border rounded-lg hover:shadow-md transition-shadow">
          <div class="text-4xl mb-3">🇬🇾</div>
          <h3 class="font-semibold text-gray-900">{destination.name}</h3>
        </div>
      {/each}
    </div>

    <div class="text-center">
      <Button href="/destinations" variant="outline" size="lg">
        View All Destinations
        <ArrowRight class="ml-2 w-5 h-5" />
      </Button>
    </div>
  </div>
</section>

<!-- How It Works -->
<section class="py-20 bg-gray-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        How It Works
      </h2>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Shipping to the Caribbean is simple with QCS Cargo
      </p>
    </div>

    <div class="grid md:grid-cols-4 gap-8">
      {#each [
        { step: '1', title: 'Get Quote', desc: 'Use our calculator for instant pricing' },
        { step: '2', title: 'Book Shipment', desc: 'Schedule your pickup online' },
        { step: '3', title: 'Pack & Send', desc: 'Drop off or we pick up' },
        { step: '4', title: 'Track Delivery', desc: 'Monitor your shipment in real-time' }
      ] as item}
        <div class="text-center">
          <div class="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
            {item.step}
          </div>
          <h3 class="font-semibold text-gray-900 mb-2">{item.title}</h3>
          <p class="text-gray-600 text-sm">{item.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- CTA Section -->
<section id="calculator-section" class="py-20 bg-primary-600">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto text-center text-white">
      <h2 class="text-3xl md:text-4xl font-bold mb-6">
        Ready to Ship?
      </h2>
      <p class="text-xl mb-8 text-primary-100">
        Get an instant quote and start shipping today
      </p>
      <Button
        href="/shipping-calculator"
        class="h-16 px-12 bg-white text-primary-600 hover:bg-gray-100 text-lg font-semibold"
      >
        Use Shipping Calculator
        <ArrowRight class="ml-2 w-5 h-5" />
      </Button>
    </div>
  </div>
</section>

<!-- Testimonials -->
<section class="py-20 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        What Our Customers Say
      </h2>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      <div class="bg-gray-50 p-8 rounded-xl">
        <div class="flex mb-4">
          {#each Array(5) as _}
            <CheckCircle class="w-5 h-5 text-yellow-500 fill-current" />
          {/each}
        </div>
        <p class="text-gray-700 mb-6">
          "Excellent service! My package arrived in Guyana in just 3 days. The tracking system kept me informed throughout."
        </p>
        <div class="font-semibold text-gray-900">- Sarah Johnson</div>
      </div>

      <div class="bg-gray-50 p-8 rounded-xl">
        <div class="flex mb-4">
          {#each Array(5) as _}
            <CheckCircle class="w-5 h-5 text-yellow-500 fill-current" />
          {/each}
        </div>
        <p class="text-gray-700 mb-6">
          "I've been using QCS Cargo for 5 years. Always reliable, great pricing, and excellent customer service."
        </p>
        <div class="font-semibold text-gray-900">- Michael Brown</div>
      </div>

      <div class="bg-gray-50 p-8 rounded-xl">
        <div class="flex mb-4">
          {#each Array(5) as _}
            <CheckCircle class="w-5 h-5 text-yellow-500 fill-current" />
          {/each}
        </div>
        <p class="text-gray-700 mb-6">
          "Shipping to Jamaica has never been easier. The online booking system is simple and efficient."
        </p>
        <div class="font-semibold text-gray-900">- Lisa Williams</div>
      </div>
    </div>
  </div>
</section>
