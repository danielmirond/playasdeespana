// src/lib/comentarios.ts — Comentarios de usuarios por playa.
//
// Diseño:
//
//   - Sin auth tradicional. Cada usuario genera un UUID en su localStorage
//     la primera vez que comenta. Ese UUID + un nickname elegido por el
//     usuario son la identidad del comentario. Si el usuario limpia su
//     localStorage o cambia de dispositivo, empieza de cero. Tradeoff
//     consciente: cero fricción, cero email, cero contraseñas, pero la
//     "identidad" es frágil. Es adecuado para un sitio de turismo donde
//     lo que interesa es sumar reseñas rápidas, no mantener una cuenta.
//
//   - Storage: Vercel KV si está disponible, fallback in-memory por
//     instancia (igual patrón que reportes). Key por playa:
//     `comments:{slug}` → array ordenado de comentarios más recientes.
//
//   - Rate limit: `ratelimit:comments:{ip}` — max 5 comentarios por hora
//     por IP. TTL de 1 hora.
//
//   - Moderación automática: lista de palabras bloqueadas, longitud
//     máxima 500 caracteres, descarta texto con demasiadas URLs o
//     repeticiones sospechosas.

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

export interface Comentario {
  id:          string   // UUID del propio comentario
  userId:      string   // UUID del perfil que lo escribió
  nickname:    string   // nombre visible del usuario
  avatarSeed:  string   // usado para generar el color del avatar
  text:        string   // 1-500 chars, filtrado
  ts:          number   // Date.now() al crear
  playa:       string   // slug de la playa (redundante pero útil en /u/[id])
  playaNombre?: string  // nombre humano de la playa
}

const MAX_LEN      = 500
const MIN_LEN      = 3
const MAX_COMMENTS_PER_PLAYA = 200   // histórico por playa
const RATE_LIMIT_HOUR = 5             // por IP por hora
const RATE_LIMIT_TTL  = 3600          // seg

// Lista básica de palabras bloqueadas — obvias, no es un filtro sofisticado
// pero corta la mayoría del spam automatizado y ofensas directas. Se
// comprueba como substring case-insensitive.
const BAD_WORDS = [
  // Spam genérico
  'viagra', 'casino', 'porn', 'xxx', 'crypto', 'bitcoin', 'forex',
  'hack', 'loan', 'cialis',
  // Insultos obvios ES
  'mierda', 'cabrón', 'cabron', 'puta', 'coño', 'joder', 'gilipollas',
  'hijo de puta', 'hdp', 'maricón', 'maricon',
  // Insultos obvios EN
  'fuck', 'shit', 'bitch', 'asshole',
]

function key(slug: string) { return `comments:${slug}` }
function rateKey(ip: string) { return `ratelimit:comments:${ip}` }

function normalizeText(s: string): string {
  return s.trim().replace(/\s+/g, ' ').slice(0, MAX_LEN)
}

function isBad(text: string): boolean {
  const t = text.toLowerCase()
  for (const w of BAD_WORDS) {
    if (t.includes(w)) return true
  }
  // Spam patterns: más de 3 URLs, repetición del mismo caracter >5 veces
  const urlCount = (t.match(/https?:\/\//g) ?? []).length
  if (urlCount > 2) return true
  if (/(.)\1{6,}/.test(t)) return true
  return false
}

function isBadNickname(nick: string): boolean {
  if (nick.length < 2 || nick.length > 30) return true
  if (isBad(nick)) return true
  // Solo admin / admin / moderador … reservados
  if (/^(admin|moderator|mod|root|system|soporte|owner)$/i.test(nick)) return true
  return false
}

// ── Rate limit ──────────────────────────────────────────────────────
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; retryAfter?: number }> {
  const kv = await getKV()
  if (!kv) return { allowed: true } // in-memory: no tracking cross-instance
  try {
    const current = ((await kv.get(rateKey(ip))) as number | null) ?? 0
    if (current >= RATE_LIMIT_HOUR) {
      return { allowed: false, retryAfter: RATE_LIMIT_TTL }
    }
    await kv.set(rateKey(ip), current + 1, { ex: RATE_LIMIT_TTL })
    return { allowed: true }
  } catch {
    return { allowed: true }
  }
}

// ── In-memory fallback ──────────────────────────────────────────────
const mem = new Map<string, Comentario[]>()

// ── API pública ─────────────────────────────────────────────────────
export async function getComentarios(slug: string, limit = 50): Promise<Comentario[]> {
  const kv = await getKV()
  if (kv) {
    try {
      const list = ((await kv.get(key(slug))) as Comentario[] | null) ?? []
      return list.slice(0, limit)
    } catch { /* fall through */ }
  }
  return (mem.get(slug) ?? []).slice(0, limit)
}

export async function getComentariosByUser(userId: string, limit = 50): Promise<Comentario[]> {
  // Solo busca en KV usando un índice por usuario: `user-comments:{userId}`
  // almacena las claves de los comentarios del usuario. Más simple: como
  // tenemos tamaño pequeño, iterar por playa no escala — aceptamos este
  // tradeoff y mantenemos el índice.
  const kv = await getKV()
  if (!kv) return []
  try {
    const list = ((await kv.get(`user-comments:${userId}`)) as Comentario[] | null) ?? []
    return list.slice(0, limit)
  } catch {
    return []
  }
}

export interface AddComentarioInput {
  slug:        string
  playaNombre?: string
  userId:      string
  nickname:    string
  avatarSeed:  string
  text:        string
  ip:          string
}

export interface AddComentarioResult {
  ok:        boolean
  comentario?: Comentario
  error?:    string
  retryAfter?: number
}

export async function addComentario(input: AddComentarioInput): Promise<AddComentarioResult> {
  const text = normalizeText(input.text)
  if (text.length < MIN_LEN) return { ok: false, error: 'El comentario es demasiado corto.' }
  if (isBad(text))           return { ok: false, error: 'El comentario contiene texto no permitido.' }
  if (isBadNickname(input.nickname)) return { ok: false, error: 'El nickname no es válido.' }
  if (!input.userId || input.userId.length < 10) return { ok: false, error: 'userId inválido.' }

  const rate = await checkRateLimit(input.ip)
  if (!rate.allowed) {
    return {
      ok: false,
      error: 'Has publicado demasiados comentarios recientemente. Inténtalo más tarde.',
      retryAfter: rate.retryAfter,
    }
  }

  const comentario: Comentario = {
    id:         crypto.randomUUID(),
    userId:     input.userId,
    nickname:   input.nickname.trim(),
    avatarSeed: input.avatarSeed,
    text,
    ts:         Date.now(),
    playa:      input.slug,
    playaNombre: input.playaNombre,
  }

  const kv = await getKV()
  if (kv) {
    try {
      const current = ((await kv.get(key(input.slug))) as Comentario[] | null) ?? []
      const next = [comentario, ...current].slice(0, MAX_COMMENTS_PER_PLAYA)
      await kv.set(key(input.slug), next)

      // Índice por usuario para /u/[id]. Sin TTL — lo limpia el propio
      // usuario si quiere borrar su historial via endpoint DELETE (pendiente).
      const userKey = `user-comments:${comentario.userId}`
      const userList = ((await kv.get(userKey)) as Comentario[] | null) ?? []
      await kv.set(userKey, [comentario, ...userList].slice(0, 200))

      return { ok: true, comentario }
    } catch {
      /* fall through */
    }
  }

  // Fallback in-memory
  const current = mem.get(input.slug) ?? []
  mem.set(input.slug, [comentario, ...current].slice(0, MAX_COMMENTS_PER_PLAYA))
  return { ok: true, comentario }
}
