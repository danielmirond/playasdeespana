// src/lib/dia-playa.ts — ¿se puede ir a la playa ese día?
//
// POR QUÉ. «El tiempo en X» lo gana el widget de Google y detrás AEMET,
// eltiempo.es y tiempo.com: grados y nubes, nada más. La pregunta que
// nadie contesta y que sí es nuestra es «¿hace día de playa?», y a siete
// días, «¿qué día voy?». Para eso sobran los grados y hacen falta tres
// cosas que ya tenemos: el viento con nombre, el mar y la lluvia.
//
// LA REGLA ES MECÁNICA Y DICE SU MOTIVO. Cada veredicto lleva la razón en
// una línea («levante a 45 km/h», «lluvia probable»), porque un semáforo
// sin motivo no se puede discutir ni comprobar. Los umbrales son los de
// `calcularEstado` en estados.ts, los mismos que pintan la bandera
// estimada de las fichas: así el calendario y la ficha nunca se
// contradicen.
//
// EL OLEAJE VIENE APARTE porque sale de otra llamada (Open-Meteo marino,
// 5 días) y puede faltar: sin él se juzga solo con viento y lluvia, y se
// dice menos, no otra cosa.
import type { DiaTiempo } from './meteo-municipio'
import { nombrarViento } from './vientos'

export type NivelDia = 'bueno' | 'regular' | 'malo'

export interface VeredictoDia {
  fecha: string
  nivel: NivelDia
  /** «Sí», «Regular», «No». Lo que va en grande. */
  titulo: string
  /** El porqué, en una línea. */
  motivo: string
  /** Nombre del viento del día si merece nombre, para reutilizarlo. */
  viento: string | null
  puntos: number
}

const NIVEL_TXT: Record<NivelDia, string> = { bueno: 'Sí', regular: 'Regular', malo: 'No' }

export function veredictoDia(d: DiaTiempo, olasMax: number | null, lat: number, lng: number): VeredictoDia {
  const v = d.viento_dir != null ? nombrarViento(lat, lng, d.viento_dir, d.viento_max) : null
  // «levante» si tiene nombre y fuerza; si no, «viento del oeste».
  const vientoTxt = v ? v.nombre : 'viento'
  const conNombre = v && v.nombre !== v.rumbo ? v.nombre : null

  const malos: string[] = []
  const regulares: string[] = []

  if (d.prob_lluvia >= 60 || d.lluvia_mm >= 3) malos.push(`lluvia probable (${d.prob_lluvia} %)`)
  else if (d.prob_lluvia >= 35 || d.lluvia_mm >= 1) regulares.push(`puede llover (${d.prob_lluvia} %)`)

  if (d.viento_max >= 40) malos.push(`${vientoTxt} a ${d.viento_max} km/h`)
  else if (d.viento_max >= 25) regulares.push(`${vientoTxt} a ${d.viento_max} km/h`)

  if (olasMax != null) {
    if (olasMax >= 1.5) malos.push(`olas de ${olasMax.toFixed(1).replace('.', ',')} m`)
    else if (olasMax >= 0.8) regulares.push(`algo de mar (${olasMax.toFixed(1).replace('.', ',')} m)`)
  }

  if (d.temp_max < 18) malos.push(`solo ${d.temp_max}° de máxima`)
  else if (d.temp_max < 22) regulares.push(`${d.temp_max}° de máxima, fresco para el agua`)

  // Puntuación para elegir el mejor día: parte de la temperatura y resta
  // por cada pega. Sirve para ordenar, no se enseña.
  const puntos = d.temp_max - malos.length * 15 - regulares.length * 6
    - (olasMax ?? 0) * 4 - Math.max(0, d.viento_max - 15) / 2 - d.prob_lluvia / 5

  if (malos.length) return { fecha: d.fecha, nivel: 'malo', titulo: NIVEL_TXT.malo, motivo: malos.join(' · '), viento: conNombre, puntos }
  if (regulares.length) return { fecha: d.fecha, nivel: 'regular', titulo: NIVEL_TXT.regular, motivo: regulares.join(' · '), viento: conNombre, puntos }
  const calma = olasMax != null && olasMax < 0.4 ? 'mar en calma' : 'mar tranquilo'
  return {
    fecha: d.fecha, nivel: 'bueno', titulo: NIVEL_TXT.bueno,
    motivo: `${d.temp_max}°, ${vientoTxt} flojo y ${calma}`,
    viento: conNombre, puntos,
  }
}

/** El mejor día de los que vienen: el de más puntos que no sea «malo». Null si todos lo son. */
export function mejorDia(v: VeredictoDia[]): VeredictoDia | null {
  const candidatos = v.filter(x => x.nivel !== 'malo')
  if (!candidatos.length) return null
  return candidatos.reduce((a, b) => (b.puntos > a.puntos ? b : a))
}
