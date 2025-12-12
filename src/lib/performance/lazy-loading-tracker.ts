import type { LazyLoadingMetrics } from './types';
import { getPerformanceTracker } from './tracker';
import { browser } from '$app/environment';

export interface LazyLoadingOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  delay?: number;
  trackSuccess?: boolean;
  trackFailure?: boolean;
}

export class LazyLoadingTracker {
  private loadingElements: Map<Element, {
    elementType: string;
    selector: string;
    startTime: number;
    intersectionTime?: number;
    options: LazyLoadingOptions;
    onLoad?: (success: boolean, metrics: LazyLoadingMetrics) => void;
    observer: IntersectionObserver;
  }> = new Map();

  constructor() {
    // no-op; created per-element in trackLazyElement
  }

  /**
   * Track lazy loading for an element
   */
  public trackLazyElement(
    element: Element,
    elementType: string,
    options: LazyLoadingOptions = {},
    onLoad?: (success: boolean, metrics: LazyLoadingMetrics) => void
  ): void {
    if (!browser) return;

    const selector = this.getElementSelector(element);
    const mergedOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      delay: 0,
      trackSuccess: true,
      trackFailure: true,
      ...options,
    };

    // Create an observer with custom options if needed
    const observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: mergedOptions.root,
        rootMargin: mergedOptions.rootMargin,
        threshold: mergedOptions.threshold,
      }
    );

    this.loadingElements.set(element, {
      elementType,
      selector,
      startTime: performance.now(),
      options: mergedOptions,
      onLoad,
      observer,
    });

    observer.observe(element);
  }

  /**
   * Handle intersection events
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const elementData = this.loadingElements.get(entry.target);
        if (!elementData) return;

        const { elementType, selector, startTime, options, onLoad, observer } = elementData;

        // Record intersection time
        const intersectionTime = performance.now();
        elementData.intersectionTime = intersectionTime;

        // Setup load tracking
        this.setupLoadTracking(
          entry.target,
          elementType,
          selector,
          startTime,
          intersectionTime,
          options,
          onLoad
        );

        // Stop observing once in viewport
        observer.unobserve(entry.target);
        observer.disconnect();
      }
    });
  }

  /**
   * Setup load tracking for different element types
   */
  private setupLoadTracking(
    element: Element,
    elementType: string,
    selector: string,
    startTime: number,
    intersectionTime: number,
    options: LazyLoadingOptions,
    onLoad?: (success: boolean, metrics: LazyLoadingMetrics) => void
  ): void {
    const tracker = getPerformanceTracker();
    const lazyTracking = tracker.trackLazyLoading(elementType, selector);

    // Mark intersection time
    lazyTracking.onIntersection();

    // Handle different element types
    if (elementType === 'img' || elementType === 'image') {
      this.trackImageLoad(
        element as HTMLImageElement,
        lazyTracking,
        onLoad,
        options
      );
    } else if (elementType === 'script' || element.tagName.toLowerCase() === 'script') {
      this.trackScriptLoad(
        element as HTMLScriptElement,
        lazyTracking,
        onLoad,
        options
      );
    } else if (elementType === 'iframe' || element.tagName.toLowerCase() === 'iframe') {
      this.trackIframeLoad(
        element as HTMLIFrameElement,
        lazyTracking,
        onLoad,
        options
      );
    } else {
      // Generic element tracking
      this.trackGenericLoad(
        element,
        elementType,
        lazyTracking,
        onLoad,
        options
      );
    }
  }

  /**
   * Track image loading
   */
  private trackImageLoad(
    img: HTMLImageElement,
    lazyTracking: { onLoad: (success: boolean) => void },
    onLoad?: (success: boolean, metrics: LazyLoadingMetrics) => void,
    options: LazyLoadingOptions = {}
  ): void {
    const completeHandler = () => {
      lazyTracking.onLoad(true);
      if (options.trackSuccess && onLoad) {
        // Create metrics for callback
        const metrics = this.createMetrics(img, 'image');
        onLoad(true, metrics);
      }
      this.cleanup(img, completeHandler, errorHandler);
    };

    const errorHandler = () => {
      lazyTracking.onLoad(false);
      if (options.trackFailure && onLoad) {
        const metrics = this.createMetrics(img, 'image');
        onLoad(false, metrics);
      }
      this.cleanup(img, completeHandler, errorHandler);
    };

    img.addEventListener('load', completeHandler, { once: true });
    img.addEventListener('error', errorHandler, { once: true });

    // If already loaded
    if (img.complete && img.naturalHeight !== 0) {
      setTimeout(() => completeHandler(), options.delay || 0);
    }
  }

  /**
   * Track script loading
   */
  private trackScriptLoad(
    script: HTMLScriptElement,
    lazyTracking: { onLoad: (success: boolean) => void },
    onLoad?: (success: boolean, metrics: LazyLoadingMetrics) => void,
    options: LazyLoadingOptions = {}
  ): void {
    const loadHandler = () => {
      lazyTracking.onLoad(true);
      if (options.trackSuccess && onLoad) {
        const metrics = this.createMetrics(script, 'script');
        onLoad(true, metrics);
      }
      this.cleanup(script, loadHandler, errorHandler);
    };

    const errorHandler = () => {
      lazyTracking.onLoad(false);
      if (options.trackFailure && onLoad) {
        const metrics = this.createMetrics(script, 'script');
        onLoad(false, metrics);
      }
      this.cleanup(script, loadHandler, errorHandler);
    };

    script.addEventListener('load', loadHandler, { once: true });
    script.addEventListener('error', errorHandler, { once: true });

    // Check if already loaded
    const anyScript = script as any;
    if (anyScript.readyState === 'complete' || anyScript.readyState === 'loaded') {
      setTimeout(() => loadHandler(), options.delay || 0);
    }
  }

  /**
   * Track iframe loading
   */
  private trackIframeLoad(
    iframe: HTMLIFrameElement,
    lazyTracking: { onLoad: (success: boolean) => void },
    onLoad?: (success: boolean, metrics: LazyLoadingMetrics) => void,
    options: LazyLoadingOptions = {}
  ): void {
    const loadHandler = () => {
      lazyTracking.onLoad(true);
      if (options.trackSuccess && onLoad) {
        const metrics = this.createMetrics(iframe, 'iframe');
        onLoad(true, metrics);
      }
      this.cleanup(iframe, loadHandler, errorHandler);
    };

    const errorHandler = () => {
      lazyTracking.onLoad(false);
      if (options.trackFailure && onLoad) {
        const metrics = this.createMetrics(iframe, 'iframe');
        onLoad(false, metrics);
      }
      this.cleanup(iframe, loadHandler, errorHandler);
    };

    iframe.addEventListener('load', loadHandler, { once: true });
    iframe.addEventListener('error', errorHandler, { once: true });
  }

  /**
   * Track generic element loading (for Svelte components, etc.)
   */
  private trackGenericLoad(
    element: Element,
    elementType: string,
    lazyTracking: { onLoad: (success: boolean) => void },
    onLoad?: (success: boolean, metrics: LazyLoadingMetrics) => void,
    options: LazyLoadingOptions = {}
  ): void {
    // For generic elements, we use a timeout or mutation observer
    setTimeout(() => {
      const success = element.isConnected && element instanceof HTMLElement && element.offsetHeight > 0;
      lazyTracking.onLoad(success);

      if (onLoad) {
        const metrics = this.createMetrics(element, elementType);
        onLoad(success, metrics);
      }
    }, options.delay || 100);
  }

  /**
   * Create metrics object
   */
  private createMetrics(
    element: Element,
    elementType: string
  ): LazyLoadingMetrics {
    const elementData = this.loadingElements.get(element);
    if (!elementData) {
      return {
        elementType,
        loadTime: 0,
        intersectionTime: 0,
        elementSelector: this.getElementSelector(element),
        success: false,
      };
    }

    const loadTime = performance.now() - elementData.startTime;

    return {
      elementType,
      loadTime,
      intersectionTime: elementData.intersectionTime || 0,
      elementSelector: elementData.selector,
      success: true,
    };
  }

  /**
   * Get element selector for identification
   */
  private getElementSelector(element: Element): string {
    if (element.id) {
      return `#${element.id}`;
    }

    const classes = Array.from(element.classList);
    if (classes.length > 0) {
      return `.${classes.join('.')}`;
    }

    return element.tagName.toLowerCase();
  }

  /**
   * Clean up event listeners
   */
  private cleanup(
    element: Element,
    loadHandler?: EventListener,
    errorHandler?: EventListener
  ): void {
    this.loadingElements.delete(element);

    if (loadHandler) {
      element.removeEventListener('load', loadHandler);
    }
    if (errorHandler) {
      element.removeEventListener('error', errorHandler);
    }
  }

  /**
   * Get all lazy loading metrics
   */
  public getMetrics(): LazyLoadingMetrics[] {
    const tracker = getPerformanceTracker();
    return tracker.generateReport()?.lazyLoading || [];
  }

  /**
   * Get average load time by element type
   */
  public getAverageLoadTime(): Record<string, number> {
    const metrics = this.getMetrics();
    const times: Record<string, number[]> = {};

    metrics.forEach(metric => {
      if (!times[metric.elementType]) {
        times[metric.elementType] = [];
      }
      times[metric.elementType].push(metric.loadTime);
    });

    const averages: Record<string, number> = {};
    Object.entries(times).forEach(([type, timeArray]) => {
      averages[type] = timeArray.reduce((a, b) => a + b, 0) / timeArray.length;
    });

    return averages;
  }

  /**
   * Get success rate by element type
   */
  public getSuccessRate(): Record<string, number> {
    const metrics = this.getMetrics();
    const counts: Record<string, { success: number; total: number }> = {};

    metrics.forEach(metric => {
      if (!counts[metric.elementType]) {
        counts[metric.elementType] = { success: 0, total: 0 };
      }
      counts[metric.elementType].total++;
      if (metric.success) {
        counts[metric.elementType].success++;
      }
    });

    const rates: Record<string, number> = {};
    Object.entries(counts).forEach(([type, count]) => {
      rates[type] = (count.success / count.total) * 100;
    });

    return rates;
  }

  /**
   * Destroy the tracker
   */
  public destroy(): void {
    this.loadingElements.forEach((data) => data.observer.disconnect());
    this.loadingElements.clear();
  }
}

// Singleton instance
let lazyLoadingTrackerInstance: LazyLoadingTracker | null = null;

export function getLazyLoadingTracker(): LazyLoadingTracker {
  if (!lazyLoadingTrackerInstance && browser) {
    lazyLoadingTrackerInstance = new LazyLoadingTracker();
  }
  return lazyLoadingTrackerInstance || new LazyLoadingTracker();
}

/**
 * Svelte action for lazy loading performance tracking
 */
export function lazyLoadPerformance(
  element: HTMLElement,
  params: {
    type: string;
    options?: LazyLoadingOptions;
    onLoad?: (success: boolean, metrics: LazyLoadingMetrics) => void;
  }
) {
  const tracker = getLazyLoadingTracker();
  tracker.trackLazyElement(element, params.type, params.options, params.onLoad);

  return {
    destroy() {
      // Cleanup handled by the tracker
    }
  };
}