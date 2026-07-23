// src/lib/google-places.ts — Google Places API (New) para enriquecer los POIs
// de la ficha (restaurantes/hoteles) con valoraciones reales, nº de reseñas y
// place_id (la UI ya construye deep-links a Maps con él).
//
// Diseño de coste (SKU Pro = 5.000 llamadas/mes gratis):
//   - Field mask MÍNIMA de tramo Pro (id, displayName, rating,
//     userRatingCount, priceLevel, primaryType, location). Nada de
//     website/teléfono/horarios: eso es SKU Enterprise (solo 1k gratis).
//     Nada de fotos: se facturan POR CADA carga de imagen.
//   - Cache KV de 30 días (el máximo que permite el TOS de Google).
//   - Techo mensual duro (BUDGET_MENSUAL) contado en KV: al agotarse se
//     devuelve null y el caller cae a Overpass/OSM. Nunca se paga.
//
// Gated por GOOGLE_PLACES_API_KEY: sin key → null → todo sigue con OSM.
import { kvCached } from './kv-cache'
import { fetchWithTimeout } from './fetch-timeout'

const API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? ''
const BUDGET_MENSUAL = 4500 // < 5.000 del tramo gratuito Pro, con margen

export interface GPlace {
  googleId: string
  nombre: string
  rating: number        // 0 si Google no tiene valoración
  reseñas: number
  precio: string        // €, €€, €€€ (aprox desde priceLevel)
  tipo: string          // 'Restaurante' | 'Bar' | 'Cafetería' | 'Hotel' | …
  lat: number
  lon: number
}

const PRECIO: Record<string, string> = {
  PRICE_LEVEL_INEXPENSIVE: '€',
  PRICE_LEVEL_MODERATE: '€€',
  PRICE_LEVEL_EXPENSIVE: '€€€',
  PRICE_LEVEL_VERY_EXPENSIVE: '€€€€',
}
const TIPO: Record<string, string> = {
  bar: 'Bar', cafe: 'Cafetería', coffee_shop: 'Cafetería', restaurant: 'Restaurante',
  lodging: 'Hotel', hotel: 'Hotel', hostel: 'Hostal', guest_house: 'Casa de huéspedes',
}

// Contador mensual en KV (fail-open: si KV no está, se permite la llamada —
// el propio kvCached tampoco cachearía, escenario solo de dev local).
async function dentroDePresupuesto(): Promise<boolean> {
  try {
    const { kv } = await import('@vercel/kv')
    const mes = new Date().toISOString().slice(0, 7) // YYYY-MM
    const n = await kv.incr(`gplaces:budget:${mes}`)
    if (n === 1) await kv.expire(`gplaces:budget:${mes}`, 35 * 24 * 3600)
    return n <= BUDGET_MENSUAL
  } catch {
    return true
  }
}

/**
 * Nearby Search (New). Devuelve null si: sin key, presupuesto mensual
 * agotado, o error de API → el caller debe caer a OSM.
 */
export async function placesNearby(
  lat: number,
  lon: number,
  includedTypes: string[],
  radiusM: number,
  maxResults = 8,
): Promise<GPlace[] | null> {
  if (!API_KEY) return null

  try {
    return await kvCached<GPlace[] | null>(
      'gplaces-v1',
      [includedTypes[0], lat.toFixed(4), lon.toFixed(4)],
      30 * 24 * 3600, // TOS Google: máximo 30 días de cache
      async () => {
        if (!(await dentroDePresupuesto())) return null

        const res = await fetchWithTimeout('https://places.googleapis.com/v1/places:searchNearby', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // La key está restringida por referrer HTTP a www.playas-espana.com
            // (defensa anti-filtración). Las llamadas server-side no llevan
            // referer, así que lo enviamos nosotros — es nuestra key y nuestro
            // dominio; Google valida el header tal cual llega.
            'Referer': 'https://www.playas-espana.com/',
            'X-Goog-Api-Key': API_KEY,
            // Solo campos de SKU Pro — añadir website/phone/horarios aquí
            // salta a SKU Enterprise y rompe el presupuesto.
            'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.primaryType,places.location',
          },
          body: JSON.stringify({
            includedTypes,
            maxResultCount: Math.min(maxResults, 20),
            rankPreference: 'POPULARITY',
            locationRestriction: {
              circle: { center: { latitude: lat, longitude: lon }, radius: Math.min(radiusM, 50000) },
            },
          }),
          next: { revalidate: 30 * 24 * 3600 },
        }, 6000)

        if (!res.ok) return null
        const data = await res.json() as { places?: Array<Record<string, any>> }
        if (!Array.isArray(data.places)) return null

        return data.places
          .filter(p => p.id && p.displayName?.text)
          .map((p): GPlace => ({
            googleId: p.id,
            nombre: p.displayName.text,
            rating: typeof p.rating === 'number' ? Math.round(p.rating * 10) / 10 : 0,
            reseñas: p.userRatingCount ?? 0,
            precio: PRECIO[p.priceLevel] ?? '€€',
            tipo: TIPO[p.primaryType] ?? TIPO[includedTypes[0]] ?? 'Restaurante',
            lat: p.location?.latitude ?? lat,
            lon: p.location?.longitude ?? lon,
          }))
      },
    )
  } catch {
    return null
  }
}


/**
 * Text Search (New) — para categorías sin tipo propio en Nearby
 * ("centro de buceo", "escuela de surf"). Misma SKU Pro, mismo
 * presupuesto mensual y misma cache de 30 días.
 */
export async function placesText(
  textQuery: string,
  lat: number,
  lon: number,
  radiusM: number,
  maxResults = 6,
): Promise<GPlace[] | null> {
  if (!API_KEY) return null

  try {
    return await kvCached<GPlace[] | null>(
      'gplaces-txt-v1',
      [textQuery.replace(/\s+/g, '-'), lat.toFixed(4), lon.toFixed(4)],
      30 * 24 * 3600,
      async () => {
        if (!(await dentroDePresupuesto())) return null

        const res = await fetchWithTimeout('https://places.googleapis.com/v1/places:searchText', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://www.playas-espana.com/',
            'X-Goog-Api-Key': API_KEY,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.primaryType,places.location',
          },
          body: JSON.stringify({
            textQuery,
            maxResultCount: Math.min(maxResults, 20),
            locationBias: {
              circle: { center: { latitude: lat, longitude: lon }, radius: Math.min(radiusM, 50000) },
            },
          }),
          next: { revalidate: 30 * 24 * 3600 },
        }, 6000)

        if (!res.ok) return null
        const data = await res.json() as { places?: Array<Record<string, any>> }
        if (!Array.isArray(data.places)) return null

        return data.places
          .filter(p => p.id && p.displayName?.text)
          .map((p): GPlace => ({
            googleId: p.id,
            nombre: p.displayName.text,
            rating: typeof p.rating === 'number' ? Math.round(p.rating * 10) / 10 : 0,
            reseñas: p.userRatingCount ?? 0,
            precio: PRECIO[p.priceLevel] ?? '€€',
            tipo: TIPO[p.primaryType] ?? 'Centro',
            lat: p.location?.latitude ?? lat,
            lon: p.location?.longitude ?? lon,
          }))
      },
    )
  } catch {
    return null
  }
}
