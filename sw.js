// ── Service Worker · Portal TIC IES Primero de Mayo ──

const CACHE_VERSION = '2026.06.17:02';

const ARCHIVOS_CACHE = [
  './',
  './lanzadera_tutoriales.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './guia_correo_corporativo.html',
  './guia_gobcan_verifica_dispositivo.html',
  './guia_correo_avanzado.html',
  './guia_miclave.html',
  './guia_firma_digital_autofirma.html',
  './guia_evagd.html',
  './guia_pincel_ekade.html',
  './guia_nube_medusa.html',
  './guia_blog_profesorado_ecoblog.html',
  './guia_videoconferencia_jitsi.html',
  './guia_wifi_red_medusa.html',
  './guia_sirvete_incidencias.html',
  './guia_pizarras_digitales.html',
  './guia_proteccion_datos.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ARCHIVOS_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const esImagen = url.pathname.startsWith('/img/') ||
                   url.pathname.match(/\.(png|gif|jpg|jpeg|webp|svg)$/i);

  if (esImagen) {
    // Cache first: devuelve desde caché si existe; si no, descarga y cachea
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200) return response;
          const copia = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copia));
          return response;
        }).catch(() => cached);
      })
    );
  } else {
    // Network first: intenta red; si falla, sirve desde caché
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const copia = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, copia));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});