// src/lib/reportes.ts — Reportes de usuarios sobre estado de playas.
// Vercel KV (persistente) → fallback in-memory (por instancia serverless).
//
// Tipos de reporte:
//   - BINARIOS: ocurrencia única. Se acumula el contador +1 por voto.
//     medusas, bandera_verde/amarilla/roja, parking_dificil, acceso_roto,
//     mucho_oleaje, mucho_viento.
//
//   - RATINGS 1-5: limpieza, afluencia. Guardamos sum y count por separado;
//     el promedio = sum / count lo calcula la UI. Así ahorramos un field
//     por nivel (limpieza_1, limpieza_2, ...).

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

export interface ReportesPlaya {
  // Binarios
  medusas:          number
  bandera_verde:    number
  bandera_amarilla: number
  bandera_roja:     number
  parking_dificil:  number
  acceso_roto:      number
  mucho_oleaje:     number
  mucho_viento:     number
  // Ratings: suma y número de votos. Promedio = sum / count.
  limpieza_sum:     number
  limpieza_count:   number
  afluencia_sum:    number
  afluencia_count:  number
  // Total de interacciones del día. Suma de todos los contadores binarios
  // más el número de votos rating (no las sumas).
  total:            number
  updatedAt:        string
}

function empty(): ReportesPlaya {
  return {
    medusas: 0, bandera_verde: 0, bandera_amarilla: 0, bandera_roja: 0,
    parking_dificil: 0, acceso_roto: 0, mucho_oleaje: 0, mucho_viento: 0,
    limpieza_sum: 0, limpieza_count: 0,
    afluencia_sum: 0, afluencia_count: 0,
    total: 0, updatedAt: '',
  }
}

// Hidrata un documento posiblemente viejo (del KV) con los campos nuevos
// a 0 para mantener compatibilidad retroactiva cuando añadimos campos.
function hydrate(data: Partial<ReportesPlaya> | null): ReportesPlaya {
  return { ...empty(), ...(data ?? {}) }
}

function todayKey(slug: string) {
  const d = new Date().toISOString().slice(0, 10)
  return `reportes:${slug}:${d}`
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
const mem = new Map<string, ReportesPlaya>()

function memCleanup() {
  const today = new Date().toISOString().slice(0, 10)
  for (const key of mem.keys()) {
    if (!key.endsWith(today)) mem.delete(key)
  }
}

// ── API pública ─────────────────────────────────────────────────────
export async function getReportes(slug: string): Promise<ReportesPlaya> {
  const key = todayKey(slug)
  const kv = await getKV()
  if (kv) {
    try {
      const data = (await kv.get(key)) as Partial<ReportesPlaya> | null
      return hydrate(data)
    } catch { /* fall through */ }
  }
  return hydrate(mem.get(key) ?? null)
}

/**
 * Añade un reporte. Para tipos rating (limpieza/afluencia), `value` debe
 * ser un entero 1-5; valores fuera de rango se descartan silenciosamente
 * devolviendo el estado actual. Para tipos binarios, `value` se ignora.
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

  const key = todayKey(slug)
  memCleanup()

  const apply = (current: ReportesPlaya): ReportesPlaya => {
    if (isRating) {
      if (tipo === 'limpieza') {
        current.limpieza_sum += value as number
        current.limpieza_count += 1
      } else if (tipo === 'afluencia') {
        current.afluencia_sum += value as number
        current.afluencia_count += 1
      }
    } else {
      current[tipo as TipoBinario] += 1
    }
    current.total += 1
    current.updatedAt = new Date().toISOString()
    return current
  }

  const kv = await getKV()
  if (kv) {
    try {
      const stored = (await kv.get(key)) as Partial<ReportesPlaya> | null
      const current = apply(hydrate(stored))
      await kv.set(key, current, { ex: 86400 })
      mem.set(key, { ...current })
      return current
    } catch { /* fall through */ }
  }

  const current = apply(hydrate(mem.get(key) ?? null))
  mem.set(key, current)
  return { ...current }
}
