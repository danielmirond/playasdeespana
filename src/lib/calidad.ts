// src/lib/calidad.ts — Calidad de agua EEA, cacheado por request
import { cache } from 'react'

export interface CalidadAgua {
  nivel: 'Excelente' | 'Buena' | 'Suficiente' | 'Deficiente' | 'Sin datos'
  porcentaje: number
  temporada: number
}

export const getCalidadDB = cache(async (): Promise<Record<string, CalidadAgua>> => {
  try {
    const { default: data } = await import('@/../public/data/calidad-agua.json', {
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
