// src/lib/aemet.ts — Predicción OFICIAL de playa de AEMET (OpenData).
//
// Es la capa "certera" sobre nuestra bandera estimada: AEMET publica
// predicción específica por playa (oleaje, viento, agua, UV) para ~590
// playas. El mapeo código↔slug vive en src/data/aemet-playas.json
// (generado por scripts/build-aemet-playas.mjs, 549 slugs).
//
// Requiere AEMET_API_KEY (gratuita: https://opendata.aemet.es/centrodedescargas/altaUsuario).
// Sin key → getPrediccionAemet devuelve null y la UI no muestra el bloque.
// OpenData va en dos pasos: la petición devuelve { datos: url } y los datos
// reales se descargan de esa segunda URL. Cache KV 3 h (AEMET actualiza
// pocas veces al día y tiene rate limit duro).
import { kvCached } from './kv-cache'
import { fetchWithTimeout } from './fetch-timeout'
import aemetMap from '@/data/aemet-playas.json'

const API_KEY = process.env.AEMET_API_KEY ?? ''
const BASE = 'https://opendata.aemet.es/opendata/api/prediccion/especifica/playa'

export interface AemetPlayaDia {
  fecha: string           // YYYY-MM-DD
  oleaje: string | null   // "débil" | "moderado" | "fuerte"
  viento: string | null   // "calma" | "flojo" | "moderado" | "fuerte"
  tAgua: number | null    // °C
  tMaxima: number | null  // °C
  uvMax: number | null
}

export interface AemetPlaya {
  codigo: string
  nombreAemet: string
  hoy: AemetPlayaDia | null
  manana: AemetPlayaDia | null
}

interface MapEntry { codigo: string; nombre: string; distM: number }
const MAP = aemetMap as Record<string, MapEntry>

/** ¿Esta playa tiene predicción oficial AEMET mapeada? */
export function tieneAemet(slug: string): boolean {
  return !!MAP[slug]
}

const desc = (x: unknown): string | null => {
  // Los campos f1/f2 llegan como { value, descripcion? } o número plano según el día.
  if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    if (typeof o.descripcion1 === 'string') return o.descripcion1.toLowerCase()
    if (typeof o.descripcion === 'string') return o.descripcion.toLowerCase()
  }
  return null
}
const num = (x: unknown): number | null => {
  if (x && typeof x === 'object') {
    const o = x as Record<string, unknown>
    if (typeof o.valor1 === 'number') return o.valor1
    if (typeof o.valor === 'number') return o.valor
  }
  if (typeof x === 'number') return x
  return null
}

function parseDia(d: Record<string, unknown> | undefined): AemetPlayaDia | null {
  if (!d) return null
  const f = String(d.fecha ?? '')
  return {
    fecha: f.length === 8 ? `${f.slice(0, 4)}-${f.slice(4, 6)}-${f.slice(6, 8)}` : f,
    oleaje: desc(d.oleaje),
    viento: desc(d.viento),
    tAgua: num(d.tAgua),
    tMaxima: num(d.tMaxima),
    uvMax: num(d.uvMax),
  }
}

/**
 * Predicción oficial AEMET para una playa nuestra (por slug).
 * null si: sin API key, sin mapeo, o AEMET no responde.
 */
export async function getPrediccionAemet(slug: string): Promise<AemetPlaya | null> {
  if (!API_KEY) return null
  const entry = MAP[slug]
  if (!entry) return null

  try {
    return await kvCached<AemetPlaya | null>('aemet-playa-v1', [entry.codigo], 3 * 3600, async () => {
      // Paso 1: el endpoint devuelve la URL real de los datos.
      const r1 = await fetchWithTimeout(`${BASE}/${entry.codigo}`, {
        headers: { api_key: API_KEY, Accept: 'application/json' },
        cache: 'no-store',
      }, 6000)
      if (!r1.ok) return null
      const meta = await r1.json() as { estado?: number; datos?: string }
      if (!meta?.datos) return null

      // Paso 2: los datos reales (JSON en latin1 la mayoría de las veces).
      const r2 = await fetchWithTimeout(meta.datos, { cache: 'no-store' }, 6000)
      if (!r2.ok) return null
      const buf = await r2.arrayBuffer()
      let arr: unknown
      try { arr = JSON.parse(new TextDecoder('latin1').decode(buf)) }
      catch { arr = JSON.parse(new TextDecoder('utf-8').decode(buf)) }

      const item = Array.isArray(arr) ? arr[0] as Record<string, unknown> : null
      const pred = item?.prediccion as { dia?: Array<Record<string, unknown>> } | undefined
      const dias = pred?.dia ?? []
      return {
        codigo: entry.codigo,
        nombreAemet: entry.nombre,
        hoy: parseDia(dias[0]),
        manana: parseDia(dias[1]),
      }
    })
  } catch {
    return null
  }
}
