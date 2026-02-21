<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { toast } from '$lib/stores/toast';
  import {
    Package, Users, DollarSign, Plane, FileText,
    Loader2, Plus, Search, ArrowLeft, ArrowRight,
    Filter, Download, Eye, CheckCircle
  } from 'lucide-svelte';

  interface Manifest {
    id: string;
    manifest_number: string;
    destination: string;
    flight_number?: string;
    departure_date?: string;
    status: 'open' | 'closed' | 'in_transit' | 'arrived' | 'cleared';
    total_pieces: number;
    total_weight_lbs: number;
    awb_number?: string;
    created: string;
  }

  let manifests: Manifest[] = [];
  let loading = true;
  let searchQuery = '';
  let statusFilter = 'all';

  const STATUS_COLORS: Record<string, string> = {
    open: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
    in_transit: 'bg-blue-100 text-blue-700',
    arrived: 'bg-purple-100 text-purple-700',
    cleared: 'bg-emerald-100 text-emerald-700'
  };

  const DEST_FLAGS: Record<string, string> = {
    guyana: '🇬🇾', jamaica: '🇯🇲', trinidad: '🇹🇹', barbados: '🇧🇧', suriname: '🇸🇷'
  };

  $: filtered = manifests.filter(m => {
    const matchSearch = !searchQuery ||
      m.manifest_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.flight_number || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  onMount(async () => {
    try {
      const res = await fetch('/api/admin/manifests');
      if (res.ok) {
        const data = await res.json();
        manifests = data.items || data || [];
      }
    } catch (err) {
      console.error(err);
    } finally {
      loading = false;
    }
  });

  async function downloadPDF(manifest: Manifest) {
    try {
      const res = await fetch(`/api/warehouse/manifests/${manifest.id}/pdf`);
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manifest-${manifest.manifest_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download manifest PDF');
    }
  }

  function formatDate(d: string) {
    return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  }
</script>

<svelte:head>
  <title>Manifests | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Manifests</h1>
      <p class="text-slate-500">View and manage all shipping manifests</p>
    </div>
    <Button href="/warehouse/manifests?new=true">
      <Plus class="w-4 h-4 mr-2" />
      New Manifest
    </Button>
  </div>

  <!-- Filters -->
  <Card class="p-4">
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input bind:value={searchQuery} placeholder="Search by manifest #, destination, flight..." class="pl-10" />
      </div>
      <select
        bind:value={statusFilter}
        class="px-3 py-2 border rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="all">All Status</option>
        <option value="open">Open</option>
        <option value="closed">Closed</option>
        <option value="in_transit">In Transit</option>
        <option value="arrived">Arrived</option>
        <option value="cleared">Cleared</option>
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
        <FileText class="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 class="font-medium text-gray-900">{searchQuery || statusFilter !== 'all' ? 'No matching manifests' : 'No manifests yet'}</h3>
        <p class="text-gray-500 mt-1">{searchQuery || statusFilter !== 'all' ? 'Try different filters' : 'Create your first manifest in the warehouse module'}</p>
      </CardContent>
    </Card>
  {:else}
    <Card class="overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-slate-50 border-b">
            <tr>
              {#each ['Manifest #', 'Destination', 'Flight', 'Departure', 'Pieces', 'Weight', 'Status', 'Actions'] as h}
                <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">{h}</th>
              {/each}
            </tr>
          </thead>
          <tbody class="divide-y">
            {#each filtered as m (m.id)}
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3">
                  <a href="/warehouse/manifests/{m.id}" class="text-sm font-medium text-blue-600 hover:underline">
                    {m.manifest_number}
                  </a>
                </td>
                <td class="px-4 py-3 text-sm">
                  {DEST_FLAGS[m.destination] || ''} <span class="capitalize ml-1">{m.destination}</span>
                </td>
                <td class="px-4 py-3 text-sm text-slate-600">{m.flight_number || '—'}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{formatDate(m.departure_date || '')}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{m.total_pieces}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{m.total_weight_lbs} lbs</td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {STATUS_COLORS[m.status] || 'bg-gray-100 text-gray-700'}">
                    {m.status.replace('_', ' ')}
                  </span>
                </td>
                <td class="px-4 py-3 flex items-center gap-2">
                  <Button variant="ghost" size="sm" href="/warehouse/manifests/{m.id}">
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" on:click={() => downloadPDF(m)}>
                    <Download class="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </Card>
  {/if}
</div>
