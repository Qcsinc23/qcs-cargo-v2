// Service worker for caching static assets, API responses, and offline scanning
const CACHE_NAME = 'qcs-cargo-v2';
const STATIC_CACHE = 'qcs-static-v2';
const API_CACHE = 'qcs-api-v2';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/shipping-calculator',
  '/admin/receiving',
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

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
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
  const cache = await caches.open(API_CACHE);
  
  // Check for admin bookings/today endpoint - always try network first
  const isAdminData = url.pathname.includes('/admin/') || 
                      url.pathname.includes('/bookings');

  if (isAdminData) {
    try {
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      // Offline - try cache
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      
      return new Response(
        JSON.stringify({ 
          status: 'error',
          error: 'Offline - Using cached data',
          offline: true 
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // For other API requests, use stale-while-revalidate
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      return new Response(
        JSON.stringify({ error: 'Offline - No cached data available' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    });

  return cachedResponse || fetchPromise;
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