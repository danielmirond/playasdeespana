// public/sw.js — Service Worker para offline
// Cachea las fichas de playa visitadas para que funcionen sin conexión
// (caso de uso: usuario en la playa sin datos móviles).
// Estrategia: Network First con fallback a cache para HTML.
// Assets estáticos: Cache First (CSS, JS, fonts, SVG).

const CACHE_NAME = 'playas-v1'
const STATIC_ASSETS = [
  '/logo.svg',
  '/icon.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET, API calls, and external requests
  if (request.method !== 'GET') return
  if (url.pathname.startsWith('/api/')) return
  if (url.origin !== self.location.origin) return

  // Static assets: Cache First
  if (
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.startsWith('/_next/static/')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        })
      })
    )
    return
  }

  // HTML pages (fichas, home, etc): Network First, cache as backup
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        })
        .catch(() => caches.match(request).then(cached => {
          if (cached) return cached
          return caches.match('/').then(home => home || new Response(
            '<html><body style="font-family:Georgia;text-align:center;padding:4rem 2rem;color:#2a1a08;background:#f5ecd5"><h1>Sin conexión</h1><p>Visita una playa con conexión y su ficha quedará guardada para consultarla offline.</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          ))
        }))
    )
    return
  }

  // Data files (playas.json): Stale While Revalidate
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone()
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          }
          return response
        })
        return cached || networkFetch
      })
    )
    return
  }
})
