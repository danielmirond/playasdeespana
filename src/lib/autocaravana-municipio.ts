// src/lib/autocaravana-municipio.ts — dormir y aparcar en autocaravana.
//
// LA PREGUNTA REAL. Quien baja a la costa en autocaravana no busca una
// playa bonita: busca dónde pasar la noche sin que le llamen la atención a
// las siete de la mañana, dónde vaciar el químico y a qué playa puede
// acercarse con siete metros de vehículo. Las tres cosas están en datos que
// ya teníamos: las áreas de OpenStreetMap, sus servicios, y el tamaño del
// aparcamiento de cada playa según el inventario oficial.
//
// LO QUE NO SE PROMETE. Ni que la pernocta esté permitida (eso lo decide
// cada ayuntamiento y cambia cada temporada), ni que el aparcamiento grande
// admita autocaravanas: muchos ponen barra de altura. La página lo dice con
// todas las letras en vez de insinuar lo contrario.
import { cache } from 'react'
import type { Playa } from '@/types'

export interface AreaAutocaravana {
  nombre: string | null
  /** 'area' es área de autocaravanas; 'parking' solo admite el vehículo. */
  tipo: 'area' | 'parking'
  metros: number
  pago: boolean | null
  plazas: number | null
  agua: boolean
  vaciado: boolean
  luz: boolean
  duchas: boolean
  aseos: boolean
  tarifa: string | null
  maxEstancia: string | null
  lat: number
  lng: number
}

export interface PlayaAutocaravana {
  slug: string
  nombre: string
  /** Tal cual lo publica el inventario: «Más de 100 plazas». */
  tamano: string
  vigilado: boolean
  bandera: boolean
}

interface Sidecar {
  pool: {
    n?: string | null; k: 'area' | 'parking'; f?: 0 | 1; c?: number
    agua?: 1; vaciado?: 1; luz?: 1; duchas?: 1; aseos?: 1
    tarifa?: string; max?: string; la: number; lo: number
  }[]
  municipios: Record<string, [number, number][]>
}

let _sidecar: Sidecar | null | undefined
async function getSidecar(): Promise<Sidecar | null> {
  if (_sidecar !== undefined) return _sidecar
  try {
    const { default: data } = await import('@/../public/data/autocaravanas.json', { assert: { type: 'json' } })
    _sidecar = data as unknown as Sidecar
  } catch {
    _sidecar = null
  }
  return _sidecar
}

/** Solo los dos tramos grandes: con «menos de 50 plazas» una autocaravana
 *  no entra un domingo de agosto, y prometerlo sería mentir. */
const GRANDE = /m[áa]s de 100|150|200|entre 50 y 100/i

export const autocaravanaDelMunicipio = cache(async (playas: Playa[], slugMunicipio: string): Promise<{
  areas: AreaAutocaravana[]
  playas: PlayaAutocaravana[]
}> => {
  const s = await getSidecar()
  const areas: AreaAutocaravana[] = !s ? [] : (s.municipios[slugMunicipio] ?? []).map(([i, d]) => {
    const p = s.pool[i]
    return {
      nombre: p.n ?? null,
      tipo: p.k,
      metros: d,
      pago: p.f === undefined ? null : p.f === 1,
      plazas: p.c && p.c >= 3 ? p.c : null,
      agua: p.agua === 1,
      vaciado: p.vaciado === 1,
      luz: p.luz === 1,
      duchas: p.duchas === 1,
      aseos: p.aseos === 1,
      // OSM escribe «13 EUR»; aquí se lee «13 €», que es como está en el cartel.
      tarifa: p.tarifa ? p.tarifa.replace(/\s*EUR\b/gi, ' €').replace(/\s+/g, ' ').trim() : null,
      maxEstancia: p.max ?? null,
      lat: p.la,
      lng: p.lo,
    }
  })
  // Primero las áreas de verdad, y dentro de cada grupo la más cercana.
  areas.sort((a, b) => (a.tipo === b.tipo ? 0 : a.tipo === 'area' ? -1 : 1) || a.metros - b.metros)

  const conSitio: PlayaAutocaravana[] = playas
    .map(p => {
      const tamano = (p as unknown as { parking_plazas?: string }).parking_plazas ?? ''
      const tipo = (p as unknown as { parking_tipo?: string }).parking_tipo ?? ''
      return { slug: p.slug, nombre: p.nombre, tamano, vigilado: /^\s*vigilado/i.test(tipo), bandera: !!p.bandera }
    })
    .filter(p => GRANDE.test(p.tamano))
    .sort((a, b) => (/m[áa]s de 100|150|200/i.test(b.tamano) ? 1 : 0) - (/m[áa]s de 100|150|200/i.test(a.tamano) ? 1 : 0)
      || a.nombre.localeCompare(b.nombre))

  return { areas, playas: conSitio }
})

/** Se publica cuando la página responde algo que no está ya en otra: un
 *  área donde dormir y una playa a la que bajar, o dos áreas que comparar.
 *  Con un área suelta y ninguna playa grande, esto sería un punto en un
 *  mapa con más texto alrededor. */
export async function tieneAutocaravana(playas: Playa[], slug: string): Promise<boolean> {
  if (playas.length < 2) return false
  const { areas, playas: ps } = await autocaravanaDelMunicipio(playas, slug)
  const propias = areas.filter(a => a.tipo === 'area').length
  return (propias >= 1 && ps.length >= 1) || propias >= 2
}

/** Los servicios que tiene, en una frase. */
export function servicios(a: AreaAutocaravana): string[] {
  const out: string[] = []
  if (a.agua) out.push('agua potable')
  if (a.vaciado) out.push('vaciado de aguas')
  if (a.luz) out.push('enganche eléctrico')
  if (a.duchas) out.push('duchas')
  if (a.aseos) out.push('aseos')
  return out
}

/** Los municipios que publican página, agrupados por comunidad, para el
 *  hub. Se calcula de una vez sobre todas las playas en vez de preguntar
 *  municipio a municipio, que son setecientas consultas. */
export const municipiosConAutocaravana = cache(async (): Promise<
  { comunidad: string; municipios: { slug: string; nombre: string; provincia: string; areas: number }[] }[]
> => {
  const [{ getPlayas, getMunicipios }, s] = await Promise.all([import('./playas'), getSidecar()])
  if (!s) return []
  const [playas, municipios] = await Promise.all([getPlayas(), getMunicipios(2)])
  const porSlug = new Map<string, Playa[]>()
  for (const p of playas) {
    const k = p.municipio.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    if (!porSlug.has(k)) porSlug.set(k, [])
    porSlug.get(k)!.push(p)
  }
  const porComunidad = new Map<string, { slug: string; nombre: string; provincia: string; areas: number }[]>()
  for (const m of municipios) {
    const ps = porSlug.get(m.slug) ?? []
    const areas = (s.municipios[m.slug] ?? []).filter(([i]) => s.pool[i].k === 'area').length
    const grandes = ps.filter(p => GRANDE.test((p as unknown as { parking_plazas?: string }).parking_plazas ?? '')).length
    if (!((areas >= 1 && grandes >= 1) || areas >= 2)) continue
    if (!porComunidad.has(m.comunidad)) porComunidad.set(m.comunidad, [])
    porComunidad.get(m.comunidad)!.push({ slug: m.slug, nombre: m.nombre, provincia: m.provincia, areas })
  }
  return [...porComunidad]
    .map(([comunidad, ms]) => ({ comunidad, municipios: ms.sort((a, b) => b.areas - a.areas || a.nombre.localeCompare(b.nombre)) }))
    .sort((a, b) => b.municipios.length - a.municipios.length)
})
