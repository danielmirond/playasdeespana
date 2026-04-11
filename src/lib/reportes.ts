// src/lib/reportes.ts — Reportes de usuarios sobre estado de playas.
//
// **Ventana rodante de 24 horas**: cada reporte expira 24 h después del
// momento exacto en que se hizo, no a medianoche. Antes usábamos claves
// `reportes:{slug}:{YYYY-MM-DD}` con TTL 86400, lo que causaba que un
// aviso hecho a las 23:55 desapareciera 5 minutos después.
//
// Ahora guardamos una lista de eventos con timestamp en un único doc KV
// por playa (`reportes:{slug}`). Cada escritura hace:
//   1. Leer el doc actual
//   2. Filtrar eventos con `ts > now - 24h`
//   3. Añadir el evento nuevo
//   4. Guardar
// La función de lectura (`getReportes`) agrega los eventos en contadores
// compatibles con el formato ReportesPlaya que consume la UI — los campos
// visibles no cambian, solo su semántica (es lo reportado en las últimas
// 24 horas, no en el día natural).
//
// Tipos de reporte:
//   - BINARIOS: ocurrencia única. Se acumula el contador +1 por voto.
//   - RATINGS 1-5 (limpieza, afluencia): guardamos el value en el evento
//     y computamos sum/count al agregar.

// ── Tipos ───────────────────────────────────────────────────────────
export type TipoBinario =
  | 'medusas'
  | 'bandera_verde'
  | 'bandera_amarilla'
  | 'bandera_roja'
  | 'parking_dificil'
  | 'acceso_roto'
  | 'mucho_oleaje'
  | 'mucho_viento'

export type TipoRating = 'limpieza' | 'afluencia'

export type TipoReporte = TipoBinario | TipoRating

export const TIPOS_BINARIOS: TipoBinario[] = [
  'medusas',
  'bandera_verde',
  'bandera_amarilla',
  'bandera_roja',
  'parking_dificil',
  'acceso_roto',
  'mucho_oleaje',
  'mucho_viento',
]

export const TIPOS_RATING: TipoRating[] = ['limpieza', 'afluencia']

const WINDOW_MS = 24 * 60 * 60 * 1000   // 24 horas
const MAX_EVENTS = 500                   // cap por playa para evitar crecimiento no acotado

interface ReporteEvento {
  tipo: TipoReporte
  value?: number   // solo presente para ratings 1-5
  ts: number       // Date.now() del momento del reporte
}

interface ReportesStore {
  events: ReporteEvento[]
  updatedAt: string
}

// Aggregated view: lo que ve la UI. Coincide con el formato previo para
// no tener que tocar el componente consumidor.
export interface ReportesPlaya {
  medusas:          number
  bandera_verde:    number
  bandera_amarilla: number
  bandera_roja:     number
  parking_dificil:  number
  acceso_roto:      number
  mucho_oleaje:     number
  mucho_viento:     number
  limpieza_sum:     number
  limpieza_count:   number
  afluencia_sum:    number
  afluencia_count:  number
  total:            number
  updatedAt:        string
}

function emptyReportes(): ReportesPlaya {
  return {
    medusas: 0, bandera_verde: 0, bandera_amarilla: 0, bandera_roja: 0,
    parking_dificil: 0, acceso_roto: 0, mucho_oleaje: 0, mucho_viento: 0,
    limpieza_sum: 0, limpieza_count: 0,
    afluencia_sum: 0, afluencia_count: 0,
    total: 0, updatedAt: '',
  }
}

function emptyStore(): ReportesStore {
  return { events: [], updatedAt: '' }
}

// Reduce a lista de eventos al formato aggregated ReportesPlaya.
function aggregate(events: ReporteEvento[], updatedAt: string): ReportesPlaya {
  const out = emptyReportes()
  out.updatedAt = updatedAt
  for (const ev of events) {
    if ((TIPOS_RATING as readonly string[]).includes(ev.tipo)) {
      if (typeof ev.value !== 'number') continue
      if (ev.tipo === 'limpieza') {
        out.limpieza_sum += ev.value
        out.limpieza_count += 1
      } else if (ev.tipo === 'afluencia') {
        out.afluencia_sum += ev.value
        out.afluencia_count += 1
      }
      out.total += 1
    } else {
      const k = ev.tipo as TipoBinario
      out[k] += 1
      out.total += 1
    }
  }
  return out
}

// Normaliza un doc posiblemente viejo o corrupto. Los docs del schema
// anterior (con contadores planos en lugar de events[]) se tratan como
// vacíos — los contadores antiguos se pierden pero el TTL del schema
// previo ya los estaba borrando cada 24 h de todas formas.
function hydrate(raw: unknown): ReportesStore {
  if (!raw || typeof raw !== 'object') return emptyStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any
  if (Array.isArray(r.events)) {
    return {
      events: r.events.filter((e: unknown): e is ReporteEvento => {
        if (!e || typeof e !== 'object') return false
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ev = e as any
        return typeof ev.tipo === 'string' && typeof ev.ts === 'number'
      }),
      updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : '',
    }
  }
  return emptyStore()
}

function key(slug: string) {
  return `reportes:${slug}`
}

// Filtra eventos dentro de la ventana de 24 h y limita su cantidad.
function pruneEvents(events: ReporteEvento[]): ReporteEvento[] {
  const cutoff = Date.now() - WINDOW_MS
  const fresh = events.filter(e => e.ts > cutoff)
  if (fresh.length > MAX_EVENTS) {
    // Quedarnos con los más recientes
    fresh.sort((a, b) => b.ts - a.ts)
    return fresh.slice(0, MAX_EVENTS)
  }
  return fresh
}

// ── Vercel KV (persistente entre instancias) ────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KV = { get: (key: string) => Promise<any>; set: (key: string, value: any, opts?: any) => Promise<any> }

let _kv: KV | null | undefined
async function getKV(): Promise<KV | null> {
  if (_kv !== undefined) return _kv
  try {
    const mod = await (Function('return import("@vercel/kv")')() as Promise<{ kv: KV }>)
    _kv = mod.kv
    return _kv
  } catch {
    _kv = null
    return null
  }
}

// ── Fallback in-memory ──────────────────────────────────────────────
const mem = new Map<string, ReportesStore>()

// ── API pública ─────────────────────────────────────────────────────
export async function getReportes(slug: string): Promise<ReportesPlaya> {
  const kv = await getKV()
  let store: ReportesStore
  if (kv) {
    try {
      const data = await kv.get(key(slug))
      store = hydrate(data)
    } catch {
      store = hydrate(mem.get(slug))
    }
  } else {
    store = hydrate(mem.get(slug))
  }
  const events = pruneEvents(store.events)
  return aggregate(events, store.updatedAt)
}

/**
 * Añade un reporte. Para tipos rating, `value` debe ser un entero 1-5;
 * valores fuera de rango se descartan silenciosamente devolviendo el
 * estado actual. Para tipos binarios, `value` se ignora.
 *
 * Cada reporte queda vivo exactamente 24 h desde `Date.now()`.
 */
export async function addReporte(
  slug: string,
  tipo: TipoReporte,
  value?: number,
): Promise<ReportesPlaya> {
  const isRating = (TIPOS_RATING as readonly string[]).includes(tipo)
  if (isRating) {
    if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > 5) {
      return await getReportes(slug)
    }
  }

  const event: ReporteEvento = { tipo, ts: Date.now() }
  if (isRating) event.value = value as number

  const apply = (store: ReportesStore): ReportesStore => {
    const pruned = pruneEvents(store.events)
    pruned.push(event)
    return {
      events: pruned,
      updatedAt: new Date().toISOString(),
    }
  }

  const kv = await getKV()
  if (kv) {
    try {
      const stored = await kv.get(key(slug))
      const next = apply(hydrate(stored))
      // TTL 48 h para dar margen — pruneEvents ya filtra por timestamp,
      // pero si la playa queda totalmente inactiva la clave expira sola.
      await kv.set(key(slug), next, { ex: 172800 })
      mem.set(slug, { ...next, events: [...next.events] })
      return aggregate(next.events, next.updatedAt)
    } catch { /* fall through */ }
  }

  const next = apply(hydrate(mem.get(slug)))
  mem.set(slug, next)
  return aggregate(next.events, next.updatedAt)
}
