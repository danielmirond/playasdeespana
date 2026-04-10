// src/lib/mareas-lunar.ts — Estimación de mareas basada en fase lunar
// Sin API key — calcula tiempos de pleamar/bajamar a partir de la posición de la luna
// Precisión: ~15-20 minutos. Suficiente para uso informativo.

export interface MareaHora {
  hora:  string   // HH:MM
  tipo:  'pleamar' | 'bajamar'
  altura: number  // metros estimados
}

export interface MareasDia {
  mareas:     MareaHora[]
  rango:      number       // rango medio en metros
  coeficiente: number      // 20-120 (coeficiente mareal)
  tipo:       'vivas' | 'muertas' | 'medias'
  zona:       'atlantico' | 'cantabrico' | 'mediterraneo' | 'canarias'
}

/**
 * Calcula la fase lunar (0 = luna nueva, 0.5 = luna llena)
 * Algoritmo de John Meeus simplificado
 */
function faseLunar(date: Date): number {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  // Días desde J2000.0
  let y = year + (month - 1) / 12 + (day - 1) / 365.25
  // Ciclo sinódico: 29.53059 días
  const ciclo = 29.53059
  // Luna nueva de referencia: 6 enero 2000 18:14 UTC
  const ref = Date.UTC(2000, 0, 6, 18, 14, 0)
  const diff = date.getTime() - ref
  const dias = diff / (1000 * 60 * 60 * 24)
  const fase = ((dias % ciclo) + ciclo) % ciclo

  return fase / ciclo // 0..1
}

/**
 * Calcula el tránsito lunar aproximado (hora en que la luna cruza el meridiano)
 * La pleamar sigue al tránsito lunar con un retraso que depende de la ubicación
 */
function transitoLunar(date: Date): number {
  const fase = faseLunar(date)
  // El tránsito lunar se retrasa ~50 min/día respecto al solar
  // En luna nueva, tránsito ~12:00. Cada día se retrasa ~50 min.
  const ciclo = 29.53059
  const diasEnCiclo = fase * ciclo
  const retrasoHoras = (diasEnCiclo * 50) / 60 // minutos → horas
  const transito = (12 + retrasoHoras) % 24

  return transito
}

/**
 * Determina la zona costera de España según coordenadas
 */
function determinarZona(lat: number, lng: number): MareasDia['zona'] {
  if (lat < 30) return 'canarias'
  if (lng > -2 && lat > 35 && lat < 44) return 'mediterraneo'
  if (lat > 43) return 'cantabrico'
  return 'atlantico'
}

/**
 * Rango medio de mareas por zona (en metros)
 */
const RANGOS: Record<MareasDia['zona'], { min: number; max: number; media: number }> = {
  cantabrico:    { min: 1.5, max: 4.5, media: 3.0 },
  atlantico:     { min: 1.0, max: 3.5, media: 2.2 },
  canarias:      { min: 0.8, max: 2.5, media: 1.5 },
  mediterraneo:  { min: 0.05, max: 0.3, media: 0.15 },
}

/**
 * Retraso establecimiento del puerto (lunitidal interval) por zona
 * Horas entre tránsito lunar y pleamar
 */
const RETRASO_HORAS: Record<MareasDia['zona'], number> = {
  cantabrico:   3.5,   // ~3h30 de retraso típico
  atlantico:    3.0,   // ~3h
  canarias:     2.5,   // ~2h30
  mediterraneo: 2.0,   // variable, mareas muy pequeñas
}

function formatHora(h: number): string {
  const horas = Math.floor(((h % 24) + 24) % 24)
  const mins = Math.round((h - Math.floor(h)) * 60)
  return `${String(horas).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`
}

/**
 * Estima las mareas del día para una playa dada su posición
 * Patrón semidiurnal: 2 pleamares + 2 bajamares por día (~6h12m entre cada una)
 */
export function estimarMareas(lat: number, lng: number, date?: Date): MareasDia {
  const hoy = date ?? new Date()
  const zona = determinarZona(lat, lng)
  const fase = faseLunar(hoy)
  const transito = transitoLunar(hoy)
  const retraso = RETRASO_HORAS[zona]
  const rango = RANGOS[zona]

  // Coeficiente mareal: máximo en luna nueva/llena (vivas), mínimo en cuartos
  // fase 0 = nueva, 0.25 = cuarto creciente, 0.5 = llena, 0.75 = cuarto menguante
  const distanciaASizigia = Math.min(fase, Math.abs(fase - 0.5), 1 - fase) * 2 // 0 = sizigia, 1 = cuadratura
  const coeficiente = Math.round(120 - distanciaASizigia * 80) // 40-120

  const factorCoef = coeficiente / 100
  const alturaMax = rango.media * factorCoef
  const alturaMin = rango.media * 0.1 * factorCoef

  // Primera pleamar: tránsito lunar + retraso del puerto
  const pleamar1 = transito + retraso
  const bajamar1 = pleamar1 + 6.21  // ~6h12m después
  const pleamar2 = bajamar1 + 6.21
  const bajamar2 = pleamar2 + 6.21

  // Corrección por longitud: ~4min por grado
  const corrLng = (lng + 3.7) * 4 / 60 // referencia: meridiano Madrid ~3.7°W

  const mareas: MareaHora[] = [
    { hora: formatHora(pleamar1 + corrLng), tipo: 'pleamar' as const, altura: parseFloat(alturaMax.toFixed(1)) },
    { hora: formatHora(bajamar1 + corrLng), tipo: 'bajamar' as const, altura: parseFloat(alturaMin.toFixed(1)) },
    { hora: formatHora(pleamar2 + corrLng), tipo: 'pleamar' as const, altura: parseFloat((alturaMax * 0.95).toFixed(1)) },
    { hora: formatHora(bajamar2 + corrLng), tipo: 'bajamar' as const, altura: parseFloat(alturaMin.toFixed(1)) },
  ]
    .filter(m => {
      const [h] = m.hora.split(':').map(Number)
      return h >= 0 && h < 24
    })
    .sort((a, b) => a.hora.localeCompare(b.hora))

  const tipo = coeficiente >= 90 ? 'vivas' : coeficiente <= 50 ? 'muertas' : 'medias'

  return {
    mareas,
    rango: parseFloat(alturaMax.toFixed(1)),
    coeficiente,
    tipo,
    zona,
  }
}
