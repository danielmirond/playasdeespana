// src/lib/hoteles.ts — Hoteles cercanos via OpenStreetMap/Overpass.
//
// Usa el helper `queryOverpass` con retry + mirrors. La query es más
// simple que la anterior: antes incluía apartment y ways[hotel|hostel],
// que multiplicaban el tiempo de respuesta y el tamaño del JSON sin
// aportar demasiado. Solo nodos de tourism = hotel / hostel / guest_house.
import { haversine } from './geo'
import { queryOverpass } from './overpass'

const RADIUS_M = 5000

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

export async function getHoteles(lat: number, lon: number): Promise<HotelReal[]> {
  // Query solo con nodos. Incluye ways solo para hoteles (los edificios
  // grandes vienen como ways en OSM), con `out center` para conseguir
  // las coordenadas centrales.
  const query = `[out:json][timeout:8];
(
  node["tourism"="hotel"](around:${RADIUS_M},${lat},${lon});
  node["tourism"="hostel"](around:${RADIUS_M},${lat},${lon});
  node["tourism"="guest_house"](around:${RADIUS_M},${lat},${lon});
  way["tourism"="hotel"](around:${RADIUS_M},${lat},${lon});
);
out center body 40;`

  const elements = await queryOverpass(query, {
    timeoutPerAttempt: 7000,
    revalidate: 86400,
    label: 'hoteles',
  })
  if (!elements) return []

  return elements
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
    .sort((a: HotelReal, b: HotelReal) => a.distancia_m - b.distancia_m)
    .slice(0, 5)
}
