// src/lib/meteo.ts — Datos meteorológicos unificados via Open-Meteo (sin API key)
// Proporciona: temperatura aire, sensación térmica, viento, humedad, UV
// La temperatura del agua viene de getMareas() en marine.ts (misma API, sin duplicar)
import { cache } from 'react'
import { gradosADireccion } from './geo'

export interface MeteoPlaya {
  temp_aire:      number
  temp_max:       number
  temp_min:       number
  sensacion:      number
  viento_kmh:     number
  viento_dir:     string
  viento_dir_deg: number
  viento_racha:   number
  humedad:        number
  uv_max:         number | null
  timestamp:      string
}

/**
 * Obtiene datos meteorológicos atmosféricos para una playa usando Open-Meteo.
 * Una sola llamada HTTP — el viento, UV, humedad y sensación térmica vienen de aquí.
 * La temperatura del agua y oleaje vienen de getMareas() (marine.ts).
 */
export const getMeteoPlaya = cache(async (lat: number, lng: number): Promise<MeteoPlaya | null> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`
      + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index`
      + `&daily=temperature_2m_max,temperature_2m_min`
      + `&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()

    const current = data.current ?? {}
    const daily = data.daily ?? {}

    return {
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
