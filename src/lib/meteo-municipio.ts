// src/lib/meteo-municipio.ts — Predicción meteo ampliada para /municipio/[slug]/el-tiempo.
//
// POR QUÉ UN MÓDULO APARTE, NO AMPLIAR meteo.ts. La Data Cache de Vercel
// clave el resultado por la URL EXACTA. Cambiar la URL del fetch que ya
// usan las fichas de playa (`fetchMeteoUncached` en meteo.ts) invalidaría
// esa capa para todas las playas de golpe; con miles de renders al día, es
// un pico de miss que no compensa. Un fetch propio con una URL propia
// mantiene los dos caminos independientes.
//
// QUÉ APORTA MÁS QUE `getMeteoPlaya`:
//   1. `hourly` para las próximas 24 horas — temperatura, probabilidad y
//      cantidad de lluvia. Sirve para el gráfico horario y para redactar la
//      respuesta directa a «¿va a llover hoy?» sin depender solo de la
//      media diaria.
//   2. `daily` a 7 días (no 5) — cubre el fin de semana siguiente en
//      cualquier día de la semana.
//   3. `wind_speed_10m_max` y `uv_index_max` por día — para pintar las
//      tarjetas del bloque «Próximos 7 días» sin volver a la red.
//
// COSTE. Una llamada adicional por municipio, cacheada 1 h en Data Cache
// (mismo criterio que meteo.ts, 5.400 s de revalidate por si algún render
// llega justo con el TTL caducado).

import { cache } from 'react'
import { fetchWithTimeout } from './fetch-timeout'
import { zonaHorariaParam } from './zona-horaria'

export interface TiempoActual {
  temp:       number
  sensacion:  number
  viento_kmh: number
  humedad:    number
  uv:         number | null
  presion:    number | null
  wmo:        number   // WMO weather code de Open-Meteo
  timestamp:  string
}

export interface HoraTiempo {
  iso:            string   // ISO local del municipio
  hora:           number   // 0-23
  temp:           number
  prob_lluvia:    number   // %
  lluvia_mm:      number
}

export interface DiaTiempo {
  fecha:         string   // YYYY-MM-DD local
  temp_max:      number
  temp_min:      number
  prob_lluvia:   number
  lluvia_mm:     number
  viento_max:    number
  /** De dónde sopla el viento dominante del día, en grados. Con él se le
   *  pone nombre (levante, tramontana…) y se sabe qué playas quedan abrigadas. */
  viento_dir:    number | null
  uv_max:        number | null
  wmo:           number
  amanecer:      string   // ISO
  atardecer:     string   // ISO
}

export interface MeteoMunicipio {
  actual:  TiempoActual
  hoy:     HoraTiempo[]   // 24 muestras (hoy, hora local del municipio)
  dias:    DiaTiempo[]    // hasta 7
}

async function fetchMeteoMunicipioBruto(lat: number, lng: number): Promise<MeteoMunicipio | null> {
  try {
    const tz = zonaHorariaParam(lat, lng)
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`
      + `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,uv_index,pressure_msl,weather_code`
      + `&hourly=temperature_2m,precipitation_probability,precipitation`
      + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weather_code,wind_speed_10m_max,wind_direction_10m_dominant,uv_index_max,sunrise,sunset`
      + `&wind_speed_unit=kmh&forecast_days=7&timezone=${tz}`
    // Igual que en meteo.ts: 5.400 s = TTL Data Cache algo mayor que el
    // revalidate de la página, para no forzar un miss al regenerar.
    const res = await fetchWithTimeout(url, { next: { revalidate: 5400 } })
    if (!res.ok) return null
    const data = await res.json()

    const c = data.current ?? {}
    const actual: TiempoActual = {
      temp:       Math.round(c.temperature_2m ?? 20),
      sensacion:  Math.round(c.apparent_temperature ?? c.temperature_2m ?? 20),
      viento_kmh: Math.round(c.wind_speed_10m ?? 0),
      humedad:    Math.round(c.relative_humidity_2m ?? 0),
      uv:         c.uv_index != null ? Math.round(c.uv_index) : null,
      presion:    c.pressure_msl != null ? Math.round(c.pressure_msl) : null,
      wmo:        Number(c.weather_code ?? 0),
      timestamp:  new Date().toISOString(),
    }

    // hourly: cogemos las 24 primeras muestras (hoy, hora local por
    // configuración de timezone). Open-Meteo devuelve arrays paralelos.
    const h = data.hourly ?? {}
    const iso = (h.time ?? []) as string[]
    const hoyDia = iso[0]?.slice(0, 10)
    const idxHoy = iso
      .map((s, i) => (s.slice(0, 10) === hoyDia ? i : -1))
      .filter(i => i >= 0)
      .slice(0, 24)
    const hoy: HoraTiempo[] = idxHoy.map(i => ({
      iso:         iso[i],
      hora:        Number(iso[i].slice(11, 13)),
      temp:        Math.round(h.temperature_2m?.[i] ?? 0),
      prob_lluvia: Math.round(h.precipitation_probability?.[i] ?? 0),
      lluvia_mm:   parseFloat((h.precipitation?.[i] ?? 0).toFixed(1)),
    }))

    const d = data.daily ?? {}
    const dias: DiaTiempo[] = (d.time ?? []).slice(0, 7).map((_: string, i: number) => ({
      fecha:       d.time[i],
      temp_max:    Math.round(d.temperature_2m_max?.[i] ?? 0),
      temp_min:    Math.round(d.temperature_2m_min?.[i] ?? 0),
      prob_lluvia: Math.round(d.precipitation_probability_max?.[i] ?? 0),
      lluvia_mm:   parseFloat((d.precipitation_sum?.[i] ?? 0).toFixed(1)),
      viento_max:  Math.round(d.wind_speed_10m_max?.[i] ?? 0),
      viento_dir:  d.wind_direction_10m_dominant?.[i] != null ? Math.round(d.wind_direction_10m_dominant[i]) : null,
      uv_max:      d.uv_index_max?.[i] != null ? Math.round(d.uv_index_max[i]) : null,
      wmo:         Number(d.weather_code?.[i] ?? 0),
      amanecer:    d.sunrise?.[i] ?? '',
      atardecer:   d.sunset?.[i] ?? '',
    }))

    return { actual, hoy, dias }
  } catch {
    return null
  }
}

/** Predicción completa para el municipio: current + 24 h + 7 días. */
export const getMeteoMunicipio = cache(async (lat: number, lng: number): Promise<MeteoMunicipio | null> => {
  return fetchMeteoMunicipioBruto(lat, lng)
})
