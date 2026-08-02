// src/lib/rutas-coche.ts — tiempos de coche MEDIDOS por carretera.
//
// Ojo con el nombre: rutas.ts es otra cosa (las rutas turísticas por
// costas). Esto son tiempos origen→playa.
//
// Cosechados con scripts/harvest-rutas.mjs contra OSRM (OpenStreetMap):
// 16 ciudades de interior × 40 playas con parking = 640 rutas, en 16
// peticiones. Congelados en el repo porque un tiempo en flujo libre no
// cambia de un día para otro, y así la página no depende de nadie.
//
// Se eligió OSRM sobre Google Routes no por precio sino porque no existe
// la posibilidad de una factura. Tras el cargo de 231 € de Places, esa
// propiedad vale más que el tráfico en tiempo real — que además aquí
// sobra, porque el dato se congela.
//
// LO QUE NO DA: tráfico. Para "¿salgo ya?" no vale; para "¿a cuánto me
// queda esta playa?" es justo el dato que hace falta, y es medido en vez
// de una regla de tres sobre la distancia en línea recta.

import { cache } from 'react'

export interface RutaCoche {
  /** Minutos por carretera, en flujo libre. */
  min: number
  /** Kilómetros por carretera (no en línea recta). */
  km: number
}

type Sidecar = Record<string, Record<string, RutaCoche>>

const cargar = cache(async (): Promise<Sidecar> => {
  try {
    const { default: d } = await import('@/data/rutas-coche.json')
    return d as unknown as Sidecar
  } catch {
    return {}
  }
})

/**
 * Rutas desde una ciudad, indexadas por slug de playa.
 * Devuelve {} si esa ciudad no se cosechó: el caller cae a su estimación.
 */
export const getRutasDe = cache(async (ciudadSlug: string): Promise<Record<string, RutaCoche>> => {
  const s = await cargar()
  return s[ciudadSlug] ?? {}
})
