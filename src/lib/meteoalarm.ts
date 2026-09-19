// src/lib/meteoalarm.ts — Avisos oficiales de fenómenos meteorológicos.
//
// FUENTE. Meteoalarm.org agrega los avisos de las agencias meteorológicas
// europeas por región NUTS. Es la misma fuente que consume AEMET en su
// portal de avisos, pero con un feed CAP (Common Alerting Protocol) que
// se puede leer sin API key ni token. La URL por país es estable
// (`/api/v1/warnings/feeds-spain`).
//
// LO QUE NO SE HACE. No se consulta AEMET Open Data (requiere API key y
// una petición por área). Meteoalarm ya centraliza; usar dos fuentes
// para el mismo dato duplica esfuerzo y crea inconsistencias.
//
// COBERTURA. El feed indexa por región NUTS 2 (comunidad autónoma). No
// hay resolución por municipio: si Málaga capital tiene aviso amarillo
// por viento, el aviso aplica a toda «Andalucía» (ES61). En la página lo
// mostramos con el nombre de la comunidad para que se entienda que es
// regional.

import { cache } from 'react'
import { fetchWithTimeout } from './fetch-timeout'

export type NivelAviso = 'yellow' | 'orange' | 'red'
export type TipoAviso =
  | 'Wind' | 'snow-ice' | 'Thunderstorm' | 'Fog' | 'high-temperature'
  | 'low-temperature' | 'coastalevent' | 'forestfire' | 'avalanches'
  | 'Rain' | 'flooding' | 'rain-flood' | 'unknown'

export interface AvisoMeteo {
  nivel:      NivelAviso
  tipo:       TipoAviso
  tipoLabel:  string        // legible en español, curado
  desde:      string        // ISO
  hasta:      string        // ISO
  descripcion?: string      // opcional, mensaje corto que la agencia añade
}

// Mapa NUTS 2 (comunidad autónoma) → slug del feed Meteoalarm. Fuente:
// codificación oficial Eurostat NUTS 2021.
const NUTS_COMUNIDAD: Record<string, string> = {
  'Andalucía':          'ES61',
  'Aragón':             'ES24',
  'Asturias':           'ES12',
  'Baleares':           'ES53',
  'Illes Balears':      'ES53',
  'Canarias':           'ES70',
  'Cantabria':          'ES13',
  'Castilla-La Mancha': 'ES42',
  'Castilla y León':    'ES41',
  'Cataluña':           'ES51',
  'Ceuta':              'ES63',
  'C. Valenciana':      'ES52',
  'Comunitat Valenciana': 'ES52',
  'Extremadura':        'ES43',
  'Galicia':            'ES11',
  'La Rioja':           'ES23',
  'Madrid':             'ES30',
  'Melilla':            'ES64',
  'Murcia':             'ES62',
  'Navarra':            'ES22',
  'País Vasco':         'ES21',
}

// Diccionario español curado. Meteoalarm da los tipos en varios idiomas;
// unificamos a nombres cortos que quepan en un chip.
const LABEL_TIPO: Record<string, string> = {
  Wind:               'Viento',
  Thunderstorm:       'Tormenta',
  'high-temperature': 'Calor extremo',
  'low-temperature':  'Frío extremo',
  Fog:                'Niebla',
  'snow-ice':         'Nieve o hielo',
  Rain:               'Lluvia',
  'rain-flood':       'Lluvia con inundaciones',
  flooding:           'Inundaciones',
  coastalevent:       'Fenómenos costeros',
  forestfire:         'Incendios',
  avalanches:         'Aludes',
}
function labelTipo(t: string): string { return LABEL_TIPO[t] ?? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() }

// Parser MUY simple del feed JSON de Meteoalarm. Un aviso allí lleva
// entre otros: `awarenessLevel` («2; yellow Level 2», «3; orange…»),
// `awarenessType`, `onset`, `expires` y `warningText`. Los formatos han
// cambiado alguna vez a lo largo de los años, así que se defiende contra
// campos ausentes: sin nivel no se lista.
function nivelDeCadena(s: string | undefined | null): NivelAviso | null {
  if (!s) return null
  const l = s.toLowerCase()
  if (l.includes('yellow') || l.startsWith('2')) return 'yellow'
  if (l.includes('orange') || l.startsWith('3')) return 'orange'
  if (l.includes('red') || l.startsWith('4')) return 'red'
  return null
}

async function traer(comunidad: string): Promise<AvisoMeteo[]> {
  const codigoNuts = NUTS_COMUNIDAD[comunidad]
  if (!codigoNuts) return []
  // Endpoint público (documentado en https://feeds.meteoalarm.org). Sin
  // API key, gratis, pero con etiqueta de cortesía UA para que puedan
  // avisar si el patrón les molesta.
  const url = `https://hazards.meteoalarm.org/api/v1/warnings/feeds-spain/${codigoNuts}`
  try {
    const res = await fetchWithTimeout(url, {
      headers: {
        'User-Agent': 'playas-espana.com/1.0 avisos (contact: hola@playas-espana.com)',
        'Accept': 'application/json',
      },
      next: { revalidate: 1800 },        // 30 min: sin la agilidad de un radar, pero suficiente para el uso
    })
    if (!res.ok) return []
    const data = await res.json() as any
    const raw: any[] = Array.isArray(data?.warnings) ? data.warnings
      : Array.isArray(data?.features) ? data.features
      : Array.isArray(data) ? data : []
    return raw
      .map(w => {
        // Meteoalarm devuelve o bien flat o dentro de `properties` (GeoJSON).
        const p = w.properties ?? w
        const nivel = nivelDeCadena(p.awarenessLevel ?? p.awareness_level ?? p.level)
        if (!nivel) return null
        const tipoRaw = p.awarenessType ?? p.awareness_type ?? p.event ?? 'unknown'
        const desde = p.onset ?? p.effective ?? p.sent ?? ''
        const hasta = p.expires ?? p.ends ?? ''
        return {
          nivel,
          tipo: tipoRaw as TipoAviso,
          tipoLabel: labelTipo(String(tipoRaw)),
          desde, hasta,
          descripcion: p.warningText ?? p.description ?? p.headline ?? undefined,
        } as AvisoMeteo
      })
      .filter((x): x is AvisoMeteo => !!x)
      // Ordenar de mayor a menor gravedad y por proximidad temporal.
      .sort((a, b) => {
        const orden = { red: 0, orange: 1, yellow: 2 } as const
        if (a.nivel !== b.nivel) return orden[a.nivel] - orden[b.nivel]
        return new Date(a.desde).getTime() - new Date(b.desde).getTime()
      })
      .slice(0, 6)
  } catch {
    return []
  }
}

/** Avisos vigentes de la comunidad autónoma. Se filtran los ya expirados
 *  contra la hora actual del servidor: los que empiezan mañana sí se
 *  listan porque interesan al viajero. */
export const getAvisos = cache(async (comunidad: string): Promise<AvisoMeteo[]> => {
  const todos = await traer(comunidad)
  const ahora = Date.now()
  return todos.filter(a => {
    if (!a.hasta) return true
    return new Date(a.hasta).getTime() >= ahora
  })
})
