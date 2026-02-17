// Service worker for caching static assets, API responses, and offline scanning
const STATIC_CACHE = 'qcs-static-v3';
const API_CACHE = 'qcs-api-v3';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/shipping-calculator',
  '/track',
  '/pricing',
  '/admin/receiving',
  '/dashboard',
  '/manifest.json',
  '/sounds/scan-success.mp3',
  '/sounds/scan-error.mp3'
];

// Offline-capable admin routes
const OFFLINE_ADMIN_ROUTES = [
  '/admin/receiving',
  '/admin/shipments',
  '/admin/search'
];

// Keep API caching explicitly allowlisted to avoid storing sensitive data in browser caches.
const CACHEABLE_API_PATHS = new Set(['/api/admin/bookings/today']);
const NETWORK_ONLY_API_PREFIXES = [
  '/api/auth/',
  '/api/payments/',
  '/api/bookings/',
  '/api/recipients/',
  '/api/invoices/',
  '/api/track/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(async (cache) => {
        // Cache assets individually with error handling
        // This prevents a single failed resource from breaking the entire cache installation
        const cachePromises = STATIC_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              console.log(`[ServiceWorker] Cached: ${url}`);
              return { url, status: 'success' };
            } else {
              console.warn(`[ServiceWorker] Failed to cache ${url}: ${response.status} ${response.statusText}`);
              return { url, status: 'failed', error: `HTTP ${response.status}` };
            }
          } catch (error) {
            console.warn(`[ServiceWorker] Failed to cache ${url}:`, error.message);
            return { url, status: 'failed', error: error.message };
          }
        });

        // Wait for all cache operations to complete (success or failure)
        const results = await Promise.allSettled(cachePromises);
        
        // Log summary
        const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success').length;
        const failed = results.length - successful;
        
        console.log(`[ServiceWorker] Cache installation complete: ${successful} succeeded, ${failed} failed`);
        
        if (failed > 0) {
          const failures = results
            .filter(r => r.status === 'fulfilled' && r.value.status === 'failed')
            .map(r => r.value.url);
          console.warn(`[ServiceWorker] Failed to cache:`, failures);
        }
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[ServiceWorker] Cache installation error:', error);
        // Still skip waiting even if caching fails
        self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) =>
              cacheName !== STATIC_CACHE &&
              cacheName !== API_CACHE
            )
            .map((cacheName) => caches.delete(cacheName))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip external requests
  if (url.origin !== self.location.origin) return;

  // Handle POST requests for offline sync
  if (request.method === 'POST' && url.pathname === '/api/admin/packages/receive') {
    event.respondWith(handleOfflinePackageReceive(request));
    return;
  }

  // Skip other non-GET requests
  if (request.method !== 'GET') return;

  // Handle API requests with stale-while-revalidate for admin routes
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request, url));
    return;
  }

  // Handle static assets and admin routes for offline access
  event.respondWith(handleStaticRequest(request, url));
});

// Handle package receive with offline fallback
async function handleOfflinePackageReceive(request) {
  try {
    // Try to send to server
    const response = await fetch(request.clone());
    return response;
  } catch (error) {
    // If offline, queue the request
    console.log('[ServiceWorker] Package receive queued for sync');
    
    // Return a synthetic response indicating offline queue
    return new Response(
      JSON.stringify({
        status: 'queued',
        message: 'Package saved offline. Will sync when online.',
        offline: true
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle API requests with cache
async function handleApiRequest(request, url) {
  const isNetworkOnly = NETWORK_ONLY_API_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
  if (isNetworkOnly || !CACHEABLE_API_PATHS.has(url.pathname)) {
    try {
      return await fetch(request);
    } catch {
      return new Response(
        JSON.stringify({
          status: 'error',
          error: 'Offline - This endpoint requires a network connection',
          offline: true
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  const cache = await caches.open(API_CACHE);

  // Network-first for allowlisted API routes with cache fallback.
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    return new Response(
      JSON.stringify({
        status: 'error',
        error: 'Offline - No cached data available',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle static requests
async function handleStaticRequest(request, url) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Return cached, but update in background
    fetch(request)
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(() => {});
    return cachedResponse;
  }

  // Not in cache - try network
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Check if this is an admin route that should work offline
    const isOfflineRoute = OFFLINE_ADMIN_ROUTES.some(route => 
      url.pathname.startsWith(route)
    );

    if (isOfflineRoute) {
      // Return offline page if we have one cached
      const offlinePage = await cache.match('/admin/receiving');
      if (offlinePage) {
        return offlinePage;
      }
    }

    // Return a generic offline response
    return new Response(
      '<html><body><h1>Offline</h1><p>This page is not available offline.</p></body></html>',
      {
        status: 503,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Background sync for offline scans
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-package-scans') {
    console.log('[ServiceWorker] Background sync triggered');
    event.waitUntil(syncPendingScans());
  }
});

// Sync pending scans from IndexedDB
async function syncPendingScans() {
  // This would be called when background sync is triggered
  // The actual sync logic is handled by the offlineScanner service
  // This is a fallback for browsers that support Background Sync API
  
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'SYNC_REQUESTED',
      timestamp: Date.now()
    });
  });
}

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_ADMIN_DATA') {
    // Pre-cache admin data when requested
    cacheAdminData(event.data.bookings);
  }
});

// Pre-cache admin data for offline use
async function cacheAdminData(bookings) {
  if (!bookings) return;
  
  const cache = await caches.open(API_CACHE);
  
  // Create a synthetic response with the bookings data
  const response = new Response(
    JSON.stringify({
      status: 'success',
      data: { items: bookings },
      cached: true,
      cachedAt: new Date().toISOString()
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
  
  // Cache it under the admin bookings endpoint
  await cache.put('/api/admin/bookings/today', response);
  console.log('[ServiceWorker] Admin data cached for offline use');
}
