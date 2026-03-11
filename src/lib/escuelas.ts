// src/lib/escuelas.ts
// Escuelas de deportes acuáticos via OpenStreetMap Overpass API

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
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method:  'POST',
      body:    `data=${encodeURIComponent(query)}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      next:    { revalidate: 86400 },
    })
    if (!res.ok) return []
    const data = await res.json()

    return (data.elements ?? [])
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
  } catch {
    return []
  }
}
