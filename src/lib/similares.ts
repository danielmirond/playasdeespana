// src/lib/similares.ts — "Playas parecidas a esta".
//
// Lee el sidecar que genera scripts/build-similares.mjs (similitud de Gower
// sobre campos tipados; el porqué de no usar embeddings está en la cabecera
// de ese script). Aquí solo hay lectura: cero cómputo por petición.
//
// El sidecar pesa ~950 KB, así que se importa de forma DINÁMICA y solo en
// servidor — nunca viaja al cliente. La ficha recibe ya los 6 registros
// mínimos, igual que hace con playasCercanas.

import { cache } from 'react'
import { getPlayas } from '@/lib/playas'

export interface PlayaSimilar {
  slug: string
  nombre: string
  municipio: string
  provincia: string
  /** 0-100. No se pinta como cifra: solo ordena. */
  score: number
  /** Rasgos compartidos, ya legibles: ["aislada", "con acantilado"]. */
  porQue: string[]
  bandera?: boolean
}

interface Sidecar {
  motivos: string[]
  playas: Record<string, [string, number, number[]][]>
}

const getSidecar = cache(async (): Promise<Sidecar | null> => {
  try {
    const { default: data } = await import('@/data/playas-similares.json')
    return data as unknown as Sidecar
  } catch {
    console.warn('[similares] falta src/data/playas-similares.json — ejecuta node scripts/build-similares.mjs')
    return null
  }
})

/**
 * Playas parecidas a `slug`, ya resueltas a nombre/municipio.
 *
 * Devuelve [] cuando la playa no es comparable: las ~1.050 que solo vienen de
 * OSM no traen los campos de carácter del MITECO, y compararlas daría un
 * parecido inventado. La ficha no debe pintar la pestaña en ese caso.
 */
export const getSimilares = cache(async (slug: string, limite = 6): Promise<PlayaSimilar[]> => {
  const sidecar = await getSidecar()
  const entradas = sidecar?.playas[slug]
  if (!entradas?.length) return []

  const playas = await getPlayas()
  const idx = new Map(playas.map(p => [p.slug, p]))

  const out: PlayaSimilar[] = []
  for (const [s, score, motivos] of entradas) {
    const p = idx.get(s)
    if (!p) continue          // el sidecar puede quedar por detrás de un sync
    out.push({
      slug: p.slug,
      nombre: p.nombre,
      municipio: p.municipio,
      provincia: p.provincia,
      score,
      porQue: motivos.map(i => sidecar!.motivos[i]).filter(Boolean),
      bandera: !!p.bandera,
    })
    if (out.length >= limite) break
  }
  return out
})
