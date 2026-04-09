// src/lib/escuelas.ts
// Escuelas de deportes acuáticos via OpenStreetMap Overpass API
import { fetchWithTimeout } from './fetch-timeout'

export interface Escuela {
  id:        number
  nombre:    string
  tipo:      string
  lat:       number
  lng:       number
  web?:      string
  telefono?: string
  distancia_m?: number
}

const TIPO_MAP: Record<string, string> = {
  'surf':          'Surf',
  'scuba_diving':  'Buceo',
  'kitesurfing':   'Kitesurf',
  'windsurfing':   'Windsurf',
  'kayak':         'Kayak',
  'paddleboarding':'Paddle surf',
  'snorkeling':    'Snorkel',
  'yoga':          'Yoga',
  'water_sports':  'Deportes acuáticos',
  'swimming':      'Natación',
}

function detectarTipo(tags: Record<string, string>): string {
  const sport = tags.sport ?? ''
  const leisure = tags.leisure ?? ''
  const name = (tags.name ?? '').toLowerCase()

  for (const [key, label] of Object.entries(TIPO_MAP)) {
    if (sport.includes(key) || leisure.includes(key) || name.includes(key)) return label
  }
  if (name.includes('surf'))    return 'Surf'
  if (name.includes('buceo') || name.includes('diving')) return 'Buceo'
  if (name.includes('kite'))    return 'Kitesurf'
  if (name.includes('wind'))    return 'Windsurf'
  if (name.includes('kayak'))   return 'Kayak'
  if (name.includes('paddle'))  return 'Paddle surf'
  if (name.includes('yoga'))    return 'Yoga'
  return 'Escuela acuática'
}

function distancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))
}

export async function getEscuelas(lat: number, lng: number, radio = 5000): Promise<Escuela[]> {
  // Intentar Foursquare primero (mejor cobertura)
  const foursquare = await getEscuelasFoursquare(lat, lng, radio)
  if (foursquare.length >= 2) return foursquare
  try {
    const query = `
      [out:json][timeout:10];
      (
        node["sport"~"surf|scuba_diving|kitesurfing|windsurfing|kayak|paddleboarding|snorkeling|yoga|water_sports"](around:${radio},${lat},${lng});
        node["leisure"="sports_centre"]["sport"~"surf|diving|kite|wind|kayak|paddle|water"](around:${radio},${lat},${lng});
        node["amenity"="diving_school"](around:${radio},${lat},${lng});
        node["name"~"surf|buceo|kite|windsurf|kayak|paddle|snorkel|yoga|diving",i](around:${radio},${lat},${lng});
        way["sport"~"surf|scuba_diving|kitesurfing|windsurfing|kayak|water_sports"](around:${radio},${lat},${lng});
      );
      out center;
    `
    const res = await fetchWithTimeout('https://overpass-api.de/api/interpreter', {
      method:  'POST',
      body:    `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      next:    { revalidate: 86400 },
    })
    if (!res.ok) return []
    const data = await res.json()

    const osm_results = (data.elements ?? [])
      .filter((e: any) => e.tags?.name)
      .map((e: any): Escuela => ({
        id:         e.id,
        nombre:     e.tags.name,
        tipo:       detectarTipo(e.tags),
        lat:        e.lat ?? e.center?.lat,
        lng:        e.lon ?? e.center?.lon,
        web:        e.tags.website ?? e.tags['contact:website'],
        telefono:   e.tags.phone ?? e.tags['contact:phone'],
        distancia_m: distancia(lat, lng, e.lat ?? e.center?.lat, e.lon ?? e.center?.lon),
      }))
      .filter((e: Escuela) => e.lat && e.lng)
      .sort((a: Escuela, b: Escuela) => (a.distancia_m ?? 0) - (b.distancia_m ?? 0))
      .slice(0, 10)

    // Combinar con Foursquare si OSM tiene pocos
    return osm_results.length > 0 ? osm_results : foursquare
  } catch {
    return foursquare
  }
}

// Foursquare fallback
const FOURSQUARE_CATEGORIES = [
  '19032', // Surf Shop / School
  '19009', // Scuba Diving
  '18008', // Water Sports
  '19040', // Kiteboarding
  '19044', // Windsurfing
  '19025', // Kayaking
  '19048', // Paddleboarding
  '15057', // Yoga Studio
]

async function getEscuelasFoursquare(lat: number, lng: number, radio = 5000): Promise<Escuela[]> {
  const key = process.env.FOURSQUARE_API_KEY
  if (!key) return []
  try {
    const params = new URLSearchParams({
      ll:           `${lat},${lng}`,
      radius:       String(radio),
      categories:   FOURSQUARE_CATEGORIES.join(','),
      limit:        '10',
      fields:       'fsq_id,name,categories,distance,website,tel,geocodes',
    })
    const res = await fetchWithTimeout(
      `https://api.foursquare.com/v3/places/search?${params}`,
      {
        headers: { Authorization: key, Accept: 'application/json' },
        next: { revalidate: 86400 },
      }
    )
    if (!res.ok) return []
    const data = await res.json()

    return (data.results ?? []).map((p: any): Escuela => ({
      id:          p.fsq_id,
      nombre:      p.name,
      tipo:        p.categories?.[0]?.name ?? 'Deportes acuáticos',
      lat:         p.geocodes?.main?.latitude,
      lng:         p.geocodes?.main?.longitude,
      web:         p.website,
      telefono:    p.tel,
      distancia_m: p.distance,
    })).filter((e: Escuela) => e.lat && e.lng)
  } catch {
    return []
  }
}
