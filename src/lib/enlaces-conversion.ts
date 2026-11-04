// src/lib/enlaces-conversion.ts
//
// El enlace de conversión hereda la geografía de la página desde la que sale.
//
// EL PROBLEMA QUE RESUELVE, medido en producción antes de escribirlo:
// hay 221 landings provinciales de conversión en el sitemap y ninguna
// recibe un solo enlace interno. Son huérfanas: Google solo llega por
// sitemap. Mientras tanto las 4.329 fichas, los 584 municipios y las 28
// provincias enlazaban TODAS al mismo hub nacional, con el mismo texto:
// «Campings cerca de la playa» aparecía 4.329 veces apuntando a
// /campings, de modo que ninguna página podía posicionar para «campings
// Cádiz» porque ningún enlace lo decía nunca.
//
// La regla: si existe la landing de esa provincia, se enlaza a ella con
// un ancla que nombra la provincia; si no existe, al hub nacional, que
// es exactamente lo que había. Nunca se inventa una URL: cada vertical
// pregunta a su propia fuente de verdad, la misma que alimenta su
// generateStaticParams, así que un enlace roto aquí sería un fallo de
// build, no un 404 en vivo.
import chiringuitosData from '@/data/chiringuitos.json'
import yogaData from '@/data/yoga-estudios.json'
import { getProvinciasCosteras } from '@/lib/provinciaTopicHelpers'
import { getBoatLinkForPlaya } from '@/lib/boat-rental-helpers'
import { getCamperCities } from '@/lib/autocaravana-localities'
import { toSlug } from '@/lib/playas'

export interface EnlaceConversion {
  href:  string
  label: string
  /** true si apunta a la landing de la provincia; false si cae al hub. */
  local: boolean
}

/** Verticales que tienen /{topic}/[provincia] para TODA provincia costera. */
const POR_PROVINCIA_COSTERA = [
  { base: '/campings',     hub: 'Campings cerca de la playa', local: (p: string) => `Campings en ${p}` },
  { base: '/hoteles-playa', hub: 'Hoteles en la playa',       local: (p: string) => `Hoteles de playa en ${p}` },
  { base: '/buceo',        hub: 'Buceo en España',            local: (p: string) => `Buceo en ${p}` },
  { base: '/clases-surf',  hub: 'Clases de surf',             local: (p: string) => `Clases de surf en ${p}` },
] as const

/**
 * Enlaces de servicio para una página geográfica.
 *
 * `provincia` y `municipio` son los NOMBRES, no los slugs: cada vertical
 * tiene su propia forma de convertirlos y ninguna coincide con las demás
 * (chiringuitos indexa por 'bizkaia', barcos mapea Las Palmas a Tenerife,
 * autocaravana va por ciudad y no por provincia).
 */
export async function enlacesConversion(
  provincia: string | undefined,
  municipio?: string,
): Promise<EnlaceConversion[]> {
  const out: EnlaceConversion[] = []
  const slug = provincia ? toSlug(provincia) : ''
  const costeras = await getProvinciasCosteras()
  const esCostera = !!slug && costeras.some(p => p.slug === slug)

  for (const v of POR_PROVINCIA_COSTERA) {
    out.push(esCostera && provincia
      ? { href: `${v.base}/${slug}`, label: v.local(provincia), local: true }
      : { href: v.base, label: v.hub, local: false })
  }

  // Chiringuitos: solo 24 provincias tienen sidecar con locales reales.
  // Enlazar a una provincia sin datos sería mandar a una página vacía.
  const chiringuitos = chiringuitosData as Record<string, unknown>
  out.push(slug && chiringuitos[slug] && provincia
    ? { href: `/chiringuitos/${slug}`, label: `Chiringuitos en ${provincia}`, local: true }
    : { href: '/chiringuitos', label: 'Chiringuitos de playa', local: false })

  // Yoga y pilates: mismo patrón que chiringuitos —sidecar por provincia
  // con locales reales—, así que mismo criterio. 24 provincias con datos.
  const yoga = yogaData as Record<string, unknown>
  out.push(slug && yoga[slug] && provincia
    ? { href: `/yoga-playa/${slug}`, label: `Yoga y pilates en ${provincia}`, local: true }
    : { href: '/yoga-playa', label: 'Yoga y pilates en la playa', local: false })

  // Barcos: la URL canónica es la jerárquica /costas/…/provincias/…, y
  // /alquiler-barco/[provincia] redirige a ella con un 308. Se enlaza la
  // canónica directamente: un salto de redirección en 4.329 páginas es
  // rastreo tirado. getBoatLinkForPlaya ya devuelve la localidad cuando
  // la hay, que es mejor que la provincia.
  const barco = getBoatLinkForPlaya(provincia, municipio)
  out.push(barco
    ? { href: barco.href, label: `Alquiler de barco en ${barco.label}`, local: true }
    : { href: '/alquiler-barco', label: 'Alquiler de barcos', local: false })

  // Autocaravana: su eje es la CIUDAD, no la provincia, y solo hay trece.
  // Se enlaza localizado únicamente cuando el municipio o la provincia
  // coinciden con una de ellas; si no, el hub. Forzar la provincia aquí
  // daría 404 —/alquiler-autocaravana/cadiz no existe—.
  const ciudades = getCamperCities()
  const cand = [municipio, provincia].filter(Boolean).map(x => toSlug(x as string))
  const ciudad = ciudades.find(c => cand.includes(c.slug))
  out.push(ciudad
    ? { href: `/alquiler-autocaravana/${ciudad.slug}`, label: `Alquiler de autocaravana en ${ciudad.ciudad}`, local: true }
    : { href: '/alquiler-autocaravana', label: 'Alquiler de autocaravanas', local: false })

  return out
}
