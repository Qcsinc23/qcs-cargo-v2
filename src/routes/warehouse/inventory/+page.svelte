<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';  
  import {
    Package, Search, Filter, MapPin, Scale, AlertTriangle,
    Loader2, RefreshCw, QrCode, Tag
  } from 'lucide-svelte';

  interface Package {
    id: string;
    tracking_number: string;
    status: string;
    location?: string;
    weight_actual?: number;
    weight_lbs?: number;
    destination: string;
    contents_description?: string;
    exception_type?: string;
    created: string;
  }

  let packages: Package[] = [];
  let loading = true;
  let searchQuery = '';
  let locationFilter = '';
  let statusFilter = 'all';

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-700',
    received: 'bg-blue-100 text-blue-700',
    processing: 'bg-yellow-100 text-yellow-700',
    in_transit: 'bg-indigo-100 text-indigo-700',
    customs: 'bg-orange-100 text-orange-700',
    out_for_delivery: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    exception: 'bg-red-100 text-red-700'
  };

  const DEST_FLAGS: Record<string, string> = {
    guyana: '🇬🇾', jamaica: '🇯🇲', trinidad: '🇹🇹', barbados: '🇧🇧', suriname: '🇸🇷'
  };

  $: filtered = packages.filter(p => {
    const qs = searchQuery.toLowerCase();
    const matchSearch = !qs ||
      p.tracking_number.toLowerCase().includes(qs) ||
      (p.contents_description || '').toLowerCase().includes(qs) ||
      (p.location || '').toLowerCase().includes(qs);
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchLocation = !locationFilter || (p.location || '').toLowerCase().includes(locationFilter.toLowerCase());
    return matchSearch && matchStatus && matchLocation;
  });

  async function loadInventory() {
    loading = true;
    try {
      const res = await fetch('/api/warehouse/packages?location=true');
      if (res.ok) {
        const data = await res.json();
        packages = data.items || data || [];
      }
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  }

  onMount(loadInventory);

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
</script>

<svelte:head>
  <title>Inventory | Warehouse | QCS Cargo</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Inventory</h1>
      <p class="text-gray-500">All packages currently in the warehouse</p>
    </div>
    <Button variant="outline" on:click={loadInventory} disabled={loading}>
      <RefreshCw class="w-4 h-4 mr-2 {loading ? 'animate-spin' : ''}" />
      Refresh
    </Button>
  </div>

  <!-- Stats row -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {#each [
      { label: 'Total Packages', value: packages.length, color: 'text-gray-900' },
      { label: 'Received', value: packages.filter(p => p.status === 'received').length, color: 'text-blue-600' },
      { label: 'Processing', value: packages.filter(p => p.status === 'processing').length, color: 'text-yellow-600' },
      { label: 'Exceptions', value: packages.filter(p => p.status === 'exception').length, color: 'text-red-600' }
    ] as stat}
      <Card class="p-4 text-center">
        <p class="text-2xl font-bold {stat.color}">{stat.value}</p>
        <p class="text-xs text-gray-500 mt-1">{stat.label}</p>
      </Card>
    {/each}
  </div>

  <!-- Filters -->
  <Card class="p-4">
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input bind:value={searchQuery} placeholder="Search tracking #, contents, location..." class="pl-10" />
      </div>
      <Input bind:value={locationFilter} placeholder="Filter by location..." class="sm:w-48" />
      <select
        bind:value={statusFilter}
        class="px-3 py-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="all">All Status</option>
        <option value="received">Received</option>
        <option value="processing">Processing</option>
        <option value="in_transit">In Transit</option>
        <option value="exception">Exception</option>
      </select>
    </div>
  </Card>

  {#if loading}
    <div class="flex items-center justify-center h-48">
      <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
    </div>
  {:else if filtered.length === 0}
    <Card>
      <CardContent class="p-8 text-center">
        <Package class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="font-medium text-gray-900">No packages found</h3>
        <p class="text-gray-500 mt-1">{searchQuery || locationFilter || statusFilter !== 'all' ? 'Try different filters' : 'No packages are currently in the warehouse'}</p>
      </CardContent>
    </Card>
  {:else}
    <Card class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              {#each ['Tracking #', 'Destination', 'Status', 'Location', 'Weight', 'Received', 'Actions'] as h}
                <th class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
              {/each}
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each filtered as pkg (pkg.id)}
              <tr class="hover:bg-gray-50 {pkg.status === 'exception' ? 'bg-red-50/50' : ''}">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <QrCode class="w-4 h-4 text-gray-300" />
                    <a href="/warehouse/packages/{pkg.id}" class="text-sm font-mono font-medium text-blue-600 hover:underline">
                      {pkg.tracking_number}
                    </a>
                  </div>
                  {#if pkg.contents_description}
                    <p class="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{pkg.contents_description}</p>
                  {/if}
                </td>
                <td class="px-4 py-3 text-sm">
                  {DEST_FLAGS[pkg.destination] || '🌍'} <span class="capitalize ml-1">{pkg.destination}</span>
                </td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium {STATUS_COLORS[pkg.status] || 'bg-gray-100 text-gray-700'}">
                    {#if pkg.status === 'exception'}
                      <AlertTriangle class="w-3 h-3" />
                    {/if}
                    {pkg.status.replace('_', ' ')}
                  </span>
                </td>
                <td class="px-4 py-3">
                  {#if pkg.location}
                    <div class="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin class="w-3 h-3 text-gray-400" />
                      <span class="font-mono">{pkg.location}</span>
                    </div>
                  {:else}
                    <span class="text-gray-400 text-sm">—</span>
                  {/if}
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  {#if pkg.weight_actual}
                    <div class="flex items-center gap-1">
                      <Scale class="w-3 h-3 text-gray-400" />
                      {pkg.weight_actual} lbs
                    </div>
                  {:else if pkg.weight_lbs}
                    <span class="text-gray-400">{pkg.weight_lbs} lbs (est.)</span>
                  {:else}
                    <span class="text-gray-400">—</span>
                  {/if}
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">{formatDate(pkg.created)}</td>
                <td class="px-4 py-3">
                  <Button variant="ghost" size="sm" href="/warehouse/packages/{pkg.id}">View</Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Card>
  {/if}
</div>
