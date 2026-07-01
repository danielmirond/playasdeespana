// src/lib/kv-cache.ts
//
// Helper genérico de cache en Vercel KV para resultados de fetches caros
// (Overpass para hoteles/restaurantes/campings/buceo/escuelas, cascada
// de fotos, etc.). Reduce TTFB:
//   - Primer hit: ejecuta la función y persiste fire-and-forget en KV.
//   - Resto de hits: sirve desde KV en ms (KV.get típico ~5ms en p99).
//
// Mismo patrón resiliente que opiniones.ts / fotos.ts:
//   - Si @vercel/kv no está instalado o KV_URL no está configurada,
//     fallback a fetch directo (no rompe en dev).
//   - Si KV.get/set lanzan error, fallback al cómputo en vivo.
//
// API:
//   const data = await kvCached('hoteles', [lat, lon], 7 * 24 * 3600,
//     () => getHotelesFromOverpass(lat, lon))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KV = { get: (key: string) => Promise<any>; set: (key: string, value: any, opts?: any) => Promise<any> }

let _kv: KV | null | undefined
async function getKV(): Promise<KV | null> {
  if (_kv !== undefined) return _kv
  try {
    const mod = await (import("@vercel/kv") as Promise<{ kv: KV }>)
    _kv = mod.kv
    return _kv
  } catch {
    _kv = null
    return null
  }
}

/**
 * Cachea el resultado de `compute()` en Vercel KV.
 *
 * @param namespace  Prefijo (ej. 'hoteles', 'restaurantes', 'fotos').
 * @param parts      Componentes que identifican el dato. Lats/lngs se
 *                   redondean a 4 decimales para que clave sea estable
 *                   ante ruido de coordenadas (~11m precisión).
 * @param ttlSeconds TTL del entry en KV.
 * @param compute    Función que produce el dato si no está en cache.
 */
export async function kvCached<T>(
  namespace: string,
  parts: Array<string | number>,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  const key = makeKey(namespace, parts)
  const kv = await getKV()

  if (kv) {
    try {
      const cached = await kv.get(key) as T | null
      if (cached !== null && cached !== undefined) {
        return cached
      }
    } catch {
      // KV down: caemos al cómputo en vivo.
    }
  }

  const fresh = await compute()

  // Persistir solo si hay datos útiles (evita cachear arrays vacíos
  // por timeouts puntuales — la próxima petición reintenta).
  if (kv && isUsefulResult(fresh)) {
    kv.set(key, fresh, { ex: ttlSeconds }).catch(() => {})
  }

  return fresh
}

/**
 * Lee de KV SIN computar ni escribir. Devuelve el valor cacheado o null.
 * Útil en generateMetadata: consulta si un recurso ya está en cache
 * (poblado por el render + warming) sin disparar la llamada externa cara,
 * evitando latencia en la metadata.
 */
export async function kvPeek<T>(namespace: string, parts: Array<string | number>): Promise<T | null> {
  const kv = await getKV()
  if (!kv) return null
  try {
    // Timeout duro: nunca bloquear la ruta que llama (p.ej. generateMetadata).
    // En prod KV responde en ~ms; si por lo que sea tarda, devolvemos null.
    const cached = await Promise.race([
      kv.get(makeKey(namespace, parts)) as Promise<T | null>,
      new Promise<null>(r => setTimeout(() => r(null), 300)),
    ])
    return cached ?? null
  } catch {
    return null
  }
}

function makeKey(namespace: string, parts: Array<string | number>): string {
  const pieces = parts.map(p => {
    if (typeof p === 'number') {
      // Redondea a 4 decimales (~11m). Las coordenadas de OSM y
      // MITECO tienen ruido sub-metro que invalidaría el cache.
      return p.toFixed(4)
    }
    return p
  })
  return `${namespace}:${pieces.join(':')}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isUsefulResult(value: any): boolean {
  if (value === null || value === undefined) return false
  if (Array.isArray(value)) return value.length > 0
  if (typeof value === 'object') return Object.keys(value).length > 0
  return true
}
