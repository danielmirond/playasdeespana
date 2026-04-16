// src/lib/overpass.ts — Helper resiliente para queries a Overpass API.
//
// Problemas que resuelve:
//   1. Overpass API es notoriamente lenta e inestable. Un solo endpoint
//      y un solo intento deja tu página mostrando "No hay datos" cuando
//      en realidad hay un hipo de 500ms en el servidor público.
//   2. Existen varios mirrors equivalentes mantenidos por la comunidad.
//      Si el principal (overpass-api.de) está saturado, los demás casi
//      siempre contestan.
//   3. Vercel Hobby corta las serverless functions a 10 s. Si pedimos
//      15 s el fetch nunca completa y el array viene vacío.
//
// Estrategia:
//   - Lista priorizada de endpoints (overpass-api.de como primario y dos
//     mirrors como fallback).
//   - Timeout conservador por intento (por defecto 7 s) para dejar margen
//     al wrapper de 10 s de Vercel y permitir al menos un retry.
//   - Si el primer endpoint falla, salta al siguiente sin esperar. El
//     timeout total del helper es suma de intentos.
//   - Logs `console.warn` con razón del fallo (timeout, HTTP status,
//     nombre del mirror) para que se vean en los logs de Vercel. Nunca
//     lanza — devuelve `null` en caso de fallo total.

// Mirrors probados y mantenidos. Orden = prioridad.
const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

export interface OverpassOptions {
  /** Timeout por intento en ms. Default 7000 ms. */
  timeoutPerAttempt?: number
  /** Next.js revalidate window for the underlying fetch cache. */
  revalidate?: number
  /** Debug label used in warnings (e.g. "hoteles", "restaurantes"). */
  label?: string
}

/**
 * Ejecuta una query Overpass contra la lista de mirrors con retry simple.
 * Devuelve los elementos del JSON o `null` si todos los mirrors fallaron.
 */
export async function queryOverpass(
  query: string,
  opts: OverpassOptions = {},
): Promise<any[] | null> {
  const {
    timeoutPerAttempt = 7000,
    revalidate = 86400,
    label = 'overpass',
  } = opts

  for (const endpoint of OVERPASS_MIRRORS) {
    const host = new URL(endpoint).host
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutPerAttempt)

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: query,
        signal: controller.signal,
        headers: {
          // Overpass acepta text/plain para las query en body. Forzamos
          // keep-alive en Node 20+ vía headers para reutilizar conexión.
          'Content-Type': 'text/plain; charset=utf-8',
          'Accept': 'application/json',
          'User-Agent': 'playas-espana.com/1.0',
        },
        next: { revalidate },
      } as RequestInit & { next: { revalidate: number } })
      clearTimeout(timer)

      if (!res.ok) {
        console.warn(`[overpass:${label}] ${host} → HTTP ${res.status}, trying next mirror`)
        continue
      }

      const data = await res.json()
      if (!Array.isArray(data?.elements)) {
        console.warn(`[overpass:${label}] ${host} → empty/invalid body, trying next mirror`)
        continue
      }

      return data.elements
    } catch (err) {
      clearTimeout(timer)
      const reason = (err as Error)?.name === 'AbortError' ? `timeout ${timeoutPerAttempt}ms` : (err as Error)?.message ?? 'unknown'
      console.warn(`[overpass:${label}] ${host} → ${reason}, trying next mirror`)
      continue
    }
  }

  console.warn(`[overpass:${label}] all mirrors failed`)
  return null
}
