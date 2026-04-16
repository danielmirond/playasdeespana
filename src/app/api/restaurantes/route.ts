// src/app/api/restaurantes/route.ts
// Proxy para restaurantes cercanos via OpenStreetMap/Overpass.
// Reutiliza el lib compartido con retry + mirrors.

import { NextRequest, NextResponse } from 'next/server'
import { getRestaurantes } from '@/lib/restaurantes'
import { parseCoords } from '@/lib/validation'

export const runtime = 'nodejs'
// Vercel Hobby cap 10s; Pro permite hasta 60s. Pedimos 25s como techo
// generoso que funciona en ambos planes (la plataforma elige el mínimo).
export const maxDuration = 25

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const coords = parseCoords(sp.get('lat'), sp.get('lon') ?? sp.get('lng'))

  if (!coords) {
    return NextResponse.json({ error: 'lat y lon requeridos (coordenadas válidas)' }, { status: 400 })
  }

  const restaurantes = await getRestaurantes(coords.lat, coords.lon)

  return NextResponse.json({ restaurantes }, {
    headers: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800',
    },
  })
}
