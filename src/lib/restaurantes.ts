// src/lib/restaurantes.ts — Restaurantes cercanos via OpenStreetMap/Overpass.
//
// Usa el helper `queryOverpass` que reintenta contra varios mirrors y loguea
// los fallos. Devuelve [] si todos los mirrors fallan (la UI cae a un empty
// state con link a Google Maps).
import type { Restaurante } from '@/types'
import { haversine } from './geo'
import { queryOverpass } from './overpass'
import { kvCached } from './kv-cache'
import { IS_BUILD } from './buildGuard'
import { placesNearby } from './google-places'

// Radio razonable para playas: hasta 3 km cubre el paseo marítimo y zonas
// limítrofes, sin hacer la query tan grande que Overpass tarde 15 s.
const RADIUS_M = 3000

function tipoDesdeAmenity(amenity: string): string {
  if (amenity === 'bar') return 'Bar'
  if (amenity === 'cafe') return 'Cafetería'
  return 'Restaurante'
}

// TTL: bares y restaurantes abren/cierran. 3 días es razonable.
const KV_TTL_RESTAURANTES = 3 * 24 * 3600

export async function getRestaurantes(lat: number, lon: number): Promise<Restaurante[]> {
  // Sin red durante `next build`; en runtime, Google Places (valoraciones
  // reales, gated por key y presupuesto) y si no, Overpass/OSM.
  if (IS_BUILD) return []
  const g = await placesNearby(lat, lon, ['restaurant', 'bar', 'cafe'], RADIUS_M, 8)
  if (g && g.length) {
    return g.map((p): Restaurante => ({
      id: p.googleId, nombre: p.nombre, tipo: p.tipo,
      distancia_m: Math.round(haversine(lat, lon, p.lat, p.lon)),
      rating: p.rating, reseñas: p.reseñas, resena: null,
      precio: p.precio, horario: '', foto: null, website: null, telefono: null,
      lat: p.lat, lon: p.lon, googleId: p.googleId, source: 'google',
    })).sort((a, b) => a.distancia_m - b.distancia_m)
  }
  return kvCached('restaurantes', [lat, lon], KV_TTL_RESTAURANTES, () => fetchRestaurantesFromOverpass(lat, lon))
}

async function fetchRestaurantesFromOverpass(lat: number, lon: number): Promise<Restaurante[]> {
  // Query compacta: restaurantes, bares, cafés como nodos dentro del radio.
  // [out:json][timeout:5] limita el tiempo interno de Overpass a 3 s,
  // complementa nuestro timeout por intento de 6 s en el cliente.
  const query = `[out:json][timeout:5];
(
  node["amenity"="restaurant"](around:${RADIUS_M},${lat},${lon});
  node["amenity"="bar"](around:${RADIUS_M},${lat},${lon});
  node["amenity"="cafe"](around:${RADIUS_M},${lat},${lon});
);
out body 30;`

  const elements = await queryOverpass(query, {
    revalidate: 86400,
    label: 'restaurantes',
  })
  if (!elements) return []

  return elements
    .filter((el: any) => el.tags?.name)
    .map((el: any): Restaurante => ({
      id:          String(el.id),
      nombre:      el.tags.name,
      tipo:        tipoDesdeAmenity(el.tags.amenity ?? 'restaurant'),
      distancia_m: haversine(lat, lon, el.lat, el.lon),
      rating:      0,
      reseñas:     0,
      resena:      null,
      precio:      el.tags['price_range'] ?? '€€',
      horario:     el.tags.opening_hours ?? '',
      foto:        null,
      website:     el.tags.website ?? el.tags['contact:website'] ?? null,
      telefono:    el.tags.phone ?? el.tags['contact:phone'] ?? null,
      lat:         el.lat,
      lon:         el.lon,
      source:      'osm',
    }))
    .sort((a: Restaurante, b: Restaurante) => a.distancia_m - b.distancia_m)
    .slice(0, 5)
}
