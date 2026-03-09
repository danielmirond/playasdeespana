// src/lib/playas.ts
import type { Playa } from '@/types'
import { cache } from 'react'

function toSlug(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

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
