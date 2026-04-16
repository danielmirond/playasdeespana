// src/lib/rutas.ts — Rutas de playas por costas de España.
//
// Las costas son las denominaciones turísticas/geográficas oficiales,
// no las provincias administrativas. Cada costa agrupa una o más
// provincias y tiene un carácter propio (cantábrico, atlántico,
// mediterráneo, insular).
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

function orderGeographically(beaches: Playa[]): Playa[] {
  if (beaches.length <= 1) return beaches
  const remaining = [...beaches]
  remaining.sort((a, b) => b.lat - a.lat || a.lng - b.lng)
  const ordered: Playa[] = [remaining.shift()!]
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1]
    let bestIdx = 0, bestDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = haversine(last.lat, last.lng, remaining[i].lat, remaining[i].lng)
      if (d < bestDist) { bestDist = d; bestIdx = i }
    }
    ordered.push(remaining.splice(bestIdx, 1)[0])
  }
  return ordered
}

// ── Definición de costas ──────────────────────────────────────────
export interface CostaDef {
  nombre: string
  slug: string
  zona: 'cantabrica' | 'atlantica' | 'mediterranea' | 'insular'
  zonaLabel: string
  provincias: string[]   // nombres canónicos de provincia
  descripcion: string
  color: string
}

export const COSTAS: CostaDef[] = [
  // Cantábrica
  { nombre: 'Costa Vasca', slug: 'costa-vasca', zona: 'cantabrica', zonaLabel: 'Zona Cantábrica',
    provincias: ['Gipuzkoa', 'Bizkaia'], color: '#0ea5e9',
    descripcion: 'Acantilados, surfing y gastronomía. Playas urbanas en San Sebastián y Bilbao y calas salvajes.' },
  { nombre: 'Costa de Cantabria', slug: 'costa-de-cantabria', zona: 'cantabrica', zonaLabel: 'Zona Cantábrica',
    provincias: ['Cantabria'], color: '#0ea5e9',
    descripcion: 'Largas playas de arena fina, dunas y pueblos marineros. Santander, Comillas, San Vicente de la Barquera.' },
  { nombre: 'Costa Verde', slug: 'costa-verde', zona: 'cantabrica', zonaLabel: 'Zona Cantábrica',
    provincias: ['Asturias'], color: '#22c55e',
    descripcion: 'Acantilados verdes, calas escondidas y playas entre montañas. Gijón, Llanes, Cudillero.' },
  // Atlántica
  { nombre: 'Rías Altas', slug: 'rias-altas', zona: 'atlantica', zonaLabel: 'Zona Atlántica',
    provincias: ['A Coruña', 'Lugo'], color: '#3b82f6',
    descripcion: 'Rías profundas, acantilados dramáticos y playas salvajes. Ferrol, A Coruña, Viveiro.' },
  { nombre: 'Costa da Morte', slug: 'costa-da-morte', zona: 'atlantica', zonaLabel: 'Zona Atlántica',
    provincias: ['A Coruña'], color: '#6366f1',
    descripcion: 'La costa más salvaje de España. Fisterra, Muxía, Carnota. Puestas de sol espectaculares.' },
  { nombre: 'Rías Baixas', slug: 'rias-baixas', zona: 'atlantica', zonaLabel: 'Zona Atlántica',
    provincias: ['Pontevedra'], color: '#3b82f6',
    descripcion: 'Rías calmadas, islas paradisíacas (Cíes, Ons) y marisqueo. Vigo, Sanxenxo, Baiona.' },
  { nombre: 'Costa de la Luz', slug: 'costa-de-la-luz', zona: 'atlantica', zonaLabel: 'Zona Atlántica',
    provincias: ['Huelva', 'Cádiz'], color: '#eab308',
    descripcion: 'Playas interminables de arena dorada, viento de Levante y Tarifa. Bolonia, Zahara, Doñana.' },
  // Mediterránea
  { nombre: 'Costa del Sol', slug: 'costa-del-sol', zona: 'mediterranea', zonaLabel: 'Zona Mediterránea',
    provincias: ['Málaga'], color: '#f97316',
    descripcion: '320 días de sol, chiringuitos y vida nocturna. Marbella, Nerja, Torremolinos.' },
  { nombre: 'Costa Tropical', slug: 'costa-tropical', zona: 'mediterranea', zonaLabel: 'Zona Mediterránea',
    provincias: ['Granada'], color: '#f97316',
    descripcion: 'Microclima subtropical, calas entre acantilados. Almuñécar, Salobreña, La Herradura.' },
  { nombre: 'Costa de Almería', slug: 'costa-de-almeria', zona: 'mediterranea', zonaLabel: 'Zona Mediterránea',
    provincias: ['Almería'], color: '#f59e0b',
    descripcion: 'Desierto y mar. Cabo de Gata, Mónsul, playas vírgenes. El rincón más seco de Europa.' },
  { nombre: 'Costa Cálida', slug: 'costa-calida', zona: 'mediterranea', zonaLabel: 'Zona Mediterránea',
    provincias: ['Murcia'], color: '#ef4444',
    descripcion: 'Mar Menor y Mediterráneo. Aguas cálidas, La Manga, Calblanque.' },
  { nombre: 'Costa Blanca', slug: 'costa-blanca', zona: 'mediterranea', zonaLabel: 'Zona Mediterránea',
    provincias: ['Alicante'], color: '#f8fafc',
    descripcion: 'Benidorm, calas de Javea, Calpe. Turismo de sol consolidado y aguas cristalinas.' },
  { nombre: 'Costa del Azahar', slug: 'costa-del-azahar', zona: 'mediterranea', zonaLabel: 'Zona Mediterránea',
    provincias: ['Castellón'], color: '#fb923c',
    descripcion: 'Naranjos hasta el mar. Peñíscola, Benicàssim, Oropesa. Playas amplias y familiares.' },
  { nombre: 'Costa de Valencia', slug: 'costa-de-valencia', zona: 'mediterranea', zonaLabel: 'Zona Mediterránea',
    provincias: ['Valencia'], color: '#f97316',
    descripcion: 'La Malvarrosa, El Saler, Gandía. Playas urbanas y arrozales junto al mar.' },
  { nombre: 'Costa Dorada', slug: 'costa-dorada', zona: 'mediterranea', zonaLabel: 'Zona Mediterránea',
    provincias: ['Tarragona'], color: '#eab308',
    descripcion: 'Playas doradas y poco profundas. Salou, Cambrils, ruinas romanas frente al mar.' },
  { nombre: 'Costa del Garraf', slug: 'costa-del-garraf', zona: 'mediterranea', zonaLabel: 'Zona Mediterránea',
    provincias: ['Barcelona'], color: '#a855f7',
    descripcion: 'Sitges, Castelldefels, Barceloneta. La costa de Barcelona entre calas y paseos marítimos.' },
  { nombre: 'Costa Brava', slug: 'costa-brava', zona: 'mediterranea', zonaLabel: 'Zona Mediterránea',
    provincias: ['Girona'], color: '#14b8a6',
    descripcion: 'Calas escondidas, pueblos medievales y Dalí. Cadaqués, Tossa de Mar, Calella de Palafrugell.' },
  // Insular
  { nombre: 'Islas Baleares', slug: 'islas-baleares', zona: 'insular', zonaLabel: 'Islas',
    provincias: ['Baleares'], color: '#0ea5e9',
    descripcion: 'Mallorca, Menorca, Ibiza y Formentera. Calas turquesa, posidonia y puestas de sol.' },
  { nombre: 'Islas Canarias', slug: 'islas-canarias', zona: 'insular', zonaLabel: 'Islas',
    provincias: ['Las Palmas', 'Santa Cruz de Tenerife'], color: '#f59e0b',
    descripcion: 'Volcanes y playas negras y doradas. Eterna primavera. Fuerteventura, Tenerife, Lanzarote.' },
]

export interface RutaPlaya {
  playa: Playa
  distFromPrev: number
  score: number
}

export interface Ruta {
  slug: string
  nombre: string
  costa: CostaDef
  paradas: RutaPlaya[]
  totalKm: number
  googleMapsUrl: string
}

function buildGoogleMapsUrl(paradas: Playa[]): string {
  if (paradas.length === 0) return 'https://www.google.com/maps'
  const origin = `${paradas[0].lat},${paradas[0].lng}`
  const dest = `${paradas[paradas.length - 1].lat},${paradas[paradas.length - 1].lng}`
  const waypoints = paradas.slice(1, -1).map(p => `${p.lat},${p.lng}`).join('|')
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${waypoints ? `&waypoints=${waypoints}` : ''}&travelmode=driving`
}

export function generarRutaCosta(playas: Playa[], costa: CostaDef, count = 5): Ruta | null {
  const costaPlayas = playas.filter(p =>
    costa.provincias.includes(p.provincia) &&
    typeof p.lat === 'number' && typeof p.lng === 'number'
  )
  if (costaPlayas.length < count) return null

  const topScored = costaPlayas
    .map(p => ({ p, score: staticScore(p) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)

  const ordered = orderGeographically(topScored.map(x => x.p))

  const paradas: RutaPlaya[] = ordered.map((p, i) => ({
    playa: p,
    distFromPrev: i === 0 ? 0 : haversine(ordered[i - 1].lat, ordered[i - 1].lng, p.lat, p.lng),
    score: topScored.find(x => x.p.slug === p.slug)!.score,
  }))

  const totalKm = paradas.reduce((sum, p) => sum + p.distFromPrev, 0)

  return {
    slug: `ruta-${costa.slug}`,
    nombre: `Ruta por la ${costa.nombre}`,
    costa,
    paradas,
    totalKm: Math.round(totalKm * 10) / 10,
    googleMapsUrl: buildGoogleMapsUrl(ordered),
  }
}

export const getRutas = cache(async (playasData: Playa[]): Promise<Ruta[]> => {
  const rutas: Ruta[] = []
  for (const costa of COSTAS) {
    const ruta = generarRutaCosta(playasData, costa, 5)
    if (ruta) rutas.push(ruta)
  }
  return rutas
})
