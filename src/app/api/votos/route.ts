// src/app/api/votos/route.ts
// GET ?slug=playa-slug → votos acumulados
// POST { slug, estrellas } → registrar voto
import { NextRequest, NextResponse } from 'next/server'
import { getVotos, addVoto } from '@/lib/votos'

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug requerido' }, { status: 400 })

  const data = await getVotos(slug)
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, estrellas } = body as { slug?: string; estrellas?: number }

    if (!slug) return NextResponse.json({ error: 'slug requerido' }, { status: 400 })
    if (!estrellas || estrellas < 1 || estrellas > 5 || !Number.isInteger(estrellas)) {
      return NextResponse.json({ error: 'estrellas debe ser 1-5' }, { status: 400 })
    }

    const data = await addVoto(slug, estrellas as 1 | 2 | 3 | 4 | 5)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Error procesando voto' }, { status: 500 })
  }
}
