// src/app/api/admin/video-purge/route.ts
//
// Purga el cache KV de videos auto (NO los overrides manuales).
// Útil tras introducir NEGATIVAS_VIDEO para forzar re-search con
// el filtro nuevo sobre todas las playas con video cacheado.
//
// Uso:
//   - Purgar todos:        GET /api/admin/video-purge?all=1
//   - Purgar uno:          GET /api/admin/video-purge?slug=playa-del-faro
//
// AUTH: Bearer CRON_SECRET. Sin secret, exige &confirm=YES.

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(req: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const authHeader = req.headers.get('authorization')
    const isLocal = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1'
    if (authHeader !== `Bearer ${expected}` && !isLocal) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }
  } else {
    if (req.nextUrl.searchParams.get('confirm') !== 'YES') {
      return NextResponse.json(
        { error: 'CRON_SECRET no configurado. Añade &confirm=YES si entiendes el riesgo.' },
        { status: 403 },
      )
    }
  }

  // Cargamos KV dinámico (igual patrón que fotos.ts).
  let kvMod
  try {
    kvMod = await (Function('return import("@vercel/kv")')() as Promise<{
      kv: {
        del:  (k: string) => Promise<number>
        keys: (pat: string) => Promise<string[]>
      }
    }>)
  } catch {
    return NextResponse.json({ error: 'KV no disponible en este entorno' }, { status: 500 })
  }

  const slug = req.nextUrl.searchParams.get('slug')?.trim()
  const purgarTodos = req.nextUrl.searchParams.get('all') === '1'

  if (!slug && !purgarTodos) {
    return NextResponse.json({ error: 'falta &slug=X o &all=1' }, { status: 400 })
  }

  let purgadas = 0
  const errores: string[] = []

  if (slug) {
    try {
      await kvMod.kv.del(`video:auto:${slug}`)
      purgadas = 1
    } catch (e) {
      errores.push(String(e))
    }
  } else {
    // all=1: enumerar las keys con kv.keys('video:auto:*') y borrar.
    try {
      const keys = await kvMod.kv.keys('video:auto:*')
      for (const k of keys) {
        try {
          await kvMod.kv.del(k)
          purgadas++
        } catch (e) {
          errores.push(`${k}: ${String(e)}`)
        }
      }
    } catch (e) {
      return NextResponse.json({ error: `kv.keys fallo: ${String(e)}` }, { status: 500 })
    }
  }

  return NextResponse.json({
    action:  slug ? 'purge-slug' : 'purge-all',
    target:  slug ?? 'video:auto:*',
    purgadas,
    errores: errores.length > 0 ? errores.slice(0, 20) : undefined,
    nota:    'Overrides manuales (video:override:*) NO se tocan.',
  })
}
