// src/lib/aparcar-provincia.ts
//
// La cabeza que le faltaba a los aparcamientos.
//
// De todas las verticales del sitio, parkings era la única SIN landing:
// 367 páginas de municipio, 25.615 aparcamientos y ni hub nacional ni
// página provincial. El caso contrario a las demás, que tenían la cabeza
// huérfana y les faltaban enlaces desde abajo: aquí la base está bien y
// no había nada por encima a lo que subir, ni página que compitiera por
// «aparcar en las playas de Cádiz».
//
// UMBRAL: 5 municipios y 40 aparcamientos. 22 provincias de las 25
// costeras con datos. Las tres que se caen —Melilla, Ceuta y Ourense—
// tienen uno o dos municipios: una landing provincial con dos entradas
// no es una landing, es una ficha de municipio con otro título.
import aparcamientosData from '@/../public/data/aparcamientos.json'
import { getPlayas, toSlug } from '@/lib/playas'

export const MIN_MUNICIPIOS = 5
export const MIN_APARCAMIENTOS = 40

export interface MunicipioAparca {
  slug: string
  nombre: string
  aparcamientos: number
  /** Si tiene página propia de donde-aparcar. */
  conPagina: boolean
}

export interface ProvinciaAparca {
  slug: string
  nombre: string
  comunidad: string
  municipios: MunicipioAparca[]
  total: number
}

interface Sidecar { pool: unknown[]; municipios: Record<string, [number, number][]> }
const DATA = aparcamientosData as unknown as Sidecar

let _cache: Map<string, ProvinciaAparca> | null = null

export async function getProvinciasAparca(): Promise<Map<string, ProvinciaAparca>> {
  if (_cache) return _cache
  const playas = await getPlayas()   // ya filtra extranjeras y duplicadas

  // slug de municipio → nombre, provincia y comunidad
  const muni = new Map<string, { nombre: string; provincia: string; comunidad: string }>()
  for (const p of playas) {
    const s = toSlug(p.municipio)
    if (!muni.has(s)) muni.set(s, { nombre: p.municipio, provincia: p.provincia, comunidad: p.comunidad })
  }

  const acc = new Map<string, ProvinciaAparca>()
  for (const [ms, lista] of Object.entries(DATA.municipios)) {
    const m = muni.get(ms)
    if (!m) continue
    const ps = toSlug(m.provincia)
    const ya = acc.get(ps)
    const entrada: MunicipioAparca = { slug: ms, nombre: m.nombre, aparcamientos: lista.length, conPagina: true }
    if (ya) { ya.municipios.push(entrada); ya.total += lista.length }
    else acc.set(ps, { slug: ps, nombre: m.provincia, comunidad: m.comunidad, municipios: [entrada], total: lista.length })
  }

  for (const p of acc.values()) p.municipios.sort((a, b) => b.aparcamientos - a.aparcamientos)

  _cache = new Map([...acc].filter(([, p]) =>
    p.municipios.length >= MIN_MUNICIPIOS && p.total >= MIN_APARCAMIENTOS))
  return _cache
}

export async function getProvinciaAparca(slug: string): Promise<ProvinciaAparca | undefined> {
  return (await getProvinciasAparca()).get(slug)
}
