<script lang="ts">
  import { page } from '$app/stores';
  import { COMPANY } from '$lib/config/constants';
  import { FileText, Shield, Truck } from 'lucide-svelte';

  const legalPages = [
    { href: '/legal/terms', label: 'Terms of Service', icon: FileText },
    { href: '/legal/privacy', label: 'Privacy Policy', icon: Shield },
    { href: '/legal/shipping-policy', label: 'Shipping Policy', icon: Truck }
  ];
</script>

<div class="min-h-screen bg-slate-50">
  <!-- Header -->
  <section class="bg-gradient-to-br from-slate-800 to-slate-900 py-12 text-white">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl md:text-4xl font-bold">Legal</h1>
        <p class="text-slate-300 mt-2">
          Important information about using {COMPANY.name} services
        </p>
      </div>
    </div>
  </section>

  <!-- Navigation -->
  <div class="bg-white border-b sticky top-0 z-10">
    <div class="container mx-auto px-4">
      <nav class="max-w-4xl mx-auto flex gap-1 overflow-x-auto py-2" aria-label="Legal pages">
        {#each legalPages as legalPage}
          {@const isActive = $page.url.pathname === legalPage.href}
          <a
            href={legalPage.href}
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              {isActive 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-slate-600 hover:bg-slate-100'}"
          >
            <svelte:component this={legalPage.icon} class="w-4 h-4" />
            {legalPage.label}
          </a>
        {/each}
      </nav>
    </div>
  </div>

  <!-- Content -->
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-4xl mx-auto">
      <article class="bg-white rounded-xl shadow-sm p-8 md:p-12 prose prose-slate max-w-none
        prose-headings:text-slate-900 
        prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-slate-600 prose-p:leading-relaxed
        prose-li:text-slate-600
        prose-a:text-primary-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-slate-900">
        <slot />
      </article>
    </div>
  </div>

  <!-- Footer note -->
  <div class="container mx-auto px-4 pb-12">
    <div class="max-w-4xl mx-auto text-center text-sm text-slate-500">
      <p>
        Questions about our policies? 
        <a href="/contact" class="text-primary-600 hover:underline">Contact us</a> or call 
        <a href={`tel:${COMPANY.phone}`} class="text-primary-600 hover:underline">{COMPANY.phone}</a>
      </p>
    </div>
  </div>
</div>

