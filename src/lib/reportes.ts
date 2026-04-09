// src/lib/reportes.ts — Reportes de usuarios sobre estado de playas
// Vercel KV (persistente) → fallback in-memory (por instancia serverless)

export type TipoReporte = 'medusas' | 'bandera_verde' | 'bandera_amarilla' | 'bandera_roja' | 'parking_dificil'

export interface ReportesPlaya {
  medusas:          number
  bandera_verde:    number
  bandera_amarilla: number
  bandera_roja:     number
  parking_dificil:  number
  total:            number
  updatedAt:        string
}

function empty(): ReportesPlaya {
  return {
    medusas: 0, bandera_verde: 0, bandera_amarilla: 0,
    bandera_roja: 0, parking_dificil: 0, total: 0, updatedAt: '',
  }
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

// ── Fallback in-memory (funciona dentro de la misma instancia) ──────
const mem = new Map<string, ReportesPlaya>()

// Limpia claves de días anteriores para no acumular memoria
function memCleanup() {
  const today = new Date().toISOString().slice(0, 10)
  for (const key of mem.keys()) {
    if (!key.endsWith(today)) mem.delete(key)
  }
}

// ── API pública ─────────────────────────────────────────────────────
export async function getReportes(slug: string): Promise<ReportesPlaya> {
  const key = todayKey(slug)

  // Intentar KV primero
  const kv = await getKV()
  if (kv) {
    try {
      const data = await kv.get(key) as ReportesPlaya | null
      return data ?? empty()
    } catch { /* fall through */ }
  }

  // Fallback in-memory
  return mem.get(key) ?? empty()
}

export async function addReporte(slug: string, tipo: TipoReporte): Promise<ReportesPlaya> {
  const key = todayKey(slug)
  memCleanup()

  // Intentar KV primero
  const kv = await getKV()
  if (kv) {
    try {
      const current = ((await kv.get(key)) as ReportesPlaya | null) ?? empty()
      current[tipo] += 1
      current.total += 1
      current.updatedAt = new Date().toISOString()
      await kv.set(key, current, { ex: 86400 })
      // Sincronizar memoria local
      mem.set(key, { ...current })
      return current
    } catch { /* fall through to in-memory */ }
  }

  // Fallback in-memory — sigue sumando entre requests del mismo proceso
  const current = mem.get(key) ?? empty()
  current[tipo] += 1
  current.total += 1
  current.updatedAt = new Date().toISOString()
  mem.set(key, current)
  return { ...current }
}
