<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import {
    ArrowRight,
    Shield,
    Sparkles,
    Package,
    Timer,
    Lock,
    Headphones,
    MapPin,
    CheckCircle
  } from 'lucide-svelte';

  let y = 0;
  let ticking = false;
  let scrollCleanup: (() => void) | null = null;

  onMount(() => {
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          y = window.scrollY;
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    scrollCleanup = () => window.removeEventListener('scroll', onScroll);
  });

  onDestroy(() => scrollCleanup?.());

  // Scroll to calculator section
  function scrollToCalculator() {
    const element = document.getElementById('calculator-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  const features = [
    {
      icon: Timer,
      title: 'Expedited Air Transit',
      description:
        'Priority routing to key Caribbean hubs with consistent flight schedules and proactive handling.'
    },
    {
      icon: Lock,
      title: 'Secure Chain of Care',
      description:
        'TSA‑licensed operations, controlled processing, and careful documentation for peace of mind.'
    },
    {
      icon: Package,
      title: 'Concierge Packaging Standards',
      description:
        'Guided prep, protective handling, and inspection‑ready packaging for smoother clearance.'
    },
    {
      icon: Headphones,
      title: 'White‑Glove Support',
      description:
        'A real team, reachable when you need it—before pickup, in‑flight, and at arrival.'
    }
  ] as const;

  const destinations = [
    { name: 'Guyana', code: 'GY', flag: '🇬🇾', note: 'Georgetown' },
    { name: 'Jamaica', code: 'JM', flag: '🇯🇲', note: 'Kingston' },
    { name: 'Trinidad & Tobago', code: 'TT', flag: '🇹🇹', note: 'Port of Spain' },
    { name: 'Barbados', code: 'BB', flag: '🇧🇧', note: 'Bridgetown' },
    { name: 'Suriname', code: 'SR', flag: '🇸🇷', note: 'Paramaribo' }
  ] as const;

  const testimonials = [
    {
      quote:
        '“It feels less like shipping—and more like having a concierge. Clear communication, careful handling, and a premium experience end‑to‑end.”',
      name: 'Sarah Johnson',
      detail: 'Frequent shipper · Guyana'
    },
    {
      quote:
        '“I’ve trusted QCS for years. What keeps me loyal is the consistency: timelines, tracking, and the way they treat your items like they matter.”',
      name: 'Michael Brown',
      detail: 'Small business owner · Jamaica'
    },
    {
      quote:
        '“From quote to delivery, everything is smooth. The experience feels elevated—professional, responsive, and genuinely reliable.”',
      name: 'Lisa Williams',
      detail: 'Family shipments · Trinidad'
    }
  ] as const;
</script>

<svelte:head>
  <title>QCS Cargo — White‑Glove Air Freight to the Caribbean</title>
  <meta
    name="description"
    content="A premium, concierge shipping experience from New Jersey to Guyana, Jamaica, Trinidad & Tobago, Barbados, and Suriname. TSA licensed. Secure handling. Trusted air freight."
  />
</svelte:head>

<main class="bg-background text-foreground">
  <!-- HERO -->
  <section
    class="relative isolate min-h-screen overflow-hidden bg-gradient-to-r from-[#023E8A] via-[#0077B6] to-[#023E8A]"
  >
    <!-- Living ocean background (decorative only) -->
    <div class="pointer-events-none absolute inset-0">
      <!-- Soft grid overlay -->
      <div class="ocean-grid absolute inset-0 opacity-30" aria-hidden="true"></div>

      <!-- Warm neutral haze (subtle, to soften the ocean) -->
      <div class="absolute inset-0 opacity-35" aria-hidden="true">
        <div class="absolute -left-40 top-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[#F3DDD4]/35 blur-2xl motion-slow ocean-float"></div>
        <div class="absolute -right-44 bottom-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[#DDE8DF]/35 blur-2xl motion-slow ocean-drift"></div>
      </div>

      <!-- Parallax layers (outer wrapper translates, inner element animates) -->
      <div
        class="absolute -top-48 left-[-12rem] h-[28rem] w-[28rem] opacity-70 blur-2xl"
        style={`transform: translate3d(0, ${y * 0.06}px, 0);`}
        aria-hidden="true"
      >
        <div class="ocean-blob ocean-blob--a motion-slow h-full w-full rounded-full"></div>
      </div>

      <div
        class="absolute top-[-18rem] right-[-14rem] h-[30rem] w-[30rem] opacity-60 blur-2xl"
        style={`transform: translate3d(0, ${y * 0.04}px, 0);`}
        aria-hidden="true"
      >
        <div class="ocean-blob ocean-blob--b motion-slow h-full w-full rounded-full"></div>
      </div>

      <div
        class="absolute bottom-[-22rem] left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 opacity-70 blur-2xl"
        style={`transform: translate3d(-50%, ${y * -0.02}px, 0);`}
        aria-hidden="true"
      >
        <div class="ocean-blob ocean-blob--c motion-slow h-full w-full rounded-full"></div>
      </div>

      <!-- Subtle floating rings -->
      <div
        class="absolute left-[10%] top-[22%] h-16 w-16 rounded-full border border-[#90E0EF]/35 opacity-60"
        style={`transform: translate3d(0, ${y * 0.1}px, 0);`}
        aria-hidden="true"
      ></div>
      <div
        class="absolute right-[14%] top-[42%] h-24 w-24 rounded-full border border-[#CAF0F8]/25 opacity-50"
        style={`transform: translate3d(0, ${y * 0.07}px, 0);`}
        aria-hidden="true"
      ></div>
      <div
        class="absolute left-[18%] bottom-[18%] h-20 w-20 rounded-full border border-[#90E0EF]/25 opacity-50"
        style={`transform: translate3d(0, ${y * -0.08}px, 0);`}
        aria-hidden="true"
      ></div>
    </div>

    <div class="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
      <div class="w-full">
        <div class="mx-auto max-w-4xl text-center">
          <!-- Glass panel -->
          <div class="glass-panel relative mx-auto rounded-2xl border border-white/12 bg-white/10 px-6 py-12 backdrop-blur-xl sm:px-10 sm:py-14">
            <div
              class="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-[#D6B15E]/35 bg-[#023E8A]/25 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[#FFF1D6]"
            >
              <Shield class="h-4 w-4 text-[#D6B15E]" />
              TSA Licensed · Fully Insured
            </div>

            <h1 class="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95] text-[#F0F9FF]">
              White‑Glove
              <span class="text-shimmer block">Caribbean Air Freight</span>
            </h1>

            <p class="mx-auto mt-6 max-w-3xl text-base sm:text-lg md:text-xl font-light leading-relaxed tracking-wide text-[#90E0EF]/75">
              A premium package forwarding experience—crafted for customers who value clarity, care, and discretion.
              From New Jersey to Guyana, Jamaica, Trinidad & Tobago, Barbados, and Suriname.
            </p>

            <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
              <Button
                size="lg"
                on:click={scrollToCalculator}
                class="ghost-cta h-14 px-10 bg-transparent border border-[#90E0EF]/50 text-[#F0F9FF] hover:bg-white/5 hover:border-[#CAF0F8]/60 tracking-[0.3em] uppercase text-xs font-semibold"
              >
                Get Instant Quote
                <ArrowRight class="ml-3 h-5 w-5 text-[#90E0EF]" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                href="/track"
                class="ghost-cta h-14 px-10 bg-transparent border border-[#D6B15E]/40 text-[#FFF1D6] hover:bg-white/5 hover:border-[#D6B15E]/60 tracking-[0.3em] uppercase text-xs font-semibold"
              >
                Track Shipment
              </Button>
            </div>

            <!-- Trust marks -->
            <div class="mt-14 grid grid-cols-2 gap-10 sm:grid-cols-4">
              <div class="text-center">
                <div class="font-display text-3xl text-[#F0F9FF]">15+</div>
                <div class="mt-2 text-xs font-light tracking-[0.22em] uppercase text-[#CAF0F8]/75">Years</div>
              </div>
              <div class="text-center">
                <div class="font-display text-3xl text-[#F0F9FF]">50K+</div>
                <div class="mt-2 text-xs font-light tracking-[0.22em] uppercase text-[#CAF0F8]/75">Delivered</div>
              </div>
              <div class="text-center">
                <div class="font-display text-3xl text-[#F0F9FF]">99%</div>
                <div class="mt-2 text-xs font-light tracking-[0.22em] uppercase text-[#CAF0F8]/75">Satisfaction</div>
              </div>
              <div class="text-center">
                <div class="font-display text-3xl text-[#F0F9FF]">24/7</div>
                <div class="mt-2 text-xs font-light tracking-[0.22em] uppercase text-[#CAF0F8]/75">Tracking</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Decorative wave divider -->
        <div class="pointer-events-none absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none" class="h-24 w-full">
            <path
              d="M0,80 C240,120 420,20 720,60 C1020,100 1200,40 1440,70 L1440,120 L0,120 Z"
              fill="rgba(0,29,61,0.55)"
            ></path>
            <path
              d="M0,90 C260,130 460,40 740,70 C1020,100 1180,60 1440,85 L1440,120 L0,120 Z"
              fill="rgba(0,29,61,0.75)"
            ></path>
          </svg>
        </div>
      </div>
    </div>
  </section>

  <!-- FEATURES -->
  <section class="relative bg-background py-32 sm:py-40">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D6B15E]/35 bg-[#FFF7E6] px-4 py-2 text-xs uppercase tracking-[0.35em] text-[#001D3D]/70">
          <Sparkles class="h-4 w-4 text-[#B8860B]" />
          Premium Standard
        </div>
        <h2 class="font-display text-4xl sm:text-5xl md:text-6xl text-foreground">
          Crafted for Discerning Shippers
        </h2>
        <p class="mx-auto mt-6 max-w-2xl text-base sm:text-lg font-light leading-relaxed tracking-wide text-muted-foreground/80">
          We operate like a concierge: measured, careful, and consistent. It’s not about being the cheapest—
          it’s about being the most trusted.
        </p>
      </div>

      <div class="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {#each features as feature}
          <div class="feature-card group rounded-2xl border border-[#0077B6]/15 bg-card p-8 shadow-sm transition-colors hover:border-[#0077B6]/25">
            <div class="mb-7 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#0077B6]/15 bg-[#E6F6FB]">
              <svelte:component this={feature.icon} class="h-6 w-6 text-[#023E8A]" />
            </div>
            <h3 class="font-display text-xl text-foreground">{feature.title}</h3>
            <p class="mt-3 text-sm font-light leading-relaxed tracking-wide text-muted-foreground/80">
              {feature.description}
            </p>
          </div>
        {/each}
      </div>
    </div>
  </section>

  <!-- DESTINATIONS (Option A: horizontal scroll + snap) -->
  <section class="relative bg-background py-32 sm:py-40">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="font-display text-4xl sm:text-5xl md:text-6xl text-foreground">
          Select Caribbean Destinations
        </h2>
        <p class="mx-auto mt-6 max-w-2xl text-base sm:text-lg font-light leading-relaxed tracking-wide text-muted-foreground/80">
          Seamless air freight service to key islands and hubs—handled with a concierge mindset from intake to arrival.
        </p>
      </div>

      <div class="mt-16">
        <div class="hide-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-6">
          {#each destinations as d}
            <div class="snap-center">
              <div
                class="relative w-[18.5rem] overflow-hidden rounded-2xl border border-[#0077B6]/20 bg-white p-7 sm:w-[22rem]"
              >
                <div class="pointer-events-none absolute inset-0">
                  <div class="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-[#90E0EF]/25 blur-2xl"></div>
                  <div class="absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-[#0077B6]/15 blur-2xl"></div>
                  <div class="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,62,138,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(2,62,138,0.06)_1px,transparent_1px)] bg-[size:80px_80px] opacity-40"></div>
                </div>

                <div class="relative">
                  <div class="flex items-start justify-between gap-6">
                    <div>
                      <div class="flex items-center gap-3">
                        <div class="text-3xl leading-none">{d.flag}</div>
                        <div class="text-xs font-semibold tracking-[0.3em] uppercase text-[#0077B6]">
                          {d.code}
                        </div>
                      </div>
                      <h3 class="mt-4 font-display text-2xl text-[#001D3D]">{d.name}</h3>
                      <div class="mt-2 inline-flex items-center gap-2 text-sm text-[#001D3D]/65">
                        <MapPin class="h-4 w-4 text-[#0077B6]" />
                        {d.note}
                      </div>
                    </div>
                    <div class="select-none font-display text-6xl text-[#001D3D]/5">{d.code}</div>
                  </div>

                  <div class="mt-8 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#001D3D]/55">
                    <span class="h-[1px] w-10 bg-[#0077B6]/25"></span>
                    Premium routing
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="mt-12 text-center">
        <Button
          href="/destinations"
          variant="outline"
          size="lg"
          class="ghost-cta h-14 px-10 bg-transparent border border-[#0077B6]/30 text-[#001D3D] hover:bg-[#0077B6]/5 hover:border-[#0077B6]/45 tracking-[0.3em] uppercase text-xs font-semibold"
        >
          View All Destinations
          <ArrowRight class="ml-3 h-5 w-5 text-[#0077B6]" />
        </Button>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS (editorial / magazine) -->
  <section class="relative overflow-hidden bg-gradient-to-b from-[#FBF8F2] via-white to-[#F3DDD4]/45 py-32 sm:py-40">
    <div class="pointer-events-none absolute inset-0 opacity-45" aria-hidden="true">
      <div class="absolute -left-24 top-12 h-[20rem] w-[20rem] rounded-full bg-[#DDE8DF]/55 blur-2xl motion-slow ocean-float"></div>
      <div class="absolute -right-28 bottom-0 h-[24rem] w-[24rem] rounded-full bg-[#F3DDD4]/55 blur-2xl motion-slow ocean-drift"></div>
    </div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="font-display text-4xl sm:text-5xl md:text-6xl text-foreground">
          Quiet Confidence, Shared
        </h2>
        <p class="mx-auto mt-6 max-w-2xl text-base sm:text-lg font-light leading-relaxed tracking-wide text-muted-foreground/80">
          The experience speaks for itself—measured, precise, and consistently premium.
        </p>
      </div>

      <div class="mt-16 grid gap-10 lg:grid-cols-12 lg:items-start">
        <!-- Featured quote -->
        <div class="lg:col-span-7">
          <div class="relative overflow-hidden rounded-2xl border border-[#0077B6]/15 bg-card p-10 shadow-sm">
            <div class="pointer-events-none absolute left-8 top-6 font-display text-[8rem] leading-none text-[#023E8A]/10" aria-hidden="true">
              “
            </div>
            <p class="relative font-display text-2xl sm:text-3xl leading-snug text-foreground">
              {testimonials[0].quote}
            </p>
            <div class="mt-10 flex items-center justify-between gap-6">
              <div>
                <div class="text-xs uppercase tracking-[0.35em] text-[#001D3D]/70">{testimonials[0].name}</div>
                <div class="mt-2 text-sm font-light tracking-wide text-muted-foreground/80">{testimonials[0].detail}</div>
              </div>
              <div class="flex items-center gap-1" aria-hidden="true">
                {#each Array(5) as _}
                  <CheckCircle class="h-5 w-5 text-[#0077B6]/35" />
                {/each}
              </div>
            </div>
          </div>
        </div>

        <!-- Supporting quotes -->
        <div class="lg:col-span-5 space-y-8">
          {#each testimonials.slice(1) as t}
            <div class="relative rounded-2xl border border-[#0077B6]/12 bg-card p-8 shadow-sm">
              <p class="font-display text-xl leading-snug text-foreground">{t.quote}</p>
              <div class="mt-8">
                <div class="text-xs uppercase tracking-[0.35em] text-[#001D3D]/70">{t.name}</div>
                <div class="mt-2 text-sm font-light tracking-wide text-muted-foreground/80">{t.detail}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </section>

  <!-- CTA / FINAL (must preserve #calculator-section + /shipping-calculator link) -->
  <section
    id="calculator-section"
    class="relative overflow-hidden py-32 sm:py-40 bg-gradient-to-br from-[#001D3D] via-[#023E8A] to-[#001D3D] text-[#F0F9FF]"
  >
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute inset-0 opacity-35 ocean-grid"></div>
      <div class="absolute -top-28 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 rounded-full bg-[#90E0EF]/25 blur-2xl motion-slow ocean-pulse"></div>
      <div class="absolute -bottom-40 right-[-10rem] h-[28rem] w-[28rem] rounded-full bg-[#CAF0F8]/20 blur-2xl motion-slow ocean-drift"></div>
      <div class="absolute -bottom-36 left-[-12rem] h-[22rem] w-[22rem] rounded-full bg-[#0077B6]/10 blur-2xl motion-slow ocean-float"></div>
      <div class="absolute -top-24 right-[-12rem] h-[20rem] w-[20rem] rounded-full bg-[#F3DDD4]/18 blur-2xl motion-slow ocean-drift"></div>
      <div class="absolute -bottom-44 left-[10%] h-[20rem] w-[20rem] rounded-full bg-[#DDE8DF]/18 blur-2xl motion-slow ocean-float"></div>
    </div>

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl text-center">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-[#CAF0F8]/90">
          <Sparkles class="h-4 w-4 text-[#90E0EF]" />
          Instant estimate
        </div>

        <h2 class="mt-6 font-display text-4xl sm:text-5xl md:text-6xl text-[#F0F9FF]">
          Ready to Ship with Confidence?
        </h2>
        <p class="mx-auto mt-6 max-w-2xl text-base sm:text-lg font-light leading-relaxed tracking-wide text-[#CAF0F8]/75">
          Get a refined quote experience with clear breakdowns—built for customers who want certainty, not surprises.
        </p>

        <div class="mt-12 flex justify-center">
          <Button
            href="/shipping-calculator"
            class="ghost-cta h-14 px-12 bg-transparent border border-[#90E0EF]/50 text-[#F0F9FF] hover:bg-white/5 hover:border-[#CAF0F8]/60 tracking-[0.3em] uppercase text-xs font-semibold"
          >
            Use Shipping Calculator
            <ArrowRight class="ml-3 h-5 w-5 text-[#90E0EF]" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Wave divider into global footer -->
    <div class="pointer-events-none absolute bottom-[-1px] left-0 right-0" aria-hidden="true">
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" class="h-24 w-full">
        <path
          d="M0,75 C220,115 460,35 720,70 C980,105 1200,60 1440,88 L1440,120 L0,120 Z"
          fill="rgba(0,29,61,1)"
        ></path>
      </svg>
    </div>
  </section>
</main>

<style>
  /* Living Ocean primitives */
  .ocean-grid {
    background-image:
      linear-gradient(90deg, rgba(144, 224, 239, 0.12) 1px, transparent 1px),
      linear-gradient(0deg, rgba(144, 224, 239, 0.12) 1px, transparent 1px);
    background-size: 96px 96px;
    mask-image: radial-gradient(circle at 50% 40%, rgba(0, 0, 0, 0.9), transparent 70%);
  }

  .ocean-blob--a {
    background: radial-gradient(circle at 30% 30%, rgba(144, 224, 239, 0.45), transparent 60%),
      radial-gradient(circle at 70% 60%, rgba(202, 240, 248, 0.25), transparent 55%),
      radial-gradient(circle at 50% 50%, rgba(2, 62, 138, 0.45), transparent 65%);
    animation: drift 18s ease-in-out infinite;
  }

  .ocean-blob--b {
    background: radial-gradient(circle at 35% 35%, rgba(0, 119, 182, 0.55), transparent 60%),
      radial-gradient(circle at 70% 55%, rgba(144, 224, 239, 0.22), transparent 55%),
      radial-gradient(circle at 50% 50%, rgba(2, 62, 138, 0.55), transparent 70%);
    animation: pulse-glow 14s ease-in-out infinite;
  }

  .ocean-blob--c {
    background: radial-gradient(circle at 40% 40%, rgba(202, 240, 248, 0.25), transparent 55%),
      radial-gradient(circle at 65% 55%, rgba(144, 224, 239, 0.28), transparent 60%),
      radial-gradient(circle at 50% 50%, rgba(0, 119, 182, 0.45), transparent 70%);
    animation: float 16s ease-in-out infinite;
  }

  /* Premium text shimmer */
  .text-shimmer {
    background-image: linear-gradient(90deg, #caf0f8, #90e0ef, #caf0f8);
    background-size: 220% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: shimmer 10s ease-in-out infinite;
  }

  /* Subtle interactions */
  .feature-card:hover {
    border-color: rgba(144, 224, 239, 0.55);
  }

  /* Scrollbar styling (destinations scroller) */
  .hide-scrollbar {
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE/Edge legacy */
  }
  .hide-scrollbar::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }

  /* Motion helpers -- browser auto-promotes animated elements; no will-change needed */

  .ocean-float {
    animation: float 18s ease-in-out infinite;
  }
  .ocean-drift {
    animation: drift 20s ease-in-out infinite;
  }
  .ocean-pulse {
    animation: pulse-glow 16s ease-in-out infinite;
  }

  @keyframes float {
    0%,
    100% {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 0.38;
    }
    50% {
      transform: translate3d(0, -18px, 0) scale(1.05);
      opacity: 0.58;
    }
  }

  @keyframes pulse-glow {
    0%,
    100% {
      transform: scale(0.98);
      opacity: 0.35;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.6;
    }
  }

  @keyframes drift {
    0%,
    100% {
      transform: translate3d(0, 0, 0) scale(1);
      opacity: 0.42;
    }
    50% {
      transform: translate3d(26px, 14px, 0) scale(1.04);
      opacity: 0.6;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* Respect user motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .motion-slow,
    .ocean-float,
    .ocean-drift,
    .ocean-pulse,
    .text-shimmer {
      animation: none !important;
    }
  }

</style>
