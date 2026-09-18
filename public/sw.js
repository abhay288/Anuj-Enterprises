const CACHE_NAME = 'anuj-enterprises-pwa-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png',
  '/logo.webp',
  '/favicon.png',
  '/favicon.webp',
  '/favicon-48x48.png',
  '/favicon-96x96.png',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-192x192.png',
  '/maskable-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon.ico'
];

// Install Event - Pre-cache Core PWA Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA ServiceWorker] Pre-caching Core Assets & Logos (v2)');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[PWA ServiceWorker] Purging Obsolete Cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests or browser extensions
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  const url = event.request.url;

  // 1. Dynamic Product APIs - Always Network Only (Live MongoDB single source of truth)
  if (url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Cloudinary & Remote CDN Images - Network First / Direct fetch (Never trap stale photos in CacheStorage)
  if (url.includes('cloudinary.com') || url.includes('images.unsplash.com') || url.includes('res.cloudinary')) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' }).catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Local Static Assets - Stale-While-Revalidate (only for local origin app shell)
  if (url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            console.warn('[PWA ServiceWorker] Static asset fetch fallback:', err);
          });

        return cachedResponse || fetchPromise;
      })
    );
  }
});
