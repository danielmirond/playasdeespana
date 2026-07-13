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
import { getAllArticles, getAllArticlesEn, CATEGORIES } from '@/lib/magazine'
import { getAllLocalities } from '@/lib/boat-rental-localities'
import { boatRentalSlug } from '@/lib/boat-rental-helpers'
import { getCamperCitiesEn } from '@/lib/autocaravana-localities'

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
    '/calas-secretas', '/familias',
    '/atardeceres', '/playas-perros', '/playas-nudistas',
    '/playas-accesibles', '/banderas-azules', '/playas-sin-viento',
    '/playas-autocaravana', '/islas', '/campings', '/buceo',
    '/surf', '/medusas', '/calidad-agua', '/protectores-solares',
    '/seguros-viaje', '/metodologia', '/comparar', '/rutas',
    '/hoteles-playa', '/playas-cerca-de-mi',
  ]

  const topPlayas = playas
    .filter((p: any) => p.bandera)
    .slice(0, 200)
    .map((p: any) => `${BASE}/playas/${p.slug}`)

  // Magazine (ES + EN): índice, categorías y artículos.
  const magazine = [
    `${BASE}/magazine`,
    ...Object.keys(CATEGORIES).map(c => `${BASE}/magazine/categoria/${c}`),
    ...getAllArticles().map(a => `${BASE}/magazine/${a.slug}`),
    `${BASE}/en/magazine`,
    ...Object.keys(CATEGORIES).map(c => `${BASE}/en/magazine/category/${c}`),
    ...getAllArticlesEn().map(a => `${BASE}/en/magazine/${a.slug}`),
  ]

  // Alquiler de barcos: jerarquía canónica costa → provincia → localidad.
  const boat: string[] = []
  {
    const locs = getAllLocalities()
    const coasts = new Set<string>(), provs = new Set<string>()
    for (const l of locs) {
      const cs = boatRentalSlug(l.coast), ps = boatRentalSlug(l.province)
      coasts.add(cs); provs.add(`${cs}/${ps}`)
      boat.push(`${BASE}/alquiler-barco/costas/${cs}/provincias/${ps}/${l.slug}`)
    }
    for (const cs of coasts) boat.push(`${BASE}/alquiler-barco/costas/${cs}`)
    for (const cp of provs) boat.push(`${BASE}/alquiler-barco/costas/${cp.split('/')[0]}/provincias/${cp.split('/')[1]}`)
  }

  // Comerciales EN + ciudades camper EN traducidas + pillars EN.
  const enComercial = [
    `${BASE}/en/campervan-rental`, `${BASE}/en/yacht-rental`, `${BASE}/en/catamaran-rental`,
    `${BASE}/en/islands`, `${BASE}/en/crystal-clear-water-beaches`,
    ...getCamperCitiesEn().map(c => `${BASE}/en/campervan-rental/${c.slug}`),
  ]

  const urls = [
    ...LANDINGS.map(p => `${BASE}${p}`),
    ...magazine,
    ...boat,
    ...enComercial,
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
