// src/lib/reporteSistema.ts
//
// Reporte automático "del sistema" — se calcula server-side cada
// render a partir de los datos meteo/bandera/calidad y se renderiza
// junto a los reportes humanos. Resuelve el "cold start": la sección
// "Cómo está hoy" NUNCA está vacía aunque ningún usuario haya votado.
//
// Es sintético, no se guarda en KV (sería ruido). Cada render lo
// recalcula desde los datos frescos. Visualmente lleva un badge
// "Sistema" para distinguirlo de reportes humanos.

import type { BanderaPlaya } from './seguridad'

export interface ReporteSistema {
  /** ISO timestamp del momento en que se genera (= ahora). */
  ts:        string
  /** Texto principal corto (≤80 chars) que titula el reporte. */
  titulo:    string
  /** Línea secundaria con detalle numérico. */
  detalle:   string
  /** Severidad para el color del card. */
  severidad: 'ok' | 'warn' | 'danger'
}

interface Input {
  oleaje?:    number | null          // metros
  viento?:    number | null          // km/h
  vientoRacha?: number | null         // km/h
  agua?:      number | null          // ºC
  bandera?:   BanderaPlaya | null
  medusasRiesgo?: 'bajo' | 'medio' | 'alto' | null
  /**
   * De dónde sale la bandera. Decide si su motivo encabeza el detalle:
   * el de una bandera izada explica el aviso, el de una estimada solo
   * repite lo que ya está en la lista de umbrales.
   */
  cert?: 'medido' | 'oficial' | 'reportado' | 'estimado' | 'sindato'
}

/**
 * Genera el reporte sistema. Devuelve null si NO hay datos suficientes
 * (en cuyo caso la card no se renderiza — preferimos vacío a fabricar
 * información sin fundamento).
 */
export function generarReporteSistema(input: Input): ReporteSistema | null {
  const { oleaje, viento, vientoRacha, agua, bandera, medusasRiesgo, cert } = input
  // Sin oleaje + viento + agua no es un reporte: bail.
  if (oleaje == null && viento == null && agua == null) return null

  const partes: string[] = []
  let severidad: ReporteSistema['severidad'] = 'ok'

  // Bandera (la cosa más importante visible).
  // Copy revisada en PR #85: títulos accionables en vez de jerga
  // institucional. La gente decide '¿me meto o no?' — no clasifica.
  let titulo = ''
  if (bandera?.color === 'roja') {
    titulo = 'No te metas hoy'
    severidad = 'danger'
  } else if (bandera?.color === 'amarilla') {
    titulo = 'Precaución hoy'
    severidad = 'warn'
  } else if (bandera?.color === 'verde') {
    titulo = 'Baño OK · agua tranquila'
  } else {
    titulo = 'Calma en la costa'
  }

  // Oleaje.
  if (typeof oleaje === 'number') {
    const olM = oleaje.toFixed(1)
    if (oleaje >= 2)        { partes.push(`oleaje fuerte ${olM} m`); if (severidad === 'ok') severidad = 'warn' }
    else if (oleaje >= 1)   { partes.push(`oleaje moderado ${olM} m`) }
    else                    { partes.push(`oleaje calmo ${olM} m`) }
  }

  // Viento.
  if (typeof viento === 'number') {
    const v = Math.round(viento)
    if (v >= 30)            { partes.push(`viento ${v} km/h`); if (severidad === 'ok') severidad = 'warn' }
    else if (v >= 20)       { partes.push(`brisa moderada ${v} km/h`) }
    else                    { partes.push(`apenas viento ${v} km/h`) }
  }

  // Rachas (solo si claramente racheado vs viento sostenido).
  if (typeof vientoRacha === 'number' && typeof viento === 'number' && vientoRacha > viento * 1.6) {
    partes.push(`con rachas hasta ${Math.round(vientoRacha)} km/h`)
    if (severidad === 'ok') severidad = 'warn'
  }

  // Agua.
  if (typeof agua === 'number') {
    const ag = agua.toFixed(0)
    partes.push(`agua ${ag} °C`)
  }

  // Medusas (si el riesgo lo eleva).
  if (medusasRiesgo === 'alto') {
    partes.push('riesgo de medusas')
    if (severidad === 'ok') severidad = 'warn'
  }

  if (partes.length === 0) return null

  // EL DETALLE TIENE QUE EXPLICAR EL TÍTULO, y no lo hacía.
  //
  // El título sale de la bandera y el detalle de los umbrales meteo, que
  // no saben POR QUÉ está izada. Con una roja por contaminación —el caso
  // de Málaga en agosto de 2026— la tarjeta decía «No te metas hoy ·
  // oleaje calmo 0,2 m · apenas viento 8 km/h · agua 27 °C». El aviso y su
  // explicación se contradecían, y el detalle ganaba porque era concreto.
  //
  // Cuando la bandera la ha izado alguien, su motivo va DELANTE: ahí está
  // la razón de verdad, y en fuentes como Canarias llega a decir
  // «corrientes» o «desprendimientos», que ninguna estimación vería.
  //
  // Con bandera estimada no se antepone: su motivo es «Oleaje fuerte
  // (1.8m)», que ya está en la lista y solo duplicaría.
  const izada = cert === 'oficial' || cert === 'reportado'
  const detalle = izada && bandera?.motivo
    ? [bandera.motivo, ...partes].join(' · ')
    : partes.join(' · ')

  return {
    ts:        new Date().toISOString(),
    titulo,
    detalle,
    severidad,
  }
}

/** Tiempo relativo en castellano: "hace 12 min", "hace 1 h". */
export function tiempoRelativo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  if (Number.isNaN(ms)) return ''
  const min = Math.round(ms / 60_000)
  if (min < 60) return `hace ${Math.max(min, 1)} min`
  const h = Math.round(min / 60)
  if (h < 24) return `hace ${h} h`
  const d = Math.round(h / 24)
  return `hace ${d} d`
}
