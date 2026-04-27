// src/lib/opiniones.ts
// Opiniones de usuarios — rating 1-5 + texto opcional. Persistente (no
// ventana rodante: las opiniones son atemporales, a diferencia de los
// reportes 24 h en lib/reportes.ts).
//
// Storage:
//   opiniones:{slug}                  → { items: Opinion[] }   (cap 1000, FIFO)
//   opiniones:rl:{ip_hash}:{yyyy-mm-dd} → number              (rate limit diario)
//
// Anti-spam:
//   - 3 opiniones por IP/día como máximo
//   - texto entre 20-500 chars cuando está presente
//   - rechaza URLs y emails en texto
//   - alias 2-30 chars, sin URLs
//   - una sola opinión por (ip_hash, slug) — re-envíos sustituyen al anterior

import crypto from 'node:crypto'

// ── Tipos ───────────────────────────────────────────────────────────
export type Estrellas = 1 | 2 | 3 | 4 | 5

export interface Opinion {
  id:       string
  rating:   Estrellas
  texto?:   string
  alias:    string
  ts:       number
  ip_hash:  string
  oculta?:  boolean
}

interface OpinionesStore {
  items:     Opinion[]
  updatedAt: string
}

// Vista agregada — coincide en forma con VotosPlaya para hacer drop-in en
// schema.ts y VotacionPlaya cuando se complete la migración.
export interface OpinionesAgregadas {
  total:        number
  media:        number
  d1: number; d2: number; d3: number; d4: number; d5: number
  // Lista paginada para mostrar
  items:        OpinionPublica[]
  updatedAt:    string
}

// Lo que mostramos al cliente — sin ip_hash ni oculta
export interface OpinionPublica {
  id:     string
  rating: Estrellas
  texto?: string
  alias:  string
  ts:     number
}

// ── Constantes ──────────────────────────────────────────────────────
const MAX_PER_PLAYA = 1000
const MIN_TEXTO     = 20
const MAX_TEXTO     = 500
const MIN_ALIAS     = 2
const MAX_ALIAS     = 30
const RATE_PER_DAY  = 3   // por IP

// Lista negra mínima — extender según moderación real
const BLACKLIST = [
  /https?:\/\//i,
  /www\./i,
  /\b[\w.-]+@[\w.-]+\.\w+\b/,                  // email
  /\b(\+?\d{2,4}[\s-]?)?\d{6,}\b/,             // teléfonos largos
  /\b(viagra|casino|bitcoin|crypto)\b/i,
]

// ── KV abstraction (idéntico patrón a votos.ts y reportes.ts) ───────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KV = { get: (key: string) => Promise<any>; set: (key: string, value: any, opts?: any) => Promise<any>; incr?: (k: string) => Promise<number>; expire?: (k: string, s: number) => Promise<unknown> }

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

// Fallback in-memory para dev local sin KV. Usamos globalThis para que
// el RSC (page.tsx) y el route handler (api/opiniones) compartan store en
// dev — en Next con Turbopack los módulos pueden instanciarse por separado.
type GlobalMem = { __opMem?: Map<string, OpinionesStore>; __opRate?: Map<string, number> }
const g = globalThis as unknown as GlobalMem
const memOpiniones: Map<string, OpinionesStore> = g.__opMem ?? (g.__opMem = new Map())
const memRate:      Map<string, number>         = g.__opRate ?? (g.__opRate = new Map())

// ── Hashing ─────────────────────────────────────────────────────────
const SECRET = process.env.OPINIONES_HASH_SECRET ?? 'playasdeespana_default_secret'
export function hashIp(ip: string): string {
  return crypto.createHash('sha256').update(`${SECRET}:${ip}`).digest('hex').slice(0, 16)
}

// ── Validación ──────────────────────────────────────────────────────
function sanitizeAlias(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const s = raw.trim().replace(/\s+/g, ' ')
  if (s.length < MIN_ALIAS || s.length > MAX_ALIAS) return null
  if (/[<>"`{}]/.test(s)) return null
  if (BLACKLIST.some(rx => rx.test(s))) return null
  return s
}

function sanitizeTexto(raw: unknown): string | null | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined
  if (typeof raw !== 'string') return null
  const s = raw.trim()
  if (s.length < MIN_TEXTO || s.length > MAX_TEXTO) return null
  if (BLACKLIST.some(rx => rx.test(s))) return null
  return s
}

function validRating(raw: unknown): Estrellas | null {
  if (!Number.isInteger(raw)) return null
  const n = raw as number
  if (n < 1 || n > 5) return null
  return n as Estrellas
}

// ── Helpers ─────────────────────────────────────────────────────────
function emptyStore(): OpinionesStore {
  return { items: [], updatedAt: '' }
}

function key(slug: string) {
  return `opiniones:${slug}`
}

function rateKey(ipHash: string) {
  const today = new Date().toISOString().slice(0, 10)
  return `opiniones:rl:${ipHash}:${today}`
}

function aggregate(store: OpinionesStore, page = 1, perPage = 10): OpinionesAgregadas {
  const visibles = store.items.filter(o => !o.oculta)
  const dist = { d1: 0, d2: 0, d3: 0, d4: 0, d5: 0 }
  let suma = 0
  for (const o of visibles) {
    suma += o.rating
    dist[`d${o.rating}` as 'd1'|'d2'|'d3'|'d4'|'d5']++
  }
  const total = visibles.length
  const media = total > 0 ? Math.round((suma / total) * 10) / 10 : 0

  // Más recientes primero, paginadas
  const sorted = [...visibles].sort((a, b) => b.ts - a.ts)
  const start  = (page - 1) * perPage
  const items: OpinionPublica[] = sorted.slice(start, start + perPage).map(o => ({
    id: o.id, rating: o.rating, texto: o.texto, alias: o.alias, ts: o.ts,
  }))

  return { total, media, ...dist, items, updatedAt: store.updatedAt }
}

function hydrate(raw: unknown): OpinionesStore {
  if (!raw || typeof raw !== 'object') return emptyStore()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = raw as any
  if (!Array.isArray(r.items)) return emptyStore()
  return {
    items: r.items.filter((it: unknown): it is Opinion => {
      if (!it || typeof it !== 'object') return false
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const o = it as any
      return typeof o.id === 'string'
        && typeof o.rating === 'number'
        && typeof o.alias === 'string'
        && typeof o.ts === 'number'
        && typeof o.ip_hash === 'string'
    }),
    updatedAt: typeof r.updatedAt === 'string' ? r.updatedAt : '',
  }
}

// ── Rate limit ──────────────────────────────────────────────────────
async function checkAndIncrRate(ipHash: string): Promise<boolean> {
  const k = rateKey(ipHash)
  const kv = await getKV()
  if (kv && kv.incr && kv.expire) {
    try {
      const n = await kv.incr(k)
      if (n === 1) await kv.expire(k, 86400 + 600)
      return n <= RATE_PER_DAY
    } catch { /* fall through */ }
  }
  const cur = (memRate.get(k) ?? 0) + 1
  memRate.set(k, cur)
  return cur <= RATE_PER_DAY
}

// ── API pública ─────────────────────────────────────────────────────
export async function getOpiniones(slug: string, page = 1, perPage = 10): Promise<OpinionesAgregadas> {
  const kv = await getKV()
  let store: OpinionesStore
  if (kv) {
    try {
      store = hydrate(await kv.get(key(slug)))
    } catch {
      store = hydrate(memOpiniones.get(slug))
    }
  } else {
    store = hydrate(memOpiniones.get(slug))
  }
  return aggregate(store, page, perPage)
}

export interface AddOpinionInput {
  slug:    string
  rating:  unknown
  texto?:  unknown
  alias:   unknown
  ip:      string
}

export type AddOpinionResult =
  | { ok: true;  data: OpinionesAgregadas }
  | { ok: false; error: 'rating' | 'alias' | 'texto' | 'rate_limit' | 'storage' }

export async function addOpinion(input: AddOpinionInput): Promise<AddOpinionResult> {
  const rating = validRating(input.rating)
  if (rating === null) return { ok: false, error: 'rating' }

  const alias = sanitizeAlias(input.alias)
  if (alias === null) return { ok: false, error: 'alias' }

  const texto = sanitizeTexto(input.texto)
  if (texto === null) return { ok: false, error: 'texto' } // null = falló validación; undefined = no había

  const ipHash = hashIp(input.ip)
  const allowed = await checkAndIncrRate(ipHash)
  if (!allowed) return { ok: false, error: 'rate_limit' }

  const newOp: Opinion = {
    id:      crypto.randomUUID(),
    rating,
    texto:   texto || undefined,
    alias,
    ts:      Date.now(),
    ip_hash: ipHash,
  }

  const apply = (store: OpinionesStore): OpinionesStore => {
    // Sustituye opinión previa de la misma IP en esta playa (1 voto por IP)
    const filtered = store.items.filter(o => o.ip_hash !== ipHash)
    filtered.push(newOp)
    // Cap FIFO
    const items = filtered.length > MAX_PER_PLAYA
      ? filtered.slice(filtered.length - MAX_PER_PLAYA)
      : filtered
    return { items, updatedAt: new Date().toISOString() }
  }

  const kv = await getKV()
  if (kv) {
    try {
      const stored = await kv.get(key(input.slug))
      const next = apply(hydrate(stored))
      await kv.set(key(input.slug), next)
      memOpiniones.set(input.slug, next)
      return { ok: true, data: aggregate(next) }
    } catch {
      // fall through to memory
    }
  }

  const next = apply(hydrate(memOpiniones.get(input.slug)))
  memOpiniones.set(input.slug, next)
  return { ok: true, data: aggregate(next) }
}

// ── Helper: agregado simple compatible con VotosPlaya ───────────────
// Permite migrar getVotos() en el futuro sin cambiar consumidores.
export async function getOpinionesAgregadoSimple(slug: string): Promise<{
  suma: number; votos: number; media: number;
  d1: number; d2: number; d3: number; d4: number; d5: number;
  updatedAt: string;
}> {
  const a = await getOpiniones(slug, 1, 0)
  const suma = a.d1 + a.d2 * 2 + a.d3 * 3 + a.d4 * 4 + a.d5 * 5
  return { suma, votos: a.total, media: a.media, d1: a.d1, d2: a.d2, d3: a.d3, d4: a.d4, d5: a.d5, updatedAt: a.updatedAt }
}
