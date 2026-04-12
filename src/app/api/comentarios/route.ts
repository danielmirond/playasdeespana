// src/app/api/comentarios/route.ts
//
// GET  /api/comentarios?slug=playa-slug             → últimos 50 comentarios
// GET  /api/comentarios?user={userId}               → comentarios de un usuario
// POST /api/comentarios { slug, playaNombre, userId, nickname, avatarSeed, text }
import { NextRequest, NextResponse } from 'next/server'
import { addComentario, getComentarios, getComentariosByUser } from '@/lib/comentarios'

export const runtime = 'nodejs'
// Los comentarios escriben en KV + aplican rate limit. El read es cheap.
export const maxDuration = 10

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const slug = sp.get('slug')
  const user = sp.get('user')

  if (user) {
    const items = await getComentariosByUser(user)
    return NextResponse.json({ comentarios: items }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  }

  if (!slug) {
    return NextResponse.json({ error: 'slug o user requerido' }, { status: 400 })
  }

  const items = await getComentarios(slug)
  return NextResponse.json({ comentarios: items }, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  })
}

export async function POST(req: NextRequest) {
  let body: {
    slug?: string
    playaNombre?: string
    userId?: string
    nickname?: string
    avatarSeed?: string
    text?: string
    honeypot?: string
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  // Honeypot: si un bot rellena el campo oculto, lo cortamos de raíz.
  if (body.honeypot && body.honeypot.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 }) // responder OK sin escribir
  }

  const { slug, playaNombre, userId, nickname, avatarSeed, text } = body
  if (!slug || !userId || !nickname || !text) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  // IP del cliente. En Vercel llega en `x-forwarded-for`.
  const ip = (req.headers.get('x-forwarded-for') ?? '')
    .split(',')[0]
    .trim() || req.headers.get('x-real-ip') || 'unknown'

  const result = await addComentario({
    slug,
    playaNombre,
    userId,
    nickname,
    avatarSeed: avatarSeed ?? nickname,
    text,
    ip,
  })

  if (!result.ok) {
    const status = result.retryAfter ? 429 : 400
    const headers: Record<string, string> = {}
    if (result.retryAfter) headers['Retry-After'] = String(result.retryAfter)
    return NextResponse.json({ error: result.error }, { status, headers })
  }

  return NextResponse.json({ comentario: result.comentario })
}
