// src/lib/meteo.ts — Datos meteorológicos unificados via Open-Meteo (sin API key)
// Una sola llamada HTTP para: current weather + daily forecast (5 días)
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

export interface MeteoForecast {
  temp_max:    number
  temp_min:    number
  lluvia_mm:   number
  prob_lluvia: number
  nubosidad:   number
  icono:       string
}

const ICONOS: Record<number, string> = {
  0:'☀️', 1:'🌤', 2:'⛅', 3:'☁️',
  45:'🌫', 48:'🌫', 51:'🌦', 53:'🌦', 55:'🌧',
  61:'🌧', 63:'🌧', 65:'🌧', 71:'🌨', 73:'🌨', 75:'❄️',
  80:'🌦', 81:'🌧', 82:'⛈', 95:'⛈', 96:'⛈', 99:'⛈',
}

interface MeteoRaw {
  current: MeteoPlaya
  forecast: MeteoForecast[]
}

/**
 * Obtiene datos meteorológicos completos en UNA sola llamada a Open-Meteo:
 * - current: temperatura, viento, UV, humedad, sensación térmica
 * - daily (5 días): temp max/min, lluvia, nubosidad, icono
 */
const fetchMeteo = cache(async (lat: number, lng: number): Promise<MeteoRaw | null> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`
      + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index`
      + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,cloudcover_mean,weathercode`
      + `&wind_speed_unit=kmh&forecast_days=5&timezone=Europe%2FMadrid`

    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()

    const c = data.current ?? {}
    const d = data.daily ?? {}

    const current: MeteoPlaya = {
      temp_aire:      Math.round(c.temperature_2m ?? 20),
      temp_max:       Math.round(d.temperature_2m_max?.[0] ?? c.temperature_2m ?? 20),
      temp_min:       Math.round(d.temperature_2m_min?.[0] ?? 15),
      sensacion:      Math.round(c.apparent_temperature ?? c.temperature_2m ?? 20),
      viento_kmh:     Math.round(c.wind_speed_10m ?? 0),
      viento_dir:     gradosADireccion(c.wind_direction_10m ?? 0),
      viento_dir_deg: Math.round(c.wind_direction_10m ?? 0),
      viento_racha:   Math.round(c.wind_gusts_10m ?? 0),
      humedad:        Math.round(c.relative_humidity_2m ?? 0),
      uv_max:         c.uv_index != null ? Math.round(c.uv_index) : null,
      timestamp:      new Date().toISOString(),
    }

    const forecast: MeteoForecast[] = (d.time ?? []).slice(0, 5).map((_: string, i: number) => ({
      temp_max:    Math.round(d.temperature_2m_max[i] ?? 20),
      temp_min:    Math.round(d.temperature_2m_min[i] ?? 15),
      lluvia_mm:   parseFloat((d.precipitation_sum[i] ?? 0).toFixed(1)),
      prob_lluvia: Math.round(d.precipitation_probability_max[i] ?? 0),
      nubosidad:   Math.round(d.cloudcover_mean[i] ?? 0),
      icono:       ICONOS[d.weathercode[i]] ?? '🌤',
    }))

    return { current, forecast }
  } catch {
    return null
  }
})

/** Datos meteorológicos actuales (temperatura, viento, UV, humedad, sensación) */
export const getMeteoPlaya = cache(async (lat: number, lng: number): Promise<MeteoPlaya | null> => {
  const data = await fetchMeteo(lat, lng)
  return data?.current ?? null
})

/** Previsión 5 días (temp max/min, lluvia, nubosidad, icono) */
export const getMeteoForecast = cache(async (lat: number, lng: number): Promise<MeteoForecast[]> => {
  const data = await fetchMeteo(lat, lng)
  return data?.forecast ?? []
})
