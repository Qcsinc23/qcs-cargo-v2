<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getPerformanceTracker } from './tracker';
  import { getMetricsService } from './metrics-service';
  import { formatMetricValue, getPerformanceRating } from './utils';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import PerformanceDashboard from './PerformanceDashboard.svelte';
  import type { PerformanceAlert } from './types';
  import {
    Gauge,
    AlertTriangle,
    Activity,
    TrendingUp,
    X,
    ChevronUp,
    ChevronDown
  } from 'lucide-svelte';

  // Props
  export let position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right';
  export let showScore: boolean = true;
  export let showVitals: boolean = true;
  export let showAlerts: boolean = true;
  export let collapsible: boolean = true;
  export let initialCollapsed: boolean = false;

  // Internal state
  let showDashboard = false;
  let collapsed = initialCollapsed;
  let currentScore = 0;
  let currentVitals: any = {};
  let alerts: PerformanceAlert[] = [];
  let lastUpdate = Date.now();
  let updateInterval: ReturnType<typeof setInterval> | null = null;

  // Position classes
  $: positionClasses = {
    'bottom-right': 'fixed bottom-4 right-4',
    'bottom-left': 'fixed bottom-4 left-4',
    'top-right': 'fixed top-4 right-4',
    'top-left': 'fixed top-4 left-4',
  }[position];

  // Computed values
  $: scoreRating = getPerformanceRating(currentScore);
  $: hasAlerts = alerts.length > 0;
  $: criticalAlerts = alerts.filter((a) => a.severity === 'critical').length;
  $: highAlerts = alerts.filter((a) => a.severity === 'high').length;

  onMount(() => {
    updateMetrics();
    updateInterval = setInterval(updateMetrics, 5000);
  });

  onDestroy(() => {
    if (updateInterval) clearInterval(updateInterval);
  });

  function updateMetrics() {
    const tracker = getPerformanceTracker();
    const metricsService = getMetricsService();

    const report = tracker.generateReport();
    if (report) {
      currentScore = report.score;
      currentVitals = report.vitals;
      lastUpdate = Date.now();
    }

    alerts = metricsService.getRecentAlerts(1); // Last hour
  }

  function toggleCollapse() {
    if (collapsible) {
      collapsed = !collapsed;
    }
  }
</script>

{#if import.meta.env.DEV || true}
  <!-- Widget Container -->
  <div class="{positionClasses} z-40 {collapsible && collapsed ? 'h-12' : 'h-auto'} transition-all duration-300">
    <Card class="shadow-lg border-2 {hasAlerts ? 'border-red-500' : ''} min-w-[200px] max-w-sm">
      <CardContent class="p-3">
        <!-- Header -->
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <Gauge class="h-4 w-4" />
            <span class="text-sm font-semibold">Performance</span>
            {#if hasAlerts}
              <Badge variant="destructive" class="text-xs">
                {criticalAlerts + highAlerts}
              </Badge>
            {/if}
          </div>
          <div class="flex items-center gap-1">
            {#if collapsible}
              <Button variant="ghost" size="icon" class="h-6 w-6" on:click={toggleCollapse}>
                {#if collapsed}
                  <ChevronUp class="h-3 w-3" />
                {:else}
                  <ChevronDown class="h-3 w-3" />
                {/if}
              </Button>
            {/if}
            <Button variant="ghost" size="icon" class="h-6 w-6" on:click={() => showDashboard = true}>
              <Activity class="h-3 w-3" />
            </Button>
          </div>
        </div>

        {#if !collapsed}
          <!-- Content -->
          <div class="space-y-3">
            {#if showScore}
              <!-- Score Display -->
              <div class="flex items-center justify-between">
                <span class="text-xs text-muted-foreground">Score</span>
                <div class="flex items-center gap-2">
                  <span class="text-lg font-bold" style="color: {scoreRating.color}">
                    {currentScore}
                  </span>
                  <Badge variant="outline" style="color: {scoreRating.color}; border-color: {scoreRating.color}">
                    {scoreRating.rating}
                  </Badge>
                </div>
              </div>
            {/if}

            {#if showVitals}
              <!-- Quick Vitals -->
              <div class="grid grid-cols-3 gap-2 text-xs">
                <div class="text-center">
                  <div class="font-semibold">{formatMetricValue(currentVitals.lcp || 0, 'lcp')}</div>
                  <div class="text-muted-foreground">LCP</div>
                </div>
                <div class="text-center">
                  <div class="font-semibold">{formatMetricValue(currentVitals.fid || 0, 'fid')}</div>
                  <div class="text-muted-foreground">FID</div>
                </div>
                <div class="text-center">
                  <div class="font-semibold">{formatMetricValue(currentVitals.cls || 0, 'cls')}</div>
                  <div class="text-muted-foreground">CLS</div>
                </div>
              </div>
            {/if}

            {#if showAlerts && hasAlerts}
              <!-- Alert Summary -->
              <div class="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
                <AlertTriangle class="h-3 w-3" />
                <span>{alerts.length} alert{alerts.length !== 1 ? 's' : ''}</span>
              </div>
            {/if}

            <!-- Last Update -->
            <div class="text-xs text-muted-foreground text-center">
              Updated {Math.round((Date.now() - lastUpdate) / 1000)}s ago
            </div>
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>

  <!-- Dashboard Modal -->
  {#if showDashboard}
    <PerformanceDashboard bind:isOpen={showDashboard} minimal={true} />
  {/if}
{/if}