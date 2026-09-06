const CACHE_NAME = 'npt-centre-v2';
const STATIC_ASSETS = [
  '/',
  '/hakekat-cinta',
  '/buku-saku',
  '/emt',
  '/wirid-khusus',
  '/manifest.json',
  '/favicon.ico',
  '/iconnpt-192x192.png',
  '/iconnpt-512x512.png',
  '/logo.png'
];

// Install: Pre-cache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: Clean up old cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate for static & pages, Network-First for APIs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Jangan cache API internal atau request POST/PUT/DELETE
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('googleapis.com')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback jika offline dan ada cache
          return cachedResponse;
        });

      // Kembalikan dari cache seketika (0 ms) jika ada, sambil memperbarui di latar belakang
      return cachedResponse || fetchPromise;
    })
  );
});
