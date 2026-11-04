// src/lib/camper-cercana.ts
//
// La ciudad donde alquilar la autocaravana para ir a un municipio.
//
// POR QUÉ. El alquiler va por trece ciudades y las 155 páginas de
// /municipio/[slug]/autocaravana solo enlazaban a una cuando el nombre
// coincidía: medido en producción, Dénia llegaba a Alicante y Níjar o
// Cádiz caían al hub nacional. Y es el lector con más intención
// comercial de todo el sitio: quien lee «áreas de pernocta en Níjar»
// está planeando un viaje y va a alquilar el vehículo en alguna parte.
//
// Nadie alquila en su pueblo: se alquila en la ciudad con depósito y se
// conduce. Así que la pregunta correcta no es «¿hay ciudad con este
// nombre?» sino «¿cuál es la más cercana, y está lo bastante cerca?».
import { CITY_COORDS, getCamperCities } from '@/lib/autocaravana-localities'
import { haversine } from '@/lib/geo'

/**
 * Tope de 300 km en línea recta.
 *
 * Sin tope, Almería acabaría recomendando Bilbao por ser lo único que
 * queda: un enlace que el lector descarta en medio segundo y que nos
 * cuesta su confianza en el resto de la página. Mejor no enlazar.
 */
export const MAX_KM = 300

export interface CamperCercana {
  slug: string
  /** Cómo nombrarla en el texto. Tres de las trece son regiones. */
  nombre: string
  km: number
  /** true si la ciudad ES el municipio o su provincia: no hay que viajar. */
  mismaZona: boolean
}

export function camperCercana(
  lat: number,
  lng: number,
  municipio?: string,
  provincia?: string,
): CamperCercana | null {
  const norm = (x: string) => (x ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const aqui = [municipio, provincia].filter(Boolean).map(x => norm(x as string))

  let mejor: CamperCercana | null = null
  for (const c of getCamperCities()) {
    const co = CITY_COORDS[c.slug]
    if (!co) continue
    const km = Math.round(haversine(lat, lng, co.lat, co.lng) / 1000)
    const mismaZona = aqui.includes(norm(c.ciudad)) || aqui.includes(norm(c.provincia))
    if (!mejor || km < mejor.km) mejor = { slug: c.slug, nombre: c.ciudad, km, mismaZona }
  }
  if (!mejor || mejor.km > MAX_KM) return null
  return mejor
}

/**
 * El texto del enlace. Tres de las trece entradas son regiones
 * —Asturias, Galicia, Cantabria—, así que «en Galicia, a 40 km» tiene
 * que leerse igual de bien que «en Málaga, a 180 km». Por eso la
 * preposición es siempre «en» y la distancia va aparte.
 */
export function anclaCamper(c: CamperCercana, municipio: string): string {
  if (c.mismaZona) return `Alquilar autocaravana en ${c.nombre}`
  return `Alquilar autocaravana en ${c.nombre}, a ${c.km} km de ${municipio}`
}
