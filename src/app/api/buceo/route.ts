import { NextRequest, NextResponse } from 'next/server'
import { getCentrosBuceo } from '@/lib/buceo'
import { parseCoords } from '@/lib/validation'

export const runtime = 'nodejs'
export const maxDuration = 25

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const coords = parseCoords(sp.get('lat'), sp.get('lon') ?? sp.get('lng'))
  if (!coords) return NextResponse.json({ centros: [] })

  const centros = await getCentrosBuceo(coords.lat, coords.lon, { google: sp.get('g') === '1' })
  return NextResponse.json({ centros }, {
    headers: { // Un array vacío suele ser un fallo puntual de Overpass: si se cachea
      // 24h en el CDN, la sección queda "sin datos" un día entero aunque la
      // fuente se recupere. Vacío → reintento en 2 min.
      'Cache-Control': centros.length > 0 ? 'public, s-maxage=86400, stale-while-revalidate=172800' : 'public, s-maxage=120, stale-while-revalidate=300' },
  })
}
