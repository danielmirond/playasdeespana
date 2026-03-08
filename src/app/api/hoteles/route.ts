import { NextRequest, NextResponse } from 'next/server'
import { getHoteles } from '@/lib/hoteles'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const sp    = req.nextUrl.searchParams
  const lat   = parseFloat(sp.get('lat') ?? '0')
  const lon   = parseFloat(sp.get('lon') ?? '0')
  const radio = parseInt(sp.get('radio') ?? '2000')
  const n     = Math.min(8, parseInt(sp.get('n') ?? '5'))

  if (!lat || !lon) return NextResponse.json({ hoteles: [] })

  const hoteles = await getHoteles({ lat, lon, radio, n })

  return NextResponse.json({ hoteles }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
