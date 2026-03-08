// src/lib/hoteles.ts

const PLACES_KEY = process.env.GOOGLE_PLACES_KEY ?? ''
const RADIUS_M   = 2000

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

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
  source:      'google'
}

async function getHotelDetails(placeId: string): Promise<{ website: string | null; telefono: string | null; precio: string | null }> {
  if (!PLACES_KEY) return { website: null, telefono: null, precio: null }
  try {
    const params = new URLSearchParams({
      place_id: placeId,
      fields:   'website,formatted_phone_number,price_level',
      key:      PLACES_KEY,
    })
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return { website: null, telefono: null, precio: null }
    const data = await res.json()
    return {
      website:  data.result?.website ?? null,
      telefono: data.result?.formatted_phone_number ?? null,
      precio:   ['', '€', '€€', '€€€', '€€€€'][data.result?.price_level ?? 0] ?? null,
    }
  } catch {
    return { website: null, telefono: null, precio: null }
  }
}

function inferirEstrellas(types: string[], nombre: string): number {
  const n = nombre.toLowerCase()
  if (n.includes('grand') || n.includes('palace') || n.includes('luxury') || n.includes('resort')) return 5
  if (n.includes('hotel') && (n.includes('playa') || n.includes('beach') || n.includes('mar'))) return 4
  if (types.includes('lodging') && n.includes('hotel')) return 3
  if (n.includes('hostal') || n.includes('pensión') || n.includes('pension')) return 2
  if (n.includes('hostel') || n.includes('camping') || n.includes('apartamento')) return 1
  return 3
}

export async function getHoteles(lat: number, lon: number): Promise<HotelReal[]> {
  if (!PLACES_KEY) return []

  const params = new URLSearchParams({
    location: `${lat},${lon}`,
    radius:   String(RADIUS_M),
    type:     'lodging',
    key:      PLACES_KEY,
    language: 'es',
  })

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    if (data.status !== 'OK') return []

    const top4 = (data.results ?? [])
      .filter((p: any) => !p.permanently_closed && (p.rating ?? 0) >= 3.5)
      .sort((a: any, b: any) => {
        const scoreA = (a.rating ?? 0) * Math.log10(Math.max(a.user_ratings_total ?? 1, 10))
        const scoreB = (b.rating ?? 0) * Math.log10(Math.max(b.user_ratings_total ?? 1, 10))
        return scoreB - scoreA
      })
      .slice(0, 4)

    const details = await Promise.all(top4.map((p: any) => getHotelDetails(p.place_id)))

    return top4.map((p: any, i: number): HotelReal => ({
      id:          p.place_id,
      googleId:    p.place_id,
      nombre:      p.name,
      estrellas:   inferirEstrellas(p.types ?? [], p.name),
      distancia_m: Math.round(haversine(lat, lon, p.geometry.location.lat, p.geometry.location.lng)),
      rating:      p.rating ?? 0,
      reseñas:     p.user_ratings_total ?? 0,
      precio:      details[i].precio ?? '€€',
      foto:        p.photos?.[0]?.photo_reference
                   ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${p.photos[0].photo_reference}&key=${PLACES_KEY}`
                   : null,
      website:     details[i].website,
      telefono:    details[i].telefono,
      source:      'google',
    }))
  } catch {
    return []
  }
}
