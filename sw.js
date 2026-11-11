// Vergis - Service Worker v5 (Ultra-Resilient PWA & Offline Support)
const CACHE_NAME = 'vergis-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  './js/storage.js',
  './js/idb.js',
  './js/dashboard.js',
  './js/workouts.js',
  './js/nutrition.js',
  './js/skincare.js',
  './js/habits.js',
  './js/progress.js',
  './js/calendar.js',
  './js/analytics.js',
  './js/settings.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png',
  './assets/icon.svg',
  './assets/favicon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Use individual caching so if any asset fails, it doesn't break the whole install
      return Promise.allSettled(
        ASSETS_TO_CACHE.map((asset) =>
          cache.add(asset).catch((err) => console.warn('[SW] Failed to precache:', asset, err))
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // 1. Navigation requests (App launch, reload, opening / or /index.html)
  if (event.request.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname === '/') {
    event.respondWith(
      caches.match('./index.html')
        .then((cachedResponse) => {
          // Kick off background network fetch to revalidate
          const networkFetch = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const clone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put('./index.html', clone);
                  cache.put('/', clone.clone());
                }).catch(() => {});
              }
              return networkResponse;
            })
            .catch(() => null);

          // If we have cached HTML, return it IMMEDIATELY (instant launch, no network latency)
          if (cachedResponse) {
            return cachedResponse;
          }

          // Otherwise wait for network fetch
          return networkFetch.then(async (response) => {
            if (response) return response;
            const fallback = await caches.match('./index.html') || await caches.match('./');
            if (fallback) return fallback;
            return new Response('<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vergis</title></head><body style="background:#F7F5EF;color:#202820;font-family:sans-serif;padding:30px;text-align:center;"><h2>Vergis</h2><p>Please check your connection and tap reload.</p><button onclick="location.reload()" style="padding:10px 20px;background:#244B3C;color:#fff;border:none;border-radius:8px;font-size:16px;">Reload</button></body></html>', {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          });
        })
        .catch(() => {
          return caches.match('./index.html').then((fallback) => {
            if (fallback) return fallback;
            return new Response('<!DOCTYPE html><html><body>Vergis</body></html>', {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          });
        })
    );
    return;
  }

  // 2. Static Assets (CSS, JS, Fonts, Icons)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Stale-while-revalidate in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse)).catch(() => {});
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone)).catch(() => {});
          }
          return networkResponse;
        })
        .catch(async () => {
          const match = await caches.match(event.request);
          if (match) return match;
          return new Response('', { status: 404 });
        });
    })
  );
});
