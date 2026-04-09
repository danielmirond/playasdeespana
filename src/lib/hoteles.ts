// src/lib/hoteles.ts — OpenStreetMap/Overpass (sin API key)
import { haversine } from './geo'

const RADIOS = [2000, 5000, 10000] // Búsqueda progresiva: 2km → 5km → 10km

export interface HotelReal {
  id:          string
  nombre:      string
  estrellas:   number
  distancia_m: number
  rating:      number
  reseñas:     number
  precio?:     string
  foto?:       string | null
  website?:    string | null
  telefono?:   string | null
  googleId:    string
  source:      'osm'
}

function inferirEstrellas(tags: Record<string, string>): number {
  const stars = parseInt(tags['stars'] ?? tags['tourism:stars'] ?? '0')
  if (stars > 0) return Math.min(stars, 5)
  const nombre = (tags.name ?? '').toLowerCase()
  if (nombre.includes('grand') || nombre.includes('palace') || nombre.includes('resort')) return 5
  if (nombre.includes('hotel') && (nombre.includes('playa') || nombre.includes('beach'))) return 4
  if (tags.tourism === 'hostel' || nombre.includes('hostel')) return 1
  if (tags.tourism === 'guest_house' || nombre.includes('hostal') || nombre.includes('pensión')) return 2
  return 3
}

function inferirPrecio(estrellas: number): string {
  if (estrellas >= 5) return '€€€€'
  if (estrellas === 4) return '€€€'
  if (estrellas === 3) return '€€'
  return '€'
}

async function buscarOSM(lat: number, lon: number, radio: number): Promise<HotelReal[]> {
  const query = `[out:json][timeout:15];
(
  node["tourism"="hotel"](around:${radio},${lat},${lon});
  node["tourism"="hostel"](around:${radio},${lat},${lon});
  node["tourism"="guest_house"](around:${radio},${lat},${lon});
  node["tourism"="apartment"](around:${radio},${lat},${lon});
  way["tourism"="hotel"](around:${radio},${lat},${lon});
  way["tourism"="hostel"](around:${radio},${lat},${lon});
);
out center body;`

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body:   query,
      next:   { revalidate: 86400 },
    })
    if (!res.ok) return []
    const data = await res.json()

    return (data.elements ?? [])
      .filter((el: any) => el.tags?.name)
      .map((el: any): HotelReal => {
        const elLat = el.lat ?? el.center?.lat ?? lat
        const elLon = el.lon ?? el.center?.lon ?? lon
        const estrellas = inferirEstrellas(el.tags ?? {})
        return {
          id:          String(el.id),
          googleId:    String(el.id),
          nombre:      el.tags.name,
          estrellas,
          distancia_m: Math.round(haversine(lat, lon, elLat, elLon)),
          rating:      0,
          reseñas:     0,
          precio:      inferirPrecio(estrellas),
          foto:        null,
          website:     el.tags.website ?? el.tags['contact:website'] ?? null,
          telefono:    el.tags.phone ?? el.tags['contact:phone'] ?? null,
          source:      'osm',
        }
      })
  } catch {
    return []
  }
}

export async function getHoteles(lat: number, lon: number): Promise<HotelReal[]> {
  for (const radio of RADIOS) {
    const results = await buscarOSM(lat, lon, radio)
    if (results.length > 0) {
      return results
        .sort((a: HotelReal, b: HotelReal) => a.distancia_m - b.distancia_m)
        .slice(0, 5)
    }
  }
  return []
}
