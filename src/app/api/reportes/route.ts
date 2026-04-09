// src/app/api/reportes/route.ts
// GET ?slug=playa-slug → reportes del día
// POST { slug, tipo } → añadir reporte
import { NextRequest, NextResponse } from 'next/server'
import { getReportes, addReporte, type TipoReporte } from '@/lib/reportes'

const TIPOS_VALIDOS: TipoReporte[] = [
  'medusas', 'bandera_verde', 'bandera_amarilla', 'bandera_roja', 'parking_dificil',
]

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug requerido' }, { status: 400 })

  const data = await getReportes(slug)
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, tipo } = body as { slug?: string; tipo?: string }

    if (!slug || !tipo) {
      return NextResponse.json({ error: 'slug y tipo requeridos' }, { status: 400 })
    }
    if (!TIPOS_VALIDOS.includes(tipo as TipoReporte)) {
      return NextResponse.json({ error: 'tipo no válido' }, { status: 400 })
    }

    const data = await addReporte(slug, tipo as TipoReporte)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Error procesando reporte' }, { status: 500 })
  }
}
