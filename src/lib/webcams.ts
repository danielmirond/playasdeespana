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
import { kvCached } from './kv-cache'
import { haversine } from './geo'

const WINDY_KEY = process.env.WINDY_API_KEY ?? ''
const RADIUS_KM = 25
const TTL_S = 24 * 3600 // las webcams cercanas cambian poco → 24h

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
  player?:        { live?: { embed?: string }; day?: { embed?: string } }
}

async function fetchWebcams(lat: number, lng: number): Promise<Webcam[]> {
  if (!WINDY_KEY) return []
  const url =
    `https://api.windy.com/webcams/api/v3/webcams` +
    `?nearby=${lat},${lng},${RADIUS_KM}` +
    `&include=images,player,location&limit=8&lang=es`
  try {
    const res = await fetchWithTimeout(
      url,
      { headers: { 'x-windy-api-key': WINDY_KEY }, next: { revalidate: TTL_S } },
      4000,
    )
    if (!res.ok) return []
    const data = (await res.json()) as { webcams?: WindyWebcam[] }
    return (data.webcams ?? [])
      .filter(w => w.status === 'active' && w.location)
      .map(w => {
        const loc = w.location!
        return {
          id:          String(w.webcamId),
          title:       w.title,
          distancia_m: Math.round(haversine(lat, lng, loc.latitude, loc.longitude)),
          thumb:       w.images?.current?.preview ?? w.images?.current?.thumbnail ?? null,
          embedUrl:    w.player?.live?.embed ?? w.player?.day?.embed ?? null,
          lat:         loc.latitude,
          lon:         loc.longitude,
          lastUpdated: w.lastUpdatedOn,
        }
      })
      .filter(w => !!w.embedUrl)                       // solo reproducibles
      .sort((a, b) => a.distancia_m - b.distancia_m)
  } catch {
    return []
  }
}

export async function getWebcams(lat: number, lng: number): Promise<Webcam[]> {
  if (!WINDY_KEY) return []
  return kvCached('webcams', [lat, lng], TTL_S, () => fetchWebcams(lat, lng))
}
