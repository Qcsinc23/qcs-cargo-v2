import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import type {
  CoreWebVitals,
  NavigationMetrics,
  ComponentMetrics,
  APIMetrics,
  LazyLoadingMetrics,
  PerformanceReport,
  PerformanceAlert,
  PerformanceSession
} from './types';
import {
  generateSessionId,
  calculatePerformanceScore,
  shouldEnableMonitoring,
  shouldExcludeRoute,
  shouldExcludeAPI,
  shouldExcludeComponent,
  debounce,
  mark,
  measure,
  getPaintTimings,
  getConnectionType,
  getMemoryUsage
} from './utils';
import { PERFORMANCE_CONFIG, ALERT_MESSAGES, STORAGE_KEYS } from './config';

export class PerformanceTracker {
  private sessionId: string;
  private startTime: number;
  private vitals: Partial<CoreWebVitals> = {};
  private navigationMetrics: NavigationMetrics[] = [];
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private apiMetrics: APIMetrics[] = [];
  private lazyLoadingMetrics: LazyLoadingMetrics[] = [];
  private alerts: PerformanceAlert[] = [];
  private routeChanges = 0;
  private errors = 0;
  private observers: PerformanceObserver[] = [];
  private storage: Storage;

  constructor() {
    this.storage = window.localStorage;
    this.sessionId = this.loadOrCreateSession();
    this.startTime = performance.now();

    if (shouldEnableMonitoring()) {
      this.initializeTracking();
    }
  }

  /**
   * Initialize all performance tracking
   */
  private async initializeTracking(): Promise<void> {
    this.trackCoreWebVitals();
    this.trackNavigation();
    this.trackResources();
    this.trackLongTasks();
    this.startMemoryMonitoring();
    this.startNetworkMonitoring();

    // Clean up old metrics
    this.cleanupOldMetrics();
  }

  /**
   * Track Core Web Vitals using web-vitals library
   */
  private trackCoreWebVitals(): void {
    const handleVital = (metric: any) => {
      const value = metric.value;
      const name = metric.name.toLowerCase();
      const key = name === 'inp' ? 'fid' : name;

      this.vitals[key as keyof CoreWebVitals] = value;

      // Check against budgets and create alerts
      this.checkBudgetThreshold(key, value);

      // Save to storage
      this.saveMetrics();
    };

    onCLS(handleVital);
    onINP(handleVital);
    onFCP(handleVital);
    onLCP(handleVital);
    onTTFB(handleVital);
  }

  /**
   * Track navigation performance
   */
  private trackNavigation(): void {
    // Track initial page load
    this.recordNavigation(window.location.pathname);

    // Track soft navigation (SvelteKit route changes)
    let lastNavigation = performance.now();

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation' || entry.name.startsWith('/')) {
          const now = performance.now();
          const timeSinceLastNav = now - lastNavigation;

          if (timeSinceLastNav > 100) { // Filter out rapid changes
            this.recordNavigation(entry.name);
            lastNavigation = now;
          }
        }
      });
    });

    observer.observe({ type: 'navigation', buffered: true });
    this.observers.push(observer);
  }

  /**
   * Record navigation metrics
   */
  private recordNavigation(route: string): void {
    if (shouldExcludeRoute(route)) return;

    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navEntry) {
      const metrics: NavigationMetrics = {
        route,
        navigationStart: performance.timeOrigin,
        loadEventEnd: navEntry.loadEventEnd,
        domContentLoaded: navEntry.domContentLoadedEventEnd,
        transferSize: navEntry.transferSize,
        encodedBodySize: navEntry.encodedBodySize,
        decodedBodySize: navEntry.decodedBodySize,
        redirectCount: navEntry.redirectCount,
        responseStart: navEntry.responseStart,
      };

      this.navigationMetrics.push(metrics);
      this.routeChanges++;
    }
  }

  /**
   * Track resource loading
   */
  private trackResources(): void {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resource = entry as PerformanceResourceTiming;

          // Track slow resources
          if (resource.duration > PERFORMANCE_CONFIG.budget.apiResponseTime) {
            this.createAlert({
              id: `resource_${Date.now()}`,
              type: 'warning',
              metric: 'resource',
              currentValue: resource.duration,
              threshold: PERFORMANCE_CONFIG.budget.apiResponseTime,
              severity: 'medium',
              message: `Slow resource detected: ${resource.name} took ${resource.duration.toFixed(2)}ms`,
              timestamp: Date.now(),
            });
          }
        }
      });
    });

    observer.observe({ type: 'resource', buffered: true });
    this.observers.push(observer);
  }

  /**
   * Track long tasks that block the main thread
   */
  private trackLongTasks(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            this.createAlert({
              id: `longtask_${Date.now()}`,
              type: 'warning',
              metric: 'longTask',
              currentValue: entry.duration,
              threshold: 50, // Tasks longer than 50ms
              severity: entry.duration > 100 ? 'high' : 'medium',
              message: `Long task detected: ${entry.duration.toFixed(2)}ms blocked the main thread`,
              timestamp: Date.now(),
            });
          }
        });
      });

      try {
        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (e) {
        // Long tasks might not be supported in all browsers
        console.debug('Long tasks not supported');
      }
    }
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    const checkMemory = debounce(() => {
      const memory = getMemoryUsage();
      if (memory) {
        const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

        if (usageRatio > 0.8) {
          this.createAlert({
            id: `memory_${Date.now()}`,
            type: 'warning',
            metric: 'memory',
            currentValue: usageRatio,
            threshold: 0.8,
            severity: 'high',
            message: `High memory usage: ${(usageRatio * 100).toFixed(1)}%`,
            timestamp: Date.now(),
          });
        }
      }
    }, 5000);

    setInterval(checkMemory, 10000);
  }

  /**
   * Start network monitoring
   */
  private startNetworkMonitoring(): void {
    const connection = getConnectionType();
    if (connection) {
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        this.createAlert({
          id: `network_${Date.now()}`,
          type: 'warning',
          metric: 'network',
          currentValue: 0,
          threshold: 0,
          severity: 'medium',
          message: `Slow network connection detected: ${connection.effectiveType}`,
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Track component render performance
   */
  trackComponentRender(componentName: string): {
    start: () => void;
    end: () => void;
  } {
    if (shouldExcludeComponent(componentName)) {
      return { start: () => {}, end: () => {} };
    }

    let startTime: number;
    let mountTime: number;

    return {
      start: () => {
        startTime = performance.now();
        mark(`${componentName}_render_start`);
      },
      end: () => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        mountTime = performance.now();

        const existing = this.componentMetrics.get(componentName) || {
          componentName,
          renderTime: 0,
          mountTime: 0,
          updateCount: 0,
          lastUpdateTime: 0,
          reRenderCount: 0,
        };

        existing.renderTime = (existing.renderTime + duration) / 2; // Average
        existing.mountTime = mountTime;
        existing.updateCount++;
        existing.lastUpdateTime = Date.now();
        existing.reRenderCount++;

        this.componentMetrics.set(componentName, existing);
        this.saveMetrics();
      },
    };
  }

  /**
   * Track API response time
   */
  trackAPIRequest(endpoint: string, method: string): {
    start: () => void;
    end: (status: number, success: boolean, size?: number) => void;
  } {
    if (shouldExcludeAPI(endpoint)) {
      return {
        start: () => {},
        end: () => {}
      };
    }

    let startTime: number;
    let cached = false;

    return {
      start: () => {
        startTime = performance.now();
      },
      end: (status: number, success: boolean, size?: number) => {
        const duration = performance.now() - startTime;

        // Check if response was from cache (very fast response)
        if (duration < 10) {
          cached = true;
        }

        const metrics: APIMetrics = {
          endpoint,
          method,
          duration,
          status,
          success,
          timestamp: Date.now(),
          cached,
          size,
        };

        this.apiMetrics.push(metrics);

        // Keep only recent API metrics
        if (this.apiMetrics.length > PERFORMANCE_CONFIG.maxTrackedAPIs) {
          this.apiMetrics = this.apiMetrics.slice(-PERFORMANCE_CONFIG.maxTrackedAPIs);
        }

        // Check against budget
        if (duration > PERFORMANCE_CONFIG.budget.apiResponseTime) {
          this.createAlert({
            id: `api_${Date.now()}`,
            type: 'budget',
            metric: 'apiResponseTime',
            currentValue: duration,
            threshold: PERFORMANCE_CONFIG.budget.apiResponseTime,
            severity: duration > 2000 ? 'high' : 'medium',
            message: `API slow response: ${method} ${endpoint} took ${duration.toFixed(2)}ms`,
            timestamp: Date.now(),
          });
        }

        this.saveMetrics();
      },
    };
  }

  /**
   * Track lazy loading performance
   */
  trackLazyLoading(elementType: string, elementSelector: string): {
    onIntersection: () => void;
    onLoad: (success: boolean) => void;
  } {
    let intersectionTime: number;

    return {
      onIntersection: () => {
        intersectionTime = performance.now();
      },
      onLoad: (success: boolean) => {
        const loadTime = performance.now();
        const metrics: LazyLoadingMetrics = {
          elementType,
          loadTime: loadTime - intersectionTime,
          intersectionTime,
          elementSelector,
          success,
        };

        this.lazyLoadingMetrics.push(metrics);
        this.saveMetrics();
      },
    };
  }

  /**
   * Track error occurrences
   */
  trackError(error: Error, context?: string): void {
    this.errors++;

    this.createAlert({
      id: `error_${Date.now()}`,
      type: 'error',
      metric: 'error',
      currentValue: this.errors,
      threshold: 1,
      severity: 'high',
      message: `${context || 'Application'} error: ${error.message}`,
      timestamp: Date.now(),
    });

    this.saveMetrics();
  }

  /**
   * Check metrics against budget thresholds
   */
  private checkBudgetThreshold(metric: string, value: number): void {
    const budget = PERFORMANCE_CONFIG.budget;
    const threshold = budget[metric as keyof typeof budget];

    if (threshold && value > threshold) {
      const severity = value > threshold * 2 ? 'critical' :
                      value > threshold * 1.5 ? 'high' : 'medium';

      this.createAlert({
        id: `${metric}_budget_${Date.now()}`,
        type: 'budget',
        metric: metric as keyof CoreWebVitals,
        currentValue: value,
        threshold,
        severity,
        message: ALERT_MESSAGES.budget[metric as keyof typeof ALERT_MESSAGES.budget],
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Create and store performance alert
   */
  private createAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    // Keep only recent alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    // Log in development
    if (import.meta.env.DEV) {
      console.warn(`[Performance Alert] ${alert.message}`, alert);
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport | null {
    if (!this.vitals.lcp || !this.vitals.fid || !this.vitals.cls || !this.vitals.fcp || !this.vitals.ttfb) {
      return null;
    }

    const currentRoute = window.location.pathname;
    const score = calculatePerformanceScore(this.vitals as CoreWebVitals);

    return {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      route: currentRoute,
      vitals: this.vitals as CoreWebVitals,
      navigation: this.navigationMetrics[this.navigationMetrics.length - 1] || {
        route: currentRoute,
        navigationStart: 0,
        loadEventEnd: 0,
        domContentLoaded: 0,
        transferSize: 0,
        encodedBodySize: 0,
        decodedBodySize: 0,
        redirectCount: 0,
        responseStart: 0,
      },
      components: Array.from(this.componentMetrics.values()),
      apis: this.apiMetrics,
      lazyLoading: this.lazyLoadingMetrics,
      alerts: this.alerts,
      score,
    };
  }

  /**
   * Get current performance session
   */
  getSession(): PerformanceSession {
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      endTime: Date.now(),
      routeChanges: this.routeChanges,
      errors: this.errors,
      vitals: this.vitals as CoreWebVitals,
      budgetCompliance: this.calculateBudgetCompliance(),
    };
  }

  /**
   * Calculate budget compliance percentage
   */
  private calculateBudgetCompliance(): number {
    const budget = PERFORMANCE_CONFIG.budget;
    let complianceCount = 0;
    let totalCount = 0;

    Object.entries(budget).forEach(([key, threshold]) => {
      const value = this.vitals[key as keyof CoreWebVitals];
      if (value !== undefined) {
        totalCount++;
        if (value <= threshold) {
          complianceCount++;
        }
      }
    });

    return totalCount > 0 ? (complianceCount / totalCount) * 100 : 0;
  }

  /**
   * Save metrics to localStorage
   */
  private saveMetrics(): void {
    const data = {
      sessionId: this.sessionId,
      vitals: this.vitals,
      navigationMetrics: this.navigationMetrics,
      componentMetrics: Array.from(this.componentMetrics.entries()),
      apiMetrics: this.apiMetrics,
      lazyLoadingMetrics: this.lazyLoadingMetrics,
      alerts: this.alerts,
      lastUpdate: Date.now(),
    };

    try {
      this.storage.setItem(STORAGE_KEYS.metrics, JSON.stringify(data));
    } catch (e) {
      // Storage might be full
      console.debug('Failed to save performance metrics:', e);
    }
  }

  /**
   * Load or create session
   */
  private loadOrCreateSession(): string {
    const sessionId = generateSessionId();

    try {
      const sessionData = this.storage.getItem(STORAGE_KEYS.session);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Resume session if it's recent (within 30 minutes)
        if (Date.now() - session.lastActivity < 30 * 60 * 1000) {
          return session.sessionId;
        }
      }

      // Create new session
      this.storage.setItem(STORAGE_KEYS.session, JSON.stringify({
        sessionId,
        startTime: Date.now(),
        lastActivity: Date.now(),
      }));
    } catch (e) {
      console.debug('Failed to load session:', e);
    }

    return sessionId;
  }

  /**
   * Clean up old metrics
   */
  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - PERFORMANCE_CONFIG.retentionPeriod;

    try {
      // Clean metrics
      const metricsData = this.storage.getItem(STORAGE_KEYS.metrics);
      if (metricsData) {
        const metrics = JSON.parse(metricsData);
        if (metrics.lastUpdate < cutoff) {
          this.storage.removeItem(STORAGE_KEYS.metrics);
        }
      }

      // Clean alerts
      const alertsData = this.storage.getItem(STORAGE_KEYS.alerts);
      if (alertsData) {
        const alerts = JSON.parse(alertsData);
        const filtered = alerts.filter((alert: PerformanceAlert) =>
          alert.timestamp > cutoff
        );
        this.storage.setItem(STORAGE_KEYS.alerts, JSON.stringify(filtered));
      }
    } catch (e) {
      console.debug('Failed to cleanup old metrics:', e);
    }
  }

  /**
   * Destroy tracker and clean up
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.saveMetrics();
  }
}

// Export singleton instance
let trackerInstance: PerformanceTracker | null = null;

export function getPerformanceTracker(): PerformanceTracker {
  if (!trackerInstance) {
    trackerInstance = new PerformanceTracker();
  }
  return trackerInstance;
}