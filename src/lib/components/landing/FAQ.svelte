<script lang="ts">
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { FAQS, FAQ_CATEGORIES } from '$lib/config/constants';
  import { ChevronDown, Search, Package, MapPin, AlertTriangle, CreditCard, FileText } from 'lucide-svelte';

  let searchQuery = '';
  let activeCategory = 'all';
  let expandedFaq: number | null = null;

  const categoryIcons: Record<string, typeof Package> = {
    shipping: Package,
    tracking: MapPin,
    prohibited: AlertTriangle,
    payment: CreditCard,
    customs: FileText
  };

  $: filteredFaqs = FAQS.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function toggleFaq(id: number) {
    expandedFaq = expandedFaq === id ? null : id;
  }
</script>

<section class="py-24 sm:py-32 bg-background">
  <div class="container mx-auto px-4">
    <div class="text-center mb-16">
      <Badge variant="secondary" class="mb-5">Help Center</Badge>
      <h2 class="font-display text-4xl md:text-5xl text-foreground mb-5">
        Frequently Asked Questions
      </h2>
      <p class="text-base sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto font-light leading-relaxed tracking-wide">
        Find answers to common questions about shipping, tracking, and more.
      </p>
    </div>

    <!-- Search -->
    <div class="max-w-xl mx-auto mb-10">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/60" />
        <input
          type="text"
          bind:value={searchQuery}
          placeholder="Search questions..."
          class="w-full pl-12 pr-4 py-3 rounded-xl border border-border/40 bg-card text-foreground placeholder:text-muted-foreground/60 focus:border-[#0077B6]/40 focus:ring-2 focus:ring-[#0077B6]/15 outline-none transition-all"
        />
      </div>
    </div>

    <!-- Categories -->
    <div class="flex flex-wrap justify-center gap-2 mb-8">
      <Button
        variant={activeCategory === 'all' ? 'default' : 'outline'}
        size="sm"
        on:click={() => activeCategory = 'all'}
      >
        All
      </Button>
      {#each FAQ_CATEGORIES as category}
        {@const Icon = categoryIcons[category.id] || Package}
        <Button
          variant={activeCategory === category.id ? 'default' : 'outline'}
          size="sm"
          on:click={() => activeCategory = category.id}
          class="gap-2"
        >
          <svelte:component this={Icon} class="w-4 h-4" />
          {category.name}
        </Button>
      {/each}
    </div>

    <!-- FAQ List -->
    <div class="max-w-3xl mx-auto space-y-4">
      {#each filteredFaqs as faq (faq.id)}
        <div class="bg-card rounded-xl border border-border/30 shadow-sm overflow-hidden">
          <button
            class="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-muted/60 transition-colors"
            on:click={() => toggleFaq(faq.id)}
          >
            <span class="font-medium text-foreground pr-4">{faq.question}</span>
            <ChevronDown 
              class="w-5 h-5 text-muted-foreground/60 flex-shrink-0 transition-transform {expandedFaq === faq.id ? 'rotate-180' : ''}" 
            />
          </button>
          {#if expandedFaq === faq.id}
            <div class="px-6 pb-4 text-muted-foreground/85 border-t border-border/30 bg-muted/40">
              <p class="pt-4">{faq.answer}</p>
            </div>
          {/if}
        </div>
      {:else}
        <div class="text-center py-12 text-muted-foreground/80">
          <p>No questions found matching your search.</p>
        </div>
      {/each}
    </div>

    <!-- Contact CTA -->
    <div class="mt-16 text-center">
      <p class="text-muted-foreground/80 mb-6 font-light tracking-wide">
        Still have questions? We're here to help.
      </p>
      <Button href="/contact">
        Contact Support
      </Button>
    </div>
  </div>
</section>






