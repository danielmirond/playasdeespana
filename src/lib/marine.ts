// src/lib/marine.ts
import { cache } from 'react'
import { fetchWithTimeout } from './fetch-timeout'
import { zonaHoraria, zonaHorariaParam } from './zona-horaria'


export interface MarineData {
  temp_agua:   number[]
  oleaje_m:    number[]
  wave_period: number[]
  /**
   * DE DÓNDE VIENE el mar de fondo, en grados meteorológicos.
   *
   * No se pedía, y por eso la bandera estimada trataba igual a una playa
   * que recibe el temporal de frente y a otra a la que ese mismo temporal
   * le llega desde tierra. Va en la MISMA llamada: una variable más en el
   * `hourly`, coste cero.
   */
  wave_dir:    number[]
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

// TTL meteo marino: 90 min, por la misma razón que el de meteo — tiene que
// sobrevivir al `revalidate` de una hora de la ficha o cada regeneración
// arranca en frío. Ver el comentario largo en `meteo.ts`.
//
// PERO AQUÍ HAY UN TECHO QUE ALLÍ NO EXISTE, y por eso no sube más.
// `fetchMareasUncached` guarda en KV el payload YA REBANADO por la hora en
// que se hizo el fetch (`oleaje.slice(ahora, ahora + 6)`). O sea que una
// entrada envejecida no solo trae datos viejos: trae el oleaje de hace
// horas ETIQUETADO COMO EL DE AHORA, y ningún indicador de edad puede
// rescatar eso porque el desfase está dentro del array.
//
// Con 90 min el desfase máximo es de un paso de una serie cuya resolución
// real es horaria, que es del mismo orden que el propio ISR y por tanto
// tolerable. Subir de ahí exige antes cachear la respuesta CRUDA —la API
// devuelve siete días de horas— y hacer el `slice` en la lectura y no en
// la escritura. Con eso esto podría irse a 6 h con total honestidad y
// reduciría las llamadas marinas unas cuatro veces. Está pendiente.
const KV_TTL_MAREAS = 90 * 60

/**
 * Fuera de KV, por la misma razón que la meteo — ver el comentario largo en
 * `meteo.ts`. La Data Cache de Vercel cachea la respuesta GET sin cuota de
 * operaciones, y una clave por playa en KV no tenía ningún apalancamiento.
 */
export const getMareas = cache((lat: number, lng: number): Promise<MarineData | null> =>
  fetchMareasUncached(lat, lng))

/** Sin respaldo: o el dato es de ahora o no está. Se conserva la firma. */
export const edadMar = cache(async (_lat: number, _lng: number): Promise<number> => 0)

async function fetchMareasUncached(lat: number, lng: number): Promise<MarineData | null> {
  try {
    // Una sola llamada combinando oleaje + SST.
    // OJO (jul-2026): Open-Meteo ELIMINÓ `wave_height_min` del daily y la
    // API pasó a responder 400 a todo el sitio (sin bandera, sin
    // temperatura del agua, sin forecast). El mínimo diario se calcula
    // ahora desde el hourly (abajo). No añadir variables daily sin
    // probarlas: un solo nombre inválido tumba la petición entera.
    const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}`
      + `&hourly=wave_height,wave_direction,wave_period,wind_wave_height,sea_surface_temperature`
      + `&daily=wave_height_max,wind_speed_10m_max`
      + `&wind_speed_unit=kmh&forecast_days=7&timezone=${zonaHorariaParam(lat, lng)}`

    // 5.400 s: la Data Cache debe sobrevivir al `revalidate` de una hora de
    // la ficha. Ver `meteo.ts`.
    const res = await fetchWithTimeout(url, { next: { revalidate: 5400 } })
    if (!res.ok) return null

    const marine = await res.json()

    const ahora   = new Date().getHours()
    const oleaje  = marine.hourly?.wave_height ?? []
    const dirOla  = marine.hourly?.wave_direction ?? []
    const periodo = marine.hourly?.wave_period ?? []
    const temps   = marine.hourly?.sea_surface_temperature ?? []
    const tempAgua = temps[ahora] ?? temps[0] ?? null

    const dias      = marine.daily?.time ?? []
    const olasMax   = marine.daily?.wave_height_max ?? []
    const vientoMax = marine.daily?.wind_speed_10m_max ?? []

    // Mínimo diario desde el hourly (wave_height_min ya no existe en la
    // API): 24 valores por día, timezone Madrid ya aplicado en la query.
    const minDia = (i: number): number => {
      const tramo = oleaje.slice(i * 24, (i + 1) * 24).filter((v: number) => v != null)
      return tramo.length ? Math.min(...tramo) : 0
    }

    const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
    const forecast: ForecastDay[] = dias.slice(0, 5).map((fecha: string, i: number) => {
      const d  = new Date(fecha)
      const om = parseFloat((olasMax[i] ?? 0).toFixed(1))
      const vm = Math.round(vientoMax[i] ?? 0)
      return {
        fecha:      `${DIAS[d.getDay()]} ${d.getDate()}`,
        olas_max:   om,
        olas_min:   parseFloat(minDia(i).toFixed(1)),
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
      wave_dir:    dirOla.slice(ahora, ahora + 6),
      forecast,
    }
  } catch {
    return null
  }
}

// TTL sol: 12h. Amanecer/atardecer dependen del día → la clave de KV
// incluye la fecha YYYY-MM-DD para invalidar automáticamente al cambiar
// de día.
/**
 * Sol, también fuera de KV: es un GET con `revalidate` de 24 h, así que la
 * Data Cache lo cubre sin gastar cuota.
 *
 * Y de paso se arregla algo que la clave de KV tenía mal por diseño: llevaba
 * la fecha, o sea que caducaba a medianoche para las 5.098 playas A LA VEZ y
 * el primer render de cada playa cada día era un fallo garantizado. La Data
 * Cache tiene el mismo problema, pero ahora no cuesta operaciones: cuesta una
 * llamada a una API gratuita.
 */
export const getSol = cache((lat: number, lng: number): Promise<SolData | null> => {
  const hoy = new Date().toISOString().slice(0, 10)
  return fetchSolUncached(lat, lng, hoy)
})

async function fetchSolUncached(lat: number, lng: number, fecha: string): Promise<SolData | null> {
  try {
    const url = `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&date=${fecha}&formatted=0`
    const res = await fetchWithTimeout(url, { next: { revalidate: 86400 } })
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 'OK') return null

    const fmt = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', {
      hour: '2-digit', minute: '2-digit', timeZone: zonaHoraria(lat, lng)
    })
    const luz = data.results.day_length
    return {
      amanecer:  fmt(data.results.sunrise),
      atardecer: fmt(data.results.sunset),
      horas_luz: `${Math.floor(luz / 3600)}h ${Math.floor((luz % 3600) / 60)}m`,
      pct_dia:   Math.round((luz / 86400) * 100),
    }
  } catch { return null }
}

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
  // Cuatro niveles, la misma escala de veredicto que el resto del sitio.
  // Antes eran verde, azul, ámbar y rojo de Tailwind: una paleta ajena que
  // bajo Litoral cantaba entre datos apagados.
  const color    = nivel === 'Excelente' ? 'var(--excelente)'
                 : nivel === 'Buena'     ? 'var(--muybueno)'
                 : nivel === 'Regular'   ? 'var(--aceptable)'
                 :                         'var(--noapto)'

  return { visibilidad_m: visibilidad, turbidez, clorofila, nivel, color }
}

