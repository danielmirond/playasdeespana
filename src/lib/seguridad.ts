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
}

/**
 * Estima el color de la bandera de baño a partir de oleaje, viento y rachas.
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
      label: 'Bandera roja',
      labelEn: 'Red flag',
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
      label: 'Bandera amarilla',
      labelEn: 'Yellow flag',
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
    label: 'Bandera verde',
    labelEn: 'Green flag',
    motivo: 'Mar en calma, apto para el baño',
    motivoEn: 'Calm sea, safe for swimming',
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
function rumboAlMar(lat: number, lng: number): number {
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
