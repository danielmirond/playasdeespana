// src/app/api/parkings/route.ts
import { NextRequest, NextResponse } from 'next/server'

export const revalidate = 3600

interface PlaceResult {
  place_id:     string
  name:         string
  vicinity:     string
  rating?:      number
  geometry:     { location: { lat: number; lng: number } }
  opening_hours?: { open_now: boolean }
  price_level?: number
}

function distancia(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))
}

function precioDesde(priceLevel?: number): string {
  if (priceLevel === undefined || priceLevel === null) return 'Precio n/d'
  const precios = ['Gratuito', '~1€/h', '~2€/h', '~3€/h', '+4€/h']
  return precios[priceLevel] ?? 'Precio n/d'
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const lat = parseFloat(searchParams.get('lat') ?? '')
  const lng = parseFloat(searchParams.get('lng') ?? '')

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat/lng requeridos' }, { status: 400 })
  }

  const key = process.env.GOOGLE_PLACES_KEY
  if (!key) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    // Google Places Nearby Search — tipo parking
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`
      + `?location=${lat},${lng}`
      + `&radius=1500`
      + `&type=parking`
      + `&key=${key}`

    const res  = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return NextResponse.json([], { status: 200 })

    const data = await res.json()
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error('[parkings] Google Places error:', data.status)
      return NextResponse.json([], { status: 200 })
    }

    const results: PlaceResult[] = data.results ?? []

    const parkings = results
      .slice(0, 5)
      .map(p => ({
        nombre:    p.name,
        direccion: p.vicinity,
        distancia: distancia(lat, lng, p.geometry.location.lat, p.geometry.location.lng),
        plazas:    null,   // Google Places no da plazas disponibles
        precio:    precioDesde(p.price_level),
        abierto:   p.opening_hours?.open_now ?? null,
        rating:    p.rating ?? null,
        googleId:  p.place_id,
        lat:       p.geometry.location.lat,
        lng:       p.geometry.location.lng,
      }))
      .sort((a, b) => a.distancia - b.distancia)

    return NextResponse.json(parkings)
  } catch (e) {
    console.error('[parkings]', e)
    return NextResponse.json([], { status: 200 })
  }
}
