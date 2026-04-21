const STATIC_CACHE = 't3code-mobile-static-v3';
const RUNTIME_CACHE = 't3code-mobile-runtime-v1';
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
        .filter((cacheName) => ![STATIC_CACHE, RUNTIME_CACHE].includes(cacheName))
        .map((cacheName) => caches.delete(cacheName))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    (async () => {
      const requestUrl = new URL(event.request.url);
      const isSameOrigin = requestUrl.origin === self.location.origin;
      const staticCache = await caches.open(STATIC_CACHE);
      const runtimeCache = await caches.open(RUNTIME_CACHE);

      if (isSameOrigin && PRECACHE_URLS.includes(requestUrl.pathname)) {
        const cached = await staticCache.match(event.request, { ignoreSearch: true });
        if (cached) {
          return cached;
        }
      }

      try {
        const response = await fetch(event.request);
        if (isSameOrigin && isCacheable(response)) {
          const targetCache = event.request.mode === 'navigate' ? runtimeCache : staticCache;
          await targetCache.put(event.request, response.clone());
        }
        return response;
      } catch (error) {
        const runtimeMatch = await runtimeCache.match(event.request);
        if (runtimeMatch) {
          return runtimeMatch;
        }

        const staticMatch = await staticCache.match(event.request, { ignoreSearch: true });
        if (staticMatch) {
          return staticMatch;
        }

        throw error;
      }
    })()
  );
});
