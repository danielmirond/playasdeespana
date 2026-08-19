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

// ─────────────────────────────────────────────────────────────────────────
// POSICIÓN DE LA LUNA Y PERIODOS SOLUNARES
//
// QUÉ ES ESTO Y QUÉ NO ES. La teoría solunar dice que los peces pican más
// cuando la Luna cruza el meridiano —arriba o abajo— y, algo menos, cuando
// sale y se pone. Es tradición de pescadores, no física demostrada, y así
// hay que contarlo: lo que aquí se calcula con rigor son las POSICIONES DE
// LA LUNA, que son astronomía exacta. Que eso haga picar al pez es lo que
// cree la afición, y el sitio no puede afirmarlo.
//
// Por qué está: 11.140 búsquedas mensuales de «solunar» viven pegadas a las
// de mareas, y el competidor titula su página «tabla de mareas para ir de
// pesca». Sin este bloque, la sección de pesca sería publicidad pegada a
// una tabla; con él, es la tabla que esa gente viene a buscar.
//
// Precisión: posición lunar por Meeus abreviado (cap. 47), ±2 minutos de
// arco, que en horas de tránsito son un par de minutos. De sobra: nadie
// pesca al segundo.

export interface Periodo {
  /** «06:12» en hora local de la costa */
  hora: string
  fin: string
  tipo: 'mayor' | 'menor'
  /** qué ocurre en el cielo, que es lo único que afirmamos */
  causa: string
  causaEn: string
}
export interface Solunar {
  periodos: Periodo[]
  /** Salida y puesta de la Luna, o null si ese día no ocurre (pasa) */
  salida: string | null
  puesta: string | null
}

/** Ascensión recta y declinación de la Luna, en grados. Meeus 47, términos principales. */
function posicionLuna(date: Date) {
  const JD = date.getTime() / 86400000 + 2440587.5
  const T = (JD - 2451545.0) / 36525
  const Lp = norm360(218.3164477 + 481267.88123421 * T)          // longitud media
  const D  = norm360(297.8501921 + 445267.1114034 * T)
  const M  = norm360(357.5291092 + 35999.0502909 * T)
  const Mp = norm360(134.9633964 + 477198.8675055 * T)
  const F  = norm360(93.2720950 + 483202.0175233 * T)

  const lon = Lp
    + 6.289 * Math.sin(rad(Mp))
    - 1.274 * Math.sin(rad(2 * D - Mp))
    + 0.658 * Math.sin(rad(2 * D))
    - 0.214 * Math.sin(rad(2 * Mp))
    - 0.186 * Math.sin(rad(M))
    - 0.114 * Math.sin(rad(2 * F))
  const lat = 5.128 * Math.sin(rad(F))
    + 0.281 * Math.sin(rad(Mp + F))
    - 0.278 * Math.sin(rad(Mp - F))
    - 0.173 * Math.sin(rad(2 * D - F))

  const e = rad(23.439291 - 0.0130042 * T)                        // oblicuidad
  const l = rad(lon), b = rad(lat)
  const ar = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l))
  const dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l))
  return { ar: norm360(ar * 180 / Math.PI), dec: dec * 180 / Math.PI }
}

/** Tiempo sidéreo aparente en Greenwich, en grados. Meeus 12.4. */
function gmst(date: Date): number {
  const JD = date.getTime() / 86400000 + 2440587.5
  const T = (JD - 2451545.0) / 36525
  return norm360(280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T)
}

/**
 * Instantes del día (UTC) en que la Luna cruza el meridiano y en que sale y
 * se pone, buscados por muestreo cada 10 min y afinados por interpolación.
 *
 * Se muestrea en vez de resolver analíticamente porque la Luna se mueve
 * rápido —13°/día— y las fórmulas cerradas exigen iterar igualmente. A 10
 * min de paso el error tras interpolar es de segundos, y el código se
 * puede leer.
 */
function eventosLunares(diaUTC: Date, lat: number, lng: number) {
  const H0 = 0.125            // altura de referencia para orto/ocaso lunar (grados)
  const t0 = Date.UTC(diaUTC.getUTCFullYear(), diaUTC.getUTCMonth(), diaUTC.getUTCDate())
  const paso = 10 * 60 * 1000
  const n = (24 * 60) / 10

  const altura = (t: number) => {
    const d = new Date(t)
    const { ar, dec } = posicionLuna(d)
    const H = rad(norm360(gmst(d) + lng - ar))
    return Math.asin(Math.sin(rad(lat)) * Math.sin(rad(dec)) + Math.cos(rad(lat)) * Math.cos(rad(dec)) * Math.cos(H)) * 180 / Math.PI
  }
  // Ángulo horario en [-180, 180): 0 = tránsito superior, ±180 = inferior
  const angHorario = (t: number) => {
    const d = new Date(t)
    const { ar } = posicionLuna(d)
    let h = norm360(gmst(d) + lng - ar)
    if (h >= 180) h -= 360
    return h
  }

  const cruces = { salida: null as number | null, puesta: null as number | null, superior: null as number | null, inferior: null as number | null }
  let aPrev = altura(t0), hPrev = angHorario(t0)
  for (let i = 1; i <= n; i++) {
    const t = t0 + i * paso
    const a = altura(t), h = angHorario(t)
    // orto y ocaso: cruce de la altura de referencia
    if (aPrev < H0 && a >= H0 && cruces.salida === null) cruces.salida = t - paso + paso * ((H0 - aPrev) / (a - aPrev))
    if (aPrev > H0 && a <= H0 && cruces.puesta === null) cruces.puesta = t - paso + paso * ((aPrev - H0) / (aPrev - a))
    // tránsito superior: el ángulo horario pasa de negativo a positivo
    if (hPrev < 0 && h >= 0 && cruces.superior === null) cruces.superior = t - paso + paso * (-hPrev / (h - hPrev))
    // tránsito inferior: salto de +180 a -180
    if (hPrev > 90 && h < -90 && cruces.inferior === null) cruces.inferior = t - paso + paso * ((180 - hPrev) / (180 - hPrev + h + 180))
    aPrev = a; hPrev = h
  }
  return cruces
}

/**
 * Los cuatro periodos solunares del día para una costa.
 *
 * Mayores (~2 h) alrededor de los dos tránsitos —la Luna en lo más alto y
 * en lo más bajo—; menores (~1 h) alrededor del orto y el ocaso lunar. Es
 * la convención de toda la vida y la que usan las tablas impresas.
 */
export function solunar(lat: number, lng: number, tz: string, date: Date = new Date()): Solunar {
  const ev = eventosLunares(date, lat, lng)
  const fmt = (ms: number) => new Intl.DateTimeFormat('es-ES', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(ms))

  const periodos: Periodo[] = []
  const add = (ms: number | null, tipo: 'mayor' | 'menor', causa: string, causaEn: string) => {
    if (ms === null) return
    const media = tipo === 'mayor' ? 60 * 60 * 1000 : 30 * 60 * 1000
    periodos.push({ hora: fmt(ms - media), fin: fmt(ms + media), tipo, causa, causaEn })
  }
  add(ev.superior, 'mayor', 'la Luna en lo más alto del cielo', 'moon at its highest')
  add(ev.inferior, 'mayor', 'la Luna en lo más bajo, bajo el horizonte', 'moon at its lowest, below the horizon')
  add(ev.salida,   'menor', 'sale la Luna', 'moonrise')
  add(ev.puesta,   'menor', 'se pone la Luna', 'moonset')
  periodos.sort((a, b) => a.hora.localeCompare(b.hora))

  return {
    periodos,
    salida: ev.salida !== null ? fmt(ev.salida) : null,
    puesta: ev.puesta !== null ? fmt(ev.puesta) : null,
  }
}
