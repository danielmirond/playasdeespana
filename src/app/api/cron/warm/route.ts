// src/app/api/cron/warm/route.ts
//
// Cron de "cache warming" — recorre las URLs principales del site para que
// estén calientes en el edge cache de Vercel y reducir TTFB de la primera
// visita real.
//
// Por qué importa (Google Content Warehouse):
//   - NavBoost mide goodClicks/badClicks en SERP. Un TTFB alto en la
//     primera visita aumenta abandonos antes de FCP → badClick.
//   - imageQualityClickSignals y otros se nutren de visitas reales que
//     llegan al fold; si la página tarda, el usuario salta.
//
// Cómo funciona:
//   - Llama en paralelo (concurrencia limitada) a todas las URLs.
//   - Cada fetch dispara la build ISR del CDN edge si la entrada está fría.
//   - Hace HEAD si disponible (más barato), GET si no.
//   - Devuelve un resumen con tiempos por bucket.
//
// Schedule (vercel.json):
//   - "/api/cron/warm?slice=landings"  → cada 6h (22 landings)
//   - "/api/cron/warm?slice=geo"       → diario (CCAAs + provincias)
//   - "/api/cron/warm?slice=top"       → cada 12h (top fichas con score alto)
//
// Auth: Vercel cron añade `Authorization: Bearer <CRON_SECRET>`.
// En desarrollo permitimos `?key=<NEXT_PUBLIC_BASE_URL>` para tests.

import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPlayas, getComunidades, getProvincias } from '@/lib/playas'

export const runtime  = 'nodejs'
export const dynamic  = 'force-dynamic'  // siempre recalcular, no cachear el cron

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const CONCURRENCY = 8
const FETCH_TIMEOUT_MS = 8000

// Landings principales que SIEMPRE warmamos
const LANDINGS = [
  '/',
  '/playas-aguas-cristalinas',
  '/playas-paradisiacas',
  '/calas-con-encanto',
  '/playas-secretas',
  '/familias',
  '/atardeceres',
  '/playas-perros',
  '/playas-nudistas',
  '/playas-accesibles',
  '/banderas-azules',
  '/playas-sin-viento',
  '/playas-autocaravana',
  '/islas',
  '/campings',
  '/buceo',
  '/surf',
  '/medusas',
  '/calidad-agua',
  '/protectores-solares',
  '/seguros-viaje',
  '/metodologia',
  '/comparar',
  '/alquiler-barco-playa',
  '/hoteles-playa',
]

interface WarmResult {
  url:    string
  status: number
  ms:     number
  cache?: string  // x-vercel-cache header
}

async function warmOne(url: string): Promise<WarmResult> {
  const t0 = Date.now()
  const ctrl = new AbortController()
  const tid = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      method:  'GET',
      signal:  ctrl.signal,
      headers: { 'User-Agent': 'playasdeespana-warm/1.0', 'Accept': 'text/html' },
      // No-cache deliberado: queremos que el ISR se ejecute en el edge.
      cache: 'no-store',
    })
    return {
      url,
      status: res.status,
      ms:     Date.now() - t0,
      cache:  res.headers.get('x-vercel-cache') ?? undefined,
    }
  } catch (err) {
    return { url, status: 0, ms: Date.now() - t0, cache: 'error:' + (err as Error).message.slice(0, 60) }
  } finally {
    clearTimeout(tid)
  }
}

async function warmBatch(urls: string[], concurrency: number = CONCURRENCY): Promise<WarmResult[]> {
  const results: WarmResult[] = []
  let i = 0
  async function worker() {
    while (i < urls.length) {
      const idx = i++
      results.push(await warmOne(urls[idx]))
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, urls.length) }, () => worker())
  await Promise.all(workers)
  return results
}

function summarise(label: string, results: WarmResult[]) {
  const ok    = results.filter(r => r.status >= 200 && r.status < 400).length
  const errs  = results.filter(r => r.status === 0 || r.status >= 400).length
  const hits  = results.filter(r => r.cache === 'HIT').length
  const miss  = results.filter(r => r.cache === 'MISS').length
  const stale = results.filter(r => r.cache === 'STALE').length
  const ms    = results.length ? Math.round(results.reduce((a, r) => a + r.ms, 0) / results.length) : 0
  const slow  = results.filter(r => r.ms > 1500).map(r => ({ url: r.url, ms: r.ms })).slice(0, 5)
  return { label, total: results.length, ok, errs, hits, miss, stale, avgMs: ms, slowest: slow }
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

  const slice = (req.nextUrl.searchParams.get('slice') ?? 'landings') as
    | 'landings' | 'geo' | 'top' | 'all'

  const t0 = Date.now()
  const buckets: Record<string, ReturnType<typeof summarise>> = {}

  // ─── LANDINGS ──────────────────────────────────────────────────
  if (slice === 'landings' || slice === 'all') {
    const urls = LANDINGS.map(p => BASE + p)
    buckets.landings = summarise('landings', await warmBatch(urls))
  }

  // ─── GEO (CCAA + provincias) ───────────────────────────────────
  if (slice === 'geo' || slice === 'all') {
    const [ccaas, provs] = await Promise.all([getComunidades(), getProvincias()])
    const urls = [
      ...ccaas.map(c => `${BASE}/comunidad/${c.slug}`),
      ...provs.map(p => `${BASE}/provincia/${p.slug}`),
    ]
    buckets.geo = summarise('geo', await warmBatch(urls))
  }

  // ─── TOP fichas (por score interno) ────────────────────────────
  if (slice === 'top' || slice === 'all') {
    const playas = await getPlayas()
    // Heurística sin GSC: priorizar Bandera Azul + servicios + bajo NSE
    const top = playas
      .map(p => ({
        slug: p.slug,
        score:
          (p.bandera ? 5 : 0) +
          (p.socorrismo ? 1 : 0) +
          (p.parking ? 1 : 0) +
          (p.accesible ? 1 : 0) +
          (p.lat && p.lng ? 1 : 0),
      }))
      .filter(x => x.score >= 5)
      .sort((a, b) => b.score - a.score)
      .slice(0, 100)
      .map(x => `${BASE}/playas/${x.slug}`)
    buckets.top = summarise('top', await warmBatch(top))
  }

  return NextResponse.json({
    ok:        true,
    slice,
    elapsedMs: Date.now() - t0,
    buckets,
  })
}
