// src/app/api/revalidate/route.ts
// Purga de caché: ISR + fetch cache
//
// Uso:
//   GET /api/revalidate?path=/playas/la-concha       → purga una playa
//   GET /api/revalidate?path=/playas/[slug]          → purga todas las playas ES
//   GET /api/revalidate?path=/en/beaches/[slug]      → purga todas las playas EN
//   GET /api/revalidate?all=1&secret=<REVALIDATE_SECRET>   → purga todo
//
// El parámetro ?all=1 requiere REVALIDATE_SECRET en .env para evitar abuso.

import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SECRET = process.env.REVALIDATE_SECRET ?? ''

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const all = sp.get('all') === '1'
  const secret = sp.get('secret') ?? ''

  // Purga masiva: todas las fichas de playa + home
  if (all) {
    if (!SECRET || secret !== SECRET) {
      return NextResponse.json({ error: 'invalid or missing secret' }, { status: 401 })
    }
    revalidatePath('/', 'layout')
    revalidatePath('/playas/[slug]', 'page')
    revalidatePath('/en/beaches/[slug]', 'page')
    revalidatePath('/comunidad/[slug]', 'page')
    revalidatePath('/provincia/[slug]', 'page')
    revalidatePath('/municipio/[slug]', 'page')
    return NextResponse.json({
      revalidated: true,
      scope: 'all',
      at: new Date().toISOString(),
    })
  }

  // Purga individual
  const path = sp.get('path') ?? '/'
  const type = sp.get('type') === 'layout' ? 'layout' : 'page'
  revalidatePath(path, type)
  return NextResponse.json({
    revalidated: true,
    path,
    type,
    at: new Date().toISOString(),
  })
}
