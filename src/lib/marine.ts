// src/lib/marine.ts
import { cache } from 'react'
import { fetchWithTimeout } from './fetch-timeout'


export interface MarineData {
  temp_agua:   number[]
  oleaje_m:    number[]
  wave_period: number[]
  forecast:    ForecastDay[]
}

export interface ForecastDay {
  fecha:      string
  olas_max:   number
  olas_min:   number
  viento_max: number
  temp_agua:  number
  periodo:    number
  estado:     string
}

export interface SolData {
  amanecer:  string
  atardecer: string
  horas_luz: string
  pct_dia:   number
}

export interface TurbidezData {
  visibilidad_m: number
  turbidez:      number
  clorofila:     number
  nivel:         string
  color:         string
}

function calcEstadoSurf(olas: number, viento: number): string {
  if (olas >= 2.5 || viento >= 50) return 'PELIGRO'
  if (olas >= 1.5) return 'SURF'
  if (viento >= 35) return 'VIENTO'
  if (olas >= 0.8 || viento >= 25) return 'AVISO'
  if (olas >= 0.4 || viento >= 15) return 'BUENA'
  return 'CALMA'
}

export const getMareas = cache(async (lat: number, lng: number): Promise<MarineData | null> => {
  try {
    // Una sola llamada combinando oleaje + SST
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}`
      + `&hourly=wave_height,wave_period,wind_wave_height,sea_surface_temperature`
      + `&daily=wave_height_max,wave_height_min,wind_speed_10m_max`
      + `&wind_speed_unit=kmh&forecast_days=7&timezone=Europe%2FMadrid`

    const res = await fetchWithTimeout(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null

    const marine = await res.json()

    const ahora   = new Date().getHours()
    const oleaje  = marine.hourly?.wave_height ?? []
    const periodo = marine.hourly?.wave_period ?? []
    const temps   = marine.hourly?.sea_surface_temperature ?? []
    const tempAgua = temps[ahora] ?? temps[0] ?? null

    const dias      = marine.daily?.time ?? []
    const olasMax   = marine.daily?.wave_height_max ?? []
    const olasMin   = marine.daily?.wave_height_min ?? []
    const vientoMax = marine.daily?.wind_speed_10m_max ?? []

    const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
    const forecast: ForecastDay[] = dias.slice(0, 5).map((fecha: string, i: number) => {
      const d  = new Date(fecha)
      const om = parseFloat((olasMax[i] ?? 0).toFixed(1))
      const vm = Math.round(vientoMax[i] ?? 0)
      return {
        fecha:      `${DIAS[d.getDay()]} ${d.getDate()}`,
        olas_max:   om,
        olas_min:   parseFloat((olasMin[i] ?? 0).toFixed(1)),
        viento_max: vm,
        temp_agua:  tempAgua ?? 18,
        periodo:    parseFloat((periodo[ahora] ?? 8).toFixed(0)),
        estado:     calcEstadoSurf(om, vm),
      }
    })

    return {
      temp_agua:   tempAgua !== null ? [tempAgua, ...temps.slice(ahora + 1, ahora + 6)] : [],
      oleaje_m:    oleaje.slice(ahora, ahora + 6).map((v: number) => parseFloat(v.toFixed(1))),
      wave_period: periodo.slice(ahora, ahora + 6),
      forecast,
    }
  } catch {
    return null
  }
})

export const getSol = cache(async (lat: number, lng: number): Promise<SolData | null> => {
  try {
    const hoy = new Date().toISOString().split('T')[0]
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${hoy}&formatted=0`
    const res = await fetchWithTimeout(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 'OK') return null

    const fmt = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid'
    })
    const luz = data.results.day_length
    return {
      amanecer:  fmt(data.results.sunrise),
      atardecer: fmt(data.results.sunset),
      horas_luz: `${Math.floor(luz / 3600)}h ${Math.floor((luz % 3600) / 60)}m`,
      pct_dia:   Math.round((luz / 86400) * 100),
    }
  } catch { return null }
})

export const getTurbidez = cache(async (lat: number, lng: number): Promise<TurbidezData | null> => {
  return estimarTurbidez(lat, lng)
})

function estimarTurbidez(lat: number, lng: number): TurbidezData {
  const mes       = new Date().getMonth() + 1
  const esMed     = lng > -2
  const esCanarias = lat < 30

  let visibilidad: number
  let clorofila: number

  if (esCanarias) {
    visibilidad = mes >= 6 && mes <= 9 ? 20 : 25
    clorofila   = 0.08
  } else if (esMed) {
    visibilidad = mes >= 6 && mes <= 9 ? 15 : 8
    clorofila   = mes >= 3 && mes <= 5 ? 0.4 : 0.15
  } else {
    visibilidad = mes >= 7 && mes <= 9 ? 8 : 5
    clorofila   = mes >= 3 && mes <= 6 ? 0.8 : 0.3
  }

  const turbidez = Math.max(0, Math.min(1, 1 - visibilidad / 30))
  const nivel    = visibilidad >= 15 ? 'Excelente' : visibilidad >= 10 ? 'Buena' : visibilidad >= 5 ? 'Regular' : 'Mala'
  const color    = nivel === 'Excelente' ? '#22c55e' : nivel === 'Buena' ? '#3b82f6' : nivel === 'Regular' ? '#f59e0b' : '#ef4444'

  return { visibilidad_m: visibilidad, turbidez, clorofila, nivel, color }
}

