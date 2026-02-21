<script lang="ts">
  import { onMount } from 'svelte';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { CheckCircle, AlertTriangle, XCircle, Clock, RefreshCw, Loader2 } from 'lucide-svelte';

  interface ServiceStatus {
    name: string;
    status: 'operational' | 'degraded' | 'outage' | 'maintenance';
    description?: string;
  }

  interface Incident {
    id: string;
    title: string;
    description: string;
    created: string;
    updates: { time: string; message: string }[];
  }

  let services: ServiceStatus[] = [];
  let incidents: Incident[] = [];
  let loading = true;
  let lastUpdated: Date | null = null;

  const STATUS_CONFIG = {
    operational: { label: 'Operational', color: 'text-green-600', bg: 'bg-green-100', icon: CheckCircle },
    degraded: { label: 'Degraded Performance', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: AlertTriangle },
    outage: { label: 'Outage', color: 'text-red-600', bg: 'bg-red-100', icon: XCircle },
    maintenance: { label: 'Under Maintenance', color: 'text-blue-600', bg: 'bg-blue-100', icon: Clock }
  };

  type StatusKey = 'operational' | 'degraded' | 'outage' | 'maintenance';

  $: overallStatus = (services.length === 0
    ? 'operational'
    : services.some(s => s.status === 'outage')
      ? 'outage'
      : services.some(s => s.status === 'degraded')
        ? 'degraded'
        : services.some(s => s.status === 'maintenance')
          ? 'maintenance'
          : 'operational') as StatusKey;

  async function loadStatus() {
    loading = true;
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        services = data.services || getDefaultServices();
        incidents = data.incidents || [];
        lastUpdated = new Date();
      } else {
        services = getDefaultServices();
      }
    } catch {
      services = getDefaultServices();
    } finally {
      loading = false;
    }
  }

  function getDefaultServices(): ServiceStatus[] {
    return [
      { name: 'Booking System', status: 'operational' },
      { name: 'Online Tracking', status: 'operational' },
      { name: 'Customer Portal', status: 'operational' },
      { name: 'Payment Processing', status: 'operational' },
      { name: 'Email Notifications', status: 'operational' },
      { name: 'Warehouse Operations', status: 'operational' }
    ];
  }

  onMount(loadStatus);

  function formatTime(d: string) {
    return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
</script>

<svelte:head>
  <title>System Status | QCS Cargo</title>
  <meta name="description" content="Real-time status of QCS Cargo services including booking, tracking, and notifications." />
</svelte:head>

<!-- Overall banner -->
<div class="{overallStatus === 'operational' ? 'bg-green-600' : overallStatus === 'degraded' ? 'bg-yellow-500' : overallStatus === 'outage' ? 'bg-red-600' : 'bg-blue-600'} text-white py-16">
  <div class="max-w-4xl mx-auto px-4 text-center">
    {#if loading}
      <Loader2 class="w-12 h-12 animate-spin mx-auto mb-4 opacity-80" />
    {:else}
      {@const cfg = STATUS_CONFIG[overallStatus]}
      <svelte:component this={cfg.icon} class="w-16 h-16 mx-auto mb-4 opacity-90" />
      <h1 class="text-3xl font-bold mb-2">
        {overallStatus === 'operational' ? 'All Systems Operational' :
         overallStatus === 'degraded' ? 'Some Systems Degraded' :
         overallStatus === 'outage' ? 'Service Disruption' : 'Scheduled Maintenance'}
      </h1>
      {#if lastUpdated}
        <p class="text-white/80 text-sm flex items-center justify-center gap-2">
          <Clock class="w-4 h-4" />
          Last updated {lastUpdated.toLocaleTimeString()}
          <button on:click={loadStatus} class="underline hover:no-underline ml-2">
            <RefreshCw class="w-3 h-3 inline" /> Refresh
          </button>
        </p>
      {/if}
    {/if}
  </div>
</div>

<div class="max-w-4xl mx-auto px-4 py-12 space-y-10">
  <!-- Services -->
  <div>
    <h2 class="text-xl font-bold text-gray-900 mb-4">Service Status</h2>
    <Card>
      <div class="divide-y">
        {#each services as service}
          {@const cfg = STATUS_CONFIG[service.status] || STATUS_CONFIG.operational}
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">{service.name}</p>
              {#if service.description}
                <p class="text-sm text-gray-500 mt-0.5">{service.description}</p>
              {/if}
            </div>
            <div class="flex items-center gap-2 {cfg.color}">
              <svelte:component this={cfg.icon} class="w-5 h-5" />
              <span class="text-sm font-medium">{cfg.label}</span>
            </div>
          </div>
        {:else}
          <div class="p-8 text-center text-gray-500">
            <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2" />
            Loading...
          </div>
        {/each}
      </div>
    </Card>
  </div>

  <!-- Incidents -->
  {#if incidents.length > 0}
    <div>
      <h2 class="text-xl font-bold text-gray-900 mb-4">Recent Incidents</h2>
      <div class="space-y-4">
        {#each incidents as incident}
          <Card>
            <CardContent class="p-4">
              <div class="flex items-start justify-between mb-2">
                <h3 class="font-semibold text-gray-900">{incident.title}</h3>
                <span class="text-xs text-gray-400">{formatTime(incident.created)}</span>
              </div>
              <p class="text-sm text-gray-600 mb-3">{incident.description}</p>
              {#if incident.updates?.length > 0}
                <div class="space-y-2 pl-4 border-l-2 border-gray-200">
                  {#each incident.updates as update}
                    <div class="text-sm">
                      <span class="text-gray-400">{formatTime(update.time)}</span>
                      <span class="text-gray-700 ml-2">{update.message}</span>
                    </div>
                  {/each}
                </div>
              {/if}
            </CardContent>
          </Card>
        {/each}
      </div>
    </div>
  {:else if !loading}
    <Card>
      <CardContent class="p-8 text-center">
        <CheckCircle class="w-10 h-10 text-green-500 mx-auto mb-3" />
        <p class="text-gray-500">No incidents in the last 30 days</p>
      </CardContent>
    </Card>
  {/if}

  <div class="text-center text-sm text-gray-400">
    <p>Get notified of status updates via email. <a href="/contact" class="text-primary-600 hover:underline">Contact us</a> to subscribe.</p>
  </div>
</div>
