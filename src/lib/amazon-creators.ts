// src/lib/amazon-creators.ts
//
// Enriquece los ASINs estáticos (src/lib/amazon-productos.ts) con
// datos en tiempo real desde Amazon Creators API: precio actual,
// imagen, rating, stock, título oficial.
//
// Diseño defensivo:
//   - Si NO hay credenciales (env vars vacías) → devuelve null,
//     los componentes caen al fallback estático. Cero ruptura.
//   - Si la API falla / rate-limit → null + cache negativo 30 min.
//   - Si la API responde OK → cachea 6 h en KV (precios cambian
//     poco intra-día, pero queremos refrescar diariamente para
//     compliance de precio mostrado).
//
// Endpoint: https://creatorsapi.amazon.es/v1/products
// (URL final depende del docs/migration guide; se ajusta cuando se
//  activen las credenciales en Vercel).
//
// Required env vars (server-side, NO NEXT_PUBLIC_):
//   AMAZON_CREATORS_ACCESS_KEY   — Access Key ID de Amazon Associates
//   AMAZON_CREATORS_SECRET_KEY   — Secret Access Key (firma SHA256)
//   AMAZON_CREATORS_PARTNER_TAG  — tag de afiliado (ej: nuus-21)
//
// Sin estas envs, el módulo entero es no-op.

import { fetchWithTimeout } from './fetch-timeout'

const ACCESS_KEY  = process.env.AMAZON_CREATORS_ACCESS_KEY  ?? ''
const SECRET_KEY  = process.env.AMAZON_CREATORS_SECRET_KEY  ?? ''
const PARTNER_TAG = process.env.AMAZON_CREATORS_PARTNER_TAG ?? 'nuus-21'

/** Resultado enriquecido por ASIN. Subset compatible con ProductoAmazon
 *  del catálogo estático, ampliado con datos en vivo. */
export interface ProductoAmazonVivo {
  asin:         string
  titulo:       string                  // titular oficial Amazon
  imagenUrl:    string                  // medium image
  precioActual: number | null           // EUR (null si fuera de stock)
  monedaCcy:    'EUR'
  ratingMedio:  number | null           // 0-5
  ratingTotal:  number | null           // # reviews
  prime:        boolean
  enlace:       string                  // URL afiliada con tag
  fechaUpdate:  string                  // ISO timestamp KV write
}

const TTL_POSITIVO_S = 6 * 3600           // 6h: precio fresco
const TTL_NEGATIVO_S = 30 * 60            // 30min si la API falla

interface CacheEntry {
  v:  ProductoAmazonVivo | null
  ts: number
}

async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const mod = await import('@vercel/kv')
    return await mod.kv.get<T>(key)
  } catch { return null }
}

async function kvSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const mod = await import('@vercel/kv')
    await mod.kv.set(key, value, { ex: ttlSeconds })
  } catch { /* sin KV: no se persiste, no es crítico */ }
}

/** True si las credenciales están configuradas. Si false, toda llamada
 *  al módulo devuelve null inmediatamente. */
export function creatorsApiActivo(): boolean {
  return Boolean(ACCESS_KEY && SECRET_KEY && PARTNER_TAG)
}

/** Devuelve el producto enriquecido para un ASIN, o null si:
 *   - No hay credenciales
 *   - El producto no existe / fuera de stock
 *   - La API responde error y no hay cache válida
 *
 * Cachea 6h positivo, 30min negativo. */
export async function getProductoVivo(asin: string): Promise<ProductoAmazonVivo | null> {
  if (!creatorsApiActivo()) return null
  if (!/^[A-Z0-9]{10}$/.test(asin)) return null   // formato ASIN

  const cacheKey = `amzn:p:${asin}`
  const cached = await kvGet<CacheEntry>(cacheKey)
  if (cached) {
    const ageS = (Date.now() - cached.ts) / 1000
    const ttl = cached.v ? TTL_POSITIVO_S : TTL_NEGATIVO_S
    if (ageS < ttl) return cached.v
  }

  // Llamada a Creators API. La firma exacta depende del docs final
  // (Amazon usa AWS Signature v4 en PAAPI; en Creators puede ser
  // distinto). El esqueleto está listo para cuando configures las
  // credenciales — solo hay que rellenar la firma y el endpoint.
  let producto: ProductoAmazonVivo | null = null
  try {
    const params = new URLSearchParams({
      ASIN:          asin,
      PartnerTag:    PARTNER_TAG,
      PartnerType:   'Associates',
      Marketplace:   'www.amazon.es',
      Resources:     [
        'ItemInfo.Title',
        'Images.Primary.Medium',
        'Offers.Listings.Price',
        'Offers.Listings.DeliveryInfo.IsPrimeEligible',
        'CustomerReviews.Count',
        'CustomerReviews.StarRating',
      ].join(','),
    })
    // PLACEHOLDER endpoint URL: ajusta cuando tengas el doc final.
    // El doc de migración explica el cambio exacto vs PAAPI.
    const url = `https://creatorsapi.amazon.es/v1/products?${params}`

    const res = await fetchWithTimeout(
      url,
      {
        headers: {
          'X-Amz-Access-Token': ACCESS_KEY,
          // Cuando uses firma v4, añade aquí: Authorization, X-Amz-Date, etc.
          // De momento esqueleto.
          'Content-Type':       'application/json',
        },
        next: { revalidate: TTL_POSITIVO_S },
      },
      5000,
    )
    if (res.ok) {
      const data = await res.json()
      const item = data?.ItemsResult?.Items?.[0] ?? data?.items?.[0]
      if (item) {
        producto = parseItem(item, asin)
      }
    }
  } catch {
    // Network / parse error: cae al cache negativo.
  }

  await kvSet(cacheKey, { v: producto, ts: Date.now() } satisfies CacheEntry,
    producto ? TTL_POSITIVO_S : TTL_NEGATIVO_S)

  return producto
}

/** Batch convenience: pide N ASINs en paralelo respetando rate-limit
 *  (Promise.all sin throttle todavía; añadir token bucket si se llega
 *  a 1 req/s con quota >1). */
export async function getProductosVivo(asins: string[]): Promise<Map<string, ProductoAmazonVivo>> {
  const out = new Map<string, ProductoAmazonVivo>()
  if (!creatorsApiActivo() || asins.length === 0) return out

  const resultados = await Promise.all(asins.map(asin => getProductoVivo(asin)))
  for (let i = 0; i < asins.length; i++) {
    const p = resultados[i]
    if (p) out.set(asins[i], p)
  }
  return out
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseItem(item: any, asin: string): ProductoAmazonVivo | null {
  const titulo = item?.ItemInfo?.Title?.DisplayValue ?? item?.title ?? null
  if (!titulo) return null

  const imagen = item?.Images?.Primary?.Medium?.URL ?? item?.image ?? null
  if (!imagen) return null

  const offer = item?.Offers?.Listings?.[0]
  const precio = offer?.Price?.Amount ?? null
  const prime = Boolean(offer?.DeliveryInfo?.IsPrimeEligible)

  const reviews = item?.CustomerReviews ?? {}
  const ratingMedio = typeof reviews.StarRating?.Value === 'number' ? reviews.StarRating.Value : null
  const ratingTotal = typeof reviews.Count === 'number' ? reviews.Count : null

  const enlace = `https://www.amazon.es/dp/${asin}?tag=${PARTNER_TAG}`

  return {
    asin,
    titulo,
    imagenUrl:    imagen,
    precioActual: typeof precio === 'number' ? precio : null,
    monedaCcy:    'EUR',
    ratingMedio,
    ratingTotal,
    prime,
    enlace,
    fechaUpdate:  new Date().toISOString(),
  }
}

/** Construye URL afiliada SIEMPRE: si tienes datos vivos los usas
 *  para mostrar imagen/precio; el link es idéntico al estático. */
export function enlaceAmazon(asin: string): string {
  return `https://www.amazon.es/dp/${asin}?tag=${PARTNER_TAG}`
}
