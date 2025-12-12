import { getPerformanceTracker } from './tracker';
import { getMetricsService } from './metrics-service';
import { shouldExcludeRoute } from './utils';
import { browser } from '$app/environment';

/**
 * Initialize performance monitoring for SvelteKit
 */
export function initializePerformanceMonitoring() {
  if (!browser) return;

  const tracker = getPerformanceTracker();
  const metricsService = getMetricsService();

  // Store initial page load report
  setTimeout(() => {
    const report = tracker.generateReport();
    if (report) {
      metricsService.storeReport(report);
    }
  }, 5000); // Wait for vitals to be collected
}

/**
 * Create SvelteKit hooks for performance monitoring
 */
export function createPerformanceHooks() {
  return {
    /**
     * Handle page navigation
     */
    handleNavigation: (url: URL) => {
      const tracker = getPerformanceTracker();

      if (!shouldExcludeRoute(url.pathname)) {
        // Navigation is tracked automatically by the PerformanceObserver
        // But we can add custom logic here if needed
        console.debug(`[Performance] Navigating to: ${url.pathname}`);
      }
    },

    /**
     * Handle fetch requests
     */
    handleFetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const tracker = getPerformanceTracker();
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

      // Extract endpoint (remove origin)
      const endpoint = url.replace(window.location.origin, '');
      const method = init?.method || 'GET';

      return tracker.trackAPIRequest(endpoint, method);
    },

    /**
     * Handle route changes
     */
    handleRouteChange: (from: string, to: string) => {
      const tracker = getPerformanceTracker();

      if (!shouldExcludeRoute(to)) {
        // Store report after route change completes
        setTimeout(() => {
          const report = tracker.generateReport();
          if (report) {
            const metricsService = getMetricsService();
            metricsService.storeReport(report);
          }
        }, 2000);
      }
    }
  };
}

/**
 * Wrap fetch with performance tracking
 */
export function createTrackedFetch() {
  const hooks = createPerformanceHooks();

  return async function trackedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const tracking = hooks.handleFetch(input, init);
    tracking.start();

    try {
      const response = await fetch(input, init);
      const success = response.ok;
      const status = response.status;
      let size: number | undefined;

      // Try to get response size
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        size = parseInt(contentLength, 10);
      }

      tracking.end(status, success, size);
      return response;
    } catch (error) {
      tracking.end(0, false);
      throw error;
    }
  };
}

/**
 * Create performance-aware SvelteKit load function wrapper
 */
export function createTrackedLoad<TArgs, TResult>(
  load: (args: TArgs) => TResult | Promise<TResult>
) {
  return async function trackedLoad(args: TArgs): Promise<TResult> {
    const startTime = performance.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyArgs = args as any;
    const route = anyArgs.route?.id || anyArgs.url?.pathname || 'unknown';

    try {
      const result = await load(args);
      const endTime = performance.now();

      console.debug(`[Performance] Load function for ${route} took ${endTime - startTime}ms`);

      return result;
    } catch (error) {
      const tracker = getPerformanceTracker();
      tracker.trackError(error as Error, `Load function: ${route}`);
      throw error;
    }
  };
}

/**
 * Track component lifecycle for performance
 */
export function trackComponentPerformance(componentName: string) {
  if (!browser) {
    return {
      onMount: () => {},
      onDestroy: () => {},
      onUpdate: () => {}
    };
  }

  const tracker = getPerformanceTracker();
  const renderTracking = tracker.trackComponentRender(componentName);
  let mountTime: number;

  return {
    onMount: () => {
      renderTracking.start();
      mountTime = performance.now();
    },
    onDestroy: () => {
      const unmountTime = performance.now();
      const lifeTime = unmountTime - mountTime;
      console.debug(`[Performance] Component ${componentName} lived for ${lifeTime}ms`);
    },
    onUpdate: () => {
      const updateTime = performance.now();
      console.debug(`[Performance] Component ${componentName} updated at ${updateTime}ms`);
    }
  };
}

/**
 * Create a Svelte action for performance tracking
 */
export function trackElement(node: HTMLElement, elementType: string = 'element') {
  if (!browser) return {};

  const tracker = getPerformanceTracker();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const lazyTracking = tracker.trackLazyLoading(
          elementType,
          `#${node.id || '.' + Array.from(node.classList).join('.') || elementType}`
        );
        lazyTracking.onIntersection();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}

/**
 * Track page visibility changes
 */
export function trackPageVisibility() {
  if (!browser) return { destroy: () => {} };

  let hiddenTime: number;
  let visibilityStart = performance.now();

  const handleVisibilityChange = () => {
    if (document.hidden) {
      hiddenTime = performance.now();
    } else {
      const hiddenDuration = performance.now() - hiddenTime;
      visibilityStart = performance.now();

      if (hiddenDuration > 60000) { // Page was hidden for more than a minute
        console.debug(`[Performance] Page was hidden for ${hiddenDuration}ms`);

        // Refresh tracking when page becomes visible again
        const tracker = getPerformanceTracker();
        const report = tracker.generateReport();
        if (report) {
          const metricsService = getMetricsService();
          metricsService.storeReport(report);
        }
      }
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);

  return {
    destroy() {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  };
}

/**
 * Initialize all SvelteKit performance integrations
 */
export function initializeSvelteKitPerformance() {
  if (!browser) return;

  // Initialize base performance monitoring
  initializePerformanceMonitoring();

  // Track page visibility
  const visibilityTracker = trackPageVisibility();

  // Override fetch globally for API tracking
  const originalFetch = window.fetch;
  const trackedFetch = createTrackedFetch();
  window.fetch = trackedFetch as typeof fetch;

  // Track error events
  const handleError = (event: ErrorEvent) => {
    const tracker = getPerformanceTracker();
    tracker.trackError(event.error || new Error(event.message), 'Global error');
  };

  window.addEventListener('error', handleError);

  // Track unhandled promise rejections
  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const tracker = getPerformanceTracker();
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    tracker.trackError(error, 'Unhandled promise rejection');
  };

  window.addEventListener('unhandledrejection', handleUnhandledRejection);

  // Return cleanup function
  return function cleanup() {
    visibilityTracker.destroy();
    window.fetch = originalFetch;
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  };
}