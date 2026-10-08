/*
 * HorariosEVG · Service worker del lanzador
 * Guarda la pantalla de inicio y los iconos para que la app abra al instante
 * y muestre un aviso si no hay conexión. Los horarios siempre se piden en línea.
 */
const VERSION = 'horariosevg-v2';
const ARCHIVOS = [
  './',
  './index.html',
  './config.js',
  './manifest.webmanifest',
  './icono-192.png',
  './icono-512.png',
  './apple-touch-icon.png',
  './apple-touch-icon-152.png',
  './apple-touch-icon-167.png',
  './favicon-32.png',
  './escuela.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Red primero (para recoger cambios de config.js), caché si no hay conexión.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        const copia = resp.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copia));
        return resp;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then((r) => r || caches.match('./index.html')))
  );
});
