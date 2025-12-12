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

<main class="min-h-screen">
  <!-- Hero Section -->
  <section class="relative bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 py-24 text-white overflow-hidden">
    <div class="absolute inset-0 opacity-20">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,_rgba(59,130,246,0.3),_transparent_50%)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,_rgba(245,158,11,0.2),_transparent_50%)]"></div>
    </div>
    
    <div class="container mx-auto px-4 relative">
      <div class="max-w-3xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
          Connecting Families 
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Across Borders</span>
        </h1>
        <p class="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          For over 15 years, QCS Cargo has been the trusted link between New Jersey and the Caribbean, 
          helping families stay connected through reliable air freight services.
        </p>
      </div>
    </div>
  </section>

  <!-- Trust Stats -->
  <section class="bg-white py-8 border-b">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {#each TRUST_SIGNALS as signal}
          <div class="p-4">
            <div class="text-3xl md:text-4xl font-bold text-primary-600">{signal.value}</div>
            <div class="text-slate-600">{signal.label}</div>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- Our Story -->
  <section class="py-20 bg-slate-50">
    <div class="container mx-auto px-4">
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <span class="text-primary-600 font-semibold text-sm uppercase tracking-wide">Our Story</span>
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-6">
            From Humble Beginnings to Caribbean's Trusted Carrier
          </h2>
          <div class="space-y-4 text-slate-600 leading-relaxed">
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
          <div class="aspect-square rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white">
            <div class="h-full flex flex-col justify-center">
              <Plane class="w-16 h-16 mb-6 opacity-80" />
              <blockquote class="text-2xl font-medium italic mb-4">
                "We don't just ship packages—we deliver peace of mind and keep families connected."
              </blockquote>
              <p class="text-primary-200">— QCS Cargo Founding Principle</p>
            </div>
          </div>
          <!-- Decorative elements -->
          <div class="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-400 rounded-2xl -z-10"></div>
          <div class="absolute -top-4 -left-4 w-24 h-24 bg-primary-200 rounded-2xl -z-10"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Our Values -->
  <section class="py-20 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <span class="text-primary-600 font-semibold text-sm uppercase tracking-wide">What We Stand For</span>
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Our Core Values</h2>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto">
          These principles guide everything we do, from handling your first package to celebrating our 50,000th delivery.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {#each values as value}
          <Card class="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent class="pt-8 pb-6">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-6">
                <svelte:component this={value.icon} class="w-8 h-8 text-primary-600" />
              </div>
              <h3 class="text-xl font-semibold text-slate-900 mb-3">{value.title}</h3>
              <p class="text-slate-600">{value.description}</p>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Timeline -->
  <section class="py-20 bg-slate-50">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <span class="text-primary-600 font-semibold text-sm uppercase tracking-wide">Our Journey</span>
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Milestones</h2>
      </div>

      <div class="max-w-4xl mx-auto">
        <div class="relative">
          <!-- Timeline line -->
          <div class="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary-200 transform md:-translate-x-1/2"></div>
          
          {#each milestones as milestone, index}
            <div class="relative flex items-start gap-8 mb-12 {index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}">
              <!-- Timeline dot -->
              <div class="absolute left-4 md:left-1/2 w-4 h-4 bg-primary-500 rounded-full transform -translate-x-1/2 mt-1.5 ring-4 ring-white"></div>
              
              <!-- Content -->
              <div class="ml-12 md:ml-0 md:w-1/2 {index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}">
                <span class="inline-block px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-2">
                  {milestone.year}
                </span>
                <h3 class="text-xl font-bold text-slate-900 mb-2">{milestone.title}</h3>
                <p class="text-slate-600">{milestone.description}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- Destinations We Serve -->
  <section class="py-20 bg-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <span class="text-primary-600 font-semibold text-sm uppercase tracking-wide">Where We Ship</span>
        <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Our Caribbean Network</h2>
        <p class="text-lg text-slate-600 max-w-2xl mx-auto">
          Weekly departures to major Caribbean destinations with reliable transit times.
        </p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-6">
        {#each DESTINATIONS as destination}
          <a 
            href="/destinations/{destination.id}"
            class="group p-6 bg-slate-50 rounded-xl hover:bg-primary-50 transition-colors text-center"
          >
            <div class="text-4xl mb-3">{destination.flag}</div>
            <h3 class="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
              {destination.name}
            </h3>
            <p class="text-sm text-slate-500 mt-1">{destination.capital}</p>
            <p class="text-xs text-primary-600 font-medium mt-2">{destination.transitDays.min}-{destination.transitDays.max} days</p>
          </a>
        {/each}
      </div>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="py-20 bg-gradient-to-br from-slate-900 to-primary-900 text-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16">
        <span class="text-primary-400 font-semibold text-sm uppercase tracking-wide">Testimonials</span>
        <h2 class="text-3xl md:text-4xl font-bold mt-2 mb-4">What Our Customers Say</h2>
      </div>

      <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {#each TESTIMONIALS as testimonial}
          <Card class="bg-white/10 border-0 backdrop-blur">
            <CardContent class="pt-6">
              <Quote class="w-8 h-8 text-amber-400 mb-4" />
              <p class="text-white/90 mb-6 leading-relaxed">"{testimonial.text}"</p>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p class="font-semibold text-white">{testimonial.name}</p>
                  <p class="text-sm text-white/60">{testimonial.location} → {testimonial.destination}</p>
                </div>
              </div>
              <div class="flex gap-1 mt-4">
                {#each Array(testimonial.rating) as _}
                  <Star class="w-4 h-4 fill-amber-400 text-amber-400" />
                {/each}
              </div>
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  </section>

  <!-- Contact Info -->
  <section class="py-20 bg-white">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Visit Our Warehouse</h2>
          <p class="text-lg text-slate-600">
            Drop off your packages at our convenient Kearny, NJ location.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 text-center">
          <div class="p-6">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
              <MapPin class="w-6 h-6 text-primary-600" />
            </div>
            <h3 class="font-semibold text-slate-900 mb-2">Address</h3>
            <p class="text-slate-600">{COMPANY.fullAddress}</p>
          </div>
          <div class="p-6">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
              <Phone class="w-6 h-6 text-primary-600" />
            </div>
            <h3 class="font-semibold text-slate-900 mb-2">Phone</h3>
            <a href="tel:{COMPANY.phone}" class="text-primary-600 hover:underline">{COMPANY.phone}</a>
          </div>
          <div class="p-6">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
              <Clock class="w-6 h-6 text-primary-600" />
            </div>
            <h3 class="font-semibold text-slate-900 mb-2">Hours</h3>
            <p class="text-slate-600">Mon-Fri: {COMPANY.hours.weekday}</p>
            <p class="text-slate-600">Sat: {COMPANY.hours.saturday}</p>
          </div>
        </div>

        <div class="text-center mt-12">
          <Button href="/contact" size="lg">
            Get in Touch
          </Button>
        </div>
      </div>
    </div>
  </section>
</main>

