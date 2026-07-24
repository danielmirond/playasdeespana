// src/lib/boyas.ts — Datos MEDIDOS por las boyas de Puertos del Estado.
//
// A diferencia del resto de la ficha (modelos Open-Meteo, predicción
// AEMET), esto son sensores físicos en el mar: altura de ola real,
// periodo y temperatura del agua medida. La API de Portus no está
// documentada; el protocolo (descubierto jul-2026, ver
// scripts/build-boyas.mjs) es:
//   POST /portussvr/api/RTData/station/{id}?locale=es  body [13,17,34,38]
//   → series horarias, valor real = valor / factor
//
// El sidecar src/data/boyas.json trae solo boyas VIVAS (probadas con
// datos <6h al generarlo). Cache KV 30 min por boya: con ~38 boyas y
// cadencia horaria de los sensores, el sitio entero hace como mucho
// 76 llamadas/hora a Portus, se mire lo que se mire.
import { kvCached } from './kv-cache'
import boyasRaw from '@/data/boyas.json'

interface BoyaMeta { id: number; n: string; la: number; lo: number; red: string; t: boolean }
const BOYAS = boyasRaw as BoyaMeta[]

// Una boya a >60 km ya no describe el mar de tu playa.
const MAX_DIST_KM = 60

export interface DatosBoya {
  nombre: string
  distanciaKm: number
  /** Altura significante del oleaje (m) — lo que "se siente" en el agua */
  hm0: number | null
  /** Altura máxima registrada (m) */
  hmax: number | null
  /** Periodo de pico (s) */
  tp: number | null
  /** Temperatura del agua medida (°C) */
  tAgua: number | null
  /** Hora local de la medición, "HH:MM" */
  hora: string
}

const hav = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371, r = (d: number) => (d * Math.PI) / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

interface FilaRT { fecha: string; datos: Array<{ id: number; valor: string | null; factor: number }> }

// Última medición de una boya, cacheada 30 min (cadencia real: 60 min).
async function medicion(id: number): Promise<{ hm0: number | null; hmax: number | null; tp: number | null; tAgua: number | null; iso: string } | null> {
  const out = await kvCached<{ hm0: number | null; hmax: number | null; tp: number | null; tAgua: number | null; iso: string } | null>(
    'boya-rt', [id], 1800, async () => {
      const res = await fetch(
        `https://portus.puertos.es/portussvr/api/RTData/station/${id}?locale=es`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '[13,17,34,38]',
          signal: AbortSignal.timeout(4000),
          next: { revalidate: 900 },
        })
      if (!res.ok) return null
      const rows: FilaRT[] = await res.json()
      const ult = rows?.[0]
      if (!ult?.datos?.length) return null
      // Fechas de Portus en UTC ("2026-07-24 20:00:00.0")
      const iso = ult.fecha.replace(' ', 'T').replace(/\.\d+$/, '') + 'Z'
      if (Date.now() - new Date(iso).getTime() > 3 * 3.6e6) return null  // rancio >3h
      const val = (pid: number): number | null => {
        const d = ult.datos.find(x => x.id === pid)
        if (!d || d.valor == null) return null
        const v = parseFloat(d.valor) / (d.factor || 1)
        return Number.isFinite(v) ? v : null
      }
      return { hm0: val(13), hmax: val(17), tp: val(34), tAgua: val(38), iso }
    })
  return out ?? null
}

/**
 * Datos medidos por la boya más cercana (≤60 km) a una playa, o null si
 * no hay boya en rango o su dato es rancio. Pensado para la ficha: "lo
 * que dice el sensor, no el modelo".
 */
export async function getBoyaCercana(lat: number, lng: number): Promise<DatosBoya | null> {
  let best: BoyaMeta | null = null, bestD = Infinity
  for (const b of BOYAS) {
    const d = hav(lat, lng, b.la, b.lo)
    if (d < bestD) { bestD = d; best = b }
  }
  if (!best || bestD > MAX_DIST_KM) return null
  try {
    const m = await medicion(best.id)
    if (!m || m.hm0 == null) return null
    const hora = new Intl.DateTimeFormat('es-ES', {
      // Canarias va una hora por detrás (misma heurística que seguridad.ts)
      timeZone: lat < 29.5 ? 'Atlantic/Canary' : 'Europe/Madrid',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(m.iso))
    return {
      nombre: best.n,
      distanciaKm: Math.round(bestD),
      hm0: m.hm0, hmax: m.hmax, tp: m.tp, tAgua: m.tAgua,
      hora,
    }
  } catch {
    return null
  }
}
