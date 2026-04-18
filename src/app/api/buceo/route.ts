import { NextRequest, NextResponse } from 'next/server'
import { getCentrosBuceo } from '@/lib/buceo'
import { parseCoords } from '@/lib/validation'

export const runtime = 'nodejs'
export const maxDuration = 25

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const coords = parseCoords(sp.get('lat'), sp.get('lon') ?? sp.get('lng'))
  if (!coords) return NextResponse.json({ centros: [] })

  const centros = await getCentrosBuceo(coords.lat, coords.lon)
  return NextResponse.json({ centros }, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800' },
  })
}
