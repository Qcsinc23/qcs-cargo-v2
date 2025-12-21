<script lang="ts">
  import Calculator from '$lib/components/calculator/Calculator.svelte';
  import { COMPANY } from '$lib/config/constants';
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

<main class="min-h-screen bg-background text-foreground">
  <!-- Hero Section -->
  <section class="relative overflow-hidden bg-gradient-to-r from-[#023E8A] via-[#0077B6] to-[#023E8A] py-32 sm:py-40">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div
        class="absolute inset-0 opacity-30"
        style="background-image: linear-gradient(90deg, rgba(144, 224, 239, 0.12) 1px, transparent 1px), linear-gradient(0deg, rgba(144, 224, 239, 0.12) 1px, transparent 1px); background-size: 96px 96px;"
      ></div>
      <div class="absolute -top-32 left-[-10rem] h-[30rem] w-[30rem] rounded-full bg-[#90E0EF]/20 blur-3xl"></div>
      <div class="absolute -bottom-40 right-[-12rem] h-[36rem] w-[36rem] rounded-full bg-[#CAF0F8]/15 blur-3xl"></div>
    </div>

    <div class="relative max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
      <h1 class="font-display text-4xl md:text-6xl text-[#F0F9FF] mb-6">
        Calculate Your Shipping Cost
      </h1>
      <p class="text-base sm:text-lg text-[#CAF0F8]/75 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
        An instant estimate with a clear breakdown—built for customers who want certainty, not surprises.
      </p>
    </div>
  </section>

  <!-- Calculator Section -->
  <section class="py-24 sm:py-28 px-4 sm:px-6 lg:px-8">
    <Calculator />
  </section>

  <!-- Info Cards -->
  <section class="py-24 sm:py-28 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto grid gap-6 md:grid-cols-3">
      <Card class="bg-card border-border/30 shadow-sm">
        <CardContent class="pt-6 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#0077B6]/15 bg-[#E6F6FB] text-[#023E8A] mb-6">
            <Phone class="h-6 w-6" />
          </div>
          <h3 class="font-display text-lg mb-2">Call Us</h3>
          <p class="text-sm text-muted-foreground/80 mb-4 font-light leading-relaxed tracking-wide">
            Speak with our shipping experts
          </p>
          <a href="tel:+12012490929" class="text-[#90E0EF] hover:text-[#CAF0F8] transition-colors font-medium tracking-wide">
            201-249-0929
          </a>
        </CardContent>
      </Card>

      <Card class="bg-card border-border/30 shadow-sm">
        <CardContent class="pt-6 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#0077B6]/15 bg-[#E6F6FB] text-[#023E8A] mb-6">
            <Mail class="h-6 w-6" />
          </div>
          <h3 class="font-display text-lg mb-2">Email Us</h3>
          <p class="text-sm text-muted-foreground/80 mb-4 font-light leading-relaxed tracking-wide">
            Get a detailed quote via email
          </p>
          <a href={`mailto:${COMPANY.email}`} class="text-[#90E0EF] hover:text-[#CAF0F8] transition-colors font-medium tracking-wide">
            {COMPANY.email}
          </a>
        </CardContent>
      </Card>

      <Card class="bg-card border-border/30 shadow-sm">
        <CardContent class="pt-6 text-center">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#0077B6]/15 bg-[#E6F6FB] text-[#023E8A] mb-6">
            <MessageCircle class="h-6 w-6" />
          </div>
          <h3 class="font-display text-lg mb-2">Live Chat</h3>
          <p class="text-sm text-muted-foreground/80 mb-4 font-light leading-relaxed tracking-wide">
            Chat with us in real-time
          </p>
          <Button variant="link" class="text-[#90E0EF] hover:text-[#CAF0F8]">
            Start Chat
          </Button>
        </CardContent>
      </Card>
    </div>
  </section>

  <!-- Shipping Guidelines -->
  <section class="py-32 sm:py-40 px-4 sm:px-6 lg:px-8 bg-background">
    <div class="max-w-4xl mx-auto">
      <h2 class="font-display text-3xl md:text-5xl text-center mb-12">
        Shipping Guidelines
      </h2>
      
      <div class="grid gap-8 md:grid-cols-2">
        <div>
          <h3 class="font-display text-xl mb-6 text-foreground">What We Ship</h3>
          <ul class="space-y-3 text-sm text-muted-foreground/80 font-light leading-relaxed tracking-wide">
            <li class="flex items-start gap-2">
              <span class="text-[#90E0EF] font-bold">✓</span>
              <span>Personal effects and household items</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-[#90E0EF] font-bold">✓</span>
              <span>Electronics and appliances</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-[#90E0EF] font-bold">✓</span>
              <span>Non-perishable food items</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-[#90E0EF] font-bold">✓</span>
              <span>Books, documents, and gifts</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-[#90E0EF] font-bold">✓</span>
              <span>Auto parts and tools</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="font-display text-xl mb-6 text-foreground">Prohibited Items</h3>
          <ul class="space-y-3 text-sm text-muted-foreground/80 font-light leading-relaxed tracking-wide">
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

      <div class="mt-12 rounded-2xl border border-border/25 bg-card/60 p-6 text-left">
        <p class="text-sm text-muted-foreground/85 font-light leading-relaxed tracking-wide">
          <span class="font-semibold text-foreground">Note:</span>
          All shipments are subject to TSA and customs inspection. Rates shown are estimates and may vary based on final inspection.
          Additional customs fees may apply at the destination country.
        </p>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="relative overflow-hidden py-32 sm:py-40 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#023E8A] via-[#0077B6] to-[#023E8A]">
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(circle at 20% 30%, rgba(144,224,239,0.25), transparent 55%), radial-gradient(circle at 80% 60%, rgba(202,240,248,0.18), transparent 55%);"></div>
    </div>
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="font-display text-3xl md:text-5xl text-[#F0F9FF] mb-6">
        Ready to Ship?
      </h2>
      <p class="text-base sm:text-lg mb-12 text-[#CAF0F8]/75 font-light leading-relaxed tracking-wide">
        Create an account to book your shipment or visit our warehouse
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          href="/api/auth/register"
          class="h-14 px-10 bg-transparent border border-[#90E0EF]/50 text-[#F0F9FF] hover:bg-white/5 hover:border-[#CAF0F8]/60 tracking-[0.3em] uppercase text-xs font-semibold"
        >
          Create Account
        </Button>
        <Button
          size="lg"
          variant="outline"
          class="h-14 px-10 bg-transparent border border-[#90E0EF]/30 text-[#CAF0F8] hover:bg-white/5 hover:border-[#CAF0F8]/50 tracking-[0.3em] uppercase text-xs font-semibold"
        >
          Visit Warehouse
        </Button>
      </div>
    </div>
  </section>
</main>


