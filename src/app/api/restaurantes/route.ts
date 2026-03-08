// src/app/api/restaurantes/route.ts
// Proxy para Google Places (con fallback a Overpass/OSM)
// Query params: lat, lon

import { NextRequest, NextResponse } from 'next/server'

const PLACES_KEY = process.env.GOOGLE_PLACES_KEY ?? ''
const RADIUS = 800

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'lat y lon requeridos' }, { status: 400 })
  }

  const resultados = PLACES_KEY
    ? await fromGoogle(parseFloat(lat), parseFloat(lon))
    : await fromOSM(parseFloat(lat), parseFloat(lon))

  return NextResponse.json(resultados, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
    },
  })
}

async function fromGoogle(lat: number, lon: number) {
  const params = new URLSearchParams({
    location: `${lat},${lon}`,
    radius: String(RADIUS),
    type: 'restaurant',
    keyword: 'chiringuito playa marisquería',
    key: PLACES_KEY,
    language: 'es',
  })

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`
  )
  if (!res.ok) return []
  const { results } = await res.json()

  return (results ?? []).slice(0, 5).map((p: any) => ({
    id:          p.place_id,
    nombre:      p.name,
    tipo:        mapTipo(p.types),
    distancia_m: haversine(lat, lon, p.geometry.location.lat, p.geometry.location.lng),
    rating:      p.rating ?? 0,
    precio:      ['', '€', '€€', '€€€', '€€€€'][p.price_level ?? 2],
    horario:     p.opening_hours?.open_now ? 'Abierto ahora' : '',
    lat:         p.geometry.location.lat,
    lon:         p.geometry.location.lng,
    source:      'google',
  }))
}

async function fromOSM(lat: number, lon: number) {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"~"restaurant|bar|cafe"](around:${RADIUS},${lat},${lon});
    );
    out body;
  `
  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    })
    if (!res.ok) return []
    const { elements } = await res.json()

    return (elements ?? [])
      .filter((el: any) => el.tags?.name)
      .slice(0, 5)
      .map((el: any) => ({
        id:          String(el.id),
        nombre:      el.tags.name,
        tipo:        el.tags.amenity === 'bar' ? 'Bar' : 'Restaurante',
        distancia_m: haversine(lat, lon, el.lat, el.lon),
        rating:      0,
        precio:      '€€',
        horario:     el.tags.opening_hours ?? '',
        lat:         el.lat,
        lon:         el.lon,
        source:      'osm',
      }))
  } catch {
    return []
  }
}

function mapTipo(types: string[] = []): string {
  if (types.includes('bar')) return 'Bar'
  if (types.includes('cafe')) return 'Cafetería'
  return 'Restaurante'
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}
