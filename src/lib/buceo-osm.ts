// src/lib/buceo-osm.ts — lector del sidecar de buceo por municipio.
// Lo genera scripts/build-buceo-osm.mjs desde OpenStreetMap.
import { cache } from 'react'

export interface EscuelaBuceo { n: string; la: number; lo: number; web: string | null; tel: string | null }
export interface PuntoInmersion { n: string; la: number; lo: number; playa: string; m: number }
export interface BuceoMunicipio { escuelas: EscuelaBuceo[]; sitios: PuntoInmersion[] }

const cargar = cache(async (): Promise<Record<string, BuceoMunicipio>> => {
  try {
    const { default: data } = await import('@/../public/data/buceo-osm.json', { assert: { type: 'json' } })
    return data as unknown as Record<string, BuceoMunicipio>
  } catch { return {} }
})

export const getBuceo = cache(async (slug: string): Promise<BuceoMunicipio | null> =>
  (await cargar())[slug] ?? null)
