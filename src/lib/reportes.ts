// src/lib/reportes.ts — Reportes de usuarios sobre estado de playas
// Usa Vercel KV si está disponible, si no degrada a solo-lectura vacío.

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

const EMPTY: ReportesPlaya = {
  medusas: 0, bandera_verde: 0, bandera_amarilla: 0,
  bandera_roja: 0, parking_dificil: 0, total: 0, updatedAt: '',
}

function todayKey(slug: string) {
  const d = new Date().toISOString().slice(0, 10)
  return `reportes:${slug}:${d}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KV = { get: (key: string) => Promise<any>; set: (key: string, value: any, opts?: any) => Promise<any> }

// Lazy-load @vercel/kv solo si está instalado
let _kv: KV | null | undefined
async function getKV(): Promise<KV | null> {
  if (_kv !== undefined) return _kv
  try {
    // Dynamic import — falla silenciosamente si no está instalado
    const mod = await (Function('return import("@vercel/kv")')() as Promise<{ kv: KV }>)
    _kv = mod.kv
    return _kv
  } catch {
    _kv = null
    return null
  }
}

export async function getReportes(slug: string): Promise<ReportesPlaya> {
  const kv = await getKV()
  if (!kv) return { ...EMPTY }
  try {
    const data = await kv.get(todayKey(slug)) as ReportesPlaya | null
    return data ?? { ...EMPTY }
  } catch {
    return { ...EMPTY }
  }
}

export async function addReporte(slug: string, tipo: TipoReporte): Promise<ReportesPlaya> {
  const kv = await getKV()
  if (!kv) return { ...EMPTY }

  const key = todayKey(slug)
  const current = ((await kv.get(key)) as ReportesPlaya | null) ?? { ...EMPTY }

  current[tipo] += 1
  current.total += 1
  current.updatedAt = new Date().toISOString()

  await kv.set(key, current, { ex: 86400 })
  return current
}
