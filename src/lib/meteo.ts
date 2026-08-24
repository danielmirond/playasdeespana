// src/lib/meteo.ts — Datos meteorológicos unificados via Open-Meteo (sin API key)
// Una sola llamada HTTP para: current weather + daily forecast (5 días)
import { cache } from 'react'
import { gradosADireccion } from './geo'
import { fetchWithTimeout } from './fetch-timeout'
import { kvCached } from './kv-cache'
import { cargarConUltimoBuenoONulo } from './ultimo-bueno'
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

// TTL del caché meteo: 90 min. TIENE QUE SER MAYOR QUE EL `revalidate` DE
// LA FICHA, que es una hora, y ese es todo el razonamiento.
//
// Antes eran 30 min, y la consecuencia era que la entrada de KV caducaba
// SIEMPRE antes de que el ISR regenerase la página: el 100 % de las
// revalidaciones arrancaban en frío y tenían que ganar una carrera de 28
// promesas con plazo de 1.500 ms. Cuando la perdían —y a veces la
// pierden— la ficha se servía sin viento, sin agua y sin oleaje, y el ISR
// congelaba ese hueco una hora entera.
//
// Lo importante es que ese TTL corto no compraba frescura ninguna. El HTML
// ya vive hasta una hora por diseño, así que un dato de 30 minutos se
// hornea igual en una página que durará sesenta más. Pagábamos el coste de
// la frescura —el fallo de caché garantizado— sin recibirla.
//
// Con 90 min la revalidación encuentra la entrada que dejó la anterior y
// un `kv.get` responde en milisegundos. El coste real: la antigüedad
// máxima teórica pasa de 1,5 h a 2,5 h. El beneficio: el caso normal deja
// de ser «no hay dato».
//
// Por qué no más: Open-Meteo actualiza `current` cada ~15 min y la
// promesa del sitio es «actualizado cada hora». 90 min es el número más
// pequeño que cumple la restricción estructural con margen para la deriva
// entre el reloj de KV y el disparo del ISR, que nunca coinciden.
const KV_TTL_METEO = 90 * 60

/**
 * Obtiene datos meteorológicos completos en UNA sola llamada a Open-Meteo:
 * - current: temperatura, viento, UV, humedad, sensación térmica
 * - daily (5 días): temp max/min, lluvia, nubosidad, icono
 *
 * Cacheado en KV por (lat, lng) con TTL 30 min. React.cache() arriba
 * deduplica dentro del mismo request; KV deduplica entre requests.
 */
/**
 * TOPE DE EDAD DE LA METEO: 3 horas, no las 6 de las banderas.
 *
 * Una bandera es un acto administrativo y la de hace cinco horas suele seguir
 * siendo la de hoy. El viento no lo es: una térmica de tarde lo cambia entero
 * en tres horas, y este sitio existe para no publicar condiciones que ya no
 * son. Tres horas cubren de sobra lo que este mecanismo debe cubrir —una
 * regeneración en frío que perdió el plazo, o una caída puntual de
 * Open-Meteo, que duran minutos— y se quedan por debajo del cambio de régimen
 * de un día de playa.
 */
export const TOPE_METEO_MS = 3 * 60 * 60 * 1000

/**
 * Devuelve el dato Y SU EDAD, porque la ficha tiene que poder decirla.
 *
 * `porClave: true` no es opcional aquí: sin él, las 5.098 playas compartirían
 * la clave de respaldo `ultimo:meteo` y cada una serviría el tiempo de otra.
 */
const fetchMeteoConEdad = cache((lat: number, lng: number) =>
  cargarConUltimoBuenoONulo<MeteoRaw>(
    'meteo', [lat, lng], KV_TTL_METEO,
    () => fetchMeteoUncached(lat, lng),
    v => v == null,
    { topeMs: TOPE_METEO_MS, porClave: true },
  ))

const fetchMeteo = cache(async (lat: number, lng: number): Promise<MeteoRaw | null> =>
  (await fetchMeteoConEdad(lat, lng)).datos)

/** La edad del dato meteo servido, en ms. 0 = recién traído. */
export const edadMeteo = cache(async (lat: number, lng: number): Promise<number> =>
  (await fetchMeteoConEdad(lat, lng)).edadMs)

async function fetchMeteoUncached(lat: number, lng: number): Promise<MeteoRaw | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`
      + `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index`
      + `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,cloudcover_mean,weathercode`
      + `&wind_speed_unit=kmh&forecast_days=5&timezone=${zonaHorariaParam(lat, lng)}`

    const res = await fetchWithTimeout(url, { next: { revalidate: 3600 } })
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
