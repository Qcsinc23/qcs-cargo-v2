import type { PerformanceBudget, MetricThresholds } from './types';

export const PERFORMANCE_CONFIG = {
  // Enable/disable performance monitoring
  enabled: true,

  // Enable in development
  developmentMode: true,

  // Sample rate for production (0-1)
  sampleRate: 0.1,

  // Maximum number of metrics to store locally
  maxStoredMetrics: 1000,

  // How long to keep metrics in localStorage (ms)
  retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days

  // How often to check for performance issues (ms)
  alertCheckInterval: 5000,

  // Debounce time for component render tracking (ms)
  renderTrackingDebounce: 100,

  // Maximum API calls to track per session
  maxTrackedAPIs: 100,

  // Performance budgets
  budget: {
    lcp: 2500, // 2.5s
    fid: 100, // 100ms
    cls: 0.1,
    fcp: 1800, // 1.8s
    ttfb: 800, // 800ms
    bundleSize: 256000, // 250KB (gzipped)
    apiResponseTime: 1000, // 1s
  } as PerformanceBudget,

  // Thresholds for scoring
  thresholds: {
    lcp: {
      excellent: 1200,
      good: 2500,
      needsImprovement: 4000,
      poor: 6000,
    },
    fid: {
      excellent: 50,
      good: 100,
      needsImprovement: 200,
      poor: 300,
    },
    cls: {
      excellent: 0.05,
      good: 0.1,
      needsImprovement: 0.25,
      poor: 0.5,
    },
    fcp: {
      excellent: 1000,
      good: 1800,
      needsImprovement: 3000,
      poor: 4000,
    },
    ttfb: {
      excellent: 200,
      good: 800,
      needsImprovement: 1500,
      poor: 2500,
    },
    apiResponseTime: {
      excellent: 200,
      good: 500,
      needsImprovement: 1000,
      poor: 2000,
    },
  } as Record<string, MetricThresholds>,

  // Routes to exclude from tracking
  excludeRoutes: [
    '/health',
    '/api/health',
    '/_auth',
    '/preview',
  ],

  // API endpoints to exclude from tracking
  excludeAPIs: [
    '/api/analytics',
    '/api/metrics',
    '/api/health',
  ],

  // Component patterns to exclude from tracking
  excludeComponents: [
    /^svelte:/, // Svelte internal components
    /^ErrorBoundary$/,
    /^LoadingSpinner$/,
    /^Skeleton$/,
  ],
} as const;

export const METRIC_WEIGHTS = {
  lcp: 0.25,
  fid: 0.2,
  cls: 0.2,
  fcp: 0.15,
  ttfb: 0.1,
  apiResponseTime: 0.05,
  bundleSize: 0.05,
} as const;

export const ALERT_MESSAGES = {
  budget: {
    lcp: 'Largest Contentful Paint exceeds budget',
    fid: 'First Input Delay exceeds budget',
    cls: 'Cumulative Layout Shift exceeds budget',
    fcp: 'First Contentful Paint exceeds budget',
    ttfb: 'Time to First Byte exceeds budget',
    apiResponseTime: 'API response time exceeds budget',
    bundleSize: 'Bundle size exceeds budget',
  },
  degradation: {
    lcp: 'Largest Contentful Paint has degraded',
    fid: 'First Input Delay has degraded',
    cls: 'Cumulative Layout Shift has degraded',
    fcp: 'First Contentful Paint has degraded',
    ttfb: 'Time to First Byte has degraded',
  },
  error: {
    navigation: 'Navigation error detected',
    component: 'Component render error detected',
    api: 'API error detected',
  },
  warning: {
    connectivity: 'Poor network connectivity detected',
    memory: 'High memory usage detected',
    resources: 'Resource loading issues detected',
  },
} as const;

export const STORAGE_KEYS = {
  metrics: 'qcs_performance_metrics',
  session: 'qcs_performance_session',
  alerts: 'qcs_performance_alerts',
  config: 'qcs_performance_config',
} as const;