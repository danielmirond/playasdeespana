// src/app/api/playas-by-slug/route.ts
// Devuelve playas por slugs (para favoritas, sin descargar todo el JSON)
import { NextRequest, NextResponse } from 'next/server'
import { getPlayas } from '@/lib/playas'

export const revalidate = 3600

export async function GET(req: NextRequest) {
  const slugsParam = req.nextUrl.searchParams.get('slugs')
  if (!slugsParam) return NextResponse.json([])

  const slugs = slugsParam.split(',').slice(0, 20)
  const playas = await getPlayas()
  const found = slugs
    .map(s => playas.find(p => p.slug === s))
    .filter(Boolean)
    .map(p => ({
      slug: p!.slug,
      nombre: p!.nombre,
      municipio: p!.municipio,
      provincia: p!.provincia,
      lat: p!.lat,
      lng: p!.lng,
      bandera: p!.bandera,
    }))

  return NextResponse.json(found, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  })
}
