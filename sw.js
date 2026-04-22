const STATIC_CACHE = 't3code-mobile-static-v4';
const PRECACHE_URLS = ['/manifest.json', '/icon.svg', '/icon-192.png', '/icon-512.png'];

function isCacheable(response) {
  return response && response.ok;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName !== STATIC_CACHE)
        .map((cacheName) => caches.delete(cacheName))
    );
    await self.clients.claim();
  })());
});

const CACHEABLE_STATIC_PATHS = new Set([
  ...PRECACHE_URLS,
  '/sw.js',
]);

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    (async () => {
      const requestUrl = new URL(event.request.url);
      const isSameOrigin = requestUrl.origin === self.location.origin;
      const staticCache = await caches.open(STATIC_CACHE);

      if (isSameOrigin && CACHEABLE_STATIC_PATHS.has(requestUrl.pathname)) {
        const cached = await staticCache.match(event.request, { ignoreSearch: true });
        if (cached) {
          return cached;
        }
      }

      try {
        const response = await fetch(event.request);
        if (isSameOrigin && isCacheable(response) && CACHEABLE_STATIC_PATHS.has(requestUrl.pathname)) {
          await staticCache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        const staticMatch = await staticCache.match(event.request, { ignoreSearch: true });
        if (staticMatch) {
          return staticMatch;
        }

        throw error;
      }
    })()
  );
});
