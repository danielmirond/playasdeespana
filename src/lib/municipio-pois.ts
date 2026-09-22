// src/lib/municipio-pois.ts — Prototipo: POIs turísticos por municipio.
//
// PARA QUÉ. Alimenta /municipio/[slug]/que-hacer. Devuelve museos, monumentos,
// teatros/cines, miradores/faros y parques que Overpass identificó dentro de
// 3 km del centroide del municipio. Cero llamadas externas: solo lee el JSON
// generado por scripts/build-municipio-pois.mjs.
//
// COBERTURA. El prototipo tiene ~25 municipios turísticos consolidados. Un
// municipio ausente devuelve null (la página muestra "próximamente" o esconde
// los bloques). La ampliación es solo añadir slugs a MUNICIPIOS en el script y
// re-correrlo — el sidecar es lineal (~2 KB por municipio).
import { cache } from 'react'

interface PoiCompacto {
  n: string       // nombre
  t: string       // tipo legible ("Museo", "Faro", "Castillo"…)
  la: number
  lo: number
  w?: string      // website
  wp?: string     // wikipedia
  pmr?: 1         // accesible silla de ruedas
  /** Foto de Wikipedia/Commons con licencia libre, solo en los del carrusel
   *  (scripts/resolve-pois-fotos.mjs). `null` = se buscó y no había. */
  f?: { u: string; a: string; l: string; w: number; h: number } | null
}

interface MunicipioPoisData {
  nombre: string
  lat: number
  lng: number
  pois: {
    museo: PoiCompacto[]
    monumento: PoiCompacto[]
    cultura: PoiCompacto[]
    mirador: PoiCompacto[]
    parque: PoiCompacto[]
  }
  total: number
  generado: string
}

export interface Poi {
  nombre: string
  tipo: string
  lat: number
  lng: number
  website?: string
  wikipedia?: string
  pmr?: boolean
  foto?: { url: string; autor: string; licencia: string; ancho: number; alto: number }
}

export interface MunicipioPois {
  nombre: string
  lat: number
  lng: number
  museos: Poi[]
  monumentos: Poi[]
  cultura: Poi[]
  miradores: Poi[]
  parques: Poi[]
  total: number
  generado: string
}

let _sidecar: Record<string, MunicipioPoisData> | null | undefined

/**
 * Mínimo para tener página. Desde que la lista sale del catálogo entero y no
 * de 78 destinos elegidos a mano, entran pueblos donde Overpass encuentra dos
 * o tres cosas. Con eso no hay plan de un día que montar ni nada que leer:
 * mejor sin página que con una que decepciona. El dato sigue en el sidecar
 * por si mañana OSM tiene más.
 */
const MINIMO_POIS = 5
const publicable = (raw: MunicipioPoisData | undefined) => !!raw && raw.total >= MINIMO_POIS

async function getSidecar(): Promise<Record<string, MunicipioPoisData> | null> {
  if (_sidecar !== undefined) return _sidecar
  try {
    const { default: data } = await import('@/../public/data/municipio-pois.json', {
      assert: { type: 'json' },
    })
    _sidecar = data as unknown as Record<string, MunicipioPoisData>
  } catch {
    _sidecar = null
  }
  return _sidecar
}

function expand(p: PoiCompacto): Poi {
  return {
    nombre: p.n,
    tipo: p.t,
    lat: p.la,
    lng: p.lo,
    ...(p.w ? { website: p.w } : {}),
    ...(p.wp ? { wikipedia: p.wp } : {}),
    ...(p.pmr ? { pmr: true } : {}),
    ...(p.f ? { foto: { url: p.f.u, autor: p.f.a, licencia: p.f.l, ancho: p.f.w, alto: p.f.h } } : {}),
  }
}

export const getMunicipioPois = cache(async (slug: string): Promise<MunicipioPois | null> => {
  const s = await getSidecar()
  if (!s) return null
  const raw = s[slug]
  if (!publicable(raw)) return null
  return {
    nombre: raw.nombre,
    lat: raw.lat,
    lng: raw.lng,
    museos: raw.pois.museo.map(expand),
    monumentos: raw.pois.monumento.map(expand),
    cultura: raw.pois.cultura.map(expand),
    miradores: raw.pois.mirador.map(expand),
    parques: raw.pois.parque.map(expand),
    total: raw.total,
    generado: raw.generado,
  }
})

/** Lista de slugs con datos (para generateStaticParams). */
export const getMunicipiosConPois = cache(async (): Promise<string[]> => {
  const s = await getSidecar()
  return s ? Object.keys(s).filter(k => publicable(s[k])) : []
})

/** ¿Este municipio está en el prototipo? Sirve para pintar el enlace desde
 *  la página raíz del municipio solo cuando hay página destino que servir. */
export const tienePois = cache(async (slug: string): Promise<boolean> => {
  const s = await getSidecar()
  return publicable(s?.[slug])
})
