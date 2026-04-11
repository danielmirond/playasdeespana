// src/lib/playas.ts
import type { Playa } from '@/types'
import { cache } from 'react'

export function toSlug(str: string): string {
  return (str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/**
 * Returns a Set of municipio slugs that have their own page
 * (>= minPlayas beaches). Useful for deciding whether to render
 * a link or plain text in the ficha.
 */
export const getMunicipioSlugsSet = cache(async (minPlayas = 4): Promise<Set<string>> => {
  const municipios = await getMunicipios(minPlayas)
  return new Set(municipios.map(m => m.slug))
})

export const getPlayas = cache(async (): Promise<Playa[]> => {
  try {
    const { default: data } = await import('@/../public/data/playas.json', {
      assert: { type: 'json' },
    })
    return data as unknown as Playa[]
  } catch {
    console.warn('[playas] public/data/playas.json no encontrado — ejecuta npm run sync:playas')
    return []
  }
})

export const getPlayaBySlug = cache(async (slug: string): Promise<Playa | undefined> => {
  const playas = await getPlayas()
  return playas.find(p => p.slug === slug)
})

export const getPlayasByComunidad = cache(async (comunidadSlug: string): Promise<Playa[]> => {
  const playas = await getPlayas()
  return playas.filter(p => toSlug(p.comunidad) === comunidadSlug)
})

export const getPlayasByProvincia = cache(async (provinciaSlug: string): Promise<Playa[]> => {
  const playas = await getPlayas()
  return playas.filter(p => toSlug(p.provincia) === provinciaSlug)
})

export const getAllSlugs = cache(async (): Promise<string[]> => {
  const playas = await getPlayas()
  return playas.map(p => p.slug)
})

export const getComunidades = cache(async () => {
  const playas = await getPlayas()
  const mapa = new Map<string, number>()
  for (const p of playas) {
    mapa.set(p.comunidad, (mapa.get(p.comunidad) ?? 0) + 1)
  }
  return Array.from(mapa.entries())
    .map(([nombre, count]) => ({
      nombre,
      slug: toSlug(nombre),
      count,
    }))
    .sort((a, b) => b.count - a.count)
})

export const getMunicipios = cache(async (minPlayas = 4) => {
  const playas = await getPlayas()
  const mapa = new Map<string, { count: number; provincia: string; comunidad: string }>()
  for (const p of playas) {
    const key = p.municipio
    const cur = mapa.get(key)
    mapa.set(key, {
      count: (cur?.count ?? 0) + 1,
      provincia: p.provincia,
      comunidad: p.comunidad,
    })
  }
  return Array.from(mapa.entries())
    .filter(([, v]) => v.count >= minPlayas)
    .map(([nombre, { count, provincia, comunidad }]) => ({
      nombre,
      slug: toSlug(nombre),
      provincia,
      provinciaSlug: toSlug(provincia),
      comunidad,
      comunidadSlug: toSlug(comunidad),
      count,
    }))
    .sort((a, b) => b.count - a.count)
})

export const getPlayasByMunicipio = cache(async (municipioSlug: string): Promise<Playa[]> => {
  const playas = await getPlayas()
  return playas.filter(p => toSlug(p.municipio) === municipioSlug)
})

export const getProvincias = cache(async () => {
  const playas = await getPlayas()
  const mapa = new Map<string, { count: number; comunidad: string }>()
  for (const p of playas) {
    const key = p.provincia
    const cur = mapa.get(key)
    mapa.set(key, { count: (cur?.count ?? 0) + 1, comunidad: p.comunidad })
  }
  return Array.from(mapa.entries())
    .map(([nombre, { count, comunidad }]) => ({
      nombre,
      slug: toSlug(nombre),
      comunidadSlug: toSlug(comunidad),
      comunidad,
      count,
    }))
    .sort((a, b) => b.count - a.count)
})

// ────────────────────────────────────────────────────────────────────────
// Helpers para /playas-perros. Filtro por perros:true + agrupaciones por
// comunidad / provincia / municipio. Se usan en las páginas hijas.

export const getPlayasPerros = cache(async (): Promise<Playa[]> => {
  const playas = await getPlayas()
  return playas.filter(p => p.perros === true)
})

export interface PerrosStats {
  total: number
  comunidades: Array<{ nombre: string; slug: string; count: number }>
  provincias:  Array<{ nombre: string; slug: string; comunidad: string; comunidadSlug: string; count: number }>
  municipios:  Array<{ nombre: string; slug: string; provincia: string; provinciaSlug: string; count: number }>
}

export const getPerrosStats = cache(async (): Promise<PerrosStats> => {
  const playas = await getPlayasPerros()
  const byCom = new Map<string, number>()
  const byProv = new Map<string, { count: number; comunidad: string }>()
  const byMun = new Map<string, { count: number; provincia: string }>()
  for (const p of playas) {
    byCom.set(p.comunidad, (byCom.get(p.comunidad) ?? 0) + 1)
    const prev = byProv.get(p.provincia)
    byProv.set(p.provincia, { count: (prev?.count ?? 0) + 1, comunidad: p.comunidad })
    const munKey = p.municipio
    const mprev = byMun.get(munKey)
    byMun.set(munKey, { count: (mprev?.count ?? 0) + 1, provincia: p.provincia })
  }
  return {
    total: playas.length,
    comunidades: Array.from(byCom.entries())
      .map(([nombre, count]) => ({ nombre, slug: toSlug(nombre), count }))
      .sort((a, b) => b.count - a.count),
    provincias: Array.from(byProv.entries())
      .map(([nombre, { count, comunidad }]) => ({
        nombre, slug: toSlug(nombre), comunidad, comunidadSlug: toSlug(comunidad), count,
      }))
      .sort((a, b) => b.count - a.count),
    municipios: Array.from(byMun.entries())
      .map(([nombre, { count, provincia }]) => ({
        nombre, slug: toSlug(nombre), provincia, provinciaSlug: toSlug(provincia), count,
      }))
      .sort((a, b) => b.count - a.count),
  }
})
