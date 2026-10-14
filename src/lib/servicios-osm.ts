// src/lib/servicios-osm.ts — lo que hay mapeado junto a la arena.
//
// NO RELLENA EL INVENTARIO, Y ESA ES LA GRACIA. Contrastado contra las
// 3.500 playas con ficha del Ministerio, OpenStreetMap acierta el 78 %
// cuando dice que hay duchas y solo encuentra el 29 % de las que existen.
// Escribir «esta playa tiene duchas» con eso sería equivocarse una de cada
// cuatro veces, y en la ficha hay gente decidiendo si va con niños o en
// silla de ruedas.
//
// Lo que sí es cierto al cien por cien: que a 120 m alguien mapeó unos
// aseos. Eso es lo que se publica, con su distancia y su fuente, igual que
// los campings o los aparcamientos. Donde no hay nada mapeado no se dice
// nada: el silencio no es un «no hay».
import { cache } from 'react'

export type TipoServicio = 'aseos' | 'duchas' | 'agua' | 'socorrista'

export interface ServicioCerca {
  tipo: TipoServicio
  nombre: string | null
  metros: number
  /** Marcado como accesible en OpenStreetMap. */
  pmr: boolean
  /** true de pago, false gratis, null no consta. */
  pago: boolean | null
  lat: number
  lng: number
}

interface Sidecar {
  pool: { t: TipoServicio; n?: string; pmr?: 1; f?: 0 | 1; la: number; lo: number }[]
  playas: Record<string, [number, number][]>
}

let _sidecar: Sidecar | null | undefined
async function getSidecar(): Promise<Sidecar | null> {
  if (_sidecar !== undefined) return _sidecar
  try {
    const { default: data } = await import('@/../public/data/servicios-osm.json', { assert: { type: 'json' } })
    _sidecar = data as unknown as Sidecar
  } catch {
    _sidecar = null
  }
  return _sidecar
}

const ORDEN: TipoServicio[] = ['socorrista', 'duchas', 'aseos', 'agua']

/** Lo mapeado a menos de 300 m, uno por tipo y el más cercano primero. */
export const serviciosCerca = cache(async (lat: number, lng: number): Promise<ServicioCerca[]> => {
  const s = await getSidecar()
  if (!s || !lat || !lng) return []
  const refs = s.playas[`${lat.toFixed(4)}:${lng.toFixed(4)}`]
  if (!refs?.length) return []
  return refs
    .map(([i, d]) => {
      const p = s.pool[i]
      return {
        tipo: p.t,
        nombre: p.n ?? null,
        metros: d,
        pmr: p.pmr === 1,
        pago: p.f === undefined ? null : p.f === 1,
        lat: p.la,
        lng: p.lo,
      }
    })
    .sort((a, b) => ORDEN.indexOf(a.tipo) - ORDEN.indexOf(b.tipo))
})

export const ETIQUETA: Record<TipoServicio, { es: string; en: string }> = {
  socorrista: { es: 'puesto de socorrismo', en: 'lifeguard post' },
  duchas:     { es: 'ducha',                en: 'shower' },
  aseos:      { es: 'aseos',                en: 'toilets' },
  agua:       { es: 'fuente de agua',       en: 'drinking water' },
}

/** «a 120 m» o «a 1,2 km»; en inglés «120 m away», con punto decimal. */
export const distancia = (m: number, locale: 'es' | 'en' = 'es'): string => {
  if (locale === 'en') return m >= 1000 ? `${(m / 1000).toFixed(1)} km away` : `${m} m away`
  return m >= 1000 ? `a ${(m / 1000).toFixed(1).replace('.', ',')} km` : `a ${m} m`
}
