// src/lib/banderas-can.ts — Bandera OFICIAL izada en las playas de Canarias.
//
// Fuente: sistema de socorrismo de la Dirección General de Seguridad y
// Emergencias del Gobierno de Canarias (el mismo que alimenta su visor
// Infoplayas). Los datos los introducen los socorristas en playa —Cruz Roja
// y adjudicatarias— desde su app, con hora de izado y de arriado previsto.
//
// Es la MEJOR fuente de banderas de España por un motivo concreto: es la
// única que dice POR QUÉ. La Junta de Andalucía da color y nada más; el SOAP
// de Málaga tiene operaciones que prometen el motivo y devuelven nulos. Aquí
// `reason` trae "Corrientes", "Desprendimientos", "Oleaje"… y eso importa
// porque una playa cerrada por desprendimientos puede estar en calma
// absoluta: ninguna estimación por oleaje la vería nunca.
//
// Estrategia de red: UNA llamada para todo el archipiélago, cacheada en KV
// 15 min. Las ~560 fichas canarias hacen lookup en memoria contra ese
// snapshot. El mapeo id DGSE → slug es offline (src/data/banderas-can-map.json,
// generado por scripts/build-banderas-can-map.mjs por cercanía ≤350 m).
//
// Autoridad en la cascada: REEMPLAZA a la estimación meteo y a AEMET (es la
// bandera físicamente izada). Los reportes de bañistas pueden ELEVARLA.
//
// Licencia: no declarada. No es un dataset publicado sino la API interna de
// un visor público, así que la atribución al Gobierno de Canarias es visible
// en la ficha y el User-Agent nos identifica.
import type { BanderaPlaya } from './seguridad'
import { kvCached } from './kv-cache'
import mapa from '@/data/banderas-can-map.json'

const MAPA = mapa as Record<string, number[]>  // slug → ids DGSE (puede haber varios tramos)

const API = 'https://www3.gobiernodecanarias.org/aplicaciones/infoplayas/socorrismo/api'

export interface EstadoOficialCan {
  bandera: BanderaPlaya | null
  /** Temperatura del agua que anota el socorrista (°C) */
  tAgua: number | null
  /** Hora local de izado, "HH:MM" */
  hora: string | null
  /** Nº de tramos con bandera propia agrupados en esta ficha (Las Canteras: 7) */
  tramos: number
}

/** ¿Esta playa tiene mapeo al sistema canario? (para gating barato) */
export function tieneBanderaCan(slug: string): boolean {
  return slug in MAPA
}

// `flag` es un entero. El mapeo está confirmado en el propio código del
// visor (v2/js/apis/beachMarker.js): flags = [verde, amarilla, roja][flag].
const COLORES = ['verde', 'amarilla', 'roja'] as const
const SEV = { verde: 0, amarilla: 1, roja: 2 } as const

// El motivo viene en castellano y de una lista corta y estable, pero es texto
// libre del socorrista: se traduce lo conocido y lo demás pasa tal cual.
const MOTIVOS_EN: Record<string, string> = {
  'oleaje': 'waves',
  'corrientes': 'currents',
  'desprendimientos': 'falling rocks',
  'viento': 'wind',
  'afloramiento de rocas': 'exposed rocks',
  'evento': 'event',
  'buenas condiciones': 'good conditions',
  'contaminación': 'pollution',
  'medusas': 'jellyfish',
}

interface FilaFlag { flag: number; reason: string; hora: string; tAgua: number | null }

/**
 * Snapshot del archipiélago: id DGSE → última bandera reportada. Una llamada
 * para las 7 islas, compartida por todas las fichas vía KV.
 *
 * TTL 15 min: las banderas se mueven pocas veces al día (izado ~09:00,
 * revisiones puntuales, arriado ~17:00-19:00), pero cuando se mueven es
 * porque ha pasado algo y no queremos enseñarlo con una hora de retraso.
 */
// Memo de proceso DELANTE de KV: en un build sin KV, cada una de las ~412
// fichas canarias dispararía su propia llamada. Con memo, una.
let _snap: { hoy: string; p: Promise<Record<number, FilaFlag>> } | null = null

async function getSnapshot(): Promise<Record<number, FilaFlag>> {
  const hoy = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Atlantic/Canary', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date()).replace(/\//g, '-')

  if (_snap?.hoy === hoy) return _snap.p
  const p = cargar(hoy)
  _snap = { hoy, p }
  p.catch(() => { if (_snap?.p === p) _snap = null })
  return p
}

async function cargar(hoy: string): Promise<Record<number, FilaFlag>> {
  return kvCached('banderas-can', [hoy], 900, async () => {
    const res = await fetch(`${API}/flags`, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'playas-espana.com (+https://playas-espana.com)' },
      next: { revalidate: 900 },
    })
    if (!res.ok) return {}
    const { data } = await res.json() as { data?: Array<Record<string, unknown>> }
    const out: Record<number, FilaFlag> = {}
    for (const r of data ?? []) {
      const id = Number(r.beach_location_id)
      if (!Number.isFinite(id)) continue
      const flag = Number(r.flag)
      if (!Number.isFinite(flag) || flag < 0 || flag > 2) continue

      // `date` es el izado, en UTC. Se pinta en hora canaria, que es la que
      // ve quien está en la playa.
      let hora = ''
      const iso = typeof r.date === 'string' ? r.date : ''
      if (iso) {
        const d = new Date(iso)
        if (!Number.isNaN(d.getTime())) {
          hora = new Intl.DateTimeFormat('es-ES', {
            timeZone: 'Atlantic/Canary', hour: '2-digit', minute: '2-digit', hour12: false,
          }).format(d)
        }
      }
      const t = Number(r.water_temp)
      out[id] = {
        flag,
        reason: typeof r.reason === 'string' ? r.reason.trim() : '',
        hora,
        tAgua: Number.isFinite(t) && t > 5 && t < 35 ? t : null,
      }
    }
    return out
  })
}

/**
 * Estado oficial de HOY para una playa canaria. null si la playa no está
 * mapeada o si su municipio no alimenta el sistema (solo 15 de los 45
 * municipios con socorrismo reportan bandera: Fuerteventura, La Gomera y
 * El Hierro están en el catálogo pero hoy no reportan ninguna).
 */
export async function getBanderaCan(slug: string): Promise<EstadoOficialCan | null> {
  const ids = MAPA[slug]
  if (!ids?.length) return null
  try {
    const snap = await getSnapshot()

    // Manda la PEOR bandera de los tramos de esta ficha. Las Canteras viene
    // troceada en 7 sectores y se ha observado el mismo día con los sectores
    // 1-4 en verde y 5-7 en amarilla: quedarnos con uno cualquiera sería
    // decidir por sorteo si avisamos o no.
    let peor: FilaFlag | null = null
    let tramos = 0
    for (const id of ids) {
      const f = snap[id]
      if (!f) continue
      tramos++
      if (!peor || f.flag > peor.flag) peor = f
    }
    if (!peor) return null

    const color = COLORES[peor.flag]
    const motivo = peor.reason
    const motivoEn = MOTIVOS_EN[motivo.toLowerCase()] ?? motivo
    // En verde el motivo suele ser "Buenas condiciones", que como coletilla
    // de una bandera verde no aporta nada. En amarilla y roja SÍ es la
    // información importante, y va delante.
    const util = motivo && !/buenas condiciones/i.test(motivo)
    const sufijo = util ? ` por ${motivo.toLowerCase()}` : ''
    const sufijoEn = util ? ` (${motivoEn.toLowerCase()})` : ''
    const varios = tramos > 1 ? `, tramo más restrictivo de ${tramos}` : ''

    const bandera: BanderaPlaya =
      color === 'roja'
        ? { color: 'roja', label: 'Bandera roja', labelEn: 'Red flag',
            motivo: `Bandera oficial izada hoy${sufijo} — baño prohibido (Gobierno de Canarias)${varios}`,
            motivoEn: `Official flag flying today${sufijoEn} — no swimming`, hex: '#ef4444' }
        : color === 'amarilla'
          ? { color: 'amarilla', label: 'Bandera amarilla', labelEn: 'Yellow flag',
              motivo: `Bandera oficial izada hoy${sufijo} (Gobierno de Canarias)${varios}`,
              motivoEn: `Official flag flying today${sufijoEn}`, hex: '#f59e0b' }
          : { color: 'verde', label: 'Bandera verde', labelEn: 'Green flag',
              motivo: 'Bandera oficial izada hoy en la playa (Gobierno de Canarias)',
              motivoEn: 'Official flag flying today (Canary Islands Government)', hex: '#22c55e' }

    return { bandera, tAgua: peor.tAgua, hora: peor.hora || null, tramos }
  } catch {
    return null
  }
}

/** Severidad del color, para que el llamador pueda comparar sin reimplementarla. */
export const severidadCan = SEV
