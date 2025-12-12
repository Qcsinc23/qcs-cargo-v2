<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getPerformanceTracker } from './tracker';
  import { getMetricsService } from './metrics-service';
  import { formatMetricValue, getPerformanceRating } from './utils';
  import { PERFORMANCE_CONFIG } from './config';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Button } from '$lib/components/ui/button';
  import { Skeleton } from '$lib/components/ui/skeleton';
  import {
    Activity,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    Minus,
    Download,
    RefreshCw,
    X,
    ChevronRight,
    Clock,
    Zap,
    Gauge,
    AlertCircle,
    CheckCircle2
  } from 'lucide-svelte';

  // Props
  export let isOpen: boolean = false;
  export let minimal: boolean = false;

  // Internal state
  let currentReport: any = null;
  let analytics: any = null;
  let loading = true;
  let error: string | null = null;
  let refreshInterval: ReturnType<typeof setInterval> | null = null;
  let selectedTab: 'overview' | 'metrics' | 'alerts' | 'analytics' = 'overview';
  let unsubscribeReports: (() => void) | null = null;
  let unsubscribeAlerts: (() => void) | null = null;

  function formatVital(metric: string, value: unknown) {
    return formatMetricValue(Number(value ?? 0), metric as any);
  }

  function getBudget(metric: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (PERFORMANCE_CONFIG.budget as any)[metric] ?? 0;
  }

  function isOverBudget(metric: string, value: unknown) {
    const budget = getBudget(metric);
    return budget ? Number(value ?? 0) > budget : false;
  }

  function formatAlertMetric(metric: string, value: unknown) {
    return formatMetricValue(Number(value ?? 0), metric as any);
  }

  // Computed values
  $: score = currentReport?.score || 0;
  $: scoreRating = score ? getPerformanceRating(score) : null;
  $: vitals = currentReport?.vitals || {};
  $: alerts = analytics?.topAlerts || [];
  $: hasAlerts = alerts.length > 0;
  $: criticalAlerts = alerts.filter((a: any) => a.severity === 'critical').length;
  $: highAlerts = alerts.filter((a: any) => a.severity === 'high').length;

  onMount(async () => {
    await loadData();

    // Subscribe to updates
    const metricsService = getMetricsService();
    unsubscribeReports = metricsService.subscribe('reports', () => {
      loadData();
    });
    unsubscribeAlerts = metricsService.subscribe('alerts', () => {
      loadData();
    });

    // Auto-refresh every 30 seconds
    refreshInterval = setInterval(loadData, 30000);
  });

  onDestroy(() => {
    if (refreshInterval) clearInterval(refreshInterval);
    if (unsubscribeReports) unsubscribeReports();
    if (unsubscribeAlerts) unsubscribeAlerts();
  });

  async function loadData() {
    try {
      loading = true;
      error = null;

      const tracker = getPerformanceTracker();
      const metricsService = getMetricsService();

      currentReport = tracker.generateReport();
      analytics = metricsService.getAnalytics();
    } catch (e) {
      error = 'Failed to load performance data';
      console.error('Performance Dashboard Error:', e);
    } finally {
      loading = false;
    }
  }

  function exportMetrics() {
    const metricsService = getMetricsService();
    const data = metricsService.exportMetrics();

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearMetrics() {
    if (confirm('Are you sure you want to clear all performance metrics?')) {
      const metricsService = getMetricsService();
      metricsService.clearMetrics();
      loadData();
    }
  }

  function getTrendIcon(trend: string) {
    switch (trend) {
      case 'improving':
        return TrendingUp;
      case 'degrading':
        return TrendingDown;
      default:
        return Minus;
    }
  }

  function getSeverityColor(severity: string) {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  }

  function formatAlertTime(timestamp: number) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return date.toLocaleDateString();
  }
</script>

{#if isOpen || !minimal}
  <div class="fixed inset-0 z-50 flex items-center justify-center {isOpen ? 'bg-black/50' : ''}">
    <Card class="w-full max-w-6xl max-h-[90vh] overflow-hidden">
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
        <div class="flex items-center gap-2">
          <Gauge class="h-5 w-5" />
          <CardTitle>Performance Dashboard</CardTitle>
          {#if hasAlerts}
            <Badge variant="destructive" class="ml-2">
              {criticalAlerts + highAlerts} Alerts
            </Badge>
          {/if}
        </div>
        <div class="flex items-center gap-2">
          <Button variant="outline" size="sm" on:click={loadData}>
            <RefreshCw class="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" on:click={exportMetrics}>
            <Download class="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="ghost" size="sm" on:click={clearMetrics}>
            Clear
          </Button>
          {#if isOpen}
            <Button variant="ghost" size="sm" on:click={() => isOpen = false}>
              <X class="h-4 w-4" />
            </Button>
          {/if}
        </div>
      </CardHeader>

      <CardContent class="p-6">
        {#if loading}
          <div class="space-y-4">
            <Skeleton class="h-8 w-48" />
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
              {#each Array(5) as _}
                <Skeleton class="h-20" />
              {/each}
            </div>
            <Skeleton class="h-64" />
          </div>
        {:else if error}
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle class="h-12 w-12 text-destructive mb-4" />
            <h3 class="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p class="text-muted-foreground">{error}</p>
          </div>
        {:else}
          <!-- Tab Navigation -->
          <div class="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
            <Button
              variant={selectedTab === 'overview' ? 'default' : 'ghost'}
              size="sm"
              class="flex-1"
              on:click={() => selectedTab = 'overview'}
            >
              Overview
            </Button>
            <Button
              variant={selectedTab === 'metrics' ? 'default' : 'ghost'}
              size="sm"
              class="flex-1"
              on:click={() => selectedTab = 'metrics'}
            >
              Metrics
            </Button>
            <Button
              variant={selectedTab === 'alerts' ? 'default' : 'ghost'}
              size="sm"
              class="flex-1"
              on:click={() => selectedTab = 'alerts'}
            >
              Alerts ({alerts.length})
            </Button>
            <Button
              variant={selectedTab === 'analytics' ? 'default' : 'ghost'}
              size="sm"
              class="flex-1"
              on:click={() => selectedTab = 'analytics'}
            >
              Analytics
            </Button>
          </div>

          {#if selectedTab === 'overview'}
            <!-- Overview Tab -->
            <div class="space-y-6">
              <!-- Performance Score -->
              <div class="text-center py-8">
                <div class="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white mb-4">
                  <div>
                    <div class="text-3xl font-bold">{score}</div>
                    <div class="text-xs opacity-90">Score</div>
                  </div>
                </div>
                {#if scoreRating}
                  <h3 class="text-xl font-semibold mb-1" style="color: {scoreRating.color}">
                    {scoreRating.description}
                  </h3>
                  <p class="text-muted-foreground">{scoreRating.rating.toUpperCase()}</p>
                {/if}
              </div>

              <!-- Quick Stats -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent class="p-4 text-center">
                    <TrendingUp class="h-8 w-8 mx-auto mb-2 text-blue-500" />
                    <div class="text-2xl font-bold">{analytics?.scoreTrend || 'N/A'}</div>
                    <p class="text-xs text-muted-foreground">Score Trend</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent class="p-4 text-center">
                    <Clock class="h-8 w-8 mx-auto mb-2 text-green-500" />
                    <div class="text-2xl font-bold">{formatMetricValue(vitals.lcp || 0, 'lcp')}</div>
                    <p class="text-xs text-muted-foreground">LCP</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent class="p-4 text-center">
                    <Zap class="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                    <div class="text-2xl font-bold">{formatMetricValue(vitals.fid || 0, 'fid')}</div>
                    <p class="text-xs text-muted-foreground">FID</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent class="p-4 text-center">
                    <Activity class="h-8 w-8 mx-auto mb-2 text-red-500" />
                    <div class="text-2xl font-bold">{formatMetricValue(vitals.cls || 0, 'cls')}</div>
                    <p class="text-xs text-muted-foreground">CLS</p>
                  </CardContent>
                </Card>
              </div>

              <!-- Recent Alerts -->
              {#if alerts.length > 0}
                <Card>
                  <CardHeader>
                    <CardTitle class="flex items-center gap-2">
                      <AlertTriangle class="h-5 w-5" />
                      Recent Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div class="space-y-2">
                      {#each alerts.slice(0, 5) as alert}
                        <div class="flex items-start justify-between p-3 bg-muted rounded-lg">
                          <div class="flex-1">
                            <p class="font-medium text-sm">{alert.message}</p>
                            <p class="text-xs text-muted-foreground mt-1">
                              {formatAlertTime(alert.timestamp)}
                            </p>
                          </div>
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                      {/each}
                    </div>
                  </CardContent>
                </Card>
              {/if}
            </div>

          {:else if selectedTab === 'metrics'}
            <!-- Metrics Tab -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {#each Object.entries(vitals) as [metric, value]}
                <Card>
                  <CardHeader>
                    <CardTitle class="text-lg capitalize">
                      {metric.replace(/([A-Z])/g, ' $1').trim()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div class="space-y-2">
                      <div class="text-3xl font-bold">
                        {formatVital(metric, value)}
                      </div>
                      <div class="flex justify-between text-xs text-muted-foreground">
                        <span>Target: {formatVital(metric, getBudget(metric))}</span>
                        <span class={isOverBudget(metric, value) ? 'text-red-500' : 'text-green-500'}>
                          {isOverBudget(metric, value) ? 'Over budget' : 'Within budget'}
                        </span>
                      </div>
                      <!-- Progress bar -->
                      <div class="w-full bg-gray-200 rounded-full h-2">
                        <div
                          class="h-2 rounded-full transition-all"
                          class:bg-green-500={!isOverBudget(metric, value)}
                          class:bg-yellow-500={isOverBudget(metric, value) && Number(value ?? 0) <= getBudget(metric) * 1.5}
                          class:bg-red-500={Number(value ?? 0) > getBudget(metric) * 1.5}
                          style="width: {Math.min(100, (Number(value ?? 0) / (getBudget(metric) || 1)) * 100)}%"
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              {/each}
            </div>

          {:else if selectedTab === 'alerts'}
            <!-- Alerts Tab -->
            <div class="space-y-4">
              {#if alerts.length === 0}
                <Card>
                  <CardContent class="p-12 text-center">
                    <CheckCircle2 class="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 class="text-lg font-semibold mb-2">No Performance Alerts</h3>
                    <p class="text-muted-foreground">Everything is running smoothly!</p>
                  </CardContent>
                </Card>
              {:else}
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {#each alerts as alert}
                    <Card>
                      <CardContent class="p-4">
                        <div class="flex items-start justify-between mb-2">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span class="text-xs text-muted-foreground">
                            {formatAlertTime(alert.timestamp)}
                          </span>
                        </div>
                        <p class="text-sm font-medium mb-2">{alert.message}</p>
                        <div class="text-xs text-muted-foreground space-y-1">
                          <div>Type: {alert.type}</div>
                          <div>Current: {formatAlertMetric(alert.metric, alert.currentValue)}</div>
                          <div>Threshold: {formatAlertMetric(alert.metric, alert.threshold)}</div>
                          {#if alert.route}
                            <div>Route: {alert.route}</div>
                          {/if}
                        </div>
                      </CardContent>
                    </Card>
                  {/each}
                </div>
              {/if}
            </div>

          {:else if selectedTab === 'analytics'}
            <!-- Analytics Tab -->
            <div class="space-y-6">
              <!-- Score Trend -->
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Average performance metrics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div class="text-center">
                      <div class="text-2xl font-bold">{Math.round(analytics?.averageScore || 0)}</div>
                      <p class="text-sm text-muted-foreground">Average Score</p>
                    </div>
                    <div class="text-center">
                      <div class="flex items-center justify-center gap-1">
                        <span class="text-2xl font-bold capitalize">{analytics?.scoreTrend || 'N/A'}</span>
                        {#if analytics?.scoreTrend}
                          <svelte:component this={getTrendIcon(analytics.scoreTrend)} class="h-5 w-5" />
                        {/if}
                      </div>
                      <p class="text-sm text-muted-foreground">Score Trend</p>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold">{currentReport?.routeChanges || 0}</div>
                      <p class="text-sm text-muted-foreground">Route Changes</p>
                    </div>
                    <div class="text-center">
                      <div class="text-2xl font-bold">{analytics?.topAlerts?.length || 0}</div>
                      <p class="text-sm text-muted-foreground">Total Alerts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <!-- Slowest Routes -->
              {#if analytics?.slowestRoutes?.length > 0}
                <Card>
                  <CardHeader>
                    <CardTitle>Slowest Routes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div class="space-y-2">
                      {#each analytics.slowestRoutes as route}
                        <div class="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span class="font-medium">{route.route}</span>
                          <span class="text-sm text-muted-foreground">
                            {Math.round(route.averageLoadTime)}ms
                          </span>
                        </div>
                      {/each}
                    </div>
                  </CardContent>
                </Card>
              {/if}

              <!-- Slowest APIs -->
              {#if analytics?.slowestAPIs?.length > 0}
                <Card>
                  <CardHeader>
                    <CardTitle>Slowest APIs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div class="space-y-2">
                      {#each analytics.slowestAPIs as api}
                        <div class="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div>
                            <p class="font-medium">{api.endpoint}</p>
                            <p class="text-xs text-muted-foreground">{api.callCount} calls</p>
                          </div>
                          <span class="text-sm text-muted-foreground">
                            {Math.round(api.averageResponseTime)}ms
                          </span>
                        </div>
                      {/each}
                    </div>
                  </CardContent>
                </Card>
              {/if}

              <!-- Recommendations -->
              {#if analytics?.recommendations?.length > 0}
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                    <CardDescription>Suggestions to improve performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div class="space-y-2">
                      {#each analytics.recommendations as recommendation}
                        <div class="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                          <ChevronRight class="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                          <p class="text-sm">{recommendation}</p>
                        </div>
                      {/each}
                    </div>
                  </CardContent>
                </Card>
              {/if}
            </div>
          {/if}
        {/if}
      </CardContent>
    </Card>
  </div>
{/if}