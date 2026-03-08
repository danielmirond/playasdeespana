// src/lib/restaurantes.ts
import type { Restaurante } from '@/types'

const PLACES_KEY = process.env.GOOGLE_PLACES_KEY ?? ''
const RADIUS_M   = 800

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function tipoBonito(types: string[]): string {
  const map: Record<string, string> = {
    restaurant:    'Restaurante',
    bar:           'Bar · Pintxos',
    cafe:          'Cafetería',
    meal_takeaway: 'Para llevar',
    seafood:       'Marisquería',
    bakery:        'Panadería',
  }
  for (const t of types) {
    if (map[t]) return map[t]
  }
  return 'Restaurante'
}

// Llama a Places Details para obtener la mejor reseña en español
interface PlaceDetails { resena: string | null; website: string | null; telefono: string | null }

async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  if (!PLACES_KEY) return { resena: null, website: null, telefono: null }
  try {
    const params = new URLSearchParams({
      place_id: placeId,
      fields:   'reviews,website,formatted_phone_number',
      language: 'es',
      key:      PLACES_KEY,
    })
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return { resena: null, website: null, telefono: null }
    const data = await res.json()
    const reviews: any[] = data.result?.reviews ?? []
    // Coger la reseña más larga en español con rating >= 4
    const buenas = reviews
      .filter(r => r.rating >= 4 && r.text?.length > 30)
      .sort((a, b) => b.text.length - a.text.length)
    const resena = buenas.length > 0
      ? (buenas[0].text.length > 120 ? buenas[0].text.slice(0, 117) + '…' : buenas[0].text)
      : null
    return {
      resena,
      website: data.result?.website ?? null,
      telefono: data.result?.formatted_phone_number ?? null,
    }
  } catch {
    return { resena: null, website: null, telefono: null }
  }
}

async function getRestaurantesGoogle(lat: number, lon: number): Promise<Restaurante[]> {
  if (!PLACES_KEY) return []

  const params = new URLSearchParams({
    location: `${lat},${lon}`,
    radius:   String(RADIUS_M),
    type:     'restaurant',
    key:      PLACES_KEY,
    language: 'es',
  })

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`,
    { next: { revalidate: 86400 } }
  )
  if (!res.ok) return []

  const data = await res.json()
  if (data.status !== 'OK') return []

  const top5 = (data.results ?? [])
    .filter((p: any) => !p.permanently_closed && p.rating >= 3.5)
    .sort((a: any, b: any) => {
      const scoreA = (a.rating ?? 0) * Math.log10(Math.max(a.user_ratings_total ?? 1, 10))
      const scoreB = (b.rating ?? 0) * Math.log10(Math.max(b.user_ratings_total ?? 1, 10))
      return scoreB - scoreA
    })
    .slice(0, 5)

  // Obtener reseñas en paralelo (cacheadas 24h)
  const details = await Promise.all(top5.map((p: any) => getPlaceDetails(p.place_id)))

  return top5.map((p: any, i: number): Restaurante => ({
    id:          p.place_id,
    googleId:    p.place_id,
    nombre:      p.name,
    tipo:        tipoBonito(p.types ?? []),
    distancia_m: Math.round(haversine(lat, lon, p.geometry.location.lat, p.geometry.location.lng)),
    rating:      p.rating ?? 0,
    reseñas:     p.user_ratings_total ?? 0,
    resena:      details[i].resena,
    website:     details[i].website,
    telefono:    details[i].telefono,
    precio:      ['', '€', '€€', '€€€', '€€€€'][p.price_level ?? 2] ?? '€€',
    horario:     p.opening_hours?.open_now === true  ? 'Abierto ahora'
               : p.opening_hours?.open_now === false ? 'Cerrado ahora'
               : '',
    foto:        p.photos?.[0]?.photo_reference
                 ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=${PLACES_KEY}`
                 : null,
    lat:         p.geometry.location.lat,
    lon:         p.geometry.location.lng,
    source:      'google',
  }))
}

async function getRestaurantesOSM(lat: number, lon: number): Promise<Restaurante[]> {
  const query = `[out:json][timeout:10];
(
  node["amenity"="restaurant"](around:${RADIUS_M},${lat},${lon});
  node["amenity"="bar"](around:${RADIUS_M},${lat},${lon});
  node["amenity"="cafe"](around:${RADIUS_M},${lat},${lon});
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
      .slice(0, 5)
      .map((el: any): Restaurante => ({
        id:          String(el.id),
        nombre:      el.tags.name,
        tipo:        el.tags.amenity === 'bar' ? 'Bar' : el.tags.amenity === 'cafe' ? 'Cafetería' : 'Restaurante',
        distancia_m: Math.round(haversine(lat, lon, el.lat, el.lon)),
        rating:      0,
        reseñas:     0,
        resena:      null,
        precio:      el.tags['price_range'] ?? '€€',
        horario:     el.tags.opening_hours ?? '',
        foto:        null,
        lat:         el.lat,
        lon:         el.lon,
        source:      'osm',
      }))
  } catch {
    return []
  }
}

export async function getRestaurantes(lat: number, lon: number): Promise<Restaurante[]> {
  const results = PLACES_KEY
    ? await getRestaurantesGoogle(lat, lon)
    : await getRestaurantesOSM(lat, lon)
  return results.sort((a, b) => a.distancia_m - b.distancia_m)
}
