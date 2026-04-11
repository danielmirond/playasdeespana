// src/lib/restaurantes.ts — Restaurantes cercanos via OpenStreetMap/Overpass.
//
// Usa el helper `queryOverpass` que reintenta contra varios mirrors y loguea
// los fallos. Devuelve [] si todos los mirrors fallan (la UI cae a un empty
// state con link a Google Maps).
import type { Restaurante } from '@/types'
import { haversine } from './geo'
import { queryOverpass } from './overpass'

// Radio razonable para playas: hasta 3 km cubre el paseo marítimo y zonas
// limítrofes, sin hacer la query tan grande que Overpass tarde 15 s.
const RADIUS_M = 3000

function tipoDesdeAmenity(amenity: string): string {
  if (amenity === 'bar') return 'Bar'
  if (amenity === 'cafe') return 'Cafetería'
  return 'Restaurante'
}

export async function getRestaurantes(lat: number, lon: number): Promise<Restaurante[]> {
  // Query compacta: restaurantes, bares, cafés como nodos dentro del radio.
  // [out:json][timeout:8] limita el tiempo interno de Overpass a 8 s,
  // complementa nuestro timeout por intento de 7 s en el cliente.
  const query = `[out:json][timeout:8];
(
  node["amenity"="restaurant"](around:${RADIUS_M},${lat},${lon});
  node["amenity"="bar"](around:${RADIUS_M},${lat},${lon});
  node["amenity"="cafe"](around:${RADIUS_M},${lat},${lon});
);
out body 30;`

  const elements = await queryOverpass(query, {
    timeoutPerAttempt: 7000,
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
