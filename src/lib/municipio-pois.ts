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
  /** Extracto crudo de Wikipedia (no se publica; CC BY-SA). */
  e?: { t: string; l: string; p: string } | null
  /** Resumen reescrito con voz propia a partir de `e` (rewrite-pois-resumen.mjs). `null` = descartado. */
  r?: string | null
}

interface AlrededorCompacto extends PoiCompacto { km: number }

interface MunicipioPoisData {
  nombre: string
  lat: number
  lng: number
  /** Sitios con artículo en Wikipedia entre 3 y 25 km: Baelo Claudia desde
   *  Tarifa, la duna de Valdevaqueros. Lo que cualquier guía cuenta y el
   *  radio de 3 km dejaba fuera. */
  alrededores?: AlrededorCompacto[]
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
  /** Dos frases sobre el sitio, reescritas de Wikipedia. Fuente al pie de la página. */
  resumen?: string
}

export interface MunicipioPois {
  nombre: string
  lat: number
  lng: number
  alrededores: (Poi & { km: number })[]
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
    ...(p.r ? { resumen: p.r } : {}),
  }
}

/**
 * Relleno que OSM etiqueta como monumento o museo y que ninguna guía
 * contaría: un torpedo en una rotonda, un carro elevador, unas escaleras,
 * el busto de un concejal. Medido en Tarifa: el castillo de Guzmán salía
 * en el puesto 11, detrás de una catapulta. Se quitan por nombre.
 */
const RELLENO = /\b(torpedo|catapulta|carro elevador|gr[úu]a|escaleras?|busto|placa|hito|rotonda|aniversario|centenario|homenaje a|monumento a (los|las|la|el|un|una)\b)/i

/** Primero lo que tiene con qué contarse: foto y resumen, luego artículo, luego web. */
const relevancia = (p: PoiCompacto) => (p.f ? 4 : 0) + (p.r ? 3 : 0) + (p.wp ? 2 : 0) + (p.w ? 1 : 0)
const ordenar = (lista: PoiCompacto[]) => lista
  .filter(p => !RELLENO.test(p.n))
  .sort((a, b) => relevancia(b) - relevancia(a))

export const getMunicipioPois = cache(async (slug: string): Promise<MunicipioPois | null> => {
  const s = await getSidecar()
  if (!s) return null
  const raw = s[slug]
  if (!publicable(raw)) return null
  return {
    nombre: raw.nombre,
    lat: raw.lat,
    lng: raw.lng,
    alrededores: (raw.alrededores ?? []).map(p => ({ ...expand(p), km: p.km })),
    museos: ordenar(raw.pois.museo).map(expand),
    monumentos: ordenar(raw.pois.monumento).map(expand),
    cultura: ordenar(raw.pois.cultura).map(expand),
    miradores: ordenar(raw.pois.mirador).map(expand),
    parques: ordenar(raw.pois.parque).map(expand),
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
