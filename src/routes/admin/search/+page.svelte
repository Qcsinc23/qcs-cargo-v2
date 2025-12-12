<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Card } from '$lib/components/ui/card';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { Search, Package, CalendarDays, Users, Receipt, ArrowRight } from 'lucide-svelte';
  import { cn } from '$lib/utils';

  $: q = ($page.url.searchParams.get('q') || '').trim();
  let query = q;

  // Mock search results (wire to PocketBase next)
  $: results = !q
    ? []
    : [
        { type: 'shipment', id: 'SH-2024-0162', label: 'Shipment SH-2024-0162', meta: 'Patricia W. · Trinidad', href: '/admin/shipments/SH-2024-0162' },
        { type: 'booking', id: 'BK-2024-0095', label: 'Booking BK-2024-0095', meta: 'Maria G. · 10:00 AM', href: '/admin/bookings/BK-2024-0095' },
        { type: 'user', id: 'usr-3', label: 'User: Maria Garcia', meta: 'maria.g@email.com', href: '/admin/users/usr-3' },
        { type: 'invoice', id: 'INV-2024-0089', label: 'Invoice INV-2024-0089', meta: '$234.50 · Paid', href: '/admin/invoices/INV-2024-0089' }
      ].filter((r) => (r.label + ' ' + r.meta + ' ' + r.id).toLowerCase().includes(q.toLowerCase()));

  function iconFor(type: string) {
    if (type === 'shipment') return Package;
    if (type === 'booking') return CalendarDays;
    if (type === 'user') return Users;
    return Receipt;
  }

  function submit() {
    const next = query.trim();
    goto(next ? `/admin/search?q=${encodeURIComponent(next)}` : '/admin/search');
  }
</script>

<svelte:head>
  <title>Search | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6 max-w-4xl">
  <div>
    <h1 class="text-2xl font-bold text-slate-900">Search</h1>
    <p class="text-slate-500">Search shipments, bookings, users, and invoices.</p>
  </div>

  <Card class="p-4">
    <form class="flex gap-2" on:submit|preventDefault={submit}>
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input class="pl-10" placeholder="Try: SH-2024-0162, maria, INV-..." bind:value={query} />
      </div>
      <Button type="submit">Search</Button>
    </form>
  </Card>

  <Card class="overflow-hidden">
    <div class="p-4 border-b bg-slate-50">
      <h2 class="font-semibold text-slate-900">
        {#if q}
          Results for “{q}”
        {:else}
          Results
        {/if}
      </h2>
    </div>

    {#if !q}
      <div class="p-6 text-sm text-slate-600">
        Enter a query to search.
      </div>
    {:else if results.length === 0}
      <div class="p-6 text-sm text-slate-600">
        No results found.
      </div>
    {:else}
      <div class="divide-y">
        {#each results as r (r.type + r.id)}
          {@const Icon = iconFor(r.type)}
          <a href={r.href} class="block p-4 hover:bg-slate-50">
            <div class="flex items-center gap-3">
              <div class={cn(
                'p-2 rounded-lg',
                r.type === 'shipment' ? 'bg-purple-100' :
                r.type === 'booking' ? 'bg-amber-100' :
                r.type === 'user' ? 'bg-blue-100' :
                'bg-green-100'
              )}>
                <Icon class="h-4 w-4 text-slate-700" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-slate-900">{r.label}</p>
                <p class="text-xs text-slate-500 truncate">{r.meta}</p>
              </div>
              <ArrowRight class="h-4 w-4 text-slate-400" />
            </div>
          </a>
        {/each}
      </div>
    {/if}
  </Card>
</div>






