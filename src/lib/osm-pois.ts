// src/lib/osm-pois.ts — Lector del sidecar OFFLINE de POIs de OpenStreetMap
// (public/data/osm-pois.json, generado por scripts/build-osm-pois.mjs desde
// el extracto de Geofabrik). Sustituye a Overpass en runtime: los mirrors
// públicos estrangulan a las IPs de Vercel (19s y 0 resultados, verificado),
// y este camino es local, instantáneo e ilimitado.
//
// El sidecar pesa ~10 MB → carga perezosa con dynamic import (mismo patrón
// que public/data/playas-images.json) para no inflar el bundle.
import type { Restaurante } from '@/types'
import type { HotelReal } from './hoteles'
import type { Camping } from './campings'
import type { CentroBuceo } from './buceo'

interface PoiCompacto {
  n: string   // nombre
  k: 'r' | 'h' | 'c' | 'b'
  t: string   // tipo legible ("Restaurante", "Hotel", …)
  la: number
  lo: number
  w?: string  // website
  p?: string  // teléfono
  e?: number  // estrellas (hoteles/campings)
}
interface Sidecar {
  pool: PoiCompacto[]
  zonas: Record<string, { r?: number[]; h?: number[]; c?: number[]; b?: number[] }>
}

let _sidecar: Sidecar | null | undefined
async function getSidecar(): Promise<Sidecar | null> {
  if (_sidecar !== undefined) return _sidecar
  try {
    const { default: data } = await import('@/../public/data/osm-pois.json', {
      assert: { type: 'json' },
    })
    _sidecar = data as unknown as Sidecar
  } catch {
    _sidecar = null
  }
  return _sidecar
}

const hav = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000, r = (d: number) => (d * Math.PI) / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

async function zona(lat: number, lon: number) {
  const s = await getSidecar()
  if (!s) return null
  return { s, z: s.zonas[`${lat.toFixed(4)}:${lon.toFixed(4)}`] ?? null }
}

export async function osmRestaurantes(lat: number, lon: number): Promise<Restaurante[] | null> {
  const r = await zona(lat, lon)
  if (!r?.z?.r?.length) return null
  return r.z.r.map((idx): Restaurante => {
    const p = r.s.pool[idx]
    return {
      id: `osm-${idx}`, nombre: p.n, tipo: p.t,
      distancia_m: Math.round(hav(lat, lon, p.la, p.lo)),
      rating: 0, reseñas: 0, resena: null, precio: '€€', horario: '',
      foto: null, website: p.w ?? null, telefono: p.p ?? null,
      lat: p.la, lon: p.lo, source: 'osm',
    }
  })
}

export async function osmHoteles(lat: number, lon: number): Promise<HotelReal[] | null> {
  const r = await zona(lat, lon)
  if (!r?.z?.h?.length) return null
  return r.z.h.map((idx): HotelReal => {
    const p = r.s.pool[idx]
    return {
      id: `osm-${idx}`, nombre: p.n, estrellas: p.e ?? 0,
      distancia_m: Math.round(hav(lat, lon, p.la, p.lo)),
      rating: 0, reseñas: 0, foto: null,
      website: p.w ?? null, telefono: p.p ?? null,
      googleId: '', source: 'osm',
    }
  })
}

export async function osmCampings(lat: number, lon: number): Promise<Camping[] | null> {
  const r = await zona(lat, lon)
  if (!r?.z?.c?.length) return null
  return r.z.c.map((idx): Camping => {
    const p = r.s.pool[idx]
    return {
      id: `osm-${idx}`, nombre: p.n, tipo: 'Camping', categoria: p.e ?? 0,
      distancia_m: Math.round(hav(lat, lon, p.la, p.lo)),
      servicios: [], tiendas: true, autocaravanas: true, bungalows: false,
      website: p.w ?? null, telefono: p.p ?? null, email: null,
      lat: p.la, lon: p.lo, source: 'osm',
    }
  })
}

export async function osmBuceo(lat: number, lon: number): Promise<CentroBuceo[] | null> {
  const r = await zona(lat, lon)
  if (!r?.z?.b?.length) return null
  return r.z.b.map((idx): CentroBuceo => {
    const p = r.s.pool[idx]
    return {
      id: `osm-${idx}`, nombre: p.n, tipo: 'Centro de buceo',
      distancia_m: Math.round(hav(lat, lon, p.la, p.lo)),
      servicios: [], website: p.w ?? null, telefono: p.p ?? null, email: null,
      lat: p.la, lon: p.lo, source: 'osm',
    }
  })
}
