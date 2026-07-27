// src/app/api/estuve/route.ts — Contador social anónimo de "Estuve aquí".
//
// GET  ?slug=playa   → { total }  (cuántos bañistas la marcaron, histórico)
// POST { slug }      → { total }  (suma 1; el cliente evita repetir con
//                       localStorage — el cuaderno es por dispositivo)
//
// Sin usuarios ni sesiones: un INCR por playa en KV, nada más. No hay
// decremento al desmarcar: "estuve" es histórico, no un like reversible.
import { NextRequest, NextResponse } from 'next/server'
import { getPlayaBySlug } from '@/lib/playas'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KV = { get: (k: string) => Promise<any>; incr: (k: string) => Promise<number> }
let _kv: KV | null | undefined
async function getKV(): Promise<KV | null> {
  if (_kv !== undefined) return _kv
  try {
    const mod = await (import('@vercel/kv') as Promise<{ kv: KV }>)
    _kv = mod.kv
  } catch { _kv = null }
  return _kv
}

const key = (slug: string) => `estuve:${slug}`

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug requerido' }, { status: 400 })
  try {
    const kv = await getKV()
    const total = kv ? (parseInt(String(await kv.get(key(slug)) ?? '0'), 10) || 0) : 0
    return NextResponse.json({ total }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  } catch {
    return NextResponse.json({ total: 0 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slug } = await req.json() as { slug?: string }
    if (!slug || typeof slug !== 'string' || slug.length > 120) {
      return NextResponse.json({ error: 'slug inválido' }, { status: 400 })
    }
    // Solo playas reales: sin esto, el endpoint sería un contador libre.
    const playa = await getPlayaBySlug(slug)
    if (!playa) return NextResponse.json({ error: 'playa desconocida' }, { status: 404 })

    const kv = await getKV()
    if (!kv) return NextResponse.json({ total: 0 })
    // AWAIT siempre (lección Places jul-2026): fire-and-forget muere con
    // la lambda y el contador jamás se escribiría.
    const total = await Promise.race([
      kv.incr(key(slug)),
      new Promise<number>(r => setTimeout(() => r(0), 1500)),
    ])
    return NextResponse.json({ total })
  } catch {
    return NextResponse.json({ total: 0 })
  }
}
