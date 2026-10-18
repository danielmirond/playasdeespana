// src/lib/perros-osm.ts — playas caninas que el inventario no recoge.
//
// El campo `perros` del Ministerio marca 28 playas en toda España y el hub
// enseñaba 25. Eso no es un país con 25 playas caninas: es un campo que
// casi nadie rellena. OSM aporta 19 más, y también 37 con `dog=no`, que
// valen igual: en el inventario hay 5.070 fichas con `perros: false` donde
// se confunde «prohibido» con «no consta», y un dog=no mapeado sí es una
// prohibición anotada por alguien.
//
// NO PISA EL CAMPO OFICIAL. Va aparte y con su fuente, como los aseos.
// Que en el mapa la llamen «canina» no la hace legal: la ordenanza la pone
// el ayuntamiento y cambia cada temporada. La página lo dice.
import { cache } from 'react'

export type EstadoPerros = 'yes' | 'leashed' | 'designated' | 'nombre' | 'no'

export interface PerrosOsm {
  /** Lo que dice OSM. 'nombre' = la playa se llama canina pero no hay etiqueta. */
  estado: EstadoPerros
  /** Nombre del elemento mapeado, cuando lo tiene. */
  nombre: string | null
  metros: number
}

type Sidecar = Record<string, { d: EstadoPerros; n?: string; m: number }>

let _sidecar: Sidecar | null | undefined
async function getSidecar(): Promise<Sidecar | null> {
  if (_sidecar !== undefined) return _sidecar
  try {
    const { default: data } = await import('@/../public/data/perros-osm.json', { assert: { type: 'json' } })
    _sidecar = data as unknown as Sidecar
  } catch { _sidecar = null }
  return _sidecar
}

export const perrosOsm = cache(async (slug: string): Promise<PerrosOsm | null> => {
  const s = await getSidecar()
  const v = s?.[slug]
  return v ? { estado: v.d, nombre: v.n ?? null, metros: v.m } : null
})

/** Los slugs que OSM dice que admiten perros, para sumarlos al hub. */
export const slugsConPerros = cache(async (): Promise<Set<string>> => {
  const s = await getSidecar()
  if (!s) return new Set()
  return new Set(Object.entries(s).filter(([, v]) => v.d !== 'no').map(([k]) => k))
})

export const TEXTO: Record<EstadoPerros, { es: string; en: string }> = {
  yes:        { es: 'admite perros',                    en: 'dogs allowed' },
  leashed:    { es: 'admite perros con correa',         en: 'dogs allowed on a lead' },
  designated: { es: 'tiene zona canina delimitada',     en: 'has a marked dog area' },
  nombre:     { es: 'figura como playa canina',         en: 'is listed as a dog beach' },
  no:         { es: 'no admite perros',                 en: 'does not allow dogs' },
}
