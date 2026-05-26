// src/lib/fetch-timeout.ts — Fetch con timeout para evitar que APIs lentas bloqueen la página

// Default 3s (aumentado desde 2s para dar más tiempo a APIs internacionales).
// El deadline global del SSR de la ficha es ~2.5s (ver src/app/playas/[slug]/page.tsx).
// APIs específicas pueden subir el timeout localmente si necesitan esperar más.
const DEFAULT_TIMEOUT = 3000

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
