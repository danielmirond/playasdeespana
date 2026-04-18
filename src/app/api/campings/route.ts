// src/app/api/campings/route.ts
// Proxy para campings y áreas de autocaravanas cercanas via OSM/Overpass.

import { NextRequest, NextResponse } from 'next/server'
import { getCampings } from '@/lib/campings'
import { parseCoords } from '@/lib/validation'

export const runtime = 'nodejs'
export const maxDuration = 25

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const coords = parseCoords(sp.get('lat'), sp.get('lon') ?? sp.get('lng'))

  if (!coords) return NextResponse.json({ campings: [] })

  const campings = await getCampings(coords.lat, coords.lon)

  return NextResponse.json({ campings }, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800' },
  })
}
