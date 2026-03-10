// src/app/api/parkings/route.ts — OpenStreetMap/Overpass (sin API key)
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 3600

function distancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))
}

function inferirPrecio(tags: Record<string, string>): string {
  const fee = tags['fee'] ?? ''
  if (fee === 'no') return 'Gratuito'
  if (fee === 'yes') return tags['charge'] ?? '~2€/h'
  return 'Precio n/d'
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat/lng requeridos' }, { status: 400 })
  }

  const query = `[out:json][timeout:15];
(
  node["amenity"="parking"](around:1500,${lat},${lng});
  way["amenity"="parking"](around:1500,${lat},${lng});
);
out center body;`

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body:   query,
      next:   { revalidate: 3600 },
    })
    if (!res.ok) return NextResponse.json([], { status: 200 })

    const data = await res.json()

    const parkings = (data.elements ?? [])
      .map((el: any) => {
        const elLat = el.lat ?? el.center?.lat ?? lat
        const elLng = el.lon ?? el.center?.lon ?? lng
        return {
          nombre:    el.tags?.name ?? el.tags?.['addr:street'] ?? 'Parking',
          direccion: el.tags?.['addr:street'] ?? '',
          distancia: distancia(lat, lng, elLat, elLng),
          plazas:    el.tags?.capacity ? parseInt(el.tags.capacity) : null,
          precio:    inferirPrecio(el.tags ?? {}),
          abierto:   null,
          rating:    null,
          googleId:  String(el.id),
          lat:       elLat,
          lng:       elLng,
        }
      })
      .sort((a: any, b: any) => a.distancia - b.distancia)
      .slice(0, 5)

    return NextResponse.json(parkings)
  } catch (e) {
    console.error('[parkings]', e)
    return NextResponse.json([], { status: 200 })
  }
}
