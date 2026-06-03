const CACHE_NAME = 'meu-app-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css', // Substitua pelo nome do seu ficheiro CSS
  './script.js', // Substitua pelo nome do seu ficheiro JS principal
  './icone-192.png',
  './icone-512.png'
];

// Instala o Service Worker e guarda os ficheiros em cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Interceta os pedidos à rede e responde com os ficheiros em cache, se possível
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Devolve da cache
        }
        return fetch(event.request); // Procura na internet
      }
    )
  );
});