// src/lib/restaurantes.ts — Restaurantes cercanos via OpenStreetMap/Overpass (sin API key)
import type { Restaurante } from '@/types'
import { haversine } from './geo'

const RADIOS = [800, 2000, 5000] // Búsqueda progresiva: 800m → 2km → 5km

function tipoDesdeAmenity(amenity: string): string {
  if (amenity === 'bar') return 'Bar'
  if (amenity === 'cafe') return 'Cafetería'
  return 'Restaurante'
}

async function buscarOSM(lat: number, lon: number, radio: number): Promise<Restaurante[]> {
  const query = `[out:json][timeout:10];
(
  node["amenity"="restaurant"](around:${radio},${lat},${lon});
  node["amenity"="bar"](around:${radio},${lat},${lon});
  node["amenity"="cafe"](around:${radio},${lat},${lon});
);
out body;`

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
  } catch {
    return []
  }
}

export async function getRestaurantes(lat: number, lon: number): Promise<Restaurante[]> {
  for (const radio of RADIOS) {
    const results = await buscarOSM(lat, lon, radio)
    if (results.length > 0) {
      return results
        .sort((a, b) => a.distancia_m - b.distancia_m)
        .slice(0, 5)
    }
  }
  return []
}
