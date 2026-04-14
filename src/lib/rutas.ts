// src/lib/rutas.ts — Generador de rutas costeras de playas.
//
// Para cada provincia costera con ≥5 playas, genera una ruta con las
// N mejores playas (por score estático) ordenadas geográficamente
// (nearest-neighbor desde el punto más al norte/oeste). El resultado
// es un itinerario que se puede seguir en coche a lo largo de la costa.
import type { Playa } from '@/types'
import { cache } from 'react'

function toSlug(str: string): string {
  return (str ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function staticScore(p: Playa): number {
  let s = 40
  if (p.bandera) s += 15
  if (p.socorrismo) s += 12
  if (p.duchas) s += 8
  if (p.parking) s += 8
  if (p.accesible) s += 5
  if (p.aseos) s += 3
  if (p.descripcion && !(p as any).descripcion_generada) s += 5
  const g = (p.grado_ocupacion ?? '').toLowerCase()
  if (g.includes('bajo')) s += 8
  else if (g.includes('alto')) s -= 3
  return Math.min(100, s)
}

// Nearest-neighbor ordering starting from the northernmost beach
function orderGeographically(beaches: Playa[]): Playa[] {
  if (beaches.length <= 1) return beaches

  const remaining = [...beaches]
  // Start from the northernmost (highest lat) or westernmost (lowest lng)
  remaining.sort((a, b) => b.lat - a.lat || a.lng - b.lng)
  const ordered: Playa[] = [remaining.shift()!]

  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1]
    let bestIdx = 0
    let bestDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(last.lat, last.lng, remaining[i].lat, remaining[i].lng)
      if (d < bestDist) { bestDist = d; bestIdx = i }
    }
    ordered.push(remaining.splice(bestIdx, 1)[0])
  }
  return ordered
}

export interface RutaPlaya {
  playa: Playa
  distFromPrev: number // km, 0 for first
  score: number
}

export interface Ruta {
  slug: string
  nombre: string
  provincia: string
  comunidad: string
  paradas: RutaPlaya[]
  totalKm: number
  googleMapsUrl: string
}

const COSTERAS = new Set([
  'Galicia', 'Asturias', 'Cantabria', 'País Vasco',
  'Cataluña', 'Comunitat Valenciana', 'Murcia', 'Andalucía',
  'Islas Baleares', 'Canarias', 'Ceuta', 'Melilla',
])

function buildGoogleMapsUrl(paradas: Playa[]): string {
  if (paradas.length === 0) return 'https://www.google.com/maps'
  const origin = `${paradas[0].lat},${paradas[0].lng}`
  const dest = `${paradas[paradas.length - 1].lat},${paradas[paradas.length - 1].lng}`
  const waypoints = paradas.slice(1, -1).map(p => `${p.lat},${p.lng}`).join('|')
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`
}

export function generarRuta(playas: Playa[], provincia: string, count = 5): Ruta | null {
  const provinciaPlayas = playas.filter(p =>
    p.provincia === provincia && typeof p.lat === 'number' && typeof p.lng === 'number'
  )
  if (provinciaPlayas.length < count) return null

  // Pick top N by static score
  const topScored = provinciaPlayas
    .map(p => ({ p, score: staticScore(p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)

  // Order geographically
  const ordered = orderGeographically(topScored.map(x => x.p))

  // Calculate distances
  const paradas: RutaPlaya[] = ordered.map((p, i) => ({
    playa: p,
    distFromPrev: i === 0 ? 0 : haversine(ordered[i - 1].lat, ordered[i - 1].lng, p.lat, p.lng),
    score: topScored.find(x => x.p.slug === p.slug)!.score,
  }))

  const totalKm = paradas.reduce((sum, p) => sum + p.distFromPrev, 0)
  const comunidad = ordered[0]?.comunidad ?? ''

  return {
    slug: `ruta-${count}-playas-${toSlug(provincia)}`,
    nombre: `Ruta de ${count} playas por ${provincia}`,
    provincia,
    comunidad,
    paradas,
    totalKm: Math.round(totalKm * 10) / 10,
    googleMapsUrl: buildGoogleMapsUrl(ordered),
  }
}

export const getRutas = cache(async (playasData: Playa[]): Promise<Ruta[]> => {
  // Get unique coastal provinces with enough beaches
  const provincias = new Set<string>()
  for (const p of playasData) {
    if (COSTERAS.has(p.comunidad) && p.provincia) provincias.add(p.provincia)
  }

  const rutas: Ruta[] = []
  for (const prov of provincias) {
    const ruta = generarRuta(playasData, prov, 5)
    if (ruta) rutas.push(ruta)
  }

  return rutas.sort((a, b) => b.paradas.length - a.paradas.length || a.provincia.localeCompare(b.provincia))
})
