// src/lib/tiempo-copy.ts — Reglas mecánicas para copy y iconos de meteo.
//
// PARA QUÉ. Traduce los códigos WMO de Open-Meteo a categorías internas
// («sol», «lluvia», «tormenta»…) y a una descripción legible corta.
// Redacta la respuesta directa a la pregunta «¿va a llover hoy?» según
// los datos horarios y diarios, sin generar prosa.

import type { HoraTiempo, DiaTiempo } from './meteo-municipio'

export type TipoIcono =
  | 'sol'
  | 'sol-nubes'
  | 'nublado'
  | 'niebla'
  | 'lluvia'
  | 'chubasco'
  | 'tormenta'
  | 'nieve'

/** WMO codes de Open-Meteo → categoría interna. Tabla estándar. */
export function iconoDeWmo(code: number): TipoIcono {
  if (code === 0 || code === 1) return 'sol'
  if (code === 2) return 'sol-nubes'
  if (code === 3) return 'nublado'
  if (code === 45 || code === 48) return 'niebla'
  if (code >= 51 && code <= 57) return 'chubasco'
  if (code >= 61 && code <= 67) return 'lluvia'
  if (code >= 71 && code <= 77) return 'nieve'
  if (code >= 80 && code <= 82) return 'chubasco'
  if (code === 85 || code === 86) return 'nieve'
  if (code >= 95 && code <= 99) return 'tormenta'
  return 'sol'
}

/** Descripción corta legible del estado meteorológico. Cae a «Despejado» si
 *  el código es 0-1 (sol pleno vs. muy pocas nubes) — Open-Meteo distingue
 *  pero para el usuario general no aporta. */
export function textoDeWmo(code: number): string {
  const tipo = iconoDeWmo(code)
  const mapa: Record<TipoIcono, string> = {
    'sol':        'Despejado',
    'sol-nubes':  'Nubes y claros',
    'nublado':    'Nublado',
    'niebla':     'Niebla',
    'chubasco':   'Chubascos',
    'lluvia':     'Lluvia',
    'tormenta':   'Tormenta',
    'nieve':      'Nieve',
  }
  return mapa[tipo]
}

/** Etiqueta UV cualitativa siguiendo la escala AEMET/WHO. */
export function etiquetaUv(uv: number | null): string {
  if (uv == null) return ''
  if (uv < 3) return 'bajo'
  if (uv < 6) return 'moderado'
  if (uv < 8) return 'alto'
  if (uv < 11) return 'muy alto'
  return 'extremo'
}

/** Etiqueta viento según la escala Beaufort simplificada. */
export function etiquetaViento(kmh: number): string {
  if (kmh < 6) return 'calma'
  if (kmh < 20) return 'flojo'
  if (kmh < 39) return 'moderado'
  if (kmh < 62) return 'fuerte'
  return 'muy fuerte'
}

/**
 * Genera la respuesta directa a «¿va a llover hoy en X?». Regla mecánica:
 *
 *   1. Máxima probabilidad horaria en las horas restantes del día:
 *        · < 20 % → «No lloverá hoy».
 *        · 20-40 % → «Es poco probable que llueva».
 *        · > 40 % → «Sí, puede llover» + primera hora con >40 %.
 *   2. Además, se busca en los 7 días la próxima jornada con > 40 % para
 *      añadir «Próxima lluvia probable el <día>».
 *
 * Sin adjetivos, sin adornos: la información y ya.
 */
export function respuestaLluvia(hoy: HoraTiempo[], dias: DiaTiempo[], municipio: string): string {
  // «Horas restantes del día» = a partir de la hora actual local. En SSR
  // la hora local del servidor no es la del municipio; nos apoyamos en las
  // horas del propio array (Open-Meteo devuelve las 24 en zona local del
  // municipio) tomando el ISO de la muestra más cercana al momento actual.
  const ahoraMs = Date.now()
  const desdeIdx = Math.max(
    0,
    hoy.findIndex(h => new Date(h.iso).getTime() >= ahoraMs),
  )
  const restantes = hoy.slice(desdeIdx)
  const maxProb = restantes.reduce((m, h) => Math.max(m, h.prob_lluvia), 0)
  const primeraHora = restantes.find(h => h.prob_lluvia >= 40)

  // Próxima jornada con lluvia probable, mirando a partir de mañana.
  const proxDia = dias.slice(1).find(d => d.prob_lluvia >= 40)
  const nombreDia = proxDia ? diaLegible(proxDia.fecha) : null

  const en = municipio
  let hoyTxt: string
  if (maxProb < 20) {
    hoyTxt = `No lloverá hoy en ${en}.`
  } else if (maxProb < 40) {
    hoyTxt = `Es poco probable que llueva hoy en ${en} (máximo ${maxProb} % en las próximas horas).`
  } else {
    hoyTxt = `Sí, puede llover hoy en ${en}${primeraHora ? ` a partir de las ${String(primeraHora.hora).padStart(2, '0')}:00` : ''} (probabilidad máxima del ${maxProb} %).`
  }

  const proxTxt = proxDia && (maxProb < 40 || diferenciaEnDias(proxDia.fecha) >= 1)
    ? ` La próxima jornada con lluvia probable es el ${nombreDia} (${proxDia.prob_lluvia} %, ~${proxDia.lluvia_mm} mm).`
    : ''

  return hoyTxt + proxTxt
}

/** «hoy», «mañana», «pasado mañana» o el día en formato legible. */
export function diaLegible(fechaISO: string): string {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const diff = diferenciaEnDias(fechaISO)
  if (diff === 0) return 'hoy'
  if (diff === 1) return 'mañana'
  if (diff === 2) return 'pasado mañana'
  const d = new Date(fechaISO + 'T12:00:00')
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`
}

/** Días de diferencia entre una fecha YYYY-MM-DD y hoy (a las 12:00 para
 *  evitar cambios de día por husos horarios). Negativo si es pasado. */
export function diferenciaEnDias(fechaISO: string): number {
  const hoy = new Date()
  hoy.setHours(12, 0, 0, 0)
  const d = new Date(fechaISO + 'T12:00:00')
  return Math.round((d.getTime() - hoy.getTime()) / 86400000)
}

/** Formato «HH:MM» de un ISO local. Devuelve «—» si no es válido. */
export function soloHora(iso: string): string {
  if (!iso || iso.length < 16) return '—'
  return iso.slice(11, 16)
}

/** Duración legible entre dos ISO: «12 h 22 min». */
export function duracionHM(desde: string, hasta: string): string {
  if (!desde || !hasta) return '—'
  const ms = new Date(hasta).getTime() - new Date(desde).getTime()
  if (isNaN(ms) || ms <= 0) return '—'
  const totalMin = Math.round(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${h} h ${String(m).padStart(2, '0')} min`
}

/** «Sáb», «Dom», «Lun»… en tres letras. */
export function diaCorto(fechaISO: string): string {
  const d = new Date(fechaISO + 'T12:00:00')
  return ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'][d.getDay()]
}

/** Número del día del mes. */
export function diaMes(fechaISO: string): number {
  return new Date(fechaISO + 'T12:00:00').getDate()
}
