// src/lib/banderas-and.ts — Bandera OFICIAL izada en las playas de Andalucía.
//
// Fuente: API de recursos turísticos de la Junta de Andalucía
// (maps.andalucia.org), la misma que alimenta el visor "Playas Seguras de
// Andalucía" del IECA. 506 playas de las cinco provincias costeras en una
// llamada de ~97 KB que responde en ~1 s. Sin clave.
//
// Por qué existe este módulo: el 15 de agosto de 2026, tras los aliviaderos
// de una tormenta, el Ayuntamiento de Málaga prohibió el baño en seis playas
// por E. coli. Nuestras fichas de La Misericordia, Sacaba y San Andrés
// decían "BUENA" — porque la bandera se estimaba con oleaje y viento, y una
// playa contaminada está en calma. Esta API sí las daba en rojo ese día.
//
// DOS LIMITACIONES que conviene tener presentes al leer el código:
//
//  1. No dice el motivo. Devuelve el color y nada más: ni contaminación, ni
//     medusas, ni oleaje. (Canarias sí lo dice; Andalucía no.) Se probaron
//     también las operaciones del SOAP municipal de Málaga que prometían el
//     motivo —getEstadoPlaya, caracteristicas— y devuelven nulos.
//  2. No trae NINGÚN timestamp: ni campo en el JSON ni cabecera de caché.
//     No se puede afirmar "actualizado a las X", así que la ficha no lo
//     afirma. Fechar los cambios exige guardar snapshots y comparar.
//
// Estrategia de red: UNA llamada para toda Andalucía, cacheada en KV 15 min.
// El mapeo id → slug es offline (src/data/banderas-and-map.json, generado por
// scripts/build-banderas-and-map.mjs por cercanía ≤350 m).
//
// Autoridad en la cascada: REEMPLAZA a la estimación meteo y a AEMET. Los
// reportes de bañistas pueden ELEVARLA.
//
// Licencia: no declarada (`license: None` en su propio OpenAPI). Titular:
// Empresa Pública para la Gestión del Turismo y del Deporte de Andalucía.
// Atribución visible en la ficha.
import type { BanderaPlaya } from './seguridad'
import { kvCached } from './kv-cache'
import mapa from '@/data/banderas-and-map.json'

const MAPA = mapa as Record<string, number[]>  // slug → ids de la Junta

const API = 'https://maps.andalucia.org/rest-turistico/rest/webapp/beach/paginated'

export interface EstadoOficialAnd {
  bandera: BanderaPlaya | null
  /** La Junta marca la playa como cerrada (distinto de bandera roja) */
  cerrada: boolean
  /** Nº de tramos agrupados en esta ficha */
  tramos: number
}

/** ¿Esta playa tiene mapeo al dataset de la Junta? (para gating barato) */
export function tieneBanderaAnd(slug: string): boolean {
  return slug in MAPA
}

// Códigos verificados contra /rest/beach_flag/list y /rest/beach_state/list.
// BAPLABLANCA existe y NO es una bandera de baño (es el distintivo de playa
// sin servicio de vigilancia), así que no se traduce a color: se ignora,
// igual que 'complet' en el dataset catalán.
const COLOR_POR_CODIGO: Record<string, 'verde' | 'amarilla' | 'roja'> = {
  BAPLAVERDE: 'verde',
  BAPLAAMARILLA: 'amarilla',
  BAPLAROJA: 'roja',
}
const SEV = { verde: 0, amarilla: 1, roja: 2 } as const

interface FilaAnd { color: 'verde' | 'amarilla' | 'roja' | null; cerrada: boolean }

/**
 * Snapshot de Andalucía: id → estado. Una llamada para las cinco provincias,
 * compartida por todas las fichas andaluzas vía KV.
 *
 * TTL 15 min. La clave lleva la fecha para que el snapshot no sobreviva al
 * cambio de día, aunque el TTL ya lo garantiza: es defensa en profundidad,
 * porque esta API no da forma de saber si el dato que devuelve es de hoy.
 */
// Memo de proceso DELANTE de KV. Sin esto, en un build sin KV configurado
// cada una de las ~325 fichas andaluzas dispara su propia llamada a la Junta:
// seis minutos de build y 325 peticiones a una API que nos deja usarla por
// cortesía. Con memo, una. También ayuda en una lambda caliente.
let _snap: { hoy: string; p: Promise<Record<number, FilaAnd>> } | null = null

async function getSnapshot(): Promise<Record<number, FilaAnd>> {
  const hoy = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date()).replace(/\//g, '-')

  if (_snap?.hoy === hoy) return _snap.p
  const p = cargar(hoy)
  _snap = { hoy, p }
  // Un fallo no debe quedarse memoizado para siempre: se olvida y el
  // siguiente lo reintenta.
  p.catch(() => { if (_snap?.p === p) _snap = null })
  return p
}

async function cargar(hoy: string): Promise<Record<number, FilaAnd>> {
  return kvCached('banderas-and', [hoy], 900, async () => {
    const res = await fetch(API, {
      method: 'POST',
      signal: AbortSignal.timeout(4000),
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'es',   // sin esto responde en inglés
        'User-Agent': 'playas-espana.com (+https://playas-espana.com)',
      },
      body: JSON.stringify({
        item_number: -1, page_size: -1,
        filters: { 'resource_type.code': ['TIPRECPLAYA'] },
      }),
      next: { revalidate: 900 },
    })
    if (!res.ok) return {}
    const { list } = await res.json() as { list?: Array<Record<string, { code?: string } | number>> }
    const out: Record<number, FilaAnd> = {}
    for (const r of list ?? []) {
      const id = Number(r.id)
      if (!Number.isFinite(id)) continue
      const codigo = (r.beach_flag as { code?: string } | null)?.code ?? ''
      const estado = (r.beach_state as { code?: string } | null)?.code ?? ''
      out[id] = {
        color: COLOR_POR_CODIGO[codigo] ?? null,
        cerrada: estado === 'ESPLASCERRADA',
      }
    }
    return out
  })
}

/**
 * Estado oficial de HOY para una playa andaluza. null si no está mapeada o si
 * la Junta no reporta bandera para ella (87 de las 506 vienen sin dato).
 */
export async function getBanderaAnd(slug: string): Promise<EstadoOficialAnd | null> {
  const ids = MAPA[slug]
  if (!ids?.length) return null
  try {
    const snap = await getSnapshot()

    // Manda la PEOR bandera de los tramos, y basta con que UN tramo esté
    // cerrado para marcar la ficha: en la duda, avisar de más.
    let peor: 'verde' | 'amarilla' | 'roja' | null = null
    let cerrada = false
    let tramos = 0
    for (const id of ids) {
      const f = snap[id]
      if (!f) continue
      tramos++
      if (f.cerrada) cerrada = true
      if (f.color && (!peor || SEV[f.color] > SEV[peor])) peor = f.color
    }
    if (!tramos) return null

    const varios = tramos > 1 ? `, tramo más restrictivo de ${tramos}` : ''
    // Deliberadamente sin hora: esta API no da timestamp y no vamos a
    // inventar una frescura que no podemos demostrar.
    const bandera: BanderaPlaya | null =
      peor === 'roja'
        ? { color: 'roja', label: 'Bandera roja', labelEn: 'Red flag',
            motivo: `Bandera oficial izada hoy — baño prohibido (Junta de Andalucía)${varios}`,
            motivoEn: 'Official flag flying today — no swimming', hex: '#ef4444' }
        : peor === 'amarilla'
          ? { color: 'amarilla', label: 'Bandera amarilla', labelEn: 'Yellow flag',
              motivo: `Bandera oficial izada hoy (Junta de Andalucía)${varios}`,
              motivoEn: 'Official flag flying today', hex: '#f59e0b' }
          : peor === 'verde'
            ? { color: 'verde', label: 'Bandera verde', labelEn: 'Green flag',
                motivo: 'Bandera oficial izada hoy en la playa (Junta de Andalucía)',
                motivoEn: 'Official flag flying today', hex: '#22c55e' }
            : null

    return { bandera, cerrada, tramos }
  } catch {
    return null
  }
}
