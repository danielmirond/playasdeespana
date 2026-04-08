import { NextRequest, NextResponse } from 'next/server'
import { getHoteles } from '@/lib/hoteles'
import { parseCoords } from '@/lib/validation'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const coords = parseCoords(sp.get('lat'), sp.get('lon'))

  if (!coords) return NextResponse.json({ hoteles: [] })

  const hoteles = await getHoteles(coords.lat, coords.lon)

  return NextResponse.json({ hoteles }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
