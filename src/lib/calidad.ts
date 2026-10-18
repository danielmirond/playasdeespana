// src/lib/calidad.ts — Calidad de agua EEA, cacheado por request
import { cache } from 'react'

export interface CalidadAgua {
  nivel: 'Excelente' | 'Buena' | 'Suficiente' | 'Deficiente' | 'Sin datos'
  // La EEA publica la CLASIFICACIÓN de la directiva, no un porcentaje de
  // muestras conformes. Opcional, y la ficha solo pinta la fila y la barra
  // si existe: el 99 % que salía antes en todas las playas era el valor por
  // defecto del componente, no un dato.
  porcentaje?: number
  temporada: number
  punto?: string        // nombre oficial del punto de baño cruzado
  bwid?: string         // identificador de la EEA (p. ej. ES123M...)
  distancia_m?: number  // a cuánto está ese punto de la playa
}

export const getCalidadDB = cache(async (): Promise<Record<string, CalidadAgua>> => {
  try {
    // calidad-eea.json lo genera scripts/build-calidad-eea.mjs desde el
    // dataset de la Agencia Europea de Medio Ambiente. Reemplaza a
    // calidad-agua.json, que tenía 20 entradas con claves que no eran los
    // slugs del sitio: casaba UNA playa de 5.098.
    const { default: data } = await import('@/../public/data/calidad-eea.json', {
      assert: { type: 'json' },
    })
    return data as unknown as Record<string, CalidadAgua>
  } catch {
    return {}
  }
})

export const getCalidad = cache(async (slug: string): Promise<CalidadAgua | null> => {
  const db = await getCalidadDB()
  return db[slug] ?? null
})
