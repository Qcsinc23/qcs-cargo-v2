import { browser } from '$app/environment';
import { getPerformanceTracker } from './tracker';

/**
 * Enhanced fetch wrapper with automatic performance tracking
 */
export async function apiRequest<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit & { trackPerformance?: boolean }
): Promise<T> {
  if (!browser || init?.trackPerformance === false) {
    return fetch(input, init).then(res => res.json());
  }

  const tracker = getPerformanceTracker();
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const endpoint = url.replace(window.location.origin, '');
  const method = init?.method || 'GET';

  const apiTracking = tracker.trackAPIRequest(endpoint, method);
  apiTracking.start();

  try {
    const response = await fetch(input, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    let size: number | undefined;
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      size = parseInt(contentLength, 10);
    }

    const data = await response.json();
    apiTracking.end(response.status, response.ok, size);

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    apiTracking.end(0, false);
    throw error;
  }
}

/**
 * GET request wrapper
 */
export async function apiGet<T = any>(
  url: string,
  options?: Omit<RequestInit, 'method'> & { trackPerformance?: boolean }
): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'GET' });
}

/**
 * POST request wrapper
 */
export async function apiPost<T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestInit, 'method' | 'body'> & { trackPerformance?: boolean }
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT request wrapper
 */
export async function apiPut<T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestInit, 'method' | 'body'> & { trackPerformance?: boolean }
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE request wrapper
 */
export async function apiDelete<T = any>(
  url: string,
  options?: Omit<RequestInit, 'method'> & { trackPerformance?: boolean }
): Promise<T> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' });
}

/**
 * PATCH request wrapper
 */
export async function apiPatch<T = any>(
  url: string,
  data?: any,
  options?: Omit<RequestInit, 'method' | 'body'> & { trackPerformance?: boolean }
): Promise<T> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * Create a custom API client with base URL and default options
 */
export function createApiClient(
  baseURL: string,
  defaultOptions: RequestInit & { trackPerformance?: boolean } = {}
) {
  const resolvedBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

  return {
    get: <T = any>(endpoint: string, options?: RequestInit & { trackPerformance?: boolean }) =>
      apiGet<T>(`${resolvedBaseURL}${endpoint}`, { ...defaultOptions, ...options }),

    post: <T = any>(endpoint: string, data?: any, options?: RequestInit & { trackPerformance?: boolean }) =>
      apiPost<T>(`${resolvedBaseURL}${endpoint}`, data, { ...defaultOptions, ...options }),

    put: <T = any>(endpoint: string, data?: any, options?: RequestInit & { trackPerformance?: boolean }) =>
      apiPut<T>(`${resolvedBaseURL}${endpoint}`, data, { ...defaultOptions, ...options }),

    delete: <T = any>(endpoint: string, options?: RequestInit & { trackPerformance?: boolean }) =>
      apiDelete<T>(`${resolvedBaseURL}${endpoint}`, { ...defaultOptions, ...options }),

    patch: <T = any>(endpoint: string, data?: any, options?: RequestInit & { trackPerformance?: boolean }) =>
      apiPatch<T>(`${resolvedBaseURL}${endpoint}`, data, { ...defaultOptions, ...options }),

    request: <T = any>(endpoint: string, options?: RequestInit & { trackPerformance?: boolean }) =>
      apiRequest<T>(`${resolvedBaseURL}${endpoint}`, { ...defaultOptions, ...options }),
  };
}

/**
 * PocketBase API client with performance tracking
 */
export const pocketbaseApi = createApiClient('http://127.0.0.1:8090/api', {
  headers: {
    'Accept': 'application/json',
  },
});

/**
 * Enhanced SvelteKit fetch with performance tracking
 */
export function createTrackedFetch(event: any) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    if (!browser) {
      return event.fetch(input, init);
    }

    const tracker = getPerformanceTracker();
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const endpoint = url.replace(window.location.origin, '');
    const method = init?.method || 'GET';

    // Only track API endpoints, not page loads
    if (endpoint.startsWith('/api/') || endpoint.includes('pb_')) {
      const apiTracking = tracker.trackAPIRequest(endpoint, method);
      apiTracking.start();

      try {
        const response = await event.fetch(input, init);
        let size: number | undefined;
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          size = parseInt(contentLength, 10);
        }
        apiTracking.end(response.status, response.ok, size);
        return response;
      } catch (error) {
        apiTracking.end(0, false);
        throw error;
      }
    } else {
      return event.fetch(input, init);
    }
  };
}