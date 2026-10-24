// src/lib/buceo-places.ts — lector del sidecar de centros de buceo de
// Google Places. Lo genera scripts/build-buceo-places.mjs una sola vez;
// el runtime no llama a Google.
//
// Convive con buceo-osm.ts y no lo sustituye: Google da los CENTROS (802
// en 316 municipios, contra 87 en 55 de OSM) y OSM da los PUNTOS DE
// INMERSIÓN, que Google no tiene.
import { cache } from 'react'

export interface CentroBuceoPlaces {
  id: string
  n: string
  nota: number | null
  resenas: number
  web: string | null
  tel: string | null
  la: number
  lo: number
  /** Playa del municipio más cercana al centro. */
  playa: string | null
  m: number | null
  /** Solo true si el propio nombre del centro declara PADI. */
  padi: boolean
}

const cargar = cache(async (): Promise<Record<string, CentroBuceoPlaces[]>> => {
  try {
    const { default: data } = await import('@/../public/data/buceo-places.json', { assert: { type: 'json' } })
    return data as unknown as Record<string, CentroBuceoPlaces[]>
  } catch { return {} }
})

export const getCentrosBuceo = cache(async (slug: string): Promise<CentroBuceoPlaces[]> =>
  (await cargar())[slug] ?? [])
