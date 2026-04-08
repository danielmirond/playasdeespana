// src/app/api/restaurantes/route.ts
// Proxy para restaurantes cercanos via OpenStreetMap/Overpass (sin API key)

import { NextRequest, NextResponse } from 'next/server'
import { haversine } from '@/lib/geo'
import { parseCoords } from '@/lib/validation'

const RADIUS = 800

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const coords = parseCoords(searchParams.get('lat'), searchParams.get('lon'))

  if (!coords) {
    return NextResponse.json({ error: 'lat y lon requeridos (coordenadas válidas)' }, { status: 400 })
  }

  const resultados = await fromOSM(coords.lat, coords.lon)

  return NextResponse.json(resultados, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
    },
  })
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
        tipo:        el.tags.amenity === 'bar' ? 'Bar' : el.tags.amenity === 'cafe' ? 'Cafetería' : 'Restaurante',
        distancia_m: haversine(lat, lon, el.lat, el.lon),
        rating:      0,
        precio:      el.tags['price_range'] ?? '€€',
        horario:     el.tags.opening_hours ?? '',
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
