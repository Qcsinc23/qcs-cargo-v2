<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { toast } from '$lib/stores/toast';
  import {
    Search, Filter, Download, BarChart2, TrendingUp, Package,
    DollarSign, Users, Calendar, FileText, Loader2, RefreshCw
  } from 'lucide-svelte';

  type Period = 'today' | 'week' | 'month' | 'quarter' | 'year';

  let selectedPeriod: Period = 'month';
  let loading = true;
  let exporting = false;

  interface ReportData {
    revenue: { total: number; change: number };
    shipments: { total: number; change: number };
    customers: { total: number; change: number };
    bookings: { total: number; change: number };
    topDestinations: Array<{ destination: string; count: number; revenue: number }>;
    monthlyRevenue: Array<{ month: string; revenue: number; shipments: number }>;
    serviceBreakdown: Array<{ service: string; count: number; percentage: number }>;
  }

  let data: ReportData = {
    revenue: { total: 0, change: 0 },
    shipments: { total: 0, change: 0 },
    customers: { total: 0, change: 0 },
    bookings: { total: 0, change: 0 },
    topDestinations: [],
    monthlyRevenue: [],
    serviceBreakdown: []
  };

  const PERIODS: { value: Period; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  const DESTINATION_FLAGS: Record<string, string> = {
    guyana: '🇬🇾', jamaica: '🇯🇲', trinidad: '🇹🇹', barbados: '🇧🇧', suriname: '🇸🇷'
  };

  async function loadReports() {
    loading = true;
    try {
      const response = await fetch(`/api/admin/reports?period=${selectedPeriod}`);
      if (response.ok) {
        data = await response.json();
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      loading = false;
    }
  }

  async function exportCSV() {
    exporting = true;
    try {
      const response = await fetch(`/api/admin/reports/export?period=${selectedPeriod}&format=csv`);
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qcs-report-${selectedPeriod}-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Report exported successfully');
    } catch (err) {
      toast.error('Failed to export report');
    } finally {
      exporting = false;
    }
  }

  onMount(loadReports);

  $: if (selectedPeriod) loadReports();

  function formatCurrency(n: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
  }

  function formatChange(n: number): string {
    return n >= 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`;
  }
</script>

<svelte:head>
  <title>Reports | Admin | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Reports</h1>
      <p class="text-slate-500">Business performance and operational insights</p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="outline" size="sm" on:click={loadReports} disabled={loading}>
        <RefreshCw class="w-4 h-4 mr-2 {loading ? 'animate-spin' : ''}" />
        Refresh
      </Button>
      <Button size="sm" on:click={exportCSV} disabled={exporting}>
        {#if exporting}
          <Loader2 class="w-4 h-4 mr-2 animate-spin" />
        {:else}
          <Download class="w-4 h-4 mr-2" />
        {/if}
        Export CSV
      </Button>
    </div>
  </div>

  <!-- Period selector -->
  <div class="flex gap-2 flex-wrap">
    {#each PERIODS as period}
      <button
        on:click={() => selectedPeriod = period.value}
        class="px-4 py-1.5 rounded-full text-sm font-medium transition-colors
               {selectedPeriod === period.value
                 ? 'bg-primary-600 text-white'
                 : 'bg-white border text-gray-600 hover:border-primary-400'}"
      >
        {period.label}
      </button>
    {/each}
  </div>

  {#if loading}
    <div class="flex items-center justify-center h-48">
      <Loader2 class="w-8 h-8 animate-spin text-gray-400" />
    </div>
  {:else}
    <!-- KPI Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {#each [
        { label: 'Revenue', value: formatCurrency(data.revenue.total), change: data.revenue.change, icon: DollarSign, color: 'bg-green-500' },
        { label: 'Shipments', value: data.shipments.total, change: data.shipments.change, icon: Package, color: 'bg-blue-500' },
        { label: 'New Customers', value: data.customers.total, change: data.customers.change, icon: Users, color: 'bg-purple-500' },
        { label: 'Bookings', value: data.bookings.total, change: data.bookings.change, icon: Calendar, color: 'bg-orange-500' }
      ] as kpi}
        <Card class="p-5">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-slate-500">{kpi.label}</p>
              <p class="mt-2 text-2xl font-bold text-slate-900">{kpi.value}</p>
              <p class="mt-1 text-sm font-medium {kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}">
                {formatChange(kpi.change)} vs prev period
              </p>
            </div>
            <div class="p-3 rounded-xl {kpi.color}">
              <svelte:component this={kpi.icon} class="w-5 h-5 text-white" />
            </div>
          </div>
        </Card>
      {/each}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Top Destinations -->
      <Card>
        <div class="p-4 border-b bg-slate-50 flex items-center gap-2">
          <BarChart2 class="w-4 h-4 text-slate-400" />
          <h2 class="font-semibold text-slate-900">Top Destinations</h2>
        </div>
        {#if data.topDestinations.length === 0}
          <div class="p-8 text-center text-slate-400">No data for this period</div>
        {:else}
          <div class="divide-y">
            {#each data.topDestinations as dest, i}
              <div class="p-4 flex items-center gap-4">
                <span class="text-lg">{DESTINATION_FLAGS[dest.destination] || '🌍'}</span>
                <div class="flex-1">
                  <p class="font-medium text-slate-900 capitalize">{dest.destination}</p>
                  <div class="mt-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      class="h-1.5 bg-primary-500 rounded-full"
                      style="width: {dest.count / data.topDestinations[0].count * 100}%"
                    ></div>
                  </div>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-slate-900">{dest.count} shipments</p>
                  <p class="text-sm text-slate-500">{formatCurrency(dest.revenue)}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </Card>

      <!-- Service Breakdown -->
      <Card>
        <div class="p-4 border-b bg-slate-50 flex items-center gap-2">
          <TrendingUp class="w-4 h-4 text-slate-400" />
          <h2 class="font-semibold text-slate-900">Service Breakdown</h2>
        </div>
        {#if data.serviceBreakdown.length === 0}
          <div class="p-8 text-center text-slate-400">No data for this period</div>
        {:else}
          <div class="p-4 space-y-4">
            {#each data.serviceBreakdown as service}
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span class="text-slate-700 capitalize">{service.service.replace('_', ' ')}</span>
                  <span class="font-medium">{service.count} ({service.percentage}%)</span>
                </div>
                <div class="bg-gray-100 rounded-full h-2">
                  <div
                    class="h-2 bg-primary-500 rounded-full transition-all"
                    style="width: {service.percentage}%"
                  ></div>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </Card>
    </div>
  {/if}
</div>
