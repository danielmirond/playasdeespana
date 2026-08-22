// src/lib/webcams.ts
//
// Webcams en directo cercanas a la playa vía Windy Webcams API v3.
//
// Gated por WINDY_API_KEY (server-side): si la clave no está configurada,
// getWebcams() devuelve [] y la sección de webcam no se renderiza. Así el
// despliegue es seguro y la feature se "enciende" al añadir la clave en
// Vercel, sin tocar código.
//
// Patrón recurso-por-lat/lng + KV cache, igual que buceo/hoteles.
//
// Windy Webcams API v3:
//   GET https://api.windy.com/webcams/api/v3/webcams
//       ?nearby={lat},{lon},{radiusKm}&include=images,player,location&limit=N
//   header: x-windy-api-key: {key}
// Atribución OBLIGATORIA en UI: "vía Windy.com".
// Clave gratuita: https://api.windy.com/keys

import { fetchWithTimeout } from './fetch-timeout'
import { cache } from 'react'
import { kvCached, kvPeek } from './kv-cache'
import { haversine } from './geo'

const WINDY_KEY = process.env.WINDY_API_KEY ?? ''
const RADIUS_KM = 15 // radio ajustado: una cam de playa relevante está cerca
const TTL_S = 24 * 3600 // las webcams cercanas cambian poco → 24h
// Namespace de caché versionado: al cambiar el filtrado (solo beach/coast)
// bumpeamos la versión para no servir las entradas antiguas sin filtrar.
const CACHE_NS = 'webcams-v2'
// Categorías de Windy que consideramos "de playa/costa". Descartamos city,
// port, mountain, landscape, meteo-solo, etc. (webcams que no miran al mar).
const CATS_PLAYA = new Set(['beach', 'coast'])

export interface Webcam {
  id:           string
  title:        string
  distancia_m:  number
  thumb:        string | null   // imagen actual (preview) para click-to-load
  embedUrl:     string | null   // iframe del player (live o day)
  lat:          number
  lon:          number
  lastUpdated?: string
}

interface WindyWebcam {
  webcamId:       number
  title:          string
  status:         string
  lastUpdatedOn?: string
  location?:      { latitude: number; longitude: number }
  images?:        { current?: { preview?: string; thumbnail?: string } }
  // player v3: URLs directas por marco temporal (no objetos {embed}).
  player?:        { live?: string; day?: string; month?: string; year?: string; lifetime?: string }
  categories?:    Array<{ id: string; name?: string }>
}

async function fetchWebcams(lat: number, lng: number): Promise<Webcam[]> {
  if (!WINDY_KEY) return []
  const url =
    `https://api.windy.com/webcams/api/v3/webcams` +
    `?nearby=${lat},${lng},${RADIUS_KM}` +
    `&include=images,player,location,categories&limit=12&lang=es`
  try {
    const res = await fetchWithTimeout(
      url,
      { headers: { 'x-windy-api-key': WINDY_KEY }, next: { revalidate: TTL_S } },
      4000,
    )
    if (!res.ok) return []
    const data = (await res.json()) as { webcams?: WindyWebcam[] }
    return (data.webcams ?? [])
      // Solo webcams de PLAYA/COSTA (descarta ciudad, puerto, montaña…).
      .filter(w => w.status === 'active' && w.location && (w.categories ?? []).some(c => CATS_PLAYA.has(c.id)))
      .map(w => {
        const loc = w.location!
        return {
          id:          String(w.webcamId),
          title:       w.title,
          distancia_m: Math.round(haversine(lat, lng, loc.latitude, loc.longitude)),
          thumb:       w.images?.current?.preview ?? w.images?.current?.thumbnail ?? null,
          embedUrl:    w.player?.live ?? w.player?.day ?? null,
          lat:         loc.latitude,
          lon:         loc.longitude,
          lastUpdated: w.lastUpdatedOn,
        }
      })
      .filter(w => !!w.embedUrl)                       // solo reproducibles
      .sort((a, b) => a.distancia_m - b.distancia_m)
      .slice(0, 8)
  } catch {
    return []
  }
}

/**
 * Lectura de KV memoizada POR PETICIÓN.
 *
 * `generateMetadata` pregunta si hay webcam —para meter la palabra en el
 * title— y el componente pide las webcams. Son dos funciones distintas
 * sobre LA MISMA CLAVE, así que cada ficha hacía dos viajes a KV para el
 * mismo dato. Con `cache()` de React, ambas comparten la lectura dentro de
 * la misma petición.
 *
 * No es solo ahorro de cuota: cada lectura es un viaje de red en el camino
 * crítico del render, y esta ocurría dos veces en todas las fichas.
 */
const leerCacheWebcams = cache((lat: number, lng: number) => kvPeek<Webcam[]>(CACHE_NS, [lat, lng]))

export async function getWebcams(lat: number, lng: number): Promise<Webcam[]> {
  if (!WINDY_KEY) return []
  // Si `generateMetadata` ya leyó la clave en esta misma petición, esto no
  // vuelve a tocar KV.
  const cacheado = await leerCacheWebcams(lat, lng)
  if (Array.isArray(cacheado)) return cacheado
  // Fallo de caché: se calcula y se guarda por la vía normal. Aquí sí hay
  // un segundo `get`, pero es el caso raro —el TTL son 24 h— y de todos
  // modos vamos a llamar a Windy, que cuesta mucho más que un get.
  return kvCached(CACHE_NS, [lat, lng], TTL_S, () => fetchWebcams(lat, lng))
}

/**
 * ¿Hay webcam cerca? Lectura KV-only (sin llamar a Windy): se usa en
 * generateMetadata para decidir si el title incluye "webcam" sin añadir
 * latencia. Devuelve true solo si el KV ya tiene webcams para esa playa
 * (poblado por el render + warming en visitas previas).
 */
export async function hasWebcamNearby(lat: number, lng: number): Promise<boolean> {
  if (!WINDY_KEY) return false
  const cached = await leerCacheWebcams(lat, lng)
  return Array.isArray(cached) && cached.length > 0
}
