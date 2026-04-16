// src/lib/votos.ts — Votaciones persistentes por playa (1-5 estrellas)
// A diferencia de reportes (diarios), los votos son permanentes.

export interface VotosPlaya {
  suma:       number  // suma de todas las valoraciones
  votos:      number  // número total de votos
  media:      number  // suma / votos (redondeado a 1 decimal)
  // Distribución por estrellas (para mostrar histograma opcional)
  d1: number; d2: number; d3: number; d4: number; d5: number
  updatedAt:  string
}

function empty(): VotosPlaya {
  return { suma: 0, votos: 0, media: 0, d1: 0, d2: 0, d3: 0, d4: 0, d5: 0, updatedAt: '' }
}

function key(slug: string) {
  return `votos:${slug}`
}

// ── Vercel KV (persistente) ─────────────────────────────────────────
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
const mem = new Map<string, VotosPlaya>()

// ── API pública ─────────────────────────────────────────────────────
export async function getVotos(slug: string): Promise<VotosPlaya> {
  const k = key(slug)
  const kv = await getKV()
  if (kv) {
    try {
      const data = await kv.get(k) as VotosPlaya | null
      return data ?? empty()
    } catch { /* fall through */ }
  }
  return mem.get(k) ?? empty()
}

export async function addVoto(slug: string, estrellas: 1 | 2 | 3 | 4 | 5): Promise<VotosPlaya> {
  if (estrellas < 1 || estrellas > 5) throw new Error('Estrellas debe ser 1-5')

  const k = key(slug)
  const kv = await getKV()

  if (kv) {
    try {
      const current = ((await kv.get(k)) as VotosPlaya | null) ?? empty()
      const next = applyVote(current, estrellas)
      await kv.set(k, next)
      mem.set(k, { ...next })
      return next
    } catch { /* fall through */ }
  }

  const current = mem.get(k) ?? empty()
  const next = applyVote(current, estrellas)
  mem.set(k, next)
  return { ...next }
}

function applyVote(v: VotosPlaya, estrellas: 1 | 2 | 3 | 4 | 5): VotosPlaya {
  const nuevo: VotosPlaya = { ...v }
  nuevo.suma += estrellas
  nuevo.votos += 1
  nuevo[`d${estrellas}` as 'd1'|'d2'|'d3'|'d4'|'d5'] += 1
  nuevo.media = parseFloat((nuevo.suma / nuevo.votos).toFixed(1))
  nuevo.updatedAt = new Date().toISOString()
  return nuevo
}
