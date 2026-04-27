// src/app/api/opiniones/route.ts
// GET  ?slug=&page=                → opiniones paginadas + agregado
// POST { slug, rating, texto?, alias } → añadir opinión (rate-limited por IP)

import { NextRequest, NextResponse } from 'next/server'
import { getOpiniones, addOpinion } from '@/lib/opiniones'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'

function getIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  const real = req.headers.get('x-real-ip')
  if (real) return real
  return '0.0.0.0'
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug requerido' }, { status: 400 })
  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get('page') ?? '1', 10) || 1)
  const perPage = Math.min(50, Math.max(1, parseInt(req.nextUrl.searchParams.get('perPage') ?? '10', 10) || 10))

  const data = await getOpiniones(slug, page, perPage)
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' },
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'body inválido' }, { status: 400 })
    }
    const { slug, rating, texto, alias } = body as {
      slug?: string; rating?: unknown; texto?: unknown; alias?: unknown
    }
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'slug requerido' }, { status: 400 })
    }

    const ip = getIp(req)
    const result = await addOpinion({ slug, rating, texto, alias, ip })

    if (result.ok === false) {
      const status = result.error === 'rate_limit' ? 429 : 400
      return NextResponse.json({ error: result.error }, { status })
    }

    // Invalida la página de la playa para que la nueva opinión aparezca
    // en el JSON-LD AggregateRating del HTML cacheado.
    try { revalidatePath(`/playas/${slug}`) } catch { /* opcional */ }

    return NextResponse.json(result.data)
  } catch {
    return NextResponse.json({ error: 'error procesando opinión' }, { status: 500 })
  }
}
