// src/app/api/reportes/route.ts
// GET  ?slug=playa-slug          → reportes del día
// POST { slug, tipo, value? }    → añadir reporte (value requerido para rating)
import { NextRequest, NextResponse } from 'next/server'
import {
  getReportes,
  addReporte,
  TIPOS_BINARIOS,
  TIPOS_RATING,
  type TipoReporte,
} from '@/lib/reportes'

// Cualquier tipo válido (binarios + ratings).
const TIPOS_VALIDOS = new Set<TipoReporte>([
  ...TIPOS_BINARIOS,
  ...TIPOS_RATING,
])

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug requerido' }, { status: 400 })

  const data = await getReportes(slug)
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=1800' },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, tipo, value } = body as { slug?: string; tipo?: string; value?: number }

    if (!slug || !tipo) {
      return NextResponse.json({ error: 'slug y tipo requeridos' }, { status: 400 })
    }
    if (!TIPOS_VALIDOS.has(tipo as TipoReporte)) {
      return NextResponse.json({ error: 'tipo no válido' }, { status: 400 })
    }

    const isRating = (TIPOS_RATING as readonly string[]).includes(tipo)
    if (isRating) {
      if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5) {
        return NextResponse.json({ error: 'value debe ser un entero 1-5 para tipos rating' }, { status: 400 })
      }
    }

    const data = await addReporte(slug, tipo as TipoReporte, value)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Error procesando reporte' }, { status: 500 })
  }
}
