// Service Worker para desabilitar cache completamente
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  // Remove todos os caches existentes
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  });
  
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Intercepta todos os requests e força bypass do cache
  event.respondWith(
    fetch(event.request, {
      cache: 'no-store'
    }).catch(() => {
      // Se falhar, tenta buscar normalmente
      return fetch(event.request);
    })
  );
});
