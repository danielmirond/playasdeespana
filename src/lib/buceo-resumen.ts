// src/lib/buceo-resumen.ts — los municipios con buceo, contados con datos
// reales: centros de Google Places (buceo-places.json) y puntos de
// inmersión de OSM (buceo-osm.json).
//
// POR QUÉ EXISTE. /buceo contaba «playas con buceo/snorkel» filtrando
// playa.actividades.buceo, un campo que el dataset no trae: salía 0. Y
// /buceo/[provincia] ordenaba por ese mismo campo, así que su «Top 6» era
// el ranking genérico de playas. Los dos hubs leen de aquí y enlazan a la
// página de snorkel y buceo de cada municipio.
import { cache } from 'react'
import { getMunicipios } from '@/lib/playas'
import { tieneVidaMarina } from '@/lib/vida-marina'

/** La cosecha pide 10 resultados por municipio y, tras filtrar, se queda en
 *  8 como mucho: 22 municipios están en ese techo. Ninguna cifra de centros
 *  sirve para decir dónde hay «más». */
export const MAX_CENTROS_POR_MUNICIPIO = 8

export interface MunicipioBuceo {
  slug: string
  nombre: string
  provincia: string
  provinciaSlug: string
  centros: number
  puntos: number
  /** Solo si existe /municipio/[slug]/snorkel-buceo (si no, haría notFound). */
  conPagina: boolean
}

const cargar = cache(async () => {
  const leer = async (imp: Promise<{ default: unknown }>) => {
    try { return (await imp).default as Record<string, unknown[] | { sitios?: unknown[] }> } catch { return {} }
  }
  const places = await leer(import('@/../public/data/buceo-places.json', { assert: { type: 'json' } }))
  const osm = await leer(import('@/../public/data/buceo-osm.json', { assert: { type: 'json' } }))
  return { places, osm }
})

export const getMunicipiosBuceo = cache(async (): Promise<MunicipioBuceo[]> => {
  const { places, osm } = await cargar()
  const municipios = new Map((await getMunicipios(1)).map(m => [m.slug, m]))
  const slugs = new Set([...Object.keys(places), ...Object.keys(osm)])
  const out: MunicipioBuceo[] = []
  for (const slug of slugs) {
    const m = municipios.get(slug)
    if (!m) continue
    const centros = (places[slug] as unknown[] | undefined)?.length ?? 0
    const puntos = ((osm[slug] as { sitios?: unknown[] } | undefined)?.sitios ?? []).length
    if (!centros && !puntos) continue
    out.push({
      slug, nombre: m.nombre, provincia: m.provincia, provinciaSlug: m.provinciaSlug,
      centros, puntos, conPagina: await tieneVidaMarina(slug),
    })
  }
  return out.sort((a, b) => b.centros - a.centros || b.puntos - a.puntos)
})

/**
 * Reservas marinas de interés pesquero que gestiona el Estado, tal como las
 * lista el Ministerio de Agricultura, Pesca y Alimentación (consultado el
 * 25-oct-2026). Las comunidades autónomas tienen las suyas, que no van aquí.
 */
export const RESERVAS_MARINAS_MAPA_URL =
  'https://www.mapa.gob.es/es/pesca/temas/proteccion-recursos-pesqueros/reservas-marinas-de-espana/'
export const RESERVAS_MARINAS_ESTADO: Array<{ nombre: string; zona: string; comSlug: string }> = [
  { nombre: 'Cabo de Gata-Níjar',              zona: 'Almería',              comSlug: 'andalucia' },
  { nombre: 'Cabo de Palos-Islas Hormigas',    zona: 'Murcia',               comSlug: 'murcia' },
  { nombre: 'Cabo Tiñoso',                     zona: 'Murcia',               comSlug: 'murcia' },
  { nombre: 'Levante de Mallorca-Cala Rajada', zona: 'Mallorca',             comSlug: 'islas-baleares' },
  { nombre: 'Isla Dragonera',                  zona: 'Mallorca',             comSlug: 'islas-baleares' },
  { nombre: 'Isla de Alborán',                 zona: 'Almería',              comSlug: 'andalucia' },
  { nombre: 'Islas Columbretes',               zona: 'Castellón',            comSlug: 'comunitat-valenciana' },
  { nombre: 'Isla Graciosa',                   zona: 'Lanzarote',            comSlug: 'canarias' },
  { nombre: 'Isla de Tabarca',                 zona: 'Alicante',             comSlug: 'comunitat-valenciana' },
  { nombre: 'Isla de La Palma',                zona: 'La Palma',             comSlug: 'canarias' },
  { nombre: 'La Restinga',                     zona: 'El Hierro',            comSlug: 'canarias' },
  { nombre: 'Masía Blanca',                    zona: 'Tarragona',            comSlug: 'cataluna' },
]
