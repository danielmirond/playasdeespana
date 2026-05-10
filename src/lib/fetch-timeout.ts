// src/lib/fetch-timeout.ts — Fetch con timeout para evitar que APIs lentas bloqueen la página

// Default 2s. El deadline global del SSR de la ficha es 1.5s
// (ver src/app/playas/[slug]/page.tsx). Cualquier fetch dentro debería
// resolver antes para no perderse. APIs específicas pueden subir el
// timeout localmente si saben que merece esperar (ej. cascada de fotos
// en cache-warm cron donde no hay deadline de TTFB).
const DEFAULT_TIMEOUT = 2000

export async function fetchWithTimeout(
  url: string,
  opts?: RequestInit & { next?: { revalidate?: number } },
  timeoutMs = DEFAULT_TIMEOUT,
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, { ...opts, signal: controller.signal })
    return res
  } finally {
    clearTimeout(timer)
  }
}
