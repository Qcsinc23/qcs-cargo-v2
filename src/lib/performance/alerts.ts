import type { PerformanceAlert, CoreWebVitals, PerformanceBudget } from './types';
import { PERFORMANCE_CONFIG, ALERT_MESSAGES, STORAGE_KEYS } from './config';
import { getMetricsService } from './metrics-service';
import { calculatePerformanceScore } from './utils';

export class PerformanceAlerts {
  private alerts: PerformanceAlert[] = [];
  private budgets: PerformanceBudget;
  private thresholds: Map<string, number[]> = new Map();
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.budgets = { ...PERFORMANCE_CONFIG.budget };
    this.initializeThresholds();
    this.loadStoredAlerts();
    this.startPeriodicChecks();
  }

  /**
   * Initialize thresholds for different alert levels
   */
  private initializeThresholds(): void {
    // Core Web Vitals thresholds
    this.thresholds.set('lcp', [
      this.budgets.lcp, // Warning
      this.budgets.lcp * 1.5, // Critical
    ]);

    this.thresholds.set('fid', [
      this.budgets.fid, // Warning
      this.budgets.fid * 2, // Critical
    ]);

    this.thresholds.set('cls', [
      this.budgets.cls, // Warning
      this.budgets.cls * 2, // Critical
    ]);

    this.thresholds.set('fcp', [
      this.budgets.fcp, // Warning
      this.budgets.fcp * 1.5, // Critical
    ]);

    this.thresholds.set('ttfb', [
      this.budgets.ttfb, // Warning
      this.budgets.ttfb * 2, // Critical
    ]);

    // API thresholds
    this.thresholds.set('apiResponseTime', [
      this.budgets.apiResponseTime, // Warning
      this.budgets.apiResponseTime * 2, // Critical
    ]);

    // Error thresholds
    this.thresholds.set('errorCount', [
      5, // Warning: 5 errors
      10, // Critical: 10 errors
    ]);

    // Memory thresholds (percentage of heap limit)
    this.thresholds.set('memoryUsage', [
      0.7, // Warning: 70%
      0.9, // Critical: 90%
    ]);
  }

  /**
   * Load stored alerts from localStorage
   */
  private loadStoredAlerts(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.alerts);
      if (stored) {
        this.alerts = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load alerts:', e);
    }
  }

  /**
   * Save alerts to localStorage
   */
  private saveAlerts(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(this.alerts));
      const metricsService = getMetricsService();
      metricsService.storeAlert(this.alerts[this.alerts.length - 1]);
    } catch (e) {
      console.error('Failed to save alerts:', e);
    }
  }

  /**
   * Start periodic checks for performance issues
   */
  private startPeriodicChecks(): void {
    this.checkInterval = setInterval(() => {
      this.runPerformanceChecks();
    }, PERFORMANCE_CONFIG.alertCheckInterval);
  }

  /**
   * Run all performance checks
   */
  private async runPerformanceChecks(): Promise<void> {
    // Check Core Web Vitals
    this.checkCoreWebVitals();

    // Check memory usage
    this.checkMemoryUsage();

    // Check bundle size
    this.checkBundleSize();

    // Check for performance degradation
    this.checkPerformanceDegradation();
  }

  /**
   * Check Core Web Vitals against budgets
   */
  private checkCoreWebVitals(): void {
    const vitals = this.getCurrentVitals();
    if (!vitals) return;

    Object.entries(vitals).forEach(([metric, value]) => {
      const thresholds = this.thresholds.get(metric);
      if (thresholds) {
        if (value > thresholds[1]) {
          this.createBudgetAlert(metric as keyof CoreWebVitals, value, 'critical');
        } else if (value > thresholds[0]) {
          this.createBudgetAlert(metric as keyof CoreWebVitals, value, 'high');
        }
      }
    });
  }

  /**
   * Get current Core Web Vitals from Performance API
   */
  private getCurrentVitals(): Partial<CoreWebVitals> | null {
    const vitals: Partial<CoreWebVitals> = {};

    // Try to get vitals from Navigation Timing API
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      vitals.fcp = navEntry.loadEventEnd - navEntry.loadEventStart;
      vitals.ttfb = navEntry.responseStart - navEntry.requestStart;
    }

    // These need to be tracked separately
    return Object.keys(vitals).length > 0 ? vitals : null;
  }

  /**
   * Create a budget alert
   */
  private createBudgetAlert(
    metric: keyof CoreWebVitals | string,
    value: number,
    severity: 'medium' | 'high' | 'critical'
  ): void {
    // Check if we already have a recent alert for this metric
    const recentAlert = this.alerts.find(
      alert => alert.metric === metric &&
      alert.type === 'budget' &&
      Date.now() - alert.timestamp < 60000 // Within last minute
    );

    if (recentAlert) return;

    const alert: PerformanceAlert = {
      id: `budget_${metric}_${Date.now()}`,
      type: 'budget',
      metric,
      currentValue: value,
      threshold: this.budgets[metric as keyof PerformanceBudget] || 0,
      severity,
      message: ALERT_MESSAGES.budget[metric as keyof typeof ALERT_MESSAGES.budget] ||
               `${metric} exceeds budget`,
      timestamp: Date.now(),
    };

    this.addAlert(alert);
  }

  /**
   * Check memory usage
   */
  private checkMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usageRatio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      const thresholds = this.thresholds.get('memoryUsage');

      if (thresholds) {
        if (usageRatio > thresholds[1]) {
          this.createMemoryAlert(usageRatio, 'critical');
        } else if (usageRatio > thresholds[0]) {
          this.createMemoryAlert(usageRatio, 'high');
        }
      }
    }
  }

  /**
   * Create memory usage alert
   */
  private createMemoryAlert(usageRatio: number, severity: 'high' | 'critical'): void {
    const alert: PerformanceAlert = {
      id: `memory_${Date.now()}`,
      type: 'warning',
      metric: 'memory',
      currentValue: usageRatio,
      threshold: 0.8,
      severity,
      message: `High memory usage: ${(usageRatio * 100).toFixed(1)}% of heap limit`,
      timestamp: Date.now(),
    };

    this.addAlert(alert);
  }

  /**
   * Check bundle size
   */
  private checkBundleSize(): void {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    let totalSize = 0;

    resources.forEach(resource => {
      if (resource.name.includes('.js') || resource.name.includes('.css')) {
        totalSize += resource.transferSize || resource.encodedBodySize || 0;
      }
    });

    if (totalSize > this.budgets.bundleSize) {
      const severity = totalSize > this.budgets.bundleSize * 1.5 ? 'critical' : 'high';
      this.createBundleSizeAlert(totalSize, severity);
    }
  }

  /**
   * Create bundle size alert
   */
  private createBundleSizeAlert(size: number, severity: 'high' | 'critical'): void {
    const alert: PerformanceAlert = {
      id: `bundle_${Date.now()}`,
      type: 'budget',
      metric: 'bundleSize',
      currentValue: size,
      threshold: this.budgets.bundleSize,
      severity,
      message: `Bundle size ${(size / 1024).toFixed(1)}KB exceeds budget`,
      timestamp: Date.now(),
    };

    this.addAlert(alert);
  }

  /**
   * Check for performance degradation over time
   */
  private checkPerformanceDegradation(): void {
    const metricsService = getMetricsService();
    const reports = metricsService.getReportsByTimeRange(
      Date.now() - 300000, // Last 5 minutes
      Date.now()
    );

    if (reports.length < 2) return;

    const reportsWithScore = reports as Array<{ score: number }>;

    // Compare recent average with older average
    const recentReports = reportsWithScore.slice(-5);
    const olderReports = reportsWithScore.slice(0, -5);

    const recentScore =
      recentReports.reduce((sum: number, r) => sum + r.score, 0) / recentReports.length;
    const olderScore =
      olderReports.reduce((sum: number, r) => sum + r.score, 0) / olderReports.length;

    const scoreDiff = olderScore - recentScore;

    if (scoreDiff > 20) {
      this.createDegradationAlert('Performance score degraded significantly', 'critical');
    } else if (scoreDiff > 10) {
      this.createDegradationAlert('Performance score degraded', 'high');
    }
  }

  /**
   * Create degradation alert
   */
  private createDegradationAlert(message: string, severity: 'high' | 'critical'): void {
    const alert: PerformanceAlert = {
      id: `degradation_${Date.now()}`,
      type: 'degradation',
      metric: 'performance',
      currentValue: 0,
      threshold: 0,
      severity,
      message,
      timestamp: Date.now(),
    };

    this.addAlert(alert);
  }

  /**
   * Add alert to the list
   */
  private addAlert(alert: PerformanceAlert): void {
    this.alerts.push(alert);

    // Keep only recent alerts (last 100)
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    this.saveAlerts();
    this.notifyAlert(alert);
  }

  /**
   * Notify about new alert
   */
  private notifyAlert(alert: PerformanceAlert): void {
    // Log in development
    if (import.meta.env.DEV) {
      console.warn(`[Performance Alert]`, alert);
    }

    // TODO: Send to monitoring service
    // TODO: Show toast notification for critical alerts
  }

  /**
   * Create custom alert
   */
  public createCustomAlert(alert: Omit<PerformanceAlert, 'id' | 'timestamp'>): void {
    const fullAlert: PerformanceAlert = {
      ...alert,
      id: `custom_${Date.now()}`,
      timestamp: Date.now(),
    };

    this.addAlert(fullAlert);
  }

  /**
   * Get all alerts
   */
  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Get alerts by severity
   */
  public getAlertsBySeverity(severity: PerformanceAlert['severity']): PerformanceAlert[] {
    return this.alerts.filter(alert => alert.severity === severity);
  }

  /**
   * Get alerts by type
   */
  public getAlertsByType(type: PerformanceAlert['type']): PerformanceAlert[] {
    return this.alerts.filter(alert => alert.type === type);
  }

  /**
   * Get recent alerts
   */
  public getRecentAlerts(minutes: number = 60): PerformanceAlert[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.alerts.filter(alert => alert.timestamp >= cutoff);
  }

  /**
   * Dismiss an alert
   */
  public dismissAlert(alertId: string): void {
    const index = this.alerts.findIndex(alert => alert.id === alertId);
    if (index > -1) {
      this.alerts.splice(index, 1);
      this.saveAlerts();
    }
  }

  /**
   * Clear all alerts
   */
  public clearAllAlerts(): void {
    this.alerts = [];
    this.saveAlerts();
  }

  /**
   * Update budget thresholds
   */
  public updateBudget(newBudget: Partial<PerformanceBudget>): void {
    this.budgets = { ...this.budgets, ...newBudget };
    this.initializeThresholds();
  }

  /**
   * Get current budget
   */
  public getBudget(): PerformanceBudget {
    return { ...this.budgets };
  }

  /**
   * Get alert summary
   */
  public getAlertSummary(): {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    byType: Record<string, number>;
  } {
    const summary = {
      total: this.alerts.length,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      byType: {} as Record<string, number>,
    };

    this.alerts.forEach(alert => {
      summary[alert.severity]++;
      summary.byType[alert.type] = (summary.byType[alert.type] || 0) + 1;
    });

    return summary;
  }

  /**
   * Destroy alerts manager
   */
  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.saveAlerts();
  }
}

// Singleton instance
let alertsInstance: PerformanceAlerts | null = null;

export function getPerformanceAlerts(): PerformanceAlerts {
  if (!alertsInstance) {
    alertsInstance = new PerformanceAlerts();
  }
  return alertsInstance;
}