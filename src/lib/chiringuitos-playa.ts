// src/lib/chiringuitos-playa.ts — Chiringuitos de la ficha de playa.
//
// Reutiliza el sidecar src/data/chiringuitos.json (908 establecimientos
// reales de Google Places, cosecha jul-2026 ya pagada — rating y reseñas
// incluidos) que hasta ahora solo alimentaba las landings /chiringuitos.
// Lookup 100% en memoria: cero llamadas de red, cero coste.
//
// Matching por DISTANCIA REAL a la playa, no por el campo playaCercana
// del sidecar: ese solo apunta a la playa más próxima de cada
// chiringuito, pero un chiringuito sirve igual a la playa de al lado.
import chiringuitosData from '@/data/chiringuitos.json'

const RADIO_M = 1000
const MAX = 4

export interface ChiringuitoCerca {
  googleId:    string
  nombre:      string
  rating:      number
  reseñas:     number
  distancia_m: number
  /** Slug de la landing /chiringuitos/[provincia] para enlazado interno */
  provSlug:    string
  provincia:   string
}

interface ChiringuitoRaw {
  googleId: string
  nombre: string
  rating: number
  reseñas: number
  lat: number
  lng: number
}
interface ProvinciaRaw { provincia: string; estudios: ChiringuitoRaw[] }

// Índice plano construido una vez por proceso (908 items, trivial).
let _pool: Array<ChiringuitoRaw & { provSlug: string; provincia: string }> | null = null
function pool() {
  if (_pool) return _pool
  _pool = []
  const vistos = new Set<string>()  // el sidecar trae algún local repetido
  for (const [provSlug, prov] of Object.entries(chiringuitosData as unknown as Record<string, ProvinciaRaw>)) {
    for (const c of prov.estudios) {
      if (!c?.nombre || !Number.isFinite(c.lat) || !Number.isFinite(c.lng)) continue
      if (c.googleId && vistos.has(c.googleId)) continue
      if (c.googleId) vistos.add(c.googleId)
      _pool.push({ ...c, provSlug, provincia: prov.provincia })
    }
  }
  return _pool
}

const hav = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000, r = (d: number) => (d * Math.PI) / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

/** Chiringuitos a ≤1 km de la playa, más cercanos primero (máx. 4). */
export function getChiringuitosPlaya(lat: number, lng: number): ChiringuitoCerca[] {
  const out: ChiringuitoCerca[] = []
  for (const c of pool()) {
    // Descarte barato antes del haversine (1° ≈ 111 km)
    if (Math.abs(c.lat - lat) > 0.02 || Math.abs(c.lng - lng) > 0.03) continue
    const d = hav(lat, lng, c.lat, c.lng)
    if (d > RADIO_M) continue
    out.push({
      googleId: c.googleId,
      nombre: c.nombre,
      rating: c.rating ?? 0,
      reseñas: c.reseñas ?? 0,
      distancia_m: Math.round(d),
      provSlug: c.provSlug,
      provincia: c.provincia,
    })
  }
  return out.sort((a, b) => a.distancia_m - b.distancia_m).slice(0, MAX)
}
