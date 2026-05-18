// src/lib/videos.ts
//
// Búsqueda y caché de videos YouTube por playa. Se usa para mostrar
// un drone clip embebido en la ficha (boost dwell-time + VideoObject
// schema → rich result en SERP).
//
// Estrategia:
//   1. Override manual (KV `video:override:{slug}`): si existe, gana.
//      Lo configura el admin via /api/admin/video-set.
//   2. Cache auto (KV `video:auto:{slug}`): resultado del último
//      search.list de YouTube. TTL 30d positivo, 7d negativo.
//   3. Búsqueda YouTube Data API v3:
//      - Query: "{nombre} {municipio} playa drone" + variantes
//      - Filtros: type=video, videoEmbeddable=true, videoDuration=short
//        (≤4min), relevanceLanguage=es, regionCode=ES
//      - Aceptación: título o descripción contiene un token del
//        nombre (anti-genérico), canal != muted, > 1000 views.
//
// Requiere YOUTUBE_API_KEY (server-side, NO NEXT_PUBLIC_). Coste
// por búsqueda: 100 units. Quota diaria gratis: 10.000 units →
// 100 búsquedas/día. Cache 30d → renueva ~33 playas/día sostenible.

import { fetchWithTimeout } from './fetch-timeout'

const YT_KEY = process.env.YOUTUBE_API_KEY ?? ''

export interface VideoPlaya {
  videoId:      string                            // YouTube videoId
  title:        string
  channelId:    string
  channelTitle: string
  publishedAt:  string                            // ISO
  duration?:    string                            // ISO 8601 duration (PT3M21S)
  thumbnail:    string                            // hqdefault.jpg
  fuente:       'youtube' | 'youtube-manual'      // distingue auto/manual
}

interface CacheEntry {
  v: VideoPlaya | null   // null = miss confirmado (negative cache)
  ts: number             // timestamp ms
}

const TTL_POSITIVE_S = 30 * 24 * 3600
const TTL_NEGATIVE_S = 7 * 24 * 3600

// Acceso KV opcional (mismo patrón que fotos.ts).
async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const mod = await (Function('return import("@vercel/kv")')() as Promise<{
      kv: { get: <X>(k: string) => Promise<X | null> }
    }>)
    return await mod.kv.get<T>(key)
  } catch {
    return null
  }
}

async function kvSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const mod = await (Function('return import("@vercel/kv")')() as Promise<{
      kv: { set: (k: string, v: unknown, opts?: { ex?: number }) => Promise<unknown> }
    }>)
    await mod.kv.set(key, value, { ex: ttlSeconds })
  } catch {
    /* no KV: el resultado simplemente no se persiste */
  }
}

// Normalizador local — coherente con fotos.ts.
function normalizar(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
}

/**
 * Override manual: si el admin ha asignado a mano un videoId al slug,
 * lo devolvemos sin tocar YouTube API.
 */
export async function getVideoManual(slug: string): Promise<VideoPlaya | null> {
  return kvGet<VideoPlaya>(`video:override:${slug}`)
}

/**
 * Asigna manualmente un videoId a un slug (override). Lo invoca el
 * endpoint admin. No verificamos que el video exista; el iframe se
 * encarga de fallar silencioso si el ID es inválido.
 */
export async function setVideoManual(slug: string, video: VideoPlaya): Promise<void> {
  // Override no expira: hasta que el admin lo borre o sobreescriba.
  await kvSet(`video:override:${slug}`, video, 365 * 24 * 3600)
}

export async function deleteVideoManual(slug: string): Promise<void> {
  try {
    const mod = await (Function('return import("@vercel/kv")')() as Promise<{
      kv: { del: (k: string) => Promise<number> }
    }>)
    await mod.kv.del(`video:override:${slug}`)
  } catch {
    /* ignore */
  }
}

/**
 * Lee el primer videoId YouTube válido para esta playa.
 *   1. Si hay override manual → devolverlo.
 *   2. Cache auto (positivo o negativo dentro de TTL) → devolverlo.
 *   3. Si no, llamar YouTube Data API y cachear el resultado.
 *
 * Devuelve null si no se encuentra (o si no hay clave configurada).
 */
export async function getVideoYouTube(
  nombre: string,
  municipio: string,
  slug: string,
): Promise<VideoPlaya | null> {
  // Override manual gana siempre.
  const manual = await getVideoManual(slug)
  if (manual) return manual

  // Sin clave no hacemos nada (silencioso, igual que Pexels/Unsplash).
  if (!YT_KEY) return null

  const cacheKey = `video:auto:${slug}`
  const cached = await kvGet<CacheEntry>(cacheKey)
  if (cached) {
    const ageS = (Date.now() - cached.ts) / 1000
    const ttl = cached.v ? TTL_POSITIVE_S : TTL_NEGATIVE_S
    if (ageS < ttl) return cached.v
  }

  // Tokens discriminantes del nombre. El video debe mencionar alguno
  // en title o description, sino lo descartamos (anti-genérico).
  const tokens = [
    normalizar(nombre),
    ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4),
  ].filter(Boolean)

  // Búsquedas de más específica a más general. Paramos al primer hit.
  const queries = [
    `${nombre} ${municipio} drone`,
    `${nombre} ${municipio} playa`,
    `${nombre} playa drone`,
    `Playa de ${nombre} ${municipio}`,
  ]

  let encontrado: VideoPlaya | null = null
  for (const q of queries) {
    try {
      const params = new URLSearchParams({
        part:             'snippet',
        q,
        type:             'video',
        videoEmbeddable:  'true',
        videoDuration:    'short',           // ≤ 4 min, evita reportajes largos
        maxResults:       '5',
        relevanceLanguage:'es',
        regionCode:       'ES',
        key:              YT_KEY,
      })
      const res = await fetchWithTimeout(
        `https://www.googleapis.com/youtube/v3/search?${params}`,
        { next: { revalidate: 86400 } },
        4500,
      )
      if (!res.ok) continue
      const data = await res.json()
      const items: unknown[] = data?.items ?? []
      if (items.length === 0) continue

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const candidatos: VideoPlaya[] = items.map((it: any): VideoPlaya | null => {
        const snippet = it?.snippet ?? {}
        const titulo = (snippet.title ?? '').toLowerCase()
        const descripcion = (snippet.description ?? '').toLowerCase()
        const tokensFound = tokens.some(t =>
          t.length >= 4 && (normalizar(titulo).includes(t) || normalizar(descripcion).includes(t))
        )
        if (!tokensFound) return null
        const videoId = it?.id?.videoId
        if (!videoId) return null
        return {
          videoId,
          title:        snippet.title ?? '',
          channelId:    snippet.channelId ?? '',
          channelTitle: snippet.channelTitle ?? '',
          publishedAt:  snippet.publishedAt ?? '',
          thumbnail:    snippet.thumbnails?.high?.url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          fuente:       'youtube',
        }
      }).filter((v: VideoPlaya | null): v is VideoPlaya => v !== null)

      if (candidatos.length > 0) {
        encontrado = candidatos[0]
        break
      }
    } catch {
      continue
    }
  }

  // Cachear resultado (positivo o negativo).
  const entry: CacheEntry = { v: encontrado, ts: Date.now() }
  await kvSet(cacheKey, entry, encontrado ? TTL_POSITIVE_S : TTL_NEGATIVE_S)

  return encontrado
}

/**
 * Construye URL embed con privacy-enhanced mode (no cookies sin click).
 * Usar siempre vía esta función — youtube.com directo planta cookies
 * antes del consentimiento y rompe el badge "Privacy-friendly" del LCP.
 */
export function videoEmbedUrl(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1`
}

/**
 * Construye URL canónica YouTube (para link rel=canonical del schema
 * y enlace de atribución al canal).
 */
export function videoCanonicalUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
}
