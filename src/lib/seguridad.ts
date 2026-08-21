// src/lib/seguridad.ts — Estimación de bandera de baño y riesgo de medusas
// Calculado a partir de datos meteorológicos reales (no hay API centralizada en España)

export type BanderaColor = 'verde' | 'amarilla' | 'roja'

export interface BanderaPlaya {
  color:    BanderaColor
  label:    string
  labelEn:  string
  motivo:   string
  motivoEn: string
  hex:      string
}

export interface MedusasRiesgo {
  nivel:    'bajo' | 'medio' | 'alto'
  label:    string
  labelEn:  string
  detalle:  string
  detalleEn: string
  hex:      string
  /** true si viene de avistamiento oficial (socorrismo), no de estimación */
  oficial?: boolean
  /** origen del dato — decide el disclaimer de la ficha */
  fuente?: 'socorrismo' | 'banistas'
}

/**
 * Estima el estado del mar a partir de oleaje, viento y rachas.
 *
 * LAS ETIQUETAS DESCRIBEN EL MAR, NO CONCEDEN PERMISO (ago-2026). Antes la
 * verde devolvía «Bandera verde · Mar en calma, apto para el baño». Las dos
 * mitades eran falsas: nadie había izado nada —lo calculaba este modelo— y
 * «apto para el baño» es una autorización que no nos corresponde dar.
 *
 * Costó caro. El 15 de agosto de 2026 el Ayuntamiento de Málaga prohibió el
 * baño en seis playas por E. coli tras unos aliviaderos. La Misericordia,
 * Sacaba y San Andrés aparecían en la ficha como «BUENA», porque el agua
 * contaminada estaba en calma: este modelo ve oleaje y viento, y no puede
 * ver bacterias, vertidos, medusas ni un cierre municipal.
 *
 * De ahí la regla: esta función habla del mar («Mar en calma») y solo una
 * fuente oficial dice «bandera». Las que sí izan mástil —Cataluña,
 * Canarias, Andalucía, AEMET— construyen sus propias etiquetas diciendo
 * «Bandera X», y esas sí se lo han ganado.
 *
 * Umbrales recalibrados (jul-2026) tras validar contra datos en vivo: los
 * antiguos (amarilla con olas ≥0.5 o viento ≥20) marcaban amarilla el ~45%
 * de las playas en una tarde normal — la brisa térmica de 20-25 km/h y el
 * mar de 0.5-0.7 m SON un día de playa corriente, no precaución. La roja se
 * mantiene intacta: en el lado del peligro no se relaja.
 * - Verde: olas < 0.8 m y viento < 30 km/h (y sin combinación al límite)
 * - Amarilla: olas ≥0.8 m · viento ≥30 · rachas ≥50 · o mar montándose
 *   (olas ≥0.6 Y viento ≥25 a la vez)
 * - Roja: olas ≥1.5 m · viento ≥40 km/h · rachas ≥60 km/h
 */
export function calcularBandera(olas: number, viento: number, vientoRacha: number): BanderaPlaya {
  if (olas >= 1.5 || viento >= 40 || vientoRacha >= 60) {
    return {
      color: 'roja',
      label: 'Mar peligroso',
      labelEn: 'Dangerous sea',
      motivo: olas >= 1.5
        ? `Oleaje fuerte (${olas}m)`
        : viento >= 40
          ? `Viento muy fuerte (${viento} km/h)`
          : `Rachas muy fuertes (${vientoRacha} km/h)`,
      motivoEn: olas >= 1.5
        ? `Strong waves (${olas}m)`
        : viento >= 40
          ? `Very strong wind (${viento} km/h)`
          : `Very strong gusts (${vientoRacha} km/h)`,
      hex: '#ef4444',
    }
  }

  if (olas >= 0.8 || viento >= 30 || vientoRacha >= 50 || (olas >= 0.6 && viento >= 25)) {
    const porOlas = olas >= 0.8 || (olas >= 0.6 && viento >= 25)
    return {
      color: 'amarilla',
      label: 'Mar con precaución',
      labelEn: 'Sea: use caution',
      motivo: porOlas
        ? `Oleaje moderado (${olas}m)`
        : viento >= 30
          ? `Viento moderado (${viento} km/h)`
          : `Rachas fuertes (${vientoRacha} km/h)`,
      motivoEn: porOlas
        ? `Moderate waves (${olas}m)`
        : viento >= 30
          ? `Moderate wind (${viento} km/h)`
          : `Strong gusts (${vientoRacha} km/h)`,
      hex: '#f59e0b',
    }
  }

  return {
    color: 'verde',
    label: 'Mar en calma',
    labelEn: 'Calm sea',
    motivo: 'Estimación propia a partir de oleaje y viento, no hay parte oficial',
    motivoEn: 'Our own estimate from waves and wind; no official report',
    hex: '#22c55e',
  }
}

// Dirección del viento (texto → grados meteorológicos, "de dónde sopla").
const DIR_GRADOS: Record<string, number> = {
  N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
  S: 180, SSW: 202.5, SO: 202.5, SW: 225, WSW: 247.5, OSO: 247.5, W: 270, O: 270,
  WNW: 292.5, ONO: 292.5, NW: 315, NO: 315, NNW: 337.5, NNO: 337.5,
}

// Rumbo aproximado HACIA MAR ABIERTO según la zona costera (grados).
// El viento "onshore" (empuja medusas a la orilla) es el que VIENE de esa
// dirección. Sin orientación playa-a-playa en los datos, se aproxima por región;
// suficiente para un índice bajo/medio/alto. Refinable luego con geometría OSM.
export function rumboAlMar(lat: number, lng: number): number {
  if (lat < 29.5) return 200                      // Canarias: playas turísticas miran S-SO
  if (lat >= 43.0) return 0                        // Cantábrico: mira N
  if (lng <= -8.0 && lat >= 41.6) return 270       // Galicia atlántica: mira O
  if (lng <= -5.9 && lat < 37.4) return 215        // Atlántico SO (Cádiz/Huelva): mira SO
  if (lat < 37.4) return 180                        // Alborán / Costa del Sol / Granada: mira S
  if (lng > 1.0 && lat >= 38.5 && lat <= 40.2) return 150  // Baleares: mira S-SE
  return 115                                        // Levante + Cataluña: mira E-SE
}

const difAngular = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}


/**
 * Cuánto de ese oleaje llega de verdad a esta orilla.
 *
 * EL PROBLEMA QUE RESUELVE. `calcularBandera` convertía `olas >= 1,5 m` en
 * bandera roja, y ese valor es un punto de rejilla del modelo, mar adentro.
 * No sabe hacia dónde mira la playa. Con mar de fondo del sur, una playa
 * cantábrica —que mira al norte— tiene toda la península por delante y el
 * temporal no le llega; el punto de rejilla, que está en el Cantábrico
 * abierto, sí lo ve. Son 3.212 fichas sin fuente oficial cuya única bandera
 * sale de esa cifra.
 *
 * LO QUE ESTO CAPTA Y LO QUE NO, y la diferencia importa. `rumboAlMar` es
 * REGIONAL, no playa a playa: sabe que el Cantábrico mira al norte y que
 * Levante mira al este, y nada más. Así que esto corrige el abrigo
 * GEOGRÁFICO —el oleaje que viene desde tierra— que es geometría y no
 * modelo. NO capta el abrigo local: una cala detrás de un cabo sigue
 * recibiendo la misma estimación que la playa abierta de al lado. Para eso
 * haría falta la orientación real de cada arenal, que no está en los datos.
 *
 * POR QUÉ SOLO PUEDE BAJAR UN ESCALÓN. Reducir la altura efectiva significa
 * menos banderas rojas, y equivocarse en esa dirección es el error
 * peligroso. Por eso el suelo es 0,6: una mar de 3 m sigue dando roja
 * (1,8), y una de 1,5 —justo en el umbral— baja a 0,9, que es amarilla, no
 * verde. Nunca convierte un peligro en un «adelante».
 */
export interface Exposicion {
  /** Multiplicador sobre la altura del modelo. Entre 0,6 y 1. */
  factor: number
  /** El mar de fondo viene desde tierra: la playa está a resguardo. */
  abrigada: boolean
}

export function exposicionOleaje(lat: number, lng: number, dirOlaDeg: number | null | undefined): Exposicion {
  if (dirOlaDeg == null || !Number.isFinite(dirOlaDeg)) return { factor: 1, abrigada: false }

  // SOLO EN LA PENÍNSULA, y esto lo encontré probando y no razonando.
  //
  // Las Canteras mira al NORTE. Con 1,32 m de mar del 13° le entra de
  // frente — y la primera versión de esta función la marcaba «abrigada» y
  // le recortaba a 0,79 m, que es exactamente el error peligroso que el
  // suelo de 0,6 pretendía evitar. La causa: `rumboAlMar` devuelve 200°
  // para TODA Canarias («las turísticas miran al S-SO»), que sirve para un
  // índice grueso de medusas y no para decidir una bandera playa a playa.
  //
  // El fondo del asunto es que en un archipiélago «la ola viene del lado
  // contrario» NO significa que haya tierra bloqueándola: la isla es
  // pequeña y hay océano abierto alrededor. En la península sí: un mar de
  // fondo del sur no llega a la costa cantábrica porque tiene delante
  // seiscientos kilómetros de meseta, y eso es cierto mire hacia donde
  // mire cada arenal.
  //
  // Así que la corrección se aplica donde hay un continente detrás, y en
  // las islas se deja el valor del modelo tal cual.
  const esIsla = lat < 29.5 || (lng > 1.0 && lat >= 38.5 && lat <= 40.2)
  if (esIsla) return { factor: 1, abrigada: false }
  // `rumboAlMar` da hacia dónde está el mar abierto; `dirOlaDeg` da de dónde
  // VIENE la ola. Coinciden cuando la ola entra de frente.
  const d = difAngular(rumboAlMar(lat, lng), dirOlaDeg)
  if (d <= 60)  return { factor: 1,    abrigada: false }   // de frente
  if (d <= 120) return { factor: 0.8,  abrigada: false }   // oblicua
  return { factor: 0.6, abrigada: true }                    // viene de tierra
}

/**
 * Estima el riesgo de medusas basándose en:
 * - Región (Mediterráneo —incl. Mar de Alborán/Costa del Sol—, Atlántico, Canarias)
 * - Temperatura del agua real (más cálida = más medusas)
 * - Mes del año (verano = más riesgo)
 * - Viento onshore real: ángulo entre el viento y el rumbo al mar de la costa
 *
 * Fuentes: Instituto de Ciencias del Mar (ICM-CSIC), datos históricos + meteo Open-Meteo.
 */
export function estimarMedusas(lat: number, lng: number, tempAgua: number | null, viento: number, vientoDir: string): MedusasRiesgo {
  const mes = new Date().getMonth() + 1 // 1-12
  const esCanarias = lat < 29.5
  // Mediterráneo: Alborán/Costa del Sol (sur, lng>-5.9) + Levante/Cataluña (lng>-1)
  // + Baleares. Antes lng>-2 dejaba fuera Málaga/Granada/Almería costa.
  const esMediterraneo = !esCanarias && (
    (lat < 37.4 && lng > -5.9) ||  // Alborán → Costa del Sol, Granada, Almería
    (lng > -1.0) ||                 // Levante, Cataluña
    (lng > 1.0 && lat > 38.5)       // Baleares
  )
  // Atlántico sur (Cádiz/Huelva): riesgo extra por carabela portuguesa en primavera.
  const esAtlanticoSur = !esMediterraneo && !esCanarias && lat < 37.4 && lng < -5.9
  const esVerano = mes >= 6 && mes <= 9
  const agua = tempAgua ?? 18

  // Factor viento onshore: 0 (offshore) → 1 (viento fuerte justo del mar).
  const sea = rumboAlMar(lat, lng)
  const dirDeg = DIR_GRADOS[(vientoDir || '').toUpperCase()] ?? null
  const compDir = dirDeg == null ? 0.3 : Math.max(0, Math.cos(difAngular(dirDeg, sea) * Math.PI / 180))
  const compVel = Math.min(1, viento / 25)
  const onshoreFactor = compDir * compVel  // 0..1
  const onshore = onshoreFactor >= 0.4

  // Modelo recalibrado (jun-2026) tras validar contra avistamientos
  // observados (meduseo.com). Aprendizajes: (1) el modelo anterior casi
  // nunca daba BAJO en temporada porque estación+región ya sumaban mucho;
  // (2) el viento del día NO crea medusas, solo mueve un bloom existente,
  // que depende sobre todo de la TEMPERATURA del agua. Por eso ahora la SST
  // es el driver dominante (gate), y estación/región/viento solo modulan.
  let score = 0

  // 1) Temperatura del agua = driver principal (los blooms necesitan calor).
  if (agua >= 25) score += 4
  else if (agua >= 23) score += 3
  else if (agua >= 21) score += 2
  else if (agua >= 19) score += 1
  else if (agua < 17) score -= 1
  // Agua fría (<19°C) deja techo bajo aunque sea verano: sin calor no hay bloom.
  const aguaTemplada = agua >= 20

  // 2) Región (modificador menor).
  if (esMediterraneo) score += 1
  else if (esCanarias || esAtlanticoSur) score += 0
  // Atlántico norte: 0.

  // 3) Estación (solo el pico fuerte suma; evita inflar todo el verano).
  if (esVerano && aguaTemplada) score += 1

  // 4) Viento onshore: solo cuenta si hay agua templada (algo que empujar).
  if (aguaTemplada) score += Math.round(2 * onshoreFactor)

  // Umbrales recalibrados: ALTO≥6, MEDIO≥4 (antes 6/3). BAJO ahora alcanzable
  // con agua templada pero sin viento onshore, y casi garantizado con agua fría.
  if (score >= 6) {
    return {
      nivel: 'alto',
      label: 'Riesgo alto de medusas',
      labelEn: 'High jellyfish risk',
      detalle: onshore
        ? `Agua a ${agua}°C y viento del mar empujando hacia la orilla`
        : (esMediterraneo
            ? `Agua cálida (${agua}°C) y época de medusas en el Mediterráneo`
            : `Agua muy cálida (${agua}°C) y condiciones favorables`),
      detalleEn: onshore
        ? `Water at ${agua}°C and onshore wind pushing toward the beach`
        : (esMediterraneo
            ? `Warm water (${agua}°C) and jellyfish season in the Mediterranean`
            : `Very warm water (${agua}°C) and favourable conditions`),
      hex: '#ef4444',
    }
  }

  if (score >= 4) {
    return {
      nivel: 'medio',
      label: 'Riesgo medio de medusas',
      labelEn: 'Moderate jellyfish risk',
      detalle: esAtlanticoSur
        ? 'Posibles carabelas portuguesas con viento del oeste'
        : 'Posibles avistamientos puntuales',
      detalleEn: esAtlanticoSur
        ? 'Portuguese man-of-war possible with westerly winds'
        : 'Occasional sightings possible',
      hex: '#f59e0b',
    }
  }

  return {
    nivel: 'bajo',
    label: 'Riesgo bajo de medusas',
    labelEn: 'Low jellyfish risk',
    detalle: 'No se esperan medusas',
    detalleEn: 'No jellyfish expected',
    hex: '#22c55e',
  }
}
