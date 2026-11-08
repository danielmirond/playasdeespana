// src/lib/perros-provincia.ts
//
// Playas caninas por provincia, y la normativa que las rige.
//
// POR QUÉ. Medido en Search Console a 180 días, «perros» es la segunda
// intención mejor posicionada del universo alojamiento: 571 consultas,
// 4.235 impresiones y posición media 25,7, con 143 consultas ya entre
// el 11 y el 20. Y casi todas son PROVINCIALES —«playas perros
// cantabria» aparece tres veces en el top— mientras lo único publicado
// es /playas-perros, una página nacional.
//
// Más revelador todavía: «normativa perros playas cantabria» con 126
// impresiones. No buscan una playa, buscan si les van a multar. Esa es
// la segunda intención de verdad y no la servía nadie.
import { getPlayasPerros, toSlug } from '@/lib/playas'
import type { Playa } from '@/types'

/** Mínimo para que la página tenga sentido. Con una playa no es una guía. */
export const MIN_PLAYAS = 2

export interface ProvinciaPerros {
  slug: string
  nombre: string
  comunidad: string
  playas: Playa[]
}

let _cache: Map<string, ProvinciaPerros> | null = null

export async function getProvinciasPerros(): Promise<Map<string, ProvinciaPerros>> {
  if (_cache) return _cache
  const playas = await getPlayasPerros()
  const acc = new Map<string, ProvinciaPerros>()
  for (const p of playas) {
    const s = toSlug(p.provincia)
    const ya = acc.get(s)
    if (ya) ya.playas.push(p)
    else acc.set(s, { slug: s, nombre: p.provincia, comunidad: p.comunidad, playas: [p] })
  }
  for (const v of acc.values()) v.playas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  _cache = new Map([...acc].filter(([, v]) => v.playas.length >= MIN_PLAYAS))
  return _cache
}

export async function getProvinciaPerros(slug: string): Promise<ProvinciaPerros | undefined> {
  return (await getProvinciasPerros()).get(slug)
}

/**
 * Lo que de verdad se pregunta: quién manda y qué arriesgas.
 *
 * NO es asesoramiento legal ni una lista de ordenanzas: cada ayuntamiento
 * tiene la suya y cambian cada temporada. Es el marco —quién regula, qué
 * suele exigirse y dónde mirar— dicho sin fingir una precisión que no
 * tenemos. Lo contrario sería el mismo error que ya cometimos diciendo
 * «tiene duchas» a partir de OSM.
 */
export const NORMATIVA = {
  quienRegula:
    'La decisión es del ayuntamiento, no de la comunidad autónoma ni del Estado. ' +
    'Por eso dos playas del mismo tramo de costa pueden tener reglas distintas, ' +
    'y por eso una lista cerrada caducaría en una temporada.',
  loHabitual: [
    'Correa obligatoria fuera de la zona habilitada, y a menudo también dentro.',
    'Recogida de excrementos, con multa específica en casi todas las ordenanzas.',
    'Temporada: muchas playas solo admiten perros de octubre a mayo, y los meses de baño quedan prohibidos.',
    'Horario: donde se permite en verano suele ser a primera hora o después de las ocho.',
    'Razas potencialmente peligrosas: bozal obligatorio según el reglamento del municipio.',
  ],
  dondeMirar:
    'La ordenanza de convivencia o de playas del ayuntamiento, publicada en su sede ' +
    'electrónica, y los carteles del acceso, que mandan sobre cualquier lista de internet.',
} as const
