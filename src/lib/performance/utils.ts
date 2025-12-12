import type { CoreWebVitals, MetricThresholds } from './types';
import { PERFORMANCE_CONFIG, METRIC_WEIGHTS } from './config';

/**
 * Calculate performance score based on metrics
 */
export function calculatePerformanceScore(vitals: CoreWebVitals): number {
  const scores = {
    lcp: getMetricScore(vitals.lcp, PERFORMANCE_CONFIG.thresholds.lcp),
    fid: getMetricScore(vitals.fid, PERFORMANCE_CONFIG.thresholds.fid),
    cls: getMetricScore(vitals.cls, PERFORMANCE_CONFIG.thresholds.cls),
    fcp: getMetricScore(vitals.fcp, PERFORMANCE_CONFIG.thresholds.fcp),
    ttfb: getMetricScore(vitals.ttfb, PERFORMANCE_CONFIG.thresholds.ttfb),
  };

  const weightedScore = Object.entries(scores).reduce((acc, [metric, score]) => {
    const weight = METRIC_WEIGHTS[metric as keyof typeof METRIC_WEIGHTS];
    return acc + score * weight;
  }, 0);

  return Math.round(weightedScore);
}

/**
 * Get individual metric score (0-100)
 */
function getMetricScore(value: number, thresholds: MetricThresholds): number {
  if (value <= thresholds.excellent) return 100;
  if (value <= thresholds.good) return 80;
  if (value <= thresholds.needsImprovement) return 50;
  if (value <= thresholds.poor) return 25;
  return 0;
}

/**
 * Format metric value with appropriate unit
 */
export function formatMetricValue(value: number, metric: keyof CoreWebVitals): string {
  switch (metric) {
    case 'cls':
      return value.toFixed(3);
    case 'lcp':
    case 'fid':
    case 'fcp':
    case 'ttfb':
      return `${Math.round(value)}ms`;
    default:
      return value.toString();
  }
}

/**
 * Get performance rating
 */
export function getPerformanceRating(score: number): {
  rating: 'excellent' | 'good' | 'needsImprovement' | 'poor';
  color: string;
  description: string;
} {
  if (score >= 90) {
    return {
      rating: 'excellent',
      color: '#10b981', // green-500
      description: 'Excellent performance',
    };
  } else if (score >= 70) {
    return {
      rating: 'good',
      color: '#3b82f6', // blue-500
      description: 'Good performance',
    };
  } else if (score >= 50) {
    return {
      rating: 'needsImprovement',
      color: '#f59e0b', // amber-500
      description: 'Needs improvement',
    };
  } else {
    return {
      rating: 'poor',
      color: '#ef4444', // red-500
      description: 'Poor performance',
    };
  }
}

/**
 * Generate unique session ID
 */
export function generateSessionId(): string {
  return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if performance monitoring should be enabled
 */
export function shouldEnableMonitoring(): boolean {
  if (!PERFORMANCE_CONFIG.enabled) return false;

  // In development, always enable if configured
  if (import.meta.env.DEV && PERFORMANCE_CONFIG.developmentMode) {
    return true;
  }

  // In production, use sample rate
  if (import.meta.env.PROD) {
    return Math.random() < PERFORMANCE_CONFIG.sampleRate;
  }

  return false;
}

/**
 * Check if route should be excluded from tracking
 */
export function shouldExcludeRoute(route: string): boolean {
  return PERFORMANCE_CONFIG.excludeRoutes.some((pattern) => route.startsWith(pattern));
}

/**
 * Check if API endpoint should be excluded from tracking
 */
export function shouldExcludeAPI(endpoint: string): boolean {
  return PERFORMANCE_CONFIG.excludeAPIs.some((pattern) => endpoint.startsWith(pattern));
}

/**
 * Check if component should be excluded from tracking
 */
export function shouldExcludeComponent(name: string): boolean {
  return PERFORMANCE_CONFIG.excludeComponents.some(pattern => {
    if (typeof pattern !== 'string') {
      return pattern.test(name);
    }
    return name === pattern;
  });
}

/**
 * Debounce function for performance tracking
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Check network connection quality
 */
export function getConnectionType(): {
  type: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
} | null {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return {
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false,
    };
  }
  return null;
}

/**
 * Get memory usage information
 */
export function getMemoryUsage(): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
} | null {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }
  return null;
}

/**
 * Calculate resource loading metrics
 */
export function calculateResourceMetrics(): {
  totalSize: number;
  cachedResources: number;
  uncachedResources: number;
  slowResources: number;
} {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  let totalSize = 0;
  let cachedResources = 0;
  let uncachedResources = 0;
  let slowResources = 0;

  resources.forEach(resource => {
    const size = resource.transferSize || 0;
    totalSize += size;

    if (size === 0 && resource.decodedBodySize > 0) {
      cachedResources++;
    } else {
      uncachedResources++;
    }

    if (resource.duration > 1000) {
      slowResources++;
    }
  });

  return {
    totalSize,
    cachedResources,
    uncachedResources,
    slowResources,
  };
}

/**
 * Get paint timing metrics
 */
export function getPaintTimings(): {
  firstPaint: number;
  firstContentfulPaint: number;
  firstMeaningfulPaint?: number;
} {
  const paintEntries = performance.getEntriesByType('paint');
  const timings: Record<string, number> = {};

  paintEntries.forEach(entry => {
    timings[entry.name.replace('-', '')] = entry.startTime;
  });

  return {
    firstPaint: timings.firstpaint || 0,
    firstContentfulPaint: timings.firstcontentfulpaint || 0,
    firstMeaningfulPaint: timings.firstmeaningfulpaint,
  };
}

/**
 * Measure execution time of a function
 */
export function measureExecutionTime<T>(fn: () => T, label?: string): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  if (label && import.meta.env.DEV) {
    console.debug(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Create a performance marker
 */
export function mark(name: string): void {
  if ('mark' in performance) {
    performance.mark(name);
  }
}

/**
 * Measure between two marks
 */
export function measure(name: string, startMark: string, endMark?: string): number | null {
  if ('measure' in performance) {
    try {
      performance.measure(name, startMark, endMark);
      const measures = performance.getEntriesByName(name, 'measure');
      return measures[measures.length - 1]?.duration || null;
    } catch (e) {
      return null;
    }
  }
  return null;
}

/**
 * Clear all performance marks and measures
 */
export function clearMarks(): void {
  if ('clearMarks' in performance) {
    performance.clearMarks();
  }
  if ('clearMeasures' in performance) {
    performance.clearMeasures();
  }
}