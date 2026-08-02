// src/lib/gplaces-sidecar.ts — datos de Google Places ya pagados, congelados.
//
// Cosechados una vez con scripts/harvest-places-sidecar.mjs (1.082 llamadas
// dentro del tramo gratuito, agosto 2026) para las 541 playas con estación
// AEMET. Van comiteados a propósito: un sidecar no caduca, una caché sí —
// y la de KV caducó vacía tras retirar la key de Vercel.
//
// Se consulta ANTES que placesNearby: es gratis, instantáneo y no depende
// de que exista la key. La llamada en vivo queda como respaldo para zonas
// fuera del sidecar.

import { cache } from 'react'
import type { GPlace } from './google-places'

type Sidecar = Record<string, GPlace[]>

const cargar = cache(async (): Promise<Sidecar | null> => {
  try {
    const { default: d } = await import('@/data/gplaces-sidecar.json')
    return d as unknown as Sidecar
  } catch {
    return null
  }
})

/**
 * POIs de una zona, o null si no se cosechó.
 *
 * `clave` es 'restaurant' o 'lodging', y las coordenadas se redondean a 4
 * decimales igual que en la cosecha (~11 m): la ficha pide siempre las de
 * la playa, así que la clave casa exacta.
 *
 * Devuelve null cuando no hay entrada y [] cuando la hubo pero Google no
 * encontró nada. La diferencia importa: [] significa "ya preguntamos, no
 * hay", y evita que el caller vuelva a pagar por una zona vacía.
 */
export async function placesDelSidecar(
  clave: 'restaurant' | 'lodging',
  lat: number,
  lon: number,
): Promise<GPlace[] | null> {
  const s = await cargar()
  if (!s) return null
  return s[`${clave}:${lat.toFixed(4)}:${lon.toFixed(4)}`] ?? null
}
