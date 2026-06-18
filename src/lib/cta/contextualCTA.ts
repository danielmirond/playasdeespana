// src/lib/cta/contextualCTA.ts
// C1 (auditoría CRO) — selector PURO que elige el CTA comercial más a tiro
// según el tipo de playa y el estado del mar de HOY. Sin fetch nuevo: usa
// datos ya presentes en la ficha. Testeable de forma aislada.
//
// C2 (deep-link): el href lleva ?near=<slug> + UTM para que el hub de destino
// pueda personalizar (y para atribución en GA4 / Partner Analytics).
import type { Playa } from '@/types'

export type ContextualCTA = {
  intent: 'barco' | 'camper' | 'actividad'
  tone: 'mar' | 'accent'
  href: string
  title: string
  sub: string
}

const utm = (slug: string) =>
  `utm_source=ficha&utm_medium=contextual_cta&utm_content=${encodeURIComponent(slug)}`

export function pickContextualCTA(
  playa: Playa,
  meteo: { estado?: string; olas?: number },
  locale: 'es' | 'en' = 'es',
): ContextualCTA {
  const es = locale === 'es'
  const nombre = playa.nombre
  const calmo = ['CALMA', 'BUENA'].includes(String(meteo?.estado ?? ''))
  const esCala = /\bcala\b/i.test(nombre) || String((playa as { tipo?: string }).tipo ?? '').toLowerCase().includes('cala')
  const esIsla = ['Islas Baleares', 'Canarias'].includes(playa.comunidad)
  const esSurf = !!(playa as { actividades?: { surf?: boolean } }).actividades?.surf
  const oleaje = Number(meteo?.olas ?? 0)

  // 1. Cala + mar en calma → barco (máxima intención de fondeo)
  if (esCala && calmo) return {
    intent: 'barco', tone: 'mar',
    href: `/alquiler-barco?near=${playa.slug}&${utm(playa.slug)}`,
    title: es ? `Hoy es día de cala: barcos cerca de ${nombre}` : `A cove day: boats near ${nombre}`,
    sub: es ? 'Mar en calma para fondear y descubrir las calas vecinas' : 'Calm sea to anchor and reach nearby coves',
  }
  // 2. Islas → autocaravana (recorrer playa a playa)
  if (esIsla) return {
    intent: 'camper', tone: 'accent',
    href: `/alquiler-autocaravana?near=${playa.slug}&${utm(playa.slug)}`,
    title: es ? `Recorre ${playa.comunidad} en autocaravana` : `Explore ${playa.comunidad} by campervan`,
    sub: es ? 'De playa en playa, a tu ritmo' : 'Beach to beach, at your own pace',
  }
  // 3. Surf con oleaje → actividad (clases/alquiler)
  if (esSurf && oleaje > 0.8) return {
    intent: 'actividad', tone: 'accent',
    href: `/surf?${utm(playa.slug)}`,
    title: es ? 'Hoy entra mar: clases y alquiler de surf' : 'Swell today: surf lessons & rental',
    sub: es ? `Escuelas y spots cerca de ${nombre}` : `Schools and spots near ${nombre}`,
  }
  // 4. Default → actividades de la zona (salta al widget GYG de la ficha)
  return {
    intent: 'actividad', tone: 'accent',
    href: '#actividades',
    title: es ? `Cosas que hacer cerca de ${nombre}` : `Things to do near ${nombre}`,
    sub: es ? 'Tours, excursiones y actividades de la zona' : 'Tours and activities in the area',
  }
}
