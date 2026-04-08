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
 * Criterios basados en las directrices generales de Protección Civil:
 * - Verde: olas < 0.5m, viento < 20 km/h
 * - Amarilla: olas 0.5-1.5m o viento 20-40 km/h
 * - Roja: olas > 1.5m o viento > 40 km/h o rachas > 60 km/h
 */
export function calcularBandera(olas: number, viento: number, vientoRacha: number): BanderaPlaya {
  if (olas >= 1.5 || viento >= 40 || vientoRacha >= 60) {
    return {
      color: 'roja',
      label: 'Bandera roja',
      labelEn: 'Red flag',
      motivo: olas >= 1.5
        ? `Oleaje fuerte (${olas}m)`
        : `Viento muy fuerte (${viento} km/h)`,
      motivoEn: olas >= 1.5
        ? `Strong waves (${olas}m)`
        : `Very strong wind (${viento} km/h)`,
      hex: '#ef4444',
    }
  }

  if (olas >= 0.5 || viento >= 20) {
    return {
      color: 'amarilla',
      label: 'Bandera amarilla',
      labelEn: 'Yellow flag',
      motivo: olas >= 0.5
        ? `Oleaje moderado (${olas}m)`
        : `Viento moderado (${viento} km/h)`,
      motivoEn: olas >= 0.5
        ? `Moderate waves (${olas}m)`
        : `Moderate wind (${viento} km/h)`,
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

/**
 * Estima el riesgo de medusas basándose en:
 * - Región (Mediterráneo, Atlántico, Canarias)
 * - Temperatura del agua (más cálida = más medusas)
 * - Mes del año (verano = más riesgo)
 * - Viento onshore (empuja medusas a la costa)
 *
 * Fuentes: Instituto de Ciencias del Mar (ICM-CSIC), datos históricos.
 */
export function estimarMedusas(lat: number, lng: number, tempAgua: number | null, viento: number, vientoDir: string): MedusasRiesgo {
  const mes = new Date().getMonth() + 1 // 1-12
  const esMediterraneo = lng > -2 && lat > 35
  const esCanarias = lat < 30
  const esVerano = mes >= 6 && mes <= 9
  const agua = tempAgua ?? 18

  // Viento onshore (del mar a tierra) aumenta riesgo
  const onshore = ['E', 'ENE', 'ESE', 'SE', 'NE'].includes(vientoDir) && esMediterraneo

  let score = 0

  // Región
  if (esMediterraneo) score += 2  // Mediterráneo: más medusas históricamente
  else if (esCanarias) score += 1  // Canarias: riesgo medio
  // Atlántico norte: score 0

  // Temperatura del agua
  if (agua >= 26) score += 3
  else if (agua >= 23) score += 2
  else if (agua >= 20) score += 1

  // Estación
  if (esVerano) score += 2
  else if (mes >= 5 && mes <= 10) score += 1

  // Viento onshore
  if (onshore && viento >= 15) score += 1

  if (score >= 6) {
    return {
      nivel: 'alto',
      label: 'Riesgo alto de medusas',
      labelEn: 'High jellyfish risk',
      detalle: esMediterraneo
        ? `Agua cálida (${agua}°C) y época de medusas en el Mediterráneo`
        : `Agua muy cálida (${agua}°C) y condiciones favorables`,
      detalleEn: esMediterraneo
        ? `Warm water (${agua}°C) and jellyfish season in the Mediterranean`
        : `Very warm water (${agua}°C) and favourable conditions`,
      hex: '#ef4444',
    }
  }

  if (score >= 3) {
    return {
      nivel: 'medio',
      label: 'Riesgo medio de medusas',
      labelEn: 'Moderate jellyfish risk',
      detalle: 'Posibles avistamientos puntuales',
      detalleEn: 'Occasional sightings possible',
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
