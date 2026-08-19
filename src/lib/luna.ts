// src/lib/luna.ts — Fase e iluminación de la Luna, calculadas, no estimadas.
//
// Astronomía pura: no hay fuente que consultar ni nada que pueda estar
// desactualizado. Se usa el algoritmo de Meeus (Astronomical Algorithms,
// cap. 48) con los términos principales de la elongación, que da la
// iluminación con error < 0,5 % y la fase al día. La aproximación anterior
// —ciclo sinódico medio desde una luna nueva de referencia— acumulaba hasta
// un día de desfase en las fechas de luna llena, que es justo lo que la
// gente mira.
//
// Por qué está en la página de mareas y no es un adorno: la Luna es la
// CAUSA de lo que esa página enseña. Luna llena y luna nueva → mareas vivas
// (las más altas y las más bajas); cuartos → mareas muertas. Contarlo al
// lado de la tabla es explicar el dato, no decorarlo.
//
// Certeza: MEDIDO, en el sentido del sistema — no es un modelo con
// incertidumbre, es efeméride. Trazo continuo grueso.

export interface EstadoLuna {
  /** 0 = nueva, 0.25 = creciente, 0.5 = llena, 0.75 = menguante */
  fase: number
  /** 0–100 */
  iluminacion: number
  nombre: 'nueva' | 'creciente' | 'cuarto creciente' | 'gibosa creciente' | 'llena' | 'gibosa menguante' | 'cuarto menguante' | 'menguante'
  nombreEn: string
  /** Qué significa para la marea */
  mareas: 'vivas' | 'muertas' | 'medias'
  /** Días hasta la próxima luna llena o nueva, y cuál */
  proxima: { tipo: 'llena' | 'nueva'; dias: number }
}

const rad = (d: number) => d * Math.PI / 180
const norm360 = (d: number) => ((d % 360) + 360) % 360

/** Elongación Luna–Sol en grados para un instante, Meeus cap. 47/48 (términos principales). */
function elongacion(date: Date): number {
  const JD = date.getTime() / 86400000 + 2440587.5
  const T = (JD - 2451545.0) / 36525
  const D  = norm360(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T)   // elongación media
  const M  = norm360(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T)    // anomalía media del Sol
  const Mp = norm360(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T)   // anomalía media de la Luna
  // Ángulo de fase i (Meeus 48.4) → la elongación verdadera sale de él
  const i = 180 - D
    - 6.289 * Math.sin(rad(Mp))
    + 2.100 * Math.sin(rad(M))
    - 1.274 * Math.sin(rad(2 * D - Mp))
    - 0.658 * Math.sin(rad(2 * D))
    - 0.214 * Math.sin(rad(2 * Mp))
    - 0.110 * Math.sin(rad(D))
  return norm360(180 - i)   // 0 = nueva, 180 = llena
}

export function estadoLuna(date: Date = new Date()): EstadoLuna {
  const e = elongacion(date)
  const fase = e / 360
  const iluminacion = Math.round((1 - Math.cos(rad(e))) / 2 * 1000) / 10

  const nombre: EstadoLuna['nombre'] =
    e < 11 || e >= 349 ? 'nueva'
    : e < 79  ? 'creciente'
    : e < 101 ? 'cuarto creciente'
    : e < 169 ? 'gibosa creciente'
    : e < 191 ? 'llena'
    : e < 259 ? 'gibosa menguante'
    : e < 281 ? 'cuarto menguante'
    : 'menguante'
  const EN: Record<EstadoLuna['nombre'], string> = {
    'nueva': 'new moon', 'creciente': 'waxing crescent', 'cuarto creciente': 'first quarter',
    'gibosa creciente': 'waxing gibbous', 'llena': 'full moon', 'gibosa menguante': 'waning gibbous',
    'cuarto menguante': 'last quarter', 'menguante': 'waning crescent',
  }
  // Vivas alrededor de sicigia (nueva/llena), muertas alrededor de cuadratura.
  // Las vivas llegan ~1-2 días después de la sicigia ("edad de la marea"),
  // pero para un semáforo de tres valores el ángulo basta.
  const distSicigia = Math.min(e, Math.abs(e - 180), 360 - e)        // 0..90
  const mareas: EstadoLuna['mareas'] = distSicigia < 30 ? 'vivas' : distSicigia > 60 ? 'muertas' : 'medias'

  // Próxima sicigia: avanzar hasta cruzar 0° o 180°. La Luna recorre
  // ~12,19°/día de elongación.
  const aLlena = norm360(180 - e), aNueva = norm360(360 - e)
  const velocidad = 360 / 29.530589
  const proxima = aLlena < aNueva
    ? { tipo: 'llena' as const, dias: Math.round(aLlena / velocidad) }
    : { tipo: 'nueva' as const, dias: Math.round(aNueva / velocidad) }

  return { fase, iluminacion, nombre, nombreEn: EN[nombre], mareas, proxima }
}
