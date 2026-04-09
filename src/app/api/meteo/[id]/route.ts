// src/app/api/meteo/[id]/route.ts
// Proxy para datos meteorológicos via Open-Meteo (sin API key)
// Mantiene la ruta [id] para retrocompatibilidad, pero acepta ?lat=&lng= como alternativa

import { NextRequest, NextResponse } from 'next/server'
import { getMeteoPlaya } from '@/lib/meteo'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const sp = req.nextUrl.searchParams
  const lat = parseFloat(sp.get('lat') ?? '0')
  const lng = parseFloat(sp.get('lng') ?? '0')

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat y lng requeridos' }, { status: 400 })
  }

  const data = await getMeteoPlaya(lat, lng)
  if (!data) {
    return NextResponse.json({ error: 'No se pudieron obtener datos meteorológicos' }, { status: 502 })
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=21600',
    },
  })
}
