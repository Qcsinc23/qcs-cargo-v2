export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint (ms)
  ttfb: number; // Time to First Byte (ms)
}

export interface NavigationMetrics {
  route: string;
  navigationStart: number;
  loadEventEnd: number;
  domContentLoaded: number;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
  redirectCount: number;
  responseStart: number;
}

export interface ComponentMetrics {
  componentName: string;
  renderTime: number;
  mountTime: number;
  updateCount: number;
  lastUpdateTime: number;
  reRenderCount: number;
}

export interface APIMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  success: boolean;
  timestamp: number;
  cached: boolean;
  size?: number;
}

export interface LazyLoadingMetrics {
  elementType: string;
  loadTime: number;
  intersectionTime: number;
  elementSelector: string;
  success: boolean;
}

export interface PerformanceBudget {
  lcp: number; // Target: 2500ms
  fid: number; // Target: 100ms
  cls: number; // Target: 0.1
  fcp: number; // Target: 1800ms
  ttfb: number; // Target: 800ms
  bundleSize: number; // Target: 250KB (gzipped)
  apiResponseTime: number; // Target: 1000ms
}

export interface PerformanceAlert {
  id: string;
  type: 'budget' | 'degradation' | 'error' | 'warning';
  metric: keyof CoreWebVitals | string;
  currentValue: number;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  route?: string;
}

export interface PerformanceSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  routeChanges: number;
  errors: number;
  vitals: CoreWebVitals;
  budgetCompliance: number; // Percentage
}

export interface PerformanceReport {
  sessionId: string;
  timestamp: number;
  route: string;
  vitals: CoreWebVitals;
  navigation: NavigationMetrics;
  components: ComponentMetrics[];
  apis: APIMetrics[];
  lazyLoading: LazyLoadingMetrics[];
  alerts: PerformanceAlert[];
  score: number; // Overall performance score (0-100)
}

export interface MetricThresholds {
  excellent: number;
  good: number;
  needsImprovement: number;
  poor: number;
}

export type MetricName = keyof CoreWebVitals | 'navigation' | 'component' | 'api' | 'lazyLoad';

export interface PerformanceObserverConfig {
  entryTypes: string[];
  buffered: boolean;
}

export interface ResourceTimingMetrics {
  name: string;
  type: string;
  duration: number;
  size: number;
  cached: boolean;
  protocol: string;
}