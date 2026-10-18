// src/lib/praias.ts — las playas de Portugal.
//
// El inventario viene de APA/SNIRH (ver scripts/build-praias-portugal.mjs).
// Vive aparte de `playas.ts` a propósito: comparten motor —Open-Meteo es
// mundial— pero no comparten dominio de datos. Mezclarlos obligaría a que
// cada listado español filtrase por país, y bastaría un olvido para que
// una praia del Algarve apareciera en «playas de Málaga».
import { cache } from 'react'
import praiasJson from '@/../public/data/praias-portugal.json'

export interface Praia {
  slug: string
  nombre: string
  /** El del inventario, cuando el de uso viene de OSM y es distinto. */
  nombreOficial?: string
  municipio: string
  region: string
  lat: number
  lng: number
  /** Embalse, río o laguna: no es litoral y no entra en los listados de costa. */
  fluvial?: boolean
  socorrismo: boolean
  vigilancia: boolean
  duchas: boolean
  aseos: boolean
  parking: boolean
  limpieza: boolean
  bandera: boolean
  accesible: boolean
  /** Lo que el inventario español no tiene. */
  sillaAnfibia: boolean
  apoyoBalneario: boolean
  panelInformativo: boolean
  olasFuertes: boolean
  riesgoDesprendimiento: boolean
  obras?: boolean
  temporadaInicio: string | null
  temporadaFin: string | null
  calidadAgua: string | null
  fichaOficial: string | null
  webcam: string | null
  codigoAgua: string | null
}

/** ARH-ALGARVE → Algarve. Es región hidrográfica, no provincia: se usa para
 *  agrupar y para la miga, y la página dice lo que es. */
export function regionLegible(arh: string): string {
  const n = arh.replace(/^ARH-/, '')
  return n.charAt(0) + n.slice(1).toLowerCase()
}

const TODAS = praiasJson as unknown as Praia[]

export const getPraias = cache(async (): Promise<Praia[]> => TODAS)

/** Solo litoral. Las fluviales existen y tienen ficha, pero no son costa. */
export const getPraiasCosta = cache(async (): Promise<Praia[]> => TODAS.filter(p => !p.fluvial))

export const getPraia = cache(async (slug: string): Promise<Praia | undefined> =>
  TODAS.find(p => p.slug === slug))

export interface ConcelhoPraias {
  slug: string
  nombre: string
  region: string
  praias: Praia[]
}

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const getConcelhos = cache(async (minimo = 2): Promise<ConcelhoPraias[]> => {
  const mapa = new Map<string, ConcelhoPraias>()
  for (const p of TODAS.filter(x => !x.fluvial)) {
    const slug = slugify(p.municipio)
    if (!mapa.has(slug)) mapa.set(slug, { slug, nombre: p.municipio, region: p.region, praias: [] })
    mapa.get(slug)!.praias.push(p)
  }
  return [...mapa.values()]
    .filter(c => c.praias.length >= minimo)
    .sort((a, b) => b.praias.length - a.praias.length)
})

export const getConcelho = cache(async (slug: string): Promise<ConcelhoPraias | undefined> =>
  (await getConcelhos(1)).find(c => c.slug === slug))

export const concelhoSlug = slugify

/**
 * La praia con la forma que espera FichaBody.
 *
 * No es un apaño: los campos comunes —nombre, municipio, coordenadas,
 * servicios— significan lo mismo en los dos países, y el componente ya
 * trata como opcional todo lo que no tiene por qué existir. Lo que no se
 * puede traducir se deja fuera y la sección no se pinta, que es como la
 * ficha lleva tratando desde siempre a las playas sin boya o sin AEMET.
 *
 * `provincia` y `comunidad` se rellenan porque el tipo los exige, pero la
 * ficha no los enseña en Portugal: para eso va la prop `geo`.
 */
export function praiaComoPlaya(p: Praia) {
  return {
    id: p.slug,
    slug: p.slug,
    nombre: p.nombre,
    municipio: p.municipio,
    provincia: regionLegible(p.region),
    comunidad: 'Portugal',
    lat: p.lat,
    lng: p.lng,
    bandera: p.bandera,
    socorrismo: p.socorrismo,
    accesible: p.accesible,
    duchas: p.duchas,
    aseos: p.aseos,
    parking: p.parking,
    limpieza: p.limpieza,
    // La ficha solo afirma un servicio cuando hay inventario detrás. Aquí
    // lo hay, y es el de la APA: se dice cuál, no se disfraza de MITECO.
    servicios_fuente: 'apa',
    nombres_alt: p.nombreOficial ?? null,
  }
}
