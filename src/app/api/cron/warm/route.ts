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
import { getMeteoPlaya } from '@/lib/meteo'
import { getMareas, getSol } from '@/lib/marine'
import { kvPeek } from '@/lib/kv-cache'
import { getPlayas, getComunidades, getProvincias } from '@/lib/playas'
import { refetchAndStoreFotos } from '@/lib/fotos'
import { getBanderaCat } from '@/lib/banderas-cat'
import { getBanderaCan } from '@/lib/banderas-can'
import { getBanderaAnd } from '@/lib/banderas-and'
import { getBanderaBiz } from '@/lib/banderas-biz'
import { getBanderaGip } from '@/lib/banderas-gip'
import { getBanderaFerrol } from '@/lib/banderas-ferrol'
import { getBanderaGijon } from '@/lib/banderas-gijon'

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
    | 'landings' | 'geo' | 'top' | 'meteo' | 'all'

  const t0 = Date.now()
  const buckets: Record<string, ReturnType<typeof summarise> & { kvCalientes?: string; segundos?: number }> = {}

  // ─── BANDERAS OFICIALES ────────────────────────────────────────
  // Siete llamadas que dejan KV poblado para ~1.450 fichas: el snapshot de
  // cada fuente es de comunidad entera, no por playa.
  //
  // Corre en TODOS los slices, a propósito. La ficha resuelve estas
  // fuentes con un deadline de 1.500 ms y, en frío, la primera
  // renderización lo pierde: entonces la ficha dice "sin dato" —no
  // adivina— y la ISR congela ese hueco una hora. Precalentar aquí es lo
  // que evita que a nadie le toque el hueco.
  //
  // Se piden por una playa cualquiera de cada comunidad: lo que interesa
  // es el efecto colateral de poblar el snapshot compartido.
  try {
    const [cat, can, and, biz, gip, fer, gij] = await Promise.allSettled([
      getBanderaCat('platja-de-la-barceloneta'),
      getBanderaCan('playa-de-las-canteras'),
      getBanderaAnd('playa-de-la-misericordia'),
      getBanderaBiz('ereaga-getxo'),
      getBanderaGip('zurriola'),
      getBanderaFerrol('praia-de-caranza'),
      getBanderaGijon('playa-de-san-lorenzo-2'),
      // SafeBeach no se precalienta: su snapshot es POR MUNICIPIO y son 44.
      // Precalentarlos todos sería 44 peticiones cada seis horas a una
      // empresa privada que nos deja usar su dato por cortesía.
    ])
    buckets.banderas = summarise('banderas', [cat, can, and, biz, gip, fer, gij].map(r => ({
      url: 'snapshot', ok: r.status === 'fulfilled', status: r.status === 'fulfilled' ? 200 : 0, ms: 0,
    })))
  } catch { /* el warming nunca debe tumbar el cron */ }

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

    // Hero cards: cada /comunidad y /provincia muestra top 6 playas con
    // hero. Si la cascada de fotos no estaba cacheada, esas cards se
    // ven con genérica. Identificamos las top 6 por CCAA + top 6 por
    // provincia (mismo scoring que el componente) y disparamos
    // refetchAndStoreFotos para garantizar foto real en KV.
    const allPlayas = await getPlayas()
    const slugsToWarm = new Set<string>()

    // Top 6 por CCAA (1 por provincia + mejor scoring)
    for (const ccaa of ccaas) {
      const playasCCAA = allPlayas.filter((p: any) => {
        // Match por nombre de comunidad o slug derivado
        return (p.comunidad ?? '').toLowerCase() === ccaa.nombre.toLowerCase()
      })
      const seenProv = new Set<string>()
      const picked: typeof playasCCAA = []
      const sorted = [...playasCCAA].sort((a: any, b: any) => {
        const sa = (a.bandera ? 5 : 0) + (a.socorrismo ? 2 : 0) + (a.accesible ? 1 : 0) + (a.parking ? 1 : 0)
        const sb = (b.bandera ? 5 : 0) + (b.socorrismo ? 2 : 0) + (b.accesible ? 1 : 0) + (b.parking ? 1 : 0)
        return sb - sa
      })
      for (const p of sorted) {
        if (!p.lat || !p.lng) continue
        if (seenProv.has(p.provincia)) continue
        seenProv.add(p.provincia)
        picked.push(p)
        if (picked.length >= 6) break
      }
      for (const p of picked) slugsToWarm.add(p.slug)
    }

    // Top 6 por provincia (1 por municipio + mejor scoring)
    for (const prov of provs) {
      const playasProv = allPlayas.filter((p: any) => {
        return (p.provincia ?? '').toLowerCase() === prov.nombre.toLowerCase()
      })
      const seenMun = new Set<string>()
      const picked: typeof playasProv = []
      const sorted = [...playasProv].sort((a: any, b: any) => {
        const sa = (a.bandera ? 5 : 0) + (a.socorrismo ? 2 : 0) + (a.accesible ? 1 : 0) + (a.parking ? 1 : 0)
        const sb = (b.bandera ? 5 : 0) + (b.socorrismo ? 2 : 0) + (b.accesible ? 1 : 0) + (b.parking ? 1 : 0)
        return sb - sa
      })
      for (const p of sorted) {
        if (!p.lat || !p.lng) continue
        if (seenMun.has(p.municipio)) continue
        seenMun.add(p.municipio)
        picked.push(p)
        if (picked.length >= 6) break
      }
      for (const p of picked) slugsToWarm.add(p.slug)
    }

    // Resolver slugs → playas y disparar refetchAndStoreFotos.
    const playasParaFoto = allPlayas.filter((p: any) => slugsToWarm.has(p.slug))
    const fotosCronT0 = Date.now()
    let fotosOk = 0, fotosVacias = 0, fotosErr = 0
    const fotosBatchSize = 4
    for (let i = 0; i < playasParaFoto.length; i += fotosBatchSize) {
      const batch = playasParaFoto.slice(i, i + fotosBatchSize)
      await Promise.all(batch.map(async (p: any) => {
        try {
          const r = await refetchAndStoreFotos(p.nombre, p.municipio, p.lat, p.lng, p.provincia)
          if (r.length > 0) fotosOk++; else fotosVacias++
        } catch {
          fotosErr++
        }
      }))
    }
    buckets.fotosGeo = {
      label: 'fotos-geo-hero',
      total: playasParaFoto.length,
      ok:    fotosOk,
      errs:  fotosErr,
      hits:  fotosOk,
      miss:  fotosVacias,
      stale: 0,
      avgMs: Math.round((Date.now() - fotosCronT0) / Math.max(1, playasParaFoto.length)),
      slowest: [],
    }
  }

  // ─── METEO Y MAR, LLAMANDO A LAS FUNCIONES ─────────────────────
  //
  // POR QUÉ ESTE BLOQUE EXISTE. El `slice=top` de abajo calienta pidiendo la
  // PÁGINA por HTTP, y para la meteo eso es autofrustrante: ese render sufre
  // exactamente el mismo plazo que sufriría un visitante, así que si la
  // meteo no llega, el calentamiento tampoco la deja en KV. Las banderas y
  // las fotos sí se calientan bien precisamente porque se las llama
  // directamente. Aquí se hace lo mismo con meteo, mar y sol: lo que
  // interesa es el efecto colateral de poblar KV, y el valor se descarta.
  //
  // EL TECHO NO ES EL TIEMPO, ES LA CUOTA. Open-Meteo da 10.000 llamadas al
  // día y 5.000 a la hora. Un barrido de las 5.098 fichas son 10.196
  // llamadas —forecast más marino— y no cabe en un día, así que no se
  // intenta: se calienta lo que tiene tráfico y el resto se calienta solo,
  // en la primera visita, vía el `after()` de la ficha.
  //
  // `getSol` entra aunque su TTL sean 12 h, porque su clave lleva la fecha:
  // caduca a medianoche para las 5.098 A LA VEZ, y sin esto el primer render
  // de cada playa cada día es un fallo garantizado.
  if (slice === 'meteo' || slice === 'all') {
    const t0 = Date.now()
    const limite = Math.min(Number(req.nextUrl.searchParams.get('n') ?? 250), 450)
    const playas = (await getPlayas())
      .filter(p => p.lat && p.lng)
      .map(p => ({ p, score: (p.bandera ? 5 : 0) + (p.socorrismo ? 1 : 0) + (p.parking ? 1 : 0) + (p.accesible ? 1 : 0) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limite)
      .map(x => x.p)

    // Concurrencia 8 y no más: por encima, Open-Meteo empieza a limitar y
    // `fetchWithTimeout` nos lo devolvería como fallo, que es peor que ir
    // despacio. A ese ritmo son 0,58 s por playa —medido—, así que el tope
    // de 450 son unos 260 s y cabe en los 300 de `maxDuration`.
    const resultados: WarmResult[] = []
    for (let i = 0; i < playas.length; i += 8) {
      const lote = playas.slice(i, i + 8)
      const tLote = Date.now()
      const rs = await Promise.allSettled(lote.flatMap(p => [
        getMeteoPlaya(p.lat!, p.lng!),
        getMareas(p.lat!, p.lng!),
        getSol(p.lat!, p.lng!),
      ]))
      const msLote = Date.now() - tLote
      rs.forEach((r, k) => resultados.push({
        url: `${lote[Math.floor(k / 3)]?.slug ?? '?'}:${['meteo', 'mar', 'sol'][k % 3]}`,
        status: r.status === 'fulfilled' && r.value != null ? 200 : 0,
        ms: Math.round(msLote / Math.max(1, rs.length)),
      }))
    }
    // Comprobación DIRECTA del estado de KV, inmune a la ISR: si esto sale
    // a cero, el calentamiento no ha servido de nada por mucho que las
    // llamadas dijeran «ok».
    const muestra = playas.slice(0, 10)
    const calientes = (await Promise.all(
      muestra.map(p => kvPeek('meteo', [p.lat!, p.lng!]).then(v => v != null).catch(() => false)),
    )).filter(Boolean).length

    // `kvCalientes` es lo que de verdad prueba que ha funcionado: el resto
    // de contadores dicen que las llamadas salieron bien, no que el dato
    // quedara guardado.
    buckets.meteo = { ...summarise('meteo', resultados), kvCalientes: `${calientes}/${muestra.length}`, segundos: Math.round((Date.now() - t0) / 1000) }
  }

  // ─── TOP fichas (por score interno) ────────────────────────────
  if (slice === 'top' || slice === 'all') {
    const playas = await getPlayas()
    // Heurística sin GSC: priorizar Bandera Azul + servicios + bajo NSE
    const topPlayas = playas
      .map(p => ({
        playa: p,
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
    const top = topPlayas.map(x => `${BASE}/playas/${x.playa.slug}`)
    buckets.top = summarise('top', await warmBatch(top))

    // Además: forzar refetchAndStoreFotos para las top playas. El GET a
    // /playas/X tiene deadline 1.5s y, si la cascada de fotos tarda más,
    // escribe negative marker en KV. refetchAndStoreFotos salta el cache
    // y la ejecuta sin deadline → garantía de que el KV de fotos para
    // las populares siempre se mantiene fresco.
    // Concurrencia limitada para no saturar APIs (Wikimedia, Flickr, etc).
    const fotosCronT0 = Date.now()
    let fotosOk = 0
    let fotosVacias = 0
    let fotosErr = 0
    const fotosBatchSize = 4  // 4 playas en paralelo
    for (let i = 0; i < topPlayas.length; i += fotosBatchSize) {
      const batch = topPlayas.slice(i, i + fotosBatchSize)
      await Promise.all(batch.map(async ({ playa }) => {
        try {
          const r = await refetchAndStoreFotos(playa.nombre, playa.municipio, playa.lat, playa.lng, playa.provincia)
          if (r.length > 0) fotosOk++; else fotosVacias++
        } catch {
          fotosErr++
        }
      }))
    }
    buckets.fotos = {
      label: 'fotos-top',
      total: topPlayas.length,
      ok:    fotosOk,
      errs:  fotosErr,
      hits:  fotosOk,         // foto recuperada y persistida
      miss:  fotosVacias,     // cascada terminó sin fotos
      stale: 0,
      avgMs: Math.round((Date.now() - fotosCronT0) / Math.max(1, topPlayas.length)),
      slowest: [],
    }
  }

  return NextResponse.json({
    ok:        true,
    slice,
    elapsedMs: Date.now() - t0,
    buckets,
  })
}
