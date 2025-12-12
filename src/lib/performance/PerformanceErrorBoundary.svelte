<script lang="ts">
  import { onMount } from 'svelte';
  import { cn } from '$lib/utils';
  import { AlertTriangle, RefreshCw, Bug, Activity } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { getPerformanceTracker } from './tracker';
  import { getPerformanceAlerts } from './alerts';

  export let error: Error | null = null;
  export let title: string = 'Something went wrong';
  export let description: string = 'An unexpected error occurred. Please try again.';
  export let className: string = '';
  export let showPerformanceDetails: boolean = import.meta.env.DEV;
  export let reportError: boolean = true;
  export let context: string = '';

  let performanceDetails: any = null;
  let errorReported = false;

  onMount(() => {
    if (error && !errorReported) {
      reportPerformanceError();
    }
  });

  async function reportPerformanceError() {
    if (!error || errorReported) return;

    errorReported = true;

    // Track error in performance system
    const tracker = getPerformanceTracker();
    tracker.trackError(error, context || 'ErrorBoundary');

    // Create performance alert
    const alerts = getPerformanceAlerts();
    alerts.createCustomAlert({
      type: 'error',
      metric: 'error',
      currentValue: 1,
      threshold: 1,
      severity: 'high',
      message: `${context || 'Application'} error in ${window.location.pathname}: ${error.message}`,
      route: window.location.pathname,
    });

    // Get performance details for debugging
    if (showPerformanceDetails) {
      performanceDetails = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        performance: tracker.generateReport(),
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        memory: (performance as any).memory ? {
          used: Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round((performance as any).memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round((performance as any).memory.jsHeapSizeLimit / 1024 / 1024),
        } : null,
        connection: (navigator as any).connection ? {
          type: (navigator as any).connection.effectiveType,
          downlink: (navigator as any).connection.downlink,
          rtt: (navigator as any).connection.rtt,
        } : null,
      };
    }

    // TODO: Send to error reporting service
    if (reportError && import.meta.env.PROD) {
      // Implement error reporting to your service
      // await sendErrorReport(error, performanceDetails);
    }
  }

  function handleRetry() {
    // Reload the page
    window.location.reload();
  }

  function handleReportIssue() {
    const issueBody = `
## Error Report

**Context:** ${context}
**URL:** ${window.location.href}
**Timestamp:** ${new Date().toISOString()}

### Error Details
\`\`\`
${error?.name}: ${error?.message}
\`\`\`

### Stack Trace
\`\`\`
${error?.stack}
\`\`\`

### Performance Details
\`\`\`json
${JSON.stringify(performanceDetails, null, 2)}
\`\`\`
`;

    const encodedBody = encodeURIComponent(issueBody);
    const issueUrl = `https://github.com/your-org/your-repo/issues/new?body=${encodedBody}`;
    window.open(issueUrl, '_blank');
  }

  function copyErrorDetails() {
    if (performanceDetails) {
      navigator.clipboard.writeText(JSON.stringify(performanceDetails, null, 2));
    }
  }
</script>

{#if error}
  <div class={cn('flex items-center justify-center min-h-[400px] p-6', className)}>
    <Card class="max-w-2xl w-full">
      <CardHeader class="text-center">
        <div class="flex justify-center mb-4">
          <div class="rounded-full bg-destructive/10 p-4">
            <AlertTriangle class="h-8 w-8 text-destructive" />
          </div>
        </div>
        <CardTitle class="text-xl">{title}</CardTitle>
        <CardDescription class="text-base">{description}</CardDescription>
      </CardHeader>

      <CardContent class="space-y-6">
        <!-- Error Message -->
        <div class="bg-muted rounded-lg p-4">
          <p class="text-sm font-mono">{error.message}</p>
        </div>

        <!-- Performance Context -->
        {#if showPerformanceDetails}
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <Activity class="h-4 w-4" />
              <h3 class="font-semibold">Performance Context</h3>
            </div>

            <!-- Performance Score -->
            {#if performanceDetails?.performance}
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="text-center p-3 bg-muted rounded-lg">
                  <div class="text-lg font-bold">{performanceDetails.performance.score || 'N/A'}</div>
                  <div class="text-xs text-muted-foreground">Performance Score</div>
                </div>
                <div class="text-center p-3 bg-muted rounded-lg">
                  <div class="text-lg font-bold">{performanceDetails.performance.routeChanges || 0}</div>
                  <div class="text-xs text-muted-foreground">Route Changes</div>
                </div>
                <div class="text-center p-3 bg-muted rounded-lg">
                  <div class="text-lg font-bold">{performanceDetails.performance.vitals?.lcp ? Math.round(performanceDetails.performance.vitals.lcp) + 'ms' : 'N/A'}</div>
                  <div class="text-xs text-muted-foreground">LCP</div>
                </div>
                <div class="text-center p-3 bg-muted rounded-lg">
                  <div class="text-lg font-bold">{performanceDetails.performance.vitals?.fid ? Math.round(performanceDetails.performance.vitals.fid) + 'ms' : 'N/A'}</div>
                  <div class="text-xs text-muted-foreground">FID</div>
                </div>
              </div>
            {/if}

            <!-- Memory Usage -->
            {#if performanceDetails?.memory}
              <div class="space-y-2">
                <h4 class="text-sm font-semibold">Memory Usage</h4>
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <span class="text-xs text-muted-foreground">Used:</span>
                    <span class="ml-2 text-sm font-mono">{performanceDetails.memory.used} MB</span>
                  </div>
                  <div>
                    <span class="text-xs text-muted-foreground">Total:</span>
                    <span class="ml-2 text-sm font-mono">{performanceDetails.memory.total} MB</span>
                  </div>
                  <div>
                    <span class="text-xs text-muted-foreground">Limit:</span>
                    <span class="ml-2 text-sm font-mono">{performanceDetails.memory.limit} MB</span>
                  </div>
                </div>
              </div>
            {/if}

            <!-- Network Info -->
            {#if performanceDetails?.connection}
              <div class="space-y-2">
                <h4 class="text-sm font-semibold">Network Connection</h4>
                <div class="flex gap-4">
                  <Badge variant="outline">
                    {performanceDetails.connection.type}
                  </Badge>
                  <span class="text-sm text-muted-foreground">
                    {performanceDetails.connection.downlink} Mbps, {performanceDetails.connection.rtt}ms RTT
                  </span>
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <Button variant="default" class="flex-1" on:click={handleRetry}>
            <RefreshCw class="h-4 w-4 mr-2" />
            Try Again
          </Button>

          {#if import.meta.env.DEV}
            <Button variant="outline" class="flex-1" on:click={copyErrorDetails}>
              Copy Details
            </Button>
          {/if}

          {#if reportError}
            <Button variant="outline" class="flex-1" on:click={handleReportIssue}>
              <Bug class="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          {/if}
        </div>

        <!-- Error Report Status -->
        {#if errorReported}
          <div class="flex items-center gap-2 text-sm text-muted-foreground">
            <svg class="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Error has been logged for investigation
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>
{:else}
  <slot />
{/if}