import type {
  PerformanceReport,
  PerformanceAlert,
  CoreWebVitals,
  PerformanceSession
} from './types';
import { PERFORMANCE_CONFIG, STORAGE_KEYS } from './config';
import { calculatePerformanceScore, getPerformanceRating } from './utils';

export class MetricsService {
  private storage: Storage;
  private subscribers: Map<string, ((data: any) => void)[]> = new Map();

  constructor() {
    this.storage = window.localStorage;
    this.initializeStorage();
  }

  /**
   * Initialize storage with default values if needed
   */
  private initializeStorage(): void {
    if (!this.storage.getItem(STORAGE_KEYS.metrics)) {
      this.storage.setItem(STORAGE_KEYS.metrics, JSON.stringify({}));
    }
    if (!this.storage.getItem(STORAGE_KEYS.alerts)) {
      this.storage.setItem(STORAGE_KEYS.alerts, JSON.stringify([]));
    }
  }

  /**
   * Store performance report
   */
  storeReport(report: PerformanceReport): void {
    try {
      const reports = this.getAllReports();
      reports.push(report);

      // Keep only recent reports
      if (reports.length > PERFORMANCE_CONFIG.maxStoredMetrics) {
        reports.splice(0, reports.length - PERFORMANCE_CONFIG.maxStoredMetrics);
      }

      this.storage.setItem(STORAGE_KEYS.metrics, JSON.stringify({
        reports,
        lastUpdate: Date.now(),
      }));

      this.notifySubscribers('reports', reports);
    } catch (e) {
      console.error('Failed to store performance report:', e);
    }
  }

  /**
   * Get all stored performance reports
   */
  getAllReports(): PerformanceReport[] {
    try {
      const data = this.storage.getItem(STORAGE_KEYS.metrics);
      if (data) {
        const parsed = JSON.parse(data);
        return parsed.reports || [];
      }
    } catch (e) {
      console.error('Failed to load performance reports:', e);
    }
    return [];
  }

  /**
   * Get reports for a specific time period
   */
  getReportsByTimeRange(startTime: number, endTime: number): PerformanceReport[] {
    const reports = this.getAllReports();
    return reports.filter(report =>
      report.timestamp >= startTime && report.timestamp <= endTime
    );
  }

  /**
   * Get reports for a specific route
   */
  getReportsByRoute(route: string): PerformanceReport[] {
    const reports = this.getAllReports();
    return reports.filter(report => report.route === route);
  }

  /**
   * Get latest performance report
   */
  getLatestReport(): PerformanceReport | null {
    const reports = this.getAllReports();
    return reports[reports.length - 1] || null;
  }

  /**
   * Store performance alert
   */
  storeAlert(alert: PerformanceAlert): void {
    try {
      const alerts = this.getAllAlerts();
      alerts.push(alert);

      // Keep only recent alerts
      if (alerts.length > 100) {
        alerts.splice(0, alerts.length - 100);
      }

      this.storage.setItem(STORAGE_KEYS.alerts, JSON.stringify(alerts));
      this.notifySubscribers('alerts', alerts);
    } catch (e) {
      console.error('Failed to store performance alert:', e);
    }
  }

  /**
   * Get all stored alerts
   */
  getAllAlerts(): PerformanceAlert[] {
    try {
      const data = this.storage.getItem(STORAGE_KEYS.alerts);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load performance alerts:', e);
    }
    return [];
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: PerformanceAlert['severity']): PerformanceAlert[] {
    const alerts = this.getAllAlerts();
    return alerts.filter(alert => alert.severity === severity);
  }

  /**
   * Get alerts by type
   */
  getAlertsByType(type: PerformanceAlert['type']): PerformanceAlert[] {
    const alerts = this.getAllAlerts();
    return alerts.filter(alert => alert.type === type);
  }

  /**
   * Get alerts from the last 24 hours
   */
  getRecentAlerts(hours: number = 24): PerformanceAlert[] {
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    const alerts = this.getAllAlerts();
    return alerts.filter(alert => alert.timestamp >= cutoff);
  }

  /**
   * Calculate performance analytics
   */
  getAnalytics(): {
    averageScore: number;
    scoreTrend: 'improving' | 'stable' | 'degrading';
    slowestRoutes: Array<{ route: string; averageLoadTime: number }>;
    slowestAPIs: Array<{ endpoint: string; averageResponseTime: number; callCount: number }>;
    topAlerts: PerformanceAlert[];
    vitalsAverages: CoreWebVitals;
    recommendations: string[];
  } {
    const reports = this.getAllReports();
    const alerts = this.getAllAlerts();

    // Calculate average score
    const scores = reports.map(r => r.score);
    const averageScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;

    // Calculate score trend
    let scoreTrend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (scores.length >= 10) {
      const recent = scores.slice(-5);
      const older = scores.slice(-10, -5);
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

      if (recentAvg > olderAvg + 5) scoreTrend = 'improving';
      else if (recentAvg < olderAvg - 5) scoreTrend = 'degrading';
    }

    // Find slowest routes
    const routeTimes = new Map<string, number[]>();
    reports.forEach(report => {
      if (!routeTimes.has(report.route)) {
        routeTimes.set(report.route, []);
      }
      routeTimes.get(report.route)!.push(report.navigation.loadEventEnd - report.navigation.navigationStart);
    });

    const slowestRoutes = Array.from(routeTimes.entries())
      .map(([route, times]) => ({
        route,
        averageLoadTime: times.reduce((a, b) => a + b, 0) / times.length
      }))
      .sort((a, b) => b.averageLoadTime - a.averageLoadTime)
      .slice(0, 5);

    // Find slowest APIs
    const apiTimes = new Map<string, { times: number[]; count: number }>();
    reports.forEach(report => {
      report.apis.forEach(api => {
        if (!apiTimes.has(api.endpoint)) {
          apiTimes.set(api.endpoint, { times: [], count: 0 });
        }
        const data = apiTimes.get(api.endpoint)!;
        data.times.push(api.duration);
        data.count++;
      });
    });

    const slowestAPIs = Array.from(apiTimes.entries())
      .map(([endpoint, data]) => ({
        endpoint,
        averageResponseTime: data.times.reduce((a, b) => a + b, 0) / data.times.length,
        callCount: data.count
      }))
      .sort((a, b) => b.averageResponseTime - a.averageResponseTime)
      .slice(0, 5);

    // Get top alerts
    const topAlerts = alerts
      .sort((a, b) => {
        const severityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
        const aWeight = severityWeight[a.severity];
        const bWeight = severityWeight[b.severity];
        if (aWeight !== bWeight) return bWeight - aWeight;
        return b.timestamp - a.timestamp;
      })
      .slice(0, 10);

    // Calculate vitals averages
    const vitalsAverages: CoreWebVitals = {
      lcp: this.averageVital(reports, 'lcp'),
      fid: this.averageVital(reports, 'fid'),
      cls: this.averageVital(reports, 'cls'),
      fcp: this.averageVital(reports, 'fcp'),
      ttfb: this.averageVital(reports, 'ttfb'),
    };

    // Generate recommendations
    const recommendations = this.generateRecommendations(vitalsAverages, slowestRoutes, slowestAPIs, topAlerts);

    return {
      averageScore,
      scoreTrend,
      slowestRoutes,
      slowestAPIs,
      topAlerts,
      vitalsAverages,
      recommendations
    };
  }

  /**
   * Calculate average for a specific vital
   */
  private averageVital(reports: PerformanceReport[], vital: keyof CoreWebVitals): number {
    const values = reports.map(r => r.vitals[vital]).filter(v => v > 0);
    return values.length > 0
      ? values.reduce((a, b) => a + b, 0) / values.length
      : 0;
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    vitals: CoreWebVitals,
    slowestRoutes: Array<{ route: string; averageLoadTime: number }>,
    slowestAPIs: Array<{ endpoint: string; averageResponseTime: number }>,
    alerts: PerformanceAlert[]
  ): string[] {
    const recommendations: string[] = [];

    // Core Web Vitals recommendations
    if (vitals.lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint by optimizing images and server response times');
    }
    if (vitals.fid > 100) {
      recommendations.push('Reduce First Input Delay by minimizing JavaScript execution time');
    }
    if (vitals.cls > 0.1) {
      recommendations.push('Improve Cumulative Layout Shift by ensuring proper dimensions for media and ads');
    }
    if (vitals.fcp > 1800) {
      recommendations.push('Speed up First Contentful Paint by reducing server response time and render-blocking resources');
    }
    if (vitals.ttfb > 800) {
      recommendations.push('Reduce Time to First Byte by optimizing server performance and CDN usage');
    }

    // Route performance recommendations
    slowestRoutes.slice(0, 3).forEach(route => {
      recommendations.push(`Optimize ${route.route} page - average load time is ${Math.round(route.averageLoadTime)}ms`);
    });

    // API performance recommendations
    slowestAPIs.slice(0, 3).forEach(api => {
      recommendations.push(`Optimize ${api.endpoint} API - average response time is ${Math.round(api.averageResponseTime)}ms`);
    });

    // Alert-based recommendations
    const errorAlerts = alerts.filter(a => a.type === 'error');
    if (errorAlerts.length > 5) {
      recommendations.push('Address frequent errors to improve user experience');
    }

    const budgetAlerts = alerts.filter(a => a.type === 'budget');
    if (budgetAlerts.length > 10) {
      recommendations.push('Multiple performance budgets exceeded - prioritize critical performance improvements');
    }

    // If everything looks good
    if (recommendations.length === 0) {
      recommendations.push('Performance is excellent! Consider setting more ambitious performance goals');
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): {
    reports: PerformanceReport[];
    alerts: PerformanceAlert[];
    analytics: ReturnType<MetricsService['getAnalytics']>;
  } {
    return {
      reports: this.getAllReports(),
      alerts: this.getAllAlerts(),
      analytics: this.getAnalytics()
    };
  }

  /**
   * Clear all stored metrics
   */
  clearMetrics(): void {
    this.storage.removeItem(STORAGE_KEYS.metrics);
    this.storage.removeItem(STORAGE_KEYS.alerts);
    this.storage.removeItem(STORAGE_KEYS.session);
    this.initializeStorage();
    this.notifySubscribers('reports', []);
    this.notifySubscribers('alerts', []);
  }

  /**
   * Subscribe to metric updates
   */
  subscribe(event: 'reports' | 'alerts', callback: (data: any) => void): () => void {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Notify subscribers of updates
   */
  private notifySubscribers(event: string, data: any): void {
    const callbacks = this.subscribers.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error('Error in metric subscriber callback:', e);
        }
      });
    }
  }
}

// Export singleton instance
let metricsServiceInstance: MetricsService | null = null;

export function getMetricsService(): MetricsService {
  if (!metricsServiceInstance) {
    metricsServiceInstance = new MetricsService();
  }
  return metricsServiceInstance;
}