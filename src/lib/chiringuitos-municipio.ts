// src/lib/chiringuitos-municipio.ts — los chiringuitos de un municipio.
//
// POR QUÉ A NIVEL MUNICIPIO. El hub por provincia mezcla 50 kilómetros de
// costa: para quien ya sabe a qué pueblo va, no sirve. Lo que decide es a
// qué playa le cae cada chiringuito y si está bien valorado, y eso lo
// tenemos para 118 municipios.
//
// DE DÓNDE SALE. Del sidecar que se cosechó una vez con Google Places y
// está congelado en el repo: nombre, valoración, reseñas y coordenadas.
// La playa más cercana la calculamos nosotros con el dataset. Cero
// llamadas: la clave salió de Vercel tras la factura de julio.
import { cache } from 'react'
import type { Playa } from '@/types'
import datos from '@/data/chiringuitos.json'

export interface Chiringuito {
  id: string
  nombre: string
  valoracion: number
  resenas: number
  lat: number
  lng: number
  playa: { slug: string; nombre: string; metros: number; bandera: boolean; socorrismo: boolean }
}

interface Local { googleId: string; nombre: string; rating: number; reseñas: number; tipo: string; lat: number; lng: number; playaCercana?: { slug: string; nombre: string; distM: number; municipio?: string } }
interface Prov { provincia: string; comunidad: string; estudios: Local[] }
const TODOS: Local[] = (Object.values(datos as unknown as Record<string, Prov>)).flatMap(p => p.estudios ?? [])

/** Más allá de 3 km ya no es «el chiringuito de esa playa». */
const RADIO_M = 3000

export const chiringuitosDelMunicipio = cache(async (playas: Playa[]): Promise<Chiringuito[]> => {
  const slugs = new Set(playas.map(p => p.slug))
  const porSlug = new Map(playas.map(p => [p.slug, p]))
  const out: Chiringuito[] = []
  const vistos = new Set<string>()

  for (const l of TODOS) {
    const pc = l.playaCercana
    if (!pc?.slug || !slugs.has(pc.slug) || pc.distM > RADIO_M) continue
    if (vistos.has(l.googleId)) continue
    vistos.add(l.googleId)
    const p = porSlug.get(pc.slug)!
    out.push({
      id: l.googleId,
      nombre: l.nombre,
      valoracion: l.rating ?? 0,
      resenas: l.reseñas ?? 0,
      lat: l.lat,
      lng: l.lng,
      playa: { slug: p.slug, nombre: p.nombre, metros: pc.distM, bandera: !!p.bandera, socorrismo: !!p.socorrismo },
    })
  }
  // Primero los de la arena; a igual distancia, el mejor valorado.
  return out.sort((a, b) => a.playa.metros - b.playa.metros || b.valoracion - a.valoracion)
})

/** Con menos de tres no hay comparación que ofrecer. */
export const MINIMO_CHIRINGUITOS = 3

export const tieneChiringuitos = cache(async (playas: Playa[]): Promise<boolean> =>
  (await chiringuitosDelMunicipio(playas)).length >= MINIMO_CHIRINGUITOS)

export const metros = (m: number): string =>
  m >= 1000 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${m} m`
