<script lang="ts">
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
  import { Search, AlertTriangle, Ban, AlertCircle, Check, Info } from 'lucide-svelte';
  import { PROHIBITED_ITEMS, checkProhibitedItem, type ProhibitedItem } from '$lib/config/prohibited';

  let searchQuery = '';
  let searchResults: ProhibitedItem[] = [];
  let hasSearched = false;

  function handleSearch() {
    if (!searchQuery.trim()) {
      searchResults = [];
      hasSearched = false;
      return;
    }
    
    searchResults = checkProhibitedItem(searchQuery);
    hasSearched = true;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  // Group items by category for display
  const prohibitedItems = PROHIBITED_ITEMS.filter(item => item.category === 'prohibited');
  const restrictedItems = PROHIBITED_ITEMS.filter(item => item.category === 'restricted');
</script>

<div class="max-w-4xl mx-auto">
  <!-- Search Card -->
  <Card class="mb-8">
    <CardHeader class="text-center">
      <CardTitle class="flex items-center justify-center gap-2 text-2xl">
        <Search class="w-6 h-6" />
        Check If Your Item Can Be Shipped
      </CardTitle>
      <CardDescription>
        Enter an item name to check if it's allowed for shipping
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex gap-3 max-w-xl mx-auto">
        <Input
          bind:value={searchQuery}
          placeholder="e.g., perfume, battery, medicine..."
          class="flex-1"
          on:keydown={handleKeydown}
          on:input={handleSearch}
        />
      </div>

      <!-- Search Results -->
      {#if hasSearched}
        <div class="mt-6">
          {#if searchResults.length === 0}
            <Alert class="bg-green-50 border-green-200">
              <Check class="w-4 h-4 text-green-600" />
              <AlertTitle class="text-green-800">Looks Good!</AlertTitle>
              <AlertDescription class="text-green-700">
                No restrictions found for "{searchQuery}". However, please ensure your item complies with 
                destination country regulations. When in doubt, contact us.
              </AlertDescription>
            </Alert>
          {:else}
            <div class="space-y-3">
              {#each searchResults as item}
                {#if item.category === 'prohibited'}
                  <Alert variant="destructive">
                    <Ban class="w-4 h-4" />
                    <AlertTitle>Prohibited: {item.name}</AlertTitle>
                    <AlertDescription>
                      <p>{item.reason}</p>
                      <p class="mt-2 font-medium">This item cannot be shipped under any circumstances.</p>
                    </AlertDescription>
                  </Alert>
                {:else}
                  <Alert class="bg-amber-50 border-amber-200">
                    <AlertTriangle class="w-4 h-4 text-amber-600" />
                    <AlertTitle class="text-amber-800">Restricted: {item.name}</AlertTitle>
                    <AlertDescription class="text-amber-700">
                      <p>{item.reason}</p>
                      {#if item.note}
                        <p class="mt-2 font-medium">{item.note}</p>
                      {/if}
                    </AlertDescription>
                  </Alert>
                {/if}
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </CardContent>
  </Card>

  <!-- Full Lists -->
  <div class="grid md:grid-cols-2 gap-6">
    <!-- Prohibited -->
    <Card class="border-red-200">
      <CardHeader class="bg-red-50 border-b border-red-200">
        <CardTitle class="flex items-center gap-2 text-red-800">
          <Ban class="w-5 h-5" />
          Prohibited Items
        </CardTitle>
        <CardDescription class="text-red-600">
          These items cannot be shipped under any circumstances
        </CardDescription>
      </CardHeader>
      <CardContent class="pt-4">
        <ul class="space-y-3">
          {#each prohibitedItems as item}
            <li class="flex items-start gap-3 p-3 rounded-lg bg-red-50/50">
              <AlertCircle class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-medium text-foreground">{item.name}</p>
                <p class="text-sm text-muted-foreground/85">{item.reason}</p>
              </div>
            </li>
          {/each}
        </ul>
      </CardContent>
    </Card>

    <!-- Restricted -->
    <Card class="border-amber-200">
      <CardHeader class="bg-amber-50 border-b border-amber-200">
        <CardTitle class="flex items-center gap-2 text-amber-800">
          <AlertTriangle class="w-5 h-5" />
          Restricted Items
        </CardTitle>
        <CardDescription class="text-amber-600">
          These items can be shipped with conditions
        </CardDescription>
      </CardHeader>
      <CardContent class="pt-4">
        <ul class="space-y-3">
          {#each restrictedItems as item}
            <li class="p-3 rounded-lg bg-amber-50/50">
              <div class="flex items-start gap-3">
                <Info class="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p class="font-medium text-foreground">{item.name}</p>
                  <p class="text-sm text-muted-foreground/85">{item.reason}</p>
                  {#if item.note}
                    <p class="text-sm text-amber-700 mt-1 font-medium">{item.note}</p>
                  {/if}
                </div>
              </div>
            </li>
          {/each}
        </ul>
      </CardContent>
    </Card>
  </div>

  <!-- Disclaimer -->
  <div class="mt-10 p-5 bg-muted/60 rounded-xl border border-border/30 text-sm text-muted-foreground/85">
    <p class="font-medium mb-2">Important Notice</p>
    <p>
      This list is not exhaustive. Regulations may vary by destination country and are subject to change. 
      Items not listed here may still be prohibited or restricted. When in doubt, please 
      <a href="/contact" class="text-[#023E8A] hover:underline">contact us</a> before shipping.
    </p>
  </div>
</div>






