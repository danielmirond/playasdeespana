// src/lib/yoga-municipio.ts — estudios de yoga y pilates de un municipio.
//
// POR QUÉ UN BLOQUE Y NO UNA PÁGINA. Solo 61 municipios llegan a tres
// estudios, muy por debajo de los 118 de chiringuitos o los 353 de
// alojamiento. Una página propia con tres fichas sería flaca; dentro de
// «qué hacer», donde el lector ya está buscando planes, encaja y de paso
// manda tráfico al hub de yoga y pilates, que tiene 548 estudios.
//
// DE DÓNDE SALE. Del sidecar cosechado una vez con Google Places y
// congelado en el repo. La playa más cercana la calculamos nosotros.
import { cache } from 'react'
import type { Playa } from '@/types'
import datos from '@/data/yoga-estudios.json'

export interface EstudioYoga {
  id: string
  nombre: string
  /** «Yoga» o «Yoga / Pilates», tal como viene etiquetado. */
  disciplina: string
  pilates: boolean
  valoracion: number
  resenas: number
  lat: number
  lng: number
  playa: { slug: string; nombre: string; metros: number }
}

interface Local { googleId: string; nombre: string; rating: number; reseñas: number; tipo: string; lat: number; lng: number; playaCercana?: { slug: string; nombre: string; distM: number } }
interface Prov { provincia: string; comunidad: string; estudios: Local[] }
const TODOS: Local[] = Object.values(datos as unknown as Record<string, Prov>).flatMap(p => p.estudios ?? [])

/** Un estudio a 6 km sigue siendo «el del pueblo»; a 20 ya no. */
const RADIO_M = 6000

export const yogaDelMunicipio = cache(async (playas: Playa[]): Promise<EstudioYoga[]> => {
  const porSlug = new Map(playas.map(p => [p.slug, p]))
  const vistos = new Set<string>()
  const out: EstudioYoga[] = []
  for (const l of TODOS) {
    const pc = l.playaCercana
    if (!pc?.slug || pc.distM > RADIO_M || !porSlug.has(pc.slug)) continue
    if (vistos.has(l.googleId)) continue
    vistos.add(l.googleId)
    const p = porSlug.get(pc.slug)!
    out.push({
      id: l.googleId, nombre: l.nombre,
      disciplina: l.tipo, pilates: /pilates/i.test(l.tipo),
      valoracion: l.rating ?? 0, resenas: l.reseñas ?? 0,
      lat: l.lat, lng: l.lng,
      playa: { slug: p.slug, nombre: p.nombre, metros: pc.distM },
    })
  }
  // El mejor valorado primero: aquí no manda la distancia, manda si es bueno.
  return out.sort((a, b) => b.valoracion - a.valoracion || b.resenas - a.resenas)
})

export const MINIMO_ESTUDIOS = 2
export const metrosYoga = (m: number): string =>
  m >= 1000 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${m} m`
