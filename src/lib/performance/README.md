# Performance Monitoring System for QCS Cargo

A comprehensive performance monitoring system for SvelteKit applications that tracks Core Web Vitals, component render performance, API response times, and provides real-time performance insights.

## Features

- **Core Web Vitals Tracking** - Monitors LCP, FID, CLS, FCP, and TTFB
- **Navigation Performance** - Tracks route changes and page load times
- **Component Render Tracking** - Monitors component render times and re-renders
- **API Response Monitoring** - Tracks API call performance and success rates
- **Lazy Loading Metrics** - Monitors lazy loading performance
- **Performance Budgets** - Enforces performance budgets with alerts
- **Error Tracking** - Integrated error reporting with performance context
- **Real-time Dashboard** - Visual performance monitoring interface
- **Local Storage** - Persists metrics for analysis

## Quick Start

### 1. Initialize Performance Monitoring

In your `app.html` or root layout:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { onMount } from 'svelte';
  import { initializeSvelteKitPerformance } from '$lib/performance';
  import PerformanceWidget from '$lib/performance/PerformanceWidget.svelte';

  onMount(() => {
    // Initialize performance monitoring
    const cleanup = initializeSvelteKitPerformance();

    // Cleanup on page unload
    return cleanup;
  });
</script>

<slot />

<!-- Add performance widget (development only) -->
{#if import.meta.env.DEV}
  <PerformanceWidget position="bottom-right" />
{/if}
```

### 2. Wrap API Calls

Use the provided API wrapper for automatic performance tracking:

```typescript
import { apiGet, apiPost, createApiClient } from '$lib/performance';

// Direct API calls
const data = await apiGet('/api/shipments');

// Create a client for repeated calls
const api = createApiClient('http://localhost:8090/api');
const shipments = await api.get('/shipments');
```

### 3. Track Component Performance

```svelte
<script>
  import { trackComponent, onMount } from '$lib/performance';

  // Track component performance
  const { trackUpdate, trackRerender } = trackComponent('MyComponent');

  onMount(() => {
    // Component mounted - tracking starts automatically
  });

  // Call trackUpdate() when component updates
  // Use trackRerender() to measure specific render operations
</script>
```

### 4. Use Performance Actions

```svelte
<script>
  import { lazyLoadPerformance } from '$lib/performance';
</script>

<!-- Track lazy loading performance -->
<img
  use:lazyLoadPerformance={{
    type: 'image',
    onLoad: (success, metrics) => {
      console.log('Image loaded:', success, metrics);
    }
  }}
  src="/image.jpg"
  alt="Lazy loaded image"
/>
```

### 5. Enhanced Error Boundaries

```svelte
<script>
  import PerformanceErrorBoundary from '$lib/performance/PerformanceErrorBoundary.svelte';
</script>

<PerformanceErrorBoundary
  context="CheckoutPage"
  showPerformanceDetails={true}
>
  <YourComponent />
</PerformanceErrorBoundary>
```

## Configuration

The performance system can be configured in `src/lib/performance/config.ts`:

```typescript
export const PERFORMANCE_CONFIG = {
  // Enable/disable monitoring
  enabled: true,

  // Sample rate for production
  sampleRate: 0.1,

  // Performance budgets
  budget: {
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1,
    // ...
  },

  // Routes to exclude from tracking
  excludeRoutes: ['/health', '/api/health'],

  // API endpoints to exclude
  excludeAPIs: ['/api/analytics'],
};
```

## Dashboard

Access the performance dashboard in two ways:

1. **Widget** - Floating widget shows real-time metrics (development mode)
2. **Component** - Full dashboard for detailed analysis

```svelte
<script>
  import PerformanceDashboard from '$lib/performance/PerformanceDashboard.svelte';

  let showDashboard = false;
</script>

<button on:click={() => showDashboard = true}>
  View Performance
</button>

<PerformanceDashboard bind:isOpen={showDashboard} />
```

## Advanced Usage

### Custom Performance Tracking

```typescript
import { getPerformanceTracker } from '$lib/performance';

const tracker = getPerformanceTracker();

// Track custom API calls
const apiTracking = tracker.trackAPIRequest('/custom/endpoint', 'POST');
apiTracking.start();
try {
  const response = await fetch('/api/custom', { method: 'POST' });
  apiTracking.end(response.status, response.ok);
} catch (error) {
  apiTracking.end(0, false);
}

// Track component render
const renderTracking = tracker.trackComponentRender('MyComponent');
renderTracking.start();
// ... render component
renderTracking.end();

// Track errors
tracker.trackError(error, 'Custom context');
```

### Performance Budgets

```typescript
import { getPerformanceAlerts } from '$lib/performance';

const alerts = getPerformanceAlerts();

// Update budgets
alerts.updateBudget({
  lcp: 2000, // Stricter budget
  fid: 50,
});

// Create custom alerts
alerts.createCustomAlert({
  type: 'warning',
  metric: 'custom',
  currentValue: 150,
  threshold: 100,
  severity: 'medium',
  message: 'Custom metric exceeded threshold',
});
```

### Lazy Loading Performance

```typescript
import { getLazyLoadingTracker } from '$lib/performance';

const tracker = getLazyLoadingTracker();

// Track lazy loading manually
tracker.trackLazyElement(
  element,
  'image',
  {
    rootMargin: '100px',
    threshold: 0.5,
    delay: 100,
  },
  (success, metrics) => {
    console.log('Load metrics:', metrics);
  }
);

// Get analytics
const averageTimes = tracker.getAverageLoadTime();
const successRates = tracker.getSuccessRate();
```

## Data Storage

Metrics are stored in localStorage for analysis:

- `qcs_performance_metrics` - Raw performance reports
- `qcs_performance_alerts` - Performance alerts
- `qcs_performance_session` - Current session info

## Environment Considerations

### Development
- Full tracking enabled
- Console debug output
- Performance widget visible
- Detailed error information

### Production
- Sampled tracking (configurable)
- Minimal overhead
- Silent error reporting
- No performance widget

## Best Practices

1. **Component Tracking**
   - Track heavy components
   - Exclude simple UI components
   - Use meaningful names

2. **API Monitoring**
   - Track all external APIs
   - Exclude analytics endpoints
   - Monitor response patterns

3. **Performance Budgets**
   - Set realistic budgets
   - Start with conservative values
   - Gradually tighten budgets

4. **Error Context**
   - Provide meaningful context
   - Include component/page names
   - Add user action information

## Troubleshooting

### Performance Issues
1. Check dashboard for red alerts
2. Review slowest routes and APIs
3. Analyze component render times
4. Check memory usage patterns

### Missing Metrics
1. Verify initialization in root layout
2. Check browser compatibility
3. Ensure proper imports
4. Verify configuration

### High Overhead
1. Reduce sample rate in production
2. Exclude non-critical components
3. Increase debounce times
4. Filter API tracking

## Browser Support

- Chrome 61+
- Firefox 55+
- Safari 12+
- Edge 79+

Note: Some features (like Long Tasks API) have limited browser support.