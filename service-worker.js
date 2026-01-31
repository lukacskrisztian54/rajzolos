const CACHE_NAME = 'rajzolos-jatek-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'
];

// Telepítés
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache megnyitva');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Aktiválás
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Régi cache törlése:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - cache first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache találat - cache-ből szolgálunk
        if (response) {
          return response;
        }

        // Nincs cache-ben, letöltjük a hálózatról
        return fetch(event.request).then(
          response => {
            // Ellenőrizzük hogy valid-e a válasz
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Klónozzuk a választ
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
