<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import QuickActions from '$lib/components/admin/QuickActions.svelte';
  import {
    Package,
    CalendarDays,
    Users,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Clock,
    AlertTriangle,
    ArrowRight,
    RefreshCw,
    Plane,
    CheckCircle2
  } from 'lucide-svelte';
  import { cn } from '$lib/utils';
  import { STATUS_COLORS, STATUS_LABELS } from '$lib/config/constants';

  interface PendingAction {
    id: string;
    type: 'booking' | 'payment' | 'shipment' | 'user';
    message: string;
    time: string;
    urgent: boolean;
    bookingId?: string;
  }

  interface TodayBooking {
    id: string;
    customer: string;
    destination: string;
    packages: number;
    time: string;
    status: string;
  }

  interface RecentShipment {
    id: string;
    trackingNumber: string;
    destination: string;
    status: string;
    customer: string;
    weight: number;
  }

  interface ScheduleItem {
    id: string;
    time: string;
    event: string;
    type: string;
    customer: string;
    packages: number;
  }

  interface DashboardData {
    kpis: {
      activeShipments: number;
      pendingBookings: number;
      activeCustomers: number;
      revenueMTD: number;
    };
    todayBookings: TodayBooking[];
    pendingActions: PendingAction[];
    recentShipments: RecentShipment[];
    todaySchedule: ScheduleItem[];
  }

  let dashboardData: DashboardData = {
    kpis: {
      activeShipments: 0,
      pendingBookings: 0,
      activeCustomers: 0,
      revenueMTD: 0
    },
    todayBookings: [],
    pendingActions: [],
    recentShipments: [],
    todaySchedule: []
  };

  let loading = true;
  let refreshing = false;

  async function loadDashboardData() {
    try {
      const response = await fetch('/api/admin/dashboard');
      if (response.ok) {
        const data = await response.json();
        dashboardData = data;
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      loading = false;
      refreshing = false;
    }
  }

  async function refresh() {
    refreshing = true;
    await loadDashboardData();
  }

  onMount(() => {
    loadDashboardData();
  });

  // KPI configuration
  const kpiConfig = [
    {
      id: 'activeShipments',
      label: 'Active Shipments',
      icon: Package,
      color: 'bg-blue-500'
    },
    {
      id: 'pendingBookings',
      label: 'Pending Bookings',
      icon: CalendarDays,
      color: 'bg-amber-500'
    },
    {
      id: 'activeCustomers',
      label: 'Active Customers',
      icon: Users,
      color: 'bg-emerald-500'
    },
    {
      id: 'revenueMTD',
      label: 'Revenue (MTD)',
      icon: DollarSign,
      color: 'bg-purple-500'
    }
  ] as const;

  function getKpiValue(kpiId: string): number | string {
    const kpis = dashboardData.kpis;
    switch (kpiId) {
      case 'activeShipments': return kpis.activeShipments;
      case 'pendingBookings': return kpis.pendingBookings;
      case 'activeCustomers': return kpis.activeCustomers;
      case 'revenueMTD': return `$${kpis.revenueMTD.toFixed(2)}`;
      default: return 0;
    }
  }
</script>

<svelte:head>
  <title>Admin Dashboard | QCS Cargo</title>
</svelte:head>

<div class="p-6 space-y-6">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p class="text-slate-500">Welcome back! Here's what's happening today.</p>
    </div>
    <div class="flex items-center gap-3">
      <Button variant="outline" size="sm" on:click={refresh} disabled={refreshing || loading}>
        <RefreshCw class={cn('h-4 w-4 mr-2', refreshing && 'animate-spin')} />
        Refresh
      </Button>
      <Button size="sm" href="/admin/shipments/new">
        <Package class="h-4 w-4 mr-2" />
        New Shipment
      </Button>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center h-64">
      <RefreshCw class="h-8 w-8 animate-spin text-slate-400" />
    </div>
  {:else}
    <!-- KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {#each kpiConfig as kpi (kpi.id)}
        {@const value = getKpiValue(kpi.id)}
        <Card class="p-5">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm font-medium text-slate-500">{kpi.label}</p>
              <p class="mt-2 text-3xl font-bold text-slate-900">{value}</p>
              <div class="mt-2 flex items-center gap-1 text-sm">
                <TrendingUp class="h-4 w-4 text-emerald-500" />
                <span class="text-emerald-600">Live</span>
                <span class="text-slate-400">· Updated now</span>
              </div>
            </div>
            <div class={cn('p-3 rounded-xl', kpi.color)}>
              <svelte:component this={kpi.icon} class="h-6 w-6 text-white" />
            </div>
          </div>
        </Card>
      {/each}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Pending Actions -->
      <Card class="lg:col-span-2 overflow-hidden">
        <div class="p-4 border-b bg-slate-50 flex items-center justify-between">
          <h2 class="font-semibold text-slate-900">Pending Actions</h2>
          <span class="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">
            {dashboardData.pendingActions.filter(a => a.urgent).length} urgent
          </span>
        </div>
        {#if dashboardData.pendingActions.length === 0}
          <div class="p-8 text-center">
            <CheckCircle2 class="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p class="text-slate-500">All caught up! No pending actions.</p>
          </div>
        {:else}
          <div class="divide-y">
            {#each dashboardData.pendingActions as action (action.id)}
              <div class="p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors">
                <div class={cn(
                  'p-2 rounded-lg',
                  action.urgent ? 'bg-red-100' : 'bg-slate-100'
                )}>
                  {#if action.type === 'booking'}
                    <CalendarDays class={cn('h-4 w-4', action.urgent ? 'text-red-600' : 'text-slate-600')} />
                  {:else if action.type === 'payment'}
                    <DollarSign class={cn('h-4 w-4', action.urgent ? 'text-red-600' : 'text-slate-600')} />
                  {:else if action.type === 'shipment'}
                    <Package class={cn('h-4 w-4', action.urgent ? 'text-red-600' : 'text-slate-600')} />
                  {:else}
                    <Users class={cn('h-4 w-4', action.urgent ? 'text-red-600' : 'text-slate-600')} />
                  {/if}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-slate-900">{action.message}</p>
                  <p class="text-xs text-slate-500 mt-1">{action.time}</p>
                </div>
                <Button variant="ghost" size="sm" href={action.type === 'booking' ? `/admin/bookings/${action.bookingId}` : '/admin/activity'}>
                  <ArrowRight class="h-4 w-4" />
                </Button>
              </div>
            {/each}
          </div>
        {/if}
        <div class="p-3 border-t bg-slate-50">
          <Button variant="ghost" size="sm" class="w-full" href="/admin/activity">
            View All Activity
          </Button>
        </div>
      </Card>

      <!-- Today's Schedule -->
      <Card class="overflow-hidden">
        <div class="p-4 border-b bg-slate-50 flex items-center justify-between">
          <h2 class="font-semibold text-slate-900">Today's Schedule</h2>
          <Clock class="h-4 w-4 text-slate-400" />
        </div>
        {#if dashboardData.todaySchedule.length === 0}
          <div class="p-8 text-center">
            <CalendarDays class="h-12 w-12 text-slate-400 mx-auto mb-3" />
            <p class="text-slate-500">No bookings scheduled for today</p>
          </div>
        {:else}
          <div class="divide-y">
            {#each dashboardData.todaySchedule as item, i}
              <div class="p-3 flex items-center gap-3">
                <div class="text-center min-w-[60px]">
                  <p class="text-xs font-medium text-slate-900">{item.time}</p>
                </div>
                <div class={cn(
                  'w-2 h-2 rounded-full',
                  item.type === 'Outbound Flight' ? 'bg-blue-500' : 'bg-emerald-500'
                )}></div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-slate-900 truncate">{item.customer}</p>
                  <p class="text-xs text-slate-500">{item.type} · {item.packages} pkg{item.packages > 1 ? 's' : ''}</p>
                </div>
                {#if item.type === 'Outbound Flight'}
                  <Plane class="h-4 w-4 text-blue-500" />
                {/if}
              </div>
            {/each}
          </div>
        {/if}
        <div class="p-3 border-t bg-slate-50">
          <Button variant="ghost" size="sm" class="w-full" href="/admin/bookings">
            View Full Schedule
          </Button>
        </div>
      </Card>
    </div>

    <!-- Recent Shipments -->
    <Card class="overflow-hidden">
      <div class="p-4 border-b bg-slate-50 flex items-center justify-between">
        <h2 class="font-semibold text-slate-900">Recent Shipments</h2>
        <Button variant="ghost" size="sm" href="/admin/shipments">
          View All
          <ArrowRight class="ml-2 h-4 w-4" />
        </Button>
      </div>
      {#if dashboardData.recentShipments.length === 0}
        <div class="p-8 text-center">
          <Package class="h-12 w-12 text-slate-400 mx-auto mb-3" />
          <p class="text-slate-500">No shipments found</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-slate-50 border-b">
              <tr>
                <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Tracking #</th>
                <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Customer</th>
                <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Destination</th>
                <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Weight</th>
                <th class="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th class="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y">
              {#each dashboardData.recentShipments as shipment (shipment.id)}
                {@const statusColor = STATUS_COLORS[shipment.status] || STATUS_COLORS.pending}
                <tr class="hover:bg-slate-50">
                  <td class="px-4 py-3">
                    <a href={`/admin/shipments/${shipment.id}`} class="text-sm font-medium text-blue-600 hover:underline">
                      {shipment.id}
                    </a>
                  </td>
                  <td class="px-4 py-3 text-sm text-slate-900">{shipment.customer}</td>
                  <td class="px-4 py-3 text-sm text-slate-600">{shipment.destination}</td>
                  <td class="px-4 py-3 text-sm text-slate-600">{shipment.weight}</td>
                  <td class="px-4 py-3">
                    <span class={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      statusColor.bg, statusColor.text
                    )}>
                      {STATUS_LABELS[shipment.status] || shipment.status}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" href={`/admin/shipments/${shipment.id}`}>
                      View
                    </Button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </Card>
  {/if}

  <!-- Quick Actions -->
  <Card class="p-6">
    <h2 class="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
    <QuickActions on:printLabels={() => alert('Opening label printer...')} on:sendNotification={() => alert('Opening notification composer...')} />
  </Card>
</div>

