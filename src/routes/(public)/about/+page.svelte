<script lang="ts">
  import { COMPANY, TRUST_SIGNALS, TESTIMONIALS } from '$lib/config/constants';
  import { DESTINATIONS } from '$lib/config/destinations';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { 
    Plane, 
    Users, 
    Shield, 
    Clock,
    MapPin,
    Phone,
    Mail,
    Award,
    Heart,
    Globe,
    CheckCircle2,
    Star,
    Quote
  } from 'lucide-svelte';

  const milestones = [
    { year: '2009', title: 'Founded', description: 'QCS Cargo was established in Kearny, NJ to serve the Caribbean diaspora community.' },
    { year: '2012', title: 'Expanded Routes', description: 'Added Jamaica and Trinidad to our destination network.' },
    { year: '2015', title: '10,000 Shipments', description: 'Reached our first major milestone of successful deliveries.' },
    { year: '2018', title: 'TSA Licensed', description: 'Became a certified TSA Known Shipper for enhanced security.' },
    { year: '2021', title: 'Digital Transformation', description: 'Launched online booking and real-time tracking systems.' },
    { year: '2024', title: '50,000+ Shipments', description: 'Continuing to grow and serve our community with excellence.' }
  ];

  const values = [
    { icon: Shield, title: 'Reliability', description: 'Your cargo is our responsibility. We deliver on our promises, every time.' },
    { icon: Heart, title: 'Community', description: 'We understand the importance of family connections across borders.' },
    { icon: Award, title: 'Excellence', description: 'Committed to the highest standards in handling and customer service.' },
    { icon: Clock, title: 'Efficiency', description: 'Streamlined processes to get your packages delivered faster.' }
  ];
</script>

<svelte:head>
  <title>About Us | QCS Cargo - Your Trusted Caribbean Shipping Partner</title>
  <meta name="description" content="Learn about QCS Cargo's 15+ years of experience shipping to the Caribbean. Family-owned, community-focused, and committed to connecting loved ones across borders." />
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
    
    <div class="container mx-auto px-4 relative">
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="font-display text-4xl md:text-6xl lg:text-7xl mb-6 leading-tight text-[#F0F9FF]">
          Connecting Families
          <span class="block text-transparent bg-clip-text bg-gradient-to-r from-[#CAF0F8] via-[#90E0EF] to-[#CAF0F8]">
            Across Borders
          </span>
        </h1>
        <p class="text-base sm:text-lg text-[#CAF0F8]/75 mb-10 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
          For over 15 years, QCS Cargo has been the trusted link between New Jersey and the Caribbean, 
          helping families stay connected through reliable air freight services.
        </p>
      </div>
    </div>
  </section>

  <!-- Trust Stats -->
  <section class="bg-background py-12 border-b border-border/25">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {#each TRUST_SIGNALS as signal}
          <div class="p-4">
            <div class="font-display text-3xl md:text-4xl text-foreground">{signal.value}</div>
            <div class="text-xs uppercase tracking-[0.22em] text-muted-foreground/75 mt-2">{signal.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Our Story -->
  <section class="py-32 sm:py-40 bg-background">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span class="text-xs uppercase tracking-[0.35em] text-muted-foreground/80">Our Story</span>
          <h2 class="font-display text-3xl md:text-5xl text-foreground mt-4 mb-8">
            From Humble Beginnings to Caribbean's Trusted Carrier
          </h2>
          <div class="space-y-5 text-muted-foreground/80 leading-relaxed tracking-wide font-light">
            <p>
              QCS Cargo was founded in 2009 by members of the Caribbean diaspora who understood firsthand 
              the challenges of sending packages home. What started as a small operation in Kearny, New Jersey, 
              has grown into a comprehensive logistics company serving thousands of families each year.
            </p>
            <p>
              We know that behind every package is a story—a care package for a grandmother, supplies for 
              a family business, or gifts for loved ones celebrating a special occasion. That's why we treat 
              every shipment with the care and attention it deserves.
            </p>
            <p>
              Today, we're proud to serve Guyana, Jamaica, Trinidad, Barbados, and Suriname with 
              weekly departures and industry-leading transit times. Our TSA Known Shipper certification 
              ensures your cargo meets the highest security standards.
            </p>
          </div>
        </div>
        <div class="relative">
          <div class="aspect-square rounded-2xl bg-gradient-to-br from-[#0077B6] to-[#023E8A] p-8 text-[#F0F9FF] border border-white/10">
            <div class="h-full flex flex-col justify-center">
              <Plane class="w-16 h-16 mb-6 opacity-80" />
              <blockquote class="text-2xl font-medium italic mb-4">
                "We don't just ship packages—we deliver peace of mind and keep families connected."
              </blockquote>
              <p class="text-[#CAF0F8]/80 font-light tracking-wide">— QCS Cargo Founding Principle</p>
            </div>
          </div>
          <!-- Decorative elements -->
          <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-[#90E0EF]/25 rounded-2xl -z-10"></div>
          <div class="absolute -top-4 -left-4 w-24 h-24 bg-[#CAF0F8]/15 rounded-2xl -z-10"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Our Values -->
  <section class="py-32 sm:py-40 bg-background">
    <div class="container mx-auto px-4">
      <div class="text-center mb-20">
        <span class="text-xs uppercase tracking-[0.35em] text-muted-foreground/80">What We Stand For</span>
        <h2 class="font-display text-3xl md:text-5xl text-foreground mt-4 mb-6">Our Core Values</h2>
        <p class="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
          These principles guide everything we do, from handling your first package to celebrating our 50,000th delivery.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
        {#each values as value}
          <Card class="text-center bg-card border-border/30 shadow-sm hover:border-[#0077B6]/25 transition-colors">
            <CardContent class="pt-8 pb-6">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-[#E6F6FB] border border-[#0077B6]/15 rounded-full mb-7">
                <svelte:component this={value.icon} class="w-8 h-8 text-[#023E8A]" />
              </div>
              <h3 class="font-display text-xl text-foreground mb-3">{value.title}</h3>
              <p class="text-sm text-muted-foreground/80 font-light leading-relaxed tracking-wide">{value.description}</p>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Timeline -->
  <section class="py-32 sm:py-40 bg-background">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <span class="text-xs uppercase tracking-[0.35em] text-muted-foreground/80">Our Journey</span>
        <h2 class="font-display text-3xl md:text-5xl text-foreground mt-4 mb-0">Milestones</h2>
      </div>

      <div class="max-w-4xl mx-auto">
        <div class="relative">
          <!-- Timeline line -->
          <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border/35 transform md:-translate-x-1/2"></div>
          
          {#each milestones as milestone, index}
            <div class="relative flex items-start gap-8 mb-12 {index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}">
              <!-- Timeline dot -->
              <div class="absolute left-4 md:left-1/2 w-4 h-4 bg-[#90E0EF] rounded-full transform -translate-x-1/2 mt-1.5 ring-4 ring-background"></div>
              
              <!-- Content -->
              <div class="ml-12 md:ml-0 md:w-1/2 {index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}">
                <span class="inline-flex items-center px-3 py-2 bg-muted/60 border border-border/30 text-muted-foreground/80 rounded-full text-xs uppercase tracking-[0.28em] mb-3">
                  {milestone.year}
                </span>
                <h3 class="font-display text-xl text-foreground mb-3">{milestone.title}</h3>
                <p class="text-sm text-muted-foreground/80 font-light leading-relaxed tracking-wide">{milestone.description}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- Destinations We Serve -->
  <section class="py-32 sm:py-40 bg-background">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <span class="text-xs uppercase tracking-[0.35em] text-muted-foreground/80">Where We Ship</span>
        <h2 class="font-display text-3xl md:text-5xl text-foreground mt-4 mb-6">Our Caribbean Network</h2>
        <p class="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
          Weekly departures to major Caribbean destinations with reliable transit times.
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
        {#each DESTINATIONS as destination}
          <a 
            href="/destinations/{destination.id}"
            class="group p-6 rounded-2xl bg-card border border-border/30 shadow-sm hover:border-[#0077B6]/25 transition-colors text-center"
          >
            <div class="text-4xl mb-3">{destination.flag}</div>
            <h3 class="font-display text-lg text-foreground transition-colors">
              {destination.name}
            </h3>
            <p class="text-sm text-muted-foreground/75 mt-2 font-light tracking-wide">{destination.capital}</p>
            <p class="text-xs text-[#0077B6] font-semibold mt-3 tracking-[0.22em] uppercase">
              {destination.transitDays.min}-{destination.transitDays.max} days
            </p>
          </a>
        {/each}
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="py-32 sm:py-40 bg-gradient-to-b from-background via-white to-[#F3DDD4]/45 text-foreground">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <span class="text-xs uppercase tracking-[0.35em] text-muted-foreground/80">Testimonials</span>
        <h2 class="font-display text-3xl md:text-5xl mt-4 text-foreground">What Our Customers Say</h2>
      </div>

      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {#each TESTIMONIALS as testimonial}
          <Card class="bg-card border border-border/30 shadow-sm">
            <CardContent class="pt-6">
              <Quote class="w-8 h-8 text-[#B8860B]/60 mb-4" />
              <p class="text-foreground/90 mb-6 leading-relaxed">"{testimonial.text}"</p>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-muted/60 border border-border/30 rounded-full flex items-center justify-center text-foreground font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p class="font-semibold text-foreground">{testimonial.name}</p>
                  <p class="text-sm text-muted-foreground/75">{testimonial.location} → {testimonial.destination}</p>
                </div>
              </div>
              <div class="flex gap-1 mt-4">
                {#each Array(testimonial.rating) as _}
                  <Star class="w-4 h-4 fill-[#D6B15E] text-[#D6B15E]" />
                {/each}
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Contact Info -->
  <section class="py-32 sm:py-40 bg-background">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="font-display text-3xl md:text-5xl text-foreground mb-6">Visit Our Warehouse</h2>
          <p class="text-base sm:text-lg text-muted-foreground/80 font-light leading-relaxed tracking-wide">
            Drop off your packages at our convenient Kearny, NJ location.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 text-center">
          <div class="p-6">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-muted/60 border border-border/30 rounded-full mb-6">
              <MapPin class="w-6 h-6 text-[#023E8A]" />
            </div>
            <h3 class="font-display text-lg text-foreground mb-3">Address</h3>
            <p class="text-sm text-muted-foreground/80 font-light leading-relaxed tracking-wide">{COMPANY.fullAddress}</p>
          </div>
          <div class="p-6">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-muted/60 border border-border/30 rounded-full mb-6">
              <Phone class="w-6 h-6 text-[#023E8A]" />
            </div>
            <h3 class="font-display text-lg text-foreground mb-3">Phone</h3>
            <a href="tel:{COMPANY.phone}" class="text-sm text-[#023E8A] hover:text-[#0077B6] transition-colors font-medium tracking-wide">{COMPANY.phone}</a>
          </div>
          <div class="p-6">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-muted/60 border border-border/30 rounded-full mb-6">
              <Clock class="w-6 h-6 text-[#023E8A]" />
            </div>
            <h3 class="font-display text-lg text-foreground mb-3">Hours</h3>
            <p class="text-sm text-muted-foreground/80 font-light tracking-wide">Mon-Fri: {COMPANY.hours.weekday}</p>
            <p class="text-sm text-muted-foreground/80 font-light tracking-wide">Sat: {COMPANY.hours.saturday}</p>
          </div>
        </div>

        <div class="text-center mt-12">
          <Button
            href="/contact"
            size="lg"
            class="h-14 px-10 bg-transparent border border-[#0077B6]/30 hover:bg-[#0077B6]/5 hover:text-foreground tracking-[0.3em] uppercase text-xs font-semibold"
          >
            Get in Touch
          </Button>
        </div>
      </div>
    </div>
  </section>
</main>

