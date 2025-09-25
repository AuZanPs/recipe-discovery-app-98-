/* Simple service worker for caching static assets and API responses */
const CACHE_NAME = 'recipe-discovery-v1';
const ASSETS = self.__WB_MANIFEST || [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).catch(() => {})
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // cache-first for same-origin static assets only
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }
  // For external APIs like themealdb.com, let them pass through normally
  // Don't intercept cross-origin requests to avoid CORS issues
});
