// src/lib/aemet.ts
// Wrapper para AEMET OpenData — siempre llamar server-side (oculta API key)

import type { DatosMeteo as MeteoPlaya } from '@/types'

const AEMET_BASE = 'https://opendata.aemet.es/opendata/api'
const KEY = process.env.AEMET_API_KEY ?? ''

// AEMET tiene un flujo de dos pasos:
// 1. Llamas al endpoint → te devuelve una URL de datos
// 2. Llamas a esa URL → obtienes el JSON real
async function aemetFetch(path: string) {
  if (!KEY) throw new Error('AEMET_API_KEY no configurada')

  const meta = await fetch(`${AEMET_BASE}${path}`, {
    headers: { api_key: KEY },
    next: { revalidate: 60 * 60 * 3 },  // caché 3h
  }).then(r => r.json())

  if (meta.estado !== 200) throw new Error(`AEMET: ${meta.descripcion}`)

  return fetch(meta.datos).then(r => r.json())
}

// Predicción específica para playa (temperatura agua, estado mar, oleaje)
export async function getMeteoPlaya(idAemet: string): Promise<MeteoPlaya | null> {
  try {
    const data = await aemetFetch(`/prediccion/especifica/playa/${idAemet}`)
    return normalizeMeteoPlaya(data)
  } catch (e) {
    console.error('AEMET playa error:', e)
    return null
  }
}

// Predicción por municipio (temperatura aire, viento, UV)
export async function getMeteoCodMunicipio(codMun: string): Promise<Partial<MeteoPlaya> | null> {
  try {
    const data = await aemetFetch(`/prediccion/especifica/municipio/diaria/${codMun}`)
    return normalizeMeteoCodMun(data)
  } catch (e) {
    console.error('AEMET municipio error:', e)
    return null
  }
}

function normalizeMeteoPlaya(data: any): MeteoPlaya {
  const hoy = data?.[0]?.prediccion?.dia?.[0] ?? {}
  const now = new Date().toISOString()

  return {
    temp_agua: hoy.tempAgua ?? null,
    temp_aire: hoy.temperatura?.maxima ?? 0,
    temp_max: hoy.temperatura?.maxima ?? 0,
    temp_min: hoy.temperatura?.minima ?? 0,
    sensacion: hoy.sensTermica?.maxima ?? 0,
    estado_mar: hoy.estadoCielo?.[0]?.descripcion ?? null,
    oleaje_m: parseFloat(hoy.oleajeMax) || null,
    periodo_s: null,
    direccion_mar: hoy.dirViento?.[0]?.descripcion ?? null,
    viento_kmh: hoy.viento?.[0]?.velocidad ?? 0,
    viento_dir: hoy.viento?.[0]?.direccion ?? '',
    viento_dir_deg: dirToGrados(hoy.viento?.[0]?.direccion),
    viento_racha: hoy.rachaMax?.[0]?.value ?? 0,
    humedad: hoy.humedadRelativa?.maxima ?? 0,
    uv_max: hoy.uvMax ?? null,
    timestamp: now,
  }
}

function normalizeMeteoCodMun(data: any): Partial<MeteoPlaya> {
  const hoy = data?.prediccion?.dia?.[0] ?? {}
  return {
    temp_aire: hoy.temperatura?.maxima ?? 0,
    temp_max: hoy.temperatura?.maxima ?? 0,
    temp_min: hoy.temperatura?.minima ?? 0,
    sensacion: hoy.sensTermica?.maxima ?? 0,
    viento_kmh: hoy.vientoAndRachaMax?.[0]?.velocidad ?? 0,
    viento_dir: hoy.vientoAndRachaMax?.[0]?.direccion ?? '',
    viento_dir_deg: dirToGrados(hoy.vientoAndRachaMax?.[0]?.direccion),
    viento_racha: hoy.vientoAndRachaMax?.[1]?.value ?? 0,
    humedad: hoy.humedadRelativa?.maxima ?? 0,
    uv_max: hoy.uvMax ?? null,
    timestamp: new Date().toISOString(),
  }
}

function dirToGrados(dir: string = ''): number {
  const map: Record<string, number> = {
    N: 0, NNE: 22, NE: 45, ENE: 67, E: 90, ESE: 112, SE: 135, SSE: 157,
    S: 180, SSO: 202, SO: 225, OSO: 247, O: 270, ONO: 292, NO: 315, NNO: 337,
  }
  return map[dir.toUpperCase()] ?? 0
}
