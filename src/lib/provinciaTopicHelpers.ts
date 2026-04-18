// src/lib/provinciaTopicHelpers.ts
// Utilidades compartidas para las páginas /{topic}/[provincia].
import { getPlayas, getProvincias, toSlug } from '@/lib/playas'
import type { Playa } from '@/types'

// Comunidades costeras (las que tienen al menos 1 playa)
const COMUNIDADES_COSTERAS = new Set([
  'Andalucía', 'Cataluña', 'Comunitat Valenciana', 'Galicia',
  'Canarias', 'Islas Baleares', 'Murcia', 'Asturias',
  'Cantabria', 'País Vasco', 'Ceuta', 'Melilla',
])

export interface ProvinciaCostera {
  nombre: string
  slug: string
  comunidad: string
  count: number
}

/** Lista de provincias con playas (para generateStaticParams) */
export async function getProvinciasCosteras(): Promise<ProvinciaCostera[]> {
  const provincias = await getProvincias()
  return provincias
    .filter(p => COMUNIDADES_COSTERAS.has(p.comunidad))
    .map(p => ({ nombre: p.nombre, slug: p.slug, comunidad: p.comunidad, count: p.count }))
}

/** Playas de una provincia concreta. Retorna null si no existe. */
export async function getPlayasByProvinciaSlug(slug: string): Promise<{
  provincia: ProvinciaCostera
  playas: Playa[]
} | null> {
  const [playas, provincias] = await Promise.all([getPlayas(), getProvinciasCosteras()])
  const provincia = provincias.find(p => p.slug === slug)
  if (!provincia) return null
  const filtradas = playas.filter(p => toSlug(p.provincia) === slug)
  return { provincia, playas: filtradas }
}
