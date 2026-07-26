// src/lib/banderas-cat.ts — Bandera OFICIAL izada en las playas de Cataluña.
//
// Fuente: dataset "Estat de les platges" de Transparència Catalunya
// (resource 4baz-cjv2, SODA, sin API key): el estado que reporta el propio
// servicio de socorrismo cada mañana — bandera real, motivo, medusas con
// especie y cantidad, y temperatura del agua medida. Se actualiza a diario
// en temporada (~320 filas/día verificado en jul-2026).
//
// Estrategia de red: UNA llamada para toda la costa catalana, cacheada en
// KV 30 min (namespace 'banderas-cat', clave = fecha del día). Las ~670
// fichas catalanas hacen lookup en memoria contra ese snapshot. El mapeo
// codiplatja → slug es offline (src/data/banderas-cat-map.json, generado
// por scripts/build-banderas-cat-map.mjs por cercanía ≤600 m).
//
// Autoridad en la cascada de banderas: REEMPLAZA a la estimación meteo y a
// AEMET (es la bandera físicamente izada, puede bajar una amarilla estimada
// a verde). Los reportes de bañistas siguen pudiendo ELEVARLA (son más
// recientes que el parte de la mañana), nunca rebajarla.
import type { BanderaPlaya, MedusasRiesgo } from './seguridad'
import { kvCached } from './kv-cache'
import mapa from '@/data/banderas-cat-map.json'

const MAPA = mapa as Record<string, string>  // slug → codiplatja

export interface EstadoOficialCat {
  bandera: BanderaPlaya | null
  /** Riesgo de medusas derivado del avistamiento oficial (null si no reportan) */
  medusas: MedusasRiesgo | null
  /** Temperatura del agua medida por el socorrismo (°C) */
  tAgua: number | null
  /** Hora local del parte, "HH:MM" */
  hora: string | null
}

/** ¿Esta playa tiene mapeo al dataset oficial catalán? (para gating barato) */
export function tieneBanderaCat(slug: string): boolean {
  return slug in MAPA
}

// ── Traducciones (el dataset viene en catalán, texto libre del
// socorrista: "Estat de la mar", "ESTAT MAR", "vent mestral"…) ───────
// Matching por palabra clave sobre el texto normalizado, no dict exacto.
const MOTIVOS: Array<[RegExp, string, string]> = [
  [/mar de fons/,          'mar de fondo',          'ground swell'],
  [/medus/,                'presencia de medusas',  'jellyfish'],
  [/qualitat|contamina/,   'calidad del agua',      'water quality'],
  [/tempesta/,             'tormenta eléctrica',    'thunderstorm'],
  [/mestral/,              'viento de mistral',     'mistral wind'],
  [/vent.*onatge|onatge.*vent/, 'viento y oleaje',  'wind and waves'],
  [/corrent/,              'corrientes',            'currents'],
  [/onatge/,               'oleaje',                'waves'],
  [/vent/,                 'viento fuerte',         'strong wind'],
  [/estat.*mar|mar.*estat/, 'estado del mar',       'sea state'],
  [/terbol/,               'aguas turbias',         'murky water'],
  [/meteor|metereo/,       'meteorología adversa',  'bad weather'],
]

// Especie → nombre común + peligrosidad (lo que un bañista quiere saber).
const ESPECIES: Record<string, [string, string]> = {
  'Pelagia noctiluca':        ['medusa luminiscente — picadura dolorosa', 'mauve stinger — painful sting'],
  'Rhizostoma pulmo':         ['aguamala — picadura leve', 'barrel jellyfish — mild sting'],
  'Cotylorhiza tuberculata':  ['medusa huevo frito — casi inofensiva', 'fried egg jellyfish — mostly harmless'],
  'Physalia physalis':        ['carabela portuguesa — PELIGROSA, no tocar', 'Portuguese man o\'war — DANGEROUS'],
  'Carybdea marsupialis':     ['cubomedusa — picadura fuerte', 'box jellyfish — strong sting'],
  'Aurelia aurita':           ['medusa común — picadura muy leve', 'moon jellyfish — very mild sting'],
  'Chrysaora hysoscella':     ['medusa de compases — picadura dolorosa', 'compass jellyfish — painful sting'],
  'Velella velella':          ['velero — inofensivo', 'by-the-wind sailor — harmless'],
  'Olindias phosphorica':     ['medusa de fondo — picadura dolorosa', 'olindias — painful sting'],
}
const CANTIDAD: Record<string, [string, string]> = {
  poques:   ['pocas', 'a few'],
  bastants: ['bastantes', 'quite a few'],
  moltes:   ['muchas', 'many'],
}

interface FilaDia { b: string; m: string; med: string; t: string; hora: string }

// Snapshot del día: codiplatja → última fila reportada. Una llamada SODA
// para todo Cataluña, compartida por todas las fichas vía KV (TTL 30 min).
async function getSnapshot(): Promise<Record<string, FilaDia>> {
  // Fecha de HOY en Madrid con el formato del dataset (DD/MM/YYYY).
  const hoy = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date())
  return kvCached('banderas-cat', [hoy.replace(/\//g, '-')], 1800, async () => {
    const url = 'https://analisi.transparenciacatalunya.cat/resource/4baz-cjv2.json?'
      + new URLSearchParams({
        $select: 'codiplatja,estat_bandera,estat_motiubandera,estat_meduses,estat_temperatura,estat_data',
        $where: `estat_data like '${hoy}%'`,
        $limit: '1000',
      })
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 900 },
    })
    if (!res.ok) return {}
    const rows: Array<Record<string, string>> = await res.json()
    const out: Record<string, FilaDia> = {}
    for (const r of rows) {
      if (!r.codiplatja) continue
      // "24/07/2026T09:12:33.000Z" → nos quedamos la más tardía del día
      const horaRaw = r.estat_data?.split('T')[1]?.slice(0, 5) ?? ''
      const prev = out[r.codiplatja]
      if (prev && prev.hora >= horaRaw) continue
      out[r.codiplatja] = {
        b: r.estat_bandera ?? '', m: r.estat_motiubandera ?? '',
        med: r.estat_meduses ?? '', t: r.estat_temperatura ?? '', hora: horaRaw,
      }
    }
    return out
  })
}

function traducirMotivo(raw: string): [string, string] | null {
  const k = raw.trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // fuera acentos
  if (!k || k === 'n/a' || k === 'altres') return null
  for (const [re, es, en] of MOTIVOS) if (re.test(k)) return [es, en]
  return [raw, raw]
}

// "Pelagia noctiluca,poques,0-5;Rhizostoma pulmo,poques,10-15" → MedusasRiesgo
function parseMedusas(raw: string): MedusasRiesgo | null {
  if (!raw || raw === 'N/A') return null
  const partes: string[] = [], partesEn: string[] = []
  let peorNivel: MedusasRiesgo['nivel'] = 'medio'  // avistamiento confirmado ⇒ mínimo medio
  for (const grupo of raw.split(';')) {
    const [especie, cantidad] = grupo.split(',').map(s => s?.trim())
    if (!especie) continue
    const [es, en] = ESPECIES[especie] ?? [especie, especie]
    const [qEs, qEn] = CANTIDAD[cantidad] ?? [cantidad ?? '', cantidad ?? '']
    partes.push(`${es}${qEs ? ` (${qEs})` : ''}`)
    partesEn.push(`${en}${qEn ? ` (${qEn})` : ''}`)
    if (especie === 'Physalia physalis' || especie === 'Carybdea marsupialis'
      || cantidad === 'moltes' || cantidad === 'bastants') peorNivel = 'alto'
  }
  if (!partes.length) return null
  return {
    nivel: peorNivel,
    label: peorNivel === 'alto' ? 'Medusas: riesgo alto' : 'Medusas avistadas',
    labelEn: peorNivel === 'alto' ? 'Jellyfish: high risk' : 'Jellyfish sighted',
    detalle: `Avistamiento oficial del socorrismo hoy: ${partes.join('; ')}.`,
    detalleEn: `Official lifeguard sighting today: ${partesEn.join('; ')}.`,
    hex: peorNivel === 'alto' ? '#ef4444' : '#f59e0b',
    oficial: true,
    fuente: 'socorrismo',
  }
}

/**
 * Estado oficial de HOY para una playa catalana. null si la playa no está
 * en el dataset o el socorrismo aún no ha reportado hoy (fuera de
 * temporada, o antes de ~9:30 de la mañana).
 */
export async function getBanderaCat(slug: string): Promise<EstadoOficialCat | null> {
  const codi = MAPA[slug]
  if (!codi) return null
  try {
    const snap = await getSnapshot()
    const fila = snap[codi]
    if (!fila) return null

    let bandera: BanderaPlaya | null = null
    const motivo = traducirMotivo(fila.m)
    const sufijo = motivo ? ` por ${motivo[0]}` : ''
    const sufijoEn = motivo ? ` (${motivo[1]})` : ''
    if (fila.b === 'verda') {
      bandera = { color: 'verde', label: 'Bandera verde', labelEn: 'Green flag',
        motivo: 'Bandera oficial izada hoy en la playa (Generalitat)',
        motivoEn: 'Official flag flying today (Generalitat de Catalunya)', hex: '#22c55e' }
    } else if (fila.b === 'groga') {
      bandera = { color: 'amarilla', label: 'Bandera amarilla', labelEn: 'Yellow flag',
        motivo: `Bandera oficial izada hoy${sufijo} (Generalitat)`,
        motivoEn: `Official flag flying today${sufijoEn}`, hex: '#f59e0b' }
    } else if (fila.b === 'vermella') {
      bandera = { color: 'roja', label: 'Bandera roja', labelEn: 'Red flag',
        motivo: `Bandera oficial izada hoy${sufijo} — baño prohibido (Generalitat)`,
        motivoEn: `Official flag flying today${sufijoEn} — no swimming`, hex: '#ef4444' }
    }
    // 'complet' (aforo lleno) y 'sense informacio' no son banderas de baño.

    const t = parseFloat(fila.t)
    return {
      bandera,
      medusas: parseMedusas(fila.med),
      tAgua: Number.isFinite(t) && t > 5 && t < 35 ? t : null,
      hora: fila.hora || null,
    }
  } catch {
    return null
  }
}
