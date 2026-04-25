// src/lib/fetch-timeout.ts — Fetch con timeout para evitar que APIs lentas bloqueen la página

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
