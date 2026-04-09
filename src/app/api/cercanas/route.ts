// src/app/api/cercanas/route.ts
// Devuelve las 6 playas más cercanas a unas coordenadas (sin descargar todo el JSON en el cliente)
import { NextRequest, NextResponse } from 'next/server'
import { getPlayas } from '@/lib/playas'
import { haversine } from '@/lib/geo'
import { parseCoords } from '@/lib/validation'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const coords = parseCoords(sp.get('lat'), sp.get('lon') ?? sp.get('lng'))
  if (!coords) return NextResponse.json([], { status: 400 })

  const playas = await getPlayas()
  const cercanas = playas
    .map(p => ({
      slug: p.slug,
      nombre: p.nombre,
      municipio: p.municipio,
      provincia: p.provincia,
      lat: p.lat,
      lng: p.lng,
      bandera: p.bandera,
      distKm: haversine(coords.lat, coords.lon, p.lat, p.lng) / 1000,
    }))
    .sort((a, b) => a.distKm - b.distKm)
    .slice(0, 6)

  return NextResponse.json(cercanas, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
