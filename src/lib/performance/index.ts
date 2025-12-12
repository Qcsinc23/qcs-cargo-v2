// Core tracking and services
export { getPerformanceTracker, PerformanceTracker } from './tracker';
export { getMetricsService, MetricsService } from './metrics-service';
export { getPerformanceAlerts, PerformanceAlerts } from './alerts';
export { getLazyLoadingTracker, LazyLoadingTracker } from './lazy-loading-tracker';

// Components
export { default as PerformanceDashboard } from './PerformanceDashboard.svelte';
export { default as PerformanceWidget } from './PerformanceWidget.svelte';
export { default as PerformanceErrorBoundary } from './PerformanceErrorBoundary.svelte';

// Utilities and integrations
export * from './utils';
export * from './types';
export * from './config';
export * from './api-wrapper';
export * from './sveltekit-integration';
export * from './component-tracker';

// Convenience exports
export { apiRequest, apiGet, apiPost, apiPut, apiDelete, apiPatch, createApiClient, createTrackedFetch } from './api-wrapper';
export {
  trackComponent,
  createPerformanceAction,
  withPerformanceTracking,
  trackStorePerformance,
  measureComponentRender,
  createReactiveTracker,
  componentProfiler,
  ComponentProfiler,
} from './component-tracker';
export {
  initializePerformanceMonitoring,
  createPerformanceHooks,
  trackPageVisibility,
  trackElement,
  initializeSvelteKitPerformance,
} from './sveltekit-integration';
export { lazyLoadPerformance } from './lazy-loading-tracker';