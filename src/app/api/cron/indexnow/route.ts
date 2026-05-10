// src/app/api/cron/indexnow/route.ts
//
// IndexNow protocol (Bing + Yandex + Naver + Seznam): notifica a los
// motores cuando hay URLs nuevas o modificadas, en lugar del antiguo
// /ping?sitemap deprecado.
//
// Por qué importa:
//   - Google /ping?sitemap deprecado en 2023 (Bing también).
//     IndexNow es lo que sustituye al ping legacy.
//   - Tiempo de indexación: minutos en lugar de días.
//   - Bing → ChatGPT Search lee el índice de Bing.
//
// Configuración requerida:
//   1. ENV INDEXNOW_KEY (32 caracteres hex). Si falta, no se llama.
//   2. /<INDEXNOW_KEY>.txt accesible públicamente (la sirve route en
//      app/[indexnowKey]/route.ts).
//
// Schedule: ya añadido en vercel.json al cron diario.

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPlayas } from '@/lib/playas'

export const runtime  = 'nodejs'
export const dynamic  = 'force-dynamic'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

// Endpoint multi-engine: una sola llamada se reparte a todos los
// motores adheridos al protocolo (Bing, Yandex, Naver, Seznam, Yep).
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

interface IndexNowResult {
  ok:      boolean
  status:  number
  body?:   string
  count:   number
}

async function submitBatch(urls: string[], key: string): Promise<IndexNowResult> {
  // El protocolo permite hasta 10.000 URLs por POST.
  const slice = urls.slice(0, 9_990)

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Host':         new URL(INDEXNOW_ENDPOINT).host,
      },
      body: JSON.stringify({
        host:        new URL(BASE).host,
        key,
        keyLocation: `${BASE}/${key}.txt`,
        urlList:     slice,
      }),
    })
    const body = await res.text().catch(() => '')
    return { ok: res.ok, status: res.status, body: body.slice(0, 500), count: slice.length }
  } catch (err) {
    return { ok: false, status: 0, body: (err as Error).message, count: slice.length }
  }
}

export async function GET(req: NextRequest) {
  // Auth: Vercel cron header o key local.
  const authHeader = req.headers.get('authorization')
  const expected   = process.env.CRON_SECRET
  const fromVercel = expected && authHeader === `Bearer ${expected}`
  const isLocal    = req.nextUrl.hostname === 'localhost' || req.nextUrl.hostname === '127.0.0.1'
  if (!fromVercel && !isLocal) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const key = process.env.INDEXNOW_KEY
  if (!key) {
    return NextResponse.json({
      ok:    false,
      error: 'INDEXNOW_KEY env var no configurada (ver /api/cron/indexnow comments)',
    }, { status: 503 })
  }

  // Construir lista de URLs a notificar:
  //   1. Landings principales y home (siempre).
  //   2. Top fichas con mayor score (las que probablemente cambian más).
  // El protocolo recomienda no abusar — solo URLs nuevas o modificadas.
  // Como no tenemos diff de cambios, enviamos el set canónico semanalmente.
  const playas = await getPlayas()

  const LANDINGS = [
    '/', '/playas-aguas-cristalinas', '/playas-paradisiacas',
    '/calas-con-encanto', '/playas-secretas', '/familias',
    '/atardeceres', '/playas-perros', '/playas-nudistas',
    '/playas-accesibles', '/banderas-azules', '/playas-sin-viento',
    '/playas-autocaravana', '/islas', '/campings', '/buceo',
    '/surf', '/medusas', '/calidad-agua', '/protectores-solares',
    '/seguros-viaje', '/metodologia', '/comparar', '/rutas',
    '/alquiler-barco-playa', '/hoteles-playa', '/playas-cerca-de-mi',
  ]

  const topPlayas = playas
    .filter((p: any) => p.bandera)
    .slice(0, 200)
    .map((p: any) => `${BASE}/playas/${p.slug}`)

  const urls = [
    ...LANDINGS.map(p => `${BASE}${p}`),
    ...topPlayas,
  ]

  const t0 = Date.now()
  const result = await submitBatch(urls, key)

  return NextResponse.json({
    ok:        result.ok,
    elapsedMs: Date.now() - t0,
    submitted: result.count,
    response:  { status: result.status, body: result.body },
  })
}
