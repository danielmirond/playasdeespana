// src/lib/meteo.ts — Datos meteorológicos unificados via Open-Meteo (sin API key)
import { cache } from 'react'
import { gradosADireccion } from './geo'

export interface MeteoPlaya {
  temp_agua:    number | null
  temp_aire:    number
  temp_max:     number
  temp_min:     number
  sensacion:    number
  viento_kmh:   number
  viento_dir:   string
  viento_dir_deg: number
  viento_racha: number
  humedad:      number
  uv_max:       number | null
  timestamp:    string
}

/**
 * Obtiene datos meteorológicos completos para una playa usando Open-Meteo.
 * Sustituye las antiguas llamadas a AEMET unificando en una sola fuente.
 */
export const getMeteoPlaya = cache(async (lat: number, lng: number): Promise<MeteoPlaya | null> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`
      + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index`
      + `&daily=temperature_2m_max,temperature_2m_min`
      + `&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`

    const urlMarine = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}`
      + `&hourly=sea_surface_temperature`
      + `&forecast_days=1&timezone=Europe%2FMadrid`

    const [resMeteo, resMarine] = await Promise.all([
      fetch(url, { next: { revalidate: 3600 } }),
      fetch(urlMarine, { next: { revalidate: 3600 } }),
    ])

    if (!resMeteo.ok) return null
    const meteo = await resMeteo.json()
    const marine = resMarine.ok ? await resMarine.json() : null

    const ahora = new Date().getHours()
    const temps = marine?.hourly?.sea_surface_temperature ?? []
    const tempAgua = temps[ahora] ?? temps[0] ?? null

    const current = meteo.current ?? {}
    const daily = meteo.daily ?? {}

    return {
      temp_agua:      tempAgua,
      temp_aire:      Math.round(current.temperature_2m ?? 20),
      temp_max:       Math.round(daily.temperature_2m_max?.[0] ?? current.temperature_2m ?? 20),
      temp_min:       Math.round(daily.temperature_2m_min?.[0] ?? 15),
      sensacion:      Math.round(current.apparent_temperature ?? current.temperature_2m ?? 20),
      viento_kmh:     Math.round(current.wind_speed_10m ?? 0),
      viento_dir:     gradosADireccion(current.wind_direction_10m ?? 0),
      viento_dir_deg: Math.round(current.wind_direction_10m ?? 0),
      viento_racha:   Math.round(current.wind_gusts_10m ?? 0),
      humedad:        Math.round(current.relative_humidity_2m ?? 0),
      uv_max:         current.uv_index != null ? Math.round(current.uv_index) : null,
      timestamp:      new Date().toISOString(),
    }
  } catch {
    return null
  }
})
