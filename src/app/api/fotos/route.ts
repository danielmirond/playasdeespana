import { NextRequest, NextResponse } from 'next/server'
import { getFotos } from '@/lib/fotos'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const sp       = req.nextUrl.searchParams
  const slug     = sp.get('slug')     ?? ''
  const nombre   = sp.get('nombre')   ?? 'playa'
  const municipio= sp.get('municipio')?? ''
  const comunidad= sp.get('comunidad')?? 'España'
  const lat      = parseFloat(sp.get('lat') ?? '0')
  const lon      = parseFloat(sp.get('lon') ?? '0')
  const n        = Math.min(6, parseInt(sp.get('n') ?? '3'))

  if (!slug) return NextResponse.json({ fotos: [] })

  const fotos = await getFotos({ slug, nombre, municipio, comunidad, lat, lon, n })
  return NextResponse.json({ fotos }, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
  })
}
