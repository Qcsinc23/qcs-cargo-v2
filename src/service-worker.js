// Service worker for caching static assets and API responses
const CACHE_NAME = 'qcs-cargo-v1';
const STATIC_CACHE = 'qcs-static-v1';
const API_CACHE = 'qcs-api-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/auth/login',
  '/auth/register',
  '/shipping-calculator',
  '/manifest.json',
  // Add other critical routes
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

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (url.origin !== self.location.origin) return;

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE)
        .then((cache) => cache.match(request))
        .then((response) => {
          // Return cached response if available
          if (response) {
            // Also fetch in background to update cache
            fetch(request)
              .then((freshResponse) => {
                if (freshResponse.ok) {
                  caches.open(API_CACHE)
                    .then((cache) => cache.put(request, freshResponse.clone()));
                }
              });
            return response;
          }

          // Fetch from network if not cached
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(API_CACHE)
                  .then((cache) => cache.put(request, responseClone));
              }
              return response;
            })
            .catch(() => {
              // Return offline fallback for API errors
              return new Response(
                JSON.stringify({ error: 'Offline - No cached data available' }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
  }

  // Handle static assets
  event.respondWith(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.match(request))
      .then((response) => {
        if (response) {
          return response;
        }

        // Try network if not in cache
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.ok) {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => cache.put(request, responseClone));
            }
            return response;
          });
      })
  );
});