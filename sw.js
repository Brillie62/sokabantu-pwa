const CACHE_NAME = 'sokabantu-pwa-v2';
const OFFLINE_URL = 'https://brillie62.github.io/sokabantu-pwa/offline.html';

const urlsToCache = [
  'https://www.sokabantu.com/',
  'https://www.sokabantu.com/p/blog-page_29.html',
  'https://www.sokabantu.com/p/football-highlights-box-sizing-border.html',
  'https://www.sokabantu.com/p/body-font-family-poppins-sans-serif.html',
  'https://www.sokabantu.com/p/sssaaajillliiiii.html',
  'https://www.sokabantu.com/p/ssssssokoooonnni.html',
  'https://www.sokabantu.com/p/misimamo-ya-ligi.html',
  'https://www.sokabantu.com/p/nyota-wa-ligi.html',
  'https://www.sokabantu.com/p/configuration-edit-this-section-const.html',
  'https://www.sokabantu.com/p/ligi.html',
  'https://www.sokabantu.com/p/configuration-const-config-logoimage.html',
  'https://www.sokabantu.com/p/usajili.html',
  'https://www.sokabantu.com/p/live.html',
  'https://www.sokabantu.com/p/about.html',
  'https://www.sokabantu.com/favicon.ico',
  OFFLINE_URL
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(urlsToCache);
        await self.skipWaiting();
        console.log('Service worker installed and cache populated');
      } catch (error) {
        console.error('Cache addAll failed:', error);
      }
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              console.log('Deleting old cache:', key);
              return caches.delete(key);
            }
          })
        );
        await self.clients.claim();
        console.log('Service worker activated');
      } catch (error) {
        console.error('Activation failed:', error);
      }
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-http(s) requests
  if (!request.url.startsWith('http')) return;

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          return networkResponse;
        } catch (error) {
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(
    (async () => {
      try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;

        const networkResponse = await fetch(request);
        
        // Cache new responses for GET requests
        if (networkResponse.ok && request.method === 'GET') {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        return new Response('Network error', { status: 503 });
      }
    })()
  );
});
