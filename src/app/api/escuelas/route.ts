// src/app/api/escuelas/route.ts — Endpoint de retry client-side cuando
// el SSR de la ficha no pudo traer escuelas dentro del deadline (1.5s).
// Cachea KV idéntico al getEscuelas server-side.

import { NextRequest, NextResponse } from 'next/server'
import { getEscuelas } from '@/lib/escuelas'
import { parseCoords } from '@/lib/validation'

export const runtime = 'nodejs'
export const maxDuration = 25

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const coords = parseCoords(sp.get('lat'), sp.get('lon') ?? sp.get('lng'))
  if (!coords) return NextResponse.json({ escuelas: [] })

  const escuelas = await getEscuelas(coords.lat, coords.lon)
  return NextResponse.json({ escuelas }, {
    headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=172800' },
  })
}
