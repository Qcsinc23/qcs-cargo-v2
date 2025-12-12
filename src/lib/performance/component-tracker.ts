import { browser } from '$app/environment';
import { getPerformanceTracker } from './tracker';
import { shouldExcludeComponent, debounce } from './utils';
import { onDestroy, onMount } from 'svelte';

/**
 * Track component performance in Svelte
 * Returns an object with methods to control tracking
 */
export function trackComponent(
  componentName: string,
  options: {
    trackMount?: boolean;
    trackUpdates?: boolean;
    trackRerenders?: boolean;
    debounceTime?: number;
  } = {}
) {
  if (!browser || shouldExcludeComponent(componentName)) {
    return {
      trackUpdate: () => {},
      trackRerender: () => {},
      endTracking: () => {},
    };
  }

  const tracker = getPerformanceTracker();
  const {
    trackMount = true,
    trackUpdates = true,
    trackRerenders = true,
    debounceTime = 100,
  } = options;

  const renderTracking = tracker.trackComponentRender(componentName);
  let updateCount = 0;
  let startTime: number;
  let mounted = false;

  // Debounced update tracking
  const debouncedUpdate = debounce(() => {
    if (trackUpdates && mounted) {
      updateCount++;
      console.debug(`[Performance] Component ${componentName} updated ${updateCount} times`);
    }
  }, debounceTime);

  // Track initial mount
  if (trackMount) {
    onMount(() => {
      startTime = performance.now();
      renderTracking.start();
      mounted = true;

      // Use requestAnimationFrame to measure after DOM update
      requestAnimationFrame(() => {
        renderTracking.end();
      });
    });
  }

  // Clean up on destroy
  onDestroy(() => {
    mounted = false;
    const endTime = performance.now();
    const lifeTime = endTime - startTime;

    console.debug(
      `[Performance] Component ${componentName} destroyed after ${lifeTime.toFixed(2)}ms with ${updateCount} updates`
    );
  });

  return {
    trackUpdate: debouncedUpdate,
    trackRerender: () => {
      if (trackRerenders) {
        const start = performance.now();
        return () => {
          const duration = performance.now() - start;
          console.debug(`[Performance] Component ${componentName} rerender took ${duration.toFixed(2)}ms`);
        };
      }
      return () => {};
    },
    endTracking: () => {
      if (mounted) {
        renderTracking.end();
      }
    },
  };
}

/**
 * Create a Svelte action for component performance tracking
 */
export function createPerformanceAction(componentName: string) {
  return function performanceAction(node: HTMLElement) {
    if (!browser || shouldExcludeComponent(componentName)) {
      return {};
    }

    const tracker = getPerformanceTracker();
    const renderTracking = tracker.trackComponentRender(componentName);
    const startTime = performance.now();

    // Track initial render
    renderTracking.start();

    // Use MutationObserver to track DOM updates
    let updateTimeout: ReturnType<typeof setTimeout>;
    const observer = new MutationObserver(() => {
      clearTimeout(updateTimeout);
      updateTimeout = setTimeout(() => {
        console.debug(`[Performance] Component ${componentName} DOM updated`);
      }, 50);
    });

    observer.observe(node, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
    });

    // Measure render time
    requestAnimationFrame(() => {
      renderTracking.end();
    });

    return {
      update() {
        // Component is updating
        console.debug(`[Performance] Component ${componentName} updating`);
      },
      destroy() {
        // Component is destroyed
        observer.disconnect();
        clearTimeout(updateTimeout);
        const totalTime = performance.now() - startTime;
        console.debug(`[Performance] Component ${componentName} total lifetime: ${totalTime.toFixed(2)}ms`);
      },
    };
  };
}

/**
 * Higher-order component wrapper for performance tracking
 */
export function withPerformanceTracking<T extends Record<string, any>>(
  component: T,
  componentName?: string
) {
  const name = componentName || component.name || 'AnonymousComponent';

  // Wrap component methods
  const wrappedComponent: any = { ...component };

  // Wrap $$render if it exists (Svelte internal)
  if (typeof wrappedComponent.$$render === 'function') {
    const originalRender = wrappedComponent.$$render;
    wrappedComponent.$$render = function (...args: any[]) {
      const startTime = performance.now();
      const result = originalRender.apply(this, args);
      const duration = performance.now() - startTime;

      console.debug(`[Performance] Component ${name} render took ${duration.toFixed(2)}ms`);
      return result;
    };
  }

  return wrappedComponent as T;
}

/**
 * Track Svelte store performance
 */
export function trackStorePerformance<T>(
  store: { subscribe: (fn: (value: T) => void) => () => void },
  storeName: string
) {
  if (!browser) return store;

  let subscriptionCount = 0;
  let updateCount = 0;
  let lastUpdate = performance.now();

  const originalSubscribe = store.subscribe;

  store.subscribe = function (callback: (value: T) => void) {
    subscriptionCount++;
    console.debug(`[Performance] Store ${storeName} has ${subscriptionCount} subscribers`);

    const startTime = performance.now();
    const unsubscribe = originalSubscribe.call(store, (value: T) => {
      updateCount++;
      const now = performance.now();
      const timeSinceLastUpdate = now - lastUpdate;

      // Only log if enough time has passed
      if (timeSinceLastUpdate > 50) {
        const duration = now - startTime;
        console.debug(
          `[Performance] Store ${storeName} update took ${duration.toFixed(2)}ms, total updates: ${updateCount}`
        );
        lastUpdate = now;
      }

      callback(value);
    });

    return unsubscribe;
  };

  return store;
}

/**
 * Measure component render time with performance marks
 */
export function measureComponentRender(componentName: string) {
  if (!browser) return () => {};

  const startMark = `${componentName}_render_start`;
  const endMark = `${componentName}_render_end`;
  const measureName = `${componentName}_render_duration`;

  performance.mark(startMark);

  return function endMeasure() {
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);

    const measures = performance.getEntriesByName(measureName, 'measure');
    if (measures.length > 0) {
      const duration = measures[measures.length - 1].duration;
      console.debug(`[Performance] Component ${componentName} render: ${duration.toFixed(2)}ms`);
    }

    // Clean up marks and measures
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
  };
}

/**
 * Create a reactive performance tracker for Svelte components
 */
export function createReactiveTracker(componentName: string) {
  if (!browser) {
    return {
      track: () => {},
      getStats: () => ({ renderCount: 0, averageRenderTime: 0 }),
    };
  }

  const stats = {
    renderCount: 0,
    totalRenderTime: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  };

  return {
    track: () => {
      const startTime = performance.now();
      stats.renderCount++;

      return () => {
        const duration = performance.now() - startTime;
        stats.totalRenderTime += duration;
        stats.lastRenderTime = duration;
        stats.averageRenderTime = stats.totalRenderTime / stats.renderCount;

        console.debug(
          `[Performance] ${componentName}: Render #${stats.renderCount}, ` +
          `Duration: ${duration.toFixed(2)}ms, Average: ${stats.averageRenderTime.toFixed(2)}ms`
        );
      };
    },
    getStats: () => ({ ...stats }),
  };
}

/**
 * Component performance profiler
 */
export class ComponentProfiler {
  private components: Map<string, any> = new Map();

  constructor(private enabled: boolean = import.meta.env.DEV) {}

  startProfile(componentName: string) {
    if (!this.enabled) return;

    const profile = {
      componentName,
      startTime: performance.now(),
      renderCount: 0,
      renderTimes: [],
      mountTime: 0,
      unmountTime: 0,
    };

    this.components.set(componentName, profile);
  }

  endRender(componentName: string) {
    if (!this.enabled) return;

    const profile = this.components.get(componentName);
    if (profile) {
      const renderTime = performance.now() - profile.startTime;
      profile.renderTimes.push(renderTime);
      profile.renderCount++;
      profile.startTime = performance.now(); // Reset for next render
    }
  }

  setMountTime(componentName: string) {
    if (!this.enabled) return;

    const profile = this.components.get(componentName);
    if (profile) {
      profile.mountTime = performance.now();
    }
  }

  setUnmountTime(componentName: string) {
    if (!this.enabled) return;

    const profile = this.components.get(componentName);
    if (profile) {
      profile.unmountTime = performance.now();
      const lifetime = profile.unmountTime - profile.mountTime;
      console.debug(
        `[Performance Profile] ${componentName}:`,
        `Lifetime: ${lifetime.toFixed(2)}ms,`,
        `Renders: ${profile.renderCount},`,
        `Avg Render: ${profile.renderTimes.length > 0 ? (profile.renderTimes.reduce((a: number, b: number) => a + b, 0) / profile.renderTimes.length).toFixed(2) : 0}ms`
      );
    }
  }

  getReport() {
    const report: Record<string, any> = {};
    this.components.forEach((profile, name) => {
      report[name] = {
        renderCount: profile.renderCount,
        averageRenderTime: profile.renderTimes.length > 0
          ? profile.renderTimes.reduce((a: number, b: number) => a + b, 0) / profile.renderTimes.length
          : 0,
        totalRenderTime: profile.renderTimes.reduce((a: number, b: number) => a + b, 0),
        maxRenderTime: Math.max(...profile.renderTimes, 0),
        minRenderTime: Math.min(...profile.renderTimes, 0),
        lifetime: profile.unmountTime - profile.mountTime,
      };
    });
    return report;
  }
}

// Global profiler instance
export const componentProfiler = new ComponentProfiler();