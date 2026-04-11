// src/app/api/hoteles/route.ts
// Proxy para hoteles cercanos via OpenStreetMap/Overpass.
// Reutiliza el lib compartido con retry + mirrors.

import { NextRequest, NextResponse } from 'next/server'
import { getHoteles } from '@/lib/hoteles'
import { parseCoords } from '@/lib/validation'

export const runtime = 'nodejs'
// Vercel Hobby cap 10s; Pro permite hasta 60s.
export const maxDuration = 25

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const coords = parseCoords(sp.get('lat'), sp.get('lon') ?? sp.get('lng'))

  if (!coords) return NextResponse.json({ hoteles: [] })

  const hoteles = await getHoteles(coords.lat, coords.lon)

  return NextResponse.json({ hoteles }, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800' },
  })
}
