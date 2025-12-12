import type { ComponentType } from 'svelte';

interface LazyComponentOptions {
  fallback?: ComponentType;
  error?: ComponentType;
  preload?: boolean;
}

export function createLazyComponent(
  loader: () => Promise<{ default: ComponentType }>,
  options: LazyComponentOptions = {}
) {
  let component: ComponentType | null = null;
  let error: Error | null = null;
  let promise: Promise<void> | null = null;

  const { fallback, error: ErrorComponent, preload } = options;

  const load = () => {
    if (promise) return promise;

    promise = loader()
      .then((module) => {
        component = module.default;
        error = null;
      })
      .catch((err) => {
        error = err;
        component = null;
      });

    return promise;
  };

  // Preload if requested
  if (preload && typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => load());
  }

  return {
    get component() {
      return component;
    },
    get error() {
      return error;
    },
    get loading() {
      return !component && !error;
    },
    load
  };
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) {
  if (typeof IntersectionObserver === 'undefined') {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
}

// Preload critical resources
export function preloadResources(resources: string[]) {
  if (typeof document === 'undefined') return;

  resources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = resource.endsWith('.css') ? 'style' : 'script';
    link.href = resource;
    document.head.appendChild(link);
  });
}

// Lazy load images
export function lazyLoadImage(img: HTMLImageElement, src: string) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: '50px' }
  );

  img.classList.add('lazy');
  observer.observe(img);
  return observer;
}