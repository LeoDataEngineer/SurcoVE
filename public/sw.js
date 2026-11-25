const CACHE = 'surocve-v6'
const ARCHIVOS = [
  '/',
  '/index.html',
  '/rueda.html',
  '/rotaciones.html',
  '/escenarios.html',
  '/mapa.html',
  '/asistente.html',
  '/ficha.html',
  '/guia.html',
  '/icon.svg',
  '/manifest.webmanifest',
  '/gold.json',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ARCHIVOS)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.origin !== self.location.origin) return

  // Las páginas se buscan en la red primero para ver siempre la versión nueva;
  // si no hay red, se usa la copia guardada para el modo campo.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then((respuesta) => {
        if (respuesta.ok) {
          const copia = respuesta.clone()
          caches.open(CACHE).then((cache) => cache.put(event.request, copia))
        }
        return respuesta
      }).catch(() => caches.match(event.request).then((cacheada) => cacheada || caches.match('/index.html'))),
    )
    return
  }

  event.respondWith(
    caches.match(event.request).then((cacheada) => cacheada || fetch(event.request).then((respuesta) => {
      if (respuesta.ok) {
        const copia = respuesta.clone()
        caches.open(CACHE).then((cache) => cache.put(event.request, copia))
      }
      return respuesta
    })),
  )
})
