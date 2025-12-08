<script lang="ts">
  import Calculator from '$lib/components/landing/Calculator.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Phone, Mail, MessageCircle } from 'lucide-svelte';
</script>

<svelte:head>
  <title>Shipping Calculator | QCS Cargo - Get Instant Quotes</title>
  <meta 
    name="description" 
    content="Calculate shipping costs to Guyana, Jamaica, Trinidad, Barbados, and Suriname. Get instant quotes for air freight from New Jersey to the Caribbean." 
  />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-white to-gray-50">
  <!-- Hero Section -->
  <section class="py-12 md:py-16 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        Calculate Your Shipping Cost
      </h1>
      <p class="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
        Get an instant quote for shipping to the Caribbean. Fast, reliable, and transparent pricing.
      </p>
    </div>
  </section>

  <!-- Calculator Section -->
  <section class="py-8 px-4 sm:px-6 lg:px-8">
    <Calculator />
  </section>

  <!-- Info Cards -->
  <section class="py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
      <Card>
        <CardContent class="pt-6 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
            <Phone class="h-6 w-6" />
          </div>
          <h3 class="font-semibold mb-2">Call Us</h3>
          <p class="text-sm text-muted-foreground mb-3">
            Speak with our shipping experts
          </p>
          <a href="tel:+12012490929" class="text-primary-600 hover:underline font-medium">
            201-249-0929
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
            <Mail class="h-6 w-6" />
          </div>
          <h3 class="font-semibold mb-2">Email Us</h3>
          <p class="text-sm text-muted-foreground mb-3">
            Get a detailed quote via email
          </p>
          <a href="mailto:sales@quietcraftsolutions.com" class="text-primary-600 hover:underline font-medium">
            sales@quietcraftsolutions.com
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-6 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
            <MessageCircle class="h-6 w-6" />
          </div>
          <h3 class="font-semibold mb-2">Live Chat</h3>
          <p class="text-sm text-muted-foreground mb-3">
            Chat with us in real-time
          </p>
          <Button variant="link" class="text-primary-600">
            Start Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  </section>

  <!-- Shipping Guidelines -->
  <section class="py-12 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-4xl mx-auto">
      <h2 class="text-2xl md:text-3xl font-bold text-center mb-8">
        Shipping Guidelines
      </h2>
      
      <div class="grid gap-8 md:grid-cols-2">
        <div>
          <h3 class="text-lg font-semibold mb-4 text-primary-700">What We Ship</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start gap-2">
              <span class="text-success-600 font-bold">✓</span>
              <span>Personal effects and household items</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-success-600 font-bold">✓</span>
              <span>Electronics and appliances</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-success-600 font-bold">✓</span>
              <span>Non-perishable food items</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-success-600 font-bold">✓</span>
              <span>Books, documents, and gifts</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-success-600 font-bold">✓</span>
              <span>Auto parts and tools</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-lg font-semibold mb-4 text-destructive-700">Prohibited Items</h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start gap-2">
              <span class="text-destructive-600 font-bold">✗</span>
              <span>Hazardous materials and chemicals</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-destructive-600 font-bold">✗</span>
              <span>Weapons and ammunition</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-destructive-600 font-bold">✗</span>
              <span>Illegal drugs and controlled substances</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-destructive-600 font-bold">✗</span>
              <span>Perishable food items</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-destructive-600 font-bold">✗</span>
              <span>Live animals and plants</span>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p class="text-sm text-gray-700">
          <strong>Note:</strong> All shipments are subject to TSA and customs inspection. 
          Rates shown are estimates and may vary based on final inspection. 
          Additional customs fees may apply at the destination country.
        </p>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="py-16 px-4 sm:px-6 lg:px-8 bg-primary-600 text-white">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-3xl md:text-4xl font-bold mb-4">
        Ready to Ship?
      </h2>
      <p class="text-lg mb-8 text-primary-100">
        Create an account to book your shipment or visit our warehouse
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button size="lg" variant="secondary" href="/auth/register">
          Create Account
        </Button>
        <Button size="lg" variant="outline" class="bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
          Visit Warehouse
        </Button>
      </div>
    </div>
  </section>
</div>


