// src/lib/meteo.ts — Datos meteorológicos unificados via Open-Meteo (sin API key)
// Una sola llamada HTTP para: current weather + daily forecast (5 días)
import { cache } from 'react'
import { gradosADireccion } from './geo'
import { fetchWithTimeout } from './fetch-timeout'
import { zonaHoraria, zonaHorariaParam } from './zona-horaria'

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
  0:'Sol', 1:'Sol', 2:'Nubes', 3:'Nublado',
  45:'Niebla', 48:'Niebla', 51:'Lluvia', 53:'Lluvia', 55:'Lluvia',
  61:'Lluvia', 63:'Lluvia', 65:'Lluvia', 71:'Nieve', 73:'Nieve', 75:'Nieve',
  80:'Lluvia', 81:'Lluvia', 82:'Tormenta', 95:'Tormenta', 96:'Tormenta', 99:'Tormenta',
}

interface MeteoRaw {
  current: MeteoPlaya
  forecast: MeteoForecast[]
}



/**
 * Obtiene datos meteorológicos completos en UNA sola llamada a Open-Meteo:
 * - current: temperatura, viento, UV, humedad, sensación térmica
 * - daily (5 días): temp max/min, lluvia, nubosidad, icono
 *
 * Cacheado en KV por (lat, lng) con TTL 30 min. React.cache() arriba
 * deduplica dentro del mismo request; KV deduplica entre requests.
 */
/**
 * FUERA DE KV. La Data Cache de Vercel ya hace este trabajo, y gratis.
 *
 * Con la base de KV en 5.000 comandos al día —que es donde se queda—, cada
 * render de ficha gastaba 21 operaciones y el sitio solo aguantaba unos 240
 * renders diarios. Había que elegir qué merece de verdad estar en KV.
 *
 * Y para esto no lo merece: la Data Cache de Vercel es regional, la comparten
 * todas las instancias, persiste entre despliegues y NO tiene cuota de
 * operaciones —solo un límite de tamaño con desalojo LRU—. Cachea la
 * respuesta HTTP de cualquier `fetch` GET con `next.revalidate`, que es
 * exactamente lo que hace `fetchMeteoUncached`. Lo único que se recalcula en
 * cada render es la transformación del JSON, que es CPU y no cuesta nada.
 *
 * KV se reserva para lo que la Data Cache NO puede cachear: las peticiones
 * POST (la Junta de Andalucía, las boyas, Google Places) y los snapshots
 * compartidos, donde una clave sirve a comunidades enteras. Ahí el
 * apalancamiento es enorme; aquí era una clave por playa, o sea ninguno.
 *
 * SE PIERDE el último-valor-bueno de la meteo, añadido ayer: su lectura y su
 * escritura eran dos operaciones más por render y no caben en el
 * presupuesto. La Data Cache cubre el caso que motivaba aquello —la
 * regeneración en frío que pierde el plazo— y deja fuera solo la caída de
 * Open-Meteo, que es rara y para la que ya decimos «sin dato». Las ocho
 * fuentes de bandera SÍ conservan su respaldo: son POST y su clave es
 * compartida.
 */
const fetchMeteo = cache((lat: number, lng: number): Promise<MeteoRaw | null> =>
  fetchMeteoUncached(lat, lng))

/** Sin respaldo, el dato o es de ahora o no está. Se conserva la firma. */
export const edadMeteo = cache(async (_lat: number, _lng: number): Promise<number> => 0)

async function fetchMeteoUncached(lat: number, lng: number): Promise<MeteoRaw | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`
      + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index`
      + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,cloudcover_mean,weathercode`
      + `&wind_speed_unit=kmh&forecast_days=5&timezone=${zonaHorariaParam(lat, lng)}`

    // 5.400 s y no 3.600: la Data Cache tiene que sobrevivir al `revalidate`
    // de la ficha, que es una hora, o cada regeneración la encontraría
    // caducada y volvería a salir a la red. Es el mismo razonamiento que
    // llevó el TTL de KV a 90 minutos, aplicado a la capa que ahora manda.
    const res = await fetchWithTimeout(url, { next: { revalidate: 5400 } })
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
      icono:       ICONOS[d.weathercode[i]] ?? 'Sol',
    }))

    return { current, forecast }
  } catch {
    return null
  }
}

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
