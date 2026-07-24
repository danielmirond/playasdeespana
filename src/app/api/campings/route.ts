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
    headers: { // Un array vacío suele ser un fallo puntual de Overpass: si se cachea
      // 24h en el CDN, la sección queda "sin datos" un día entero aunque la
      // fuente se recupere. Vacío → reintento en 2 min.
      'Cache-Control': campings.length > 0 ? 'public, s-maxage=86400, stale-while-revalidate=172800' : 'public, s-maxage=120, stale-while-revalidate=300' },
  })
}
