// src/lib/banderas-sb.ts — Bandera izada en los municipios que usan SafeBeach.
//
// Cubre ~172 de nuestras fichas en Comunitat Valenciana, Illes Balears,
// Murcia y dos concejos asturianos. Es, con diferencia, la fuente de más
// alcance después de Andalucía y Canarias, y en Baleares es la ÚNICA que
// existe: el portal oficial del Govern devuelve 503 con el certificado
// caducado, y su catálogo de datos abiertos da cero resultados para
// «bandera» y «socorrisme».
//
// QUÉ ES Y QUÉ NO ES ─────────────────────────────────────────────────────
//
// SafeBeach es una EMPRESA PRIVADA que vende el sistema a los ayuntamientos;
// los datos los meten los servicios de socorrismo municipales. No es un
// portal de datos abiertos: no publica licencia ni términos de uso, y sirve
// `noindex`. Por eso aquí se hacen dos cosas de forma deliberada:
//   · La atribución es visible en la ficha, con el nombre de SafeBeach.
//   · La caché es agresiva y la petición es POR MUNICIPIO, no por playa: las
//     16 fichas de Calvià comparten una sola petición cada 15 minutos.
// No hay API ni endpoint global —probados /api, /list, /sitemap.xml: 404—,
// así que el dato va embebido en el HTML como `window.SB_MARKERS`.
//
// HORARIO DE SERVICIO. Fuera del horario de socorrismo todas las playas
// vienen en gris (`#CCCCCC`, textoBandera vacío) y eso NO es una bandera:
// es "aún no hay parte". Verificado a las 09:17, con Guardamar y Valencia en
// gris, cuando la tarde anterior tenían banderas reales.
import type { BanderaPlaya, MedusasRiesgo } from './seguridad'
import { kvCached } from './kv-cache'
import mapa from '@/data/banderas-sb-map.json'

interface Entrada { m: string; l: string }
const MAPA = mapa as Record<string, Entrada>

export interface EstadoOficialSb {
  bandera: BanderaPlaya | null
  medusas: MedusasRiesgo | null
  tAgua: number | null
  /** Hora del parte, "HH:MM" */
  hora: string | null
}

export function tieneBanderaSb(slug: string): boolean {
  return slug in MAPA
}

// El texto llega en castellano o en valenciano/catalán según el municipio
// («Bandera verda» / «Bandera verde»), así que se normaliza por palabra
// clave y no por cadena exacta. El hex es el respaldo.
function colorDe(texto: string, hex: string): 'verde' | 'amarilla' | 'roja' | null {
  const t = texto.toLowerCase()
  if (/verd/.test(t)) return 'verde'
  if (/grog|amarill|groc/.test(t)) return 'amarilla'
  if (/roj|vermell|roig/.test(t)) return 'roja'
  const h = hex.toUpperCase().replace('#', '')
  if (/^(2ECC71|27AE60|4CAF50|00B050|0F9D58)$/.test(h)) return 'verde'
  if (/^(F7D40E|FFC107|F1C40F|FFEA00|F39C12)$/.test(h)) return 'amarilla'
  if (/^(E74C3C|C0392B|FF5252|D32F2F|E53935)$/.test(h)) return 'roja'
  return null   // gris #CCCCCC incluido: sin parte, no es bandera
}

interface FilaSb {
  color: 'verde' | 'amarilla' | 'roja' | null
  texto: string; hora: string; medusas: string
  oleaje: string; tAgua: string
}

const _memo = new Map<string, { hoy: string; p: Promise<Record<string, FilaSb>> }>()

function hoyMadrid(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

/** Snapshot de UN municipio: localizador → estado. */
async function getMunicipio(muni: string): Promise<Record<string, FilaSb>> {
  const hoy = hoyMadrid()
  const cache = _memo.get(muni)
  if (cache?.hoy === hoy) return cache.p
  const p = cargar(muni, hoy)
  _memo.set(muni, { hoy, p })
  p.catch(() => { if (_memo.get(muni)?.p === p) _memo.delete(muni) })
  return p
}

async function cargar(muni: string, hoy: string): Promise<Record<string, FilaSb>> {
  return kvCached('banderas-sb', [muni, hoy], 900, async () => {
    const res = await fetch(`https://info.safebeach.es/${muni}`, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'playas-espana.com (+https://playas-espana.com)' },
      next: { revalidate: 900 },
    })
    if (!res.ok) return {}
    const html = await res.text()
    const m = /SB_MARKERS\s*=\s*(\[[\s\S]*?\])\s*;/.exec(html)
    if (!m) return {}
    let filas: Array<Record<string, unknown>>
    try { filas = JSON.parse(m[1]) } catch { return {} }
    const out: Record<string, FilaSb> = {}
    for (const f of filas) {
      const loc = String(f.localizador ?? '')
      if (!loc) continue
      const it = (Array.isArray(f.items) ? f.items[0] : {}) as Record<string, unknown>
      const texto = String(it.textoBandera ?? '')
      const hex = String(it.colorBandera ?? '')
      out[loc] = {
        color: colorDe(texto, hex),
        texto: String(it.texto ?? ''),
        hora: String(it.hora ?? ''),
        medusas: String(it.medusas ?? ''),
        oleaje: String(it.oleaje ?? ''),
        tAgua: String(it.waterTemp ?? ''),
      }
    }
    return out
  })
}

export async function getBanderaSb(slug: string): Promise<EstadoOficialSb | null> {
  const e = MAPA[slug]
  if (!e) return null
  try {
    const snap = await getMunicipio(e.m)
    const f = snap[e.l]
    if (!f) return null
    if (!f.color) return null   // gris: fuera de horario de socorrismo

    const hora = f.hora ? ` (${f.hora} h)` : ''
    // `texto` es la frase del propio socorrismo: «Baño prohibido», «Baño con
    // precaución». Se usa tal cual porque la escriben ellos.
    const frase = f.texto ? `${f.texto} — ` : ''
    const attr = `(socorrismo municipal vía SafeBeach)`

    const bandera: BanderaPlaya =
      f.color === 'roja'
        ? { color: 'roja', label: 'Bandera roja', labelEn: 'Red flag',
            motivo: `${frase}bandera oficial izada hoy ${attr}${hora}`,
            motivoEn: 'Official flag flying today — no swimming', hex: '#ef4444' }
        : f.color === 'amarilla'
          ? { color: 'amarilla', label: 'Bandera amarilla', labelEn: 'Yellow flag',
              motivo: `${frase}bandera oficial izada hoy ${attr}${hora}`,
              motivoEn: 'Official flag flying today', hex: '#f59e0b' }
          : { color: 'verde', label: 'Bandera verde', labelEn: 'Green flag',
              motivo: `Bandera oficial izada hoy en la playa ${attr}${hora}`,
              motivoEn: 'Official flag flying today', hex: '#22c55e' }

    const t = parseFloat(f.tAgua)
    const hayMedusas = /^s[ií]$/i.test(f.medusas.trim())
    return {
      bandera,
      hora: f.hora || null,
      tAgua: Number.isFinite(t) && t > 5 && t < 35 ? t : null,
      medusas: hayMedusas
        ? {
            nivel: 'medio', label: 'Medusas avistadas', labelEn: 'Jellyfish sighted',
            detalle: 'Aviso de medusas del servicio de socorrismo municipal.',
            detalleEn: 'Jellyfish warning from the municipal lifeguard service.',
            hex: '#f59e0b', oficial: true, fuente: 'socorrismo',
          }
        : null,
    }
  } catch {
    return null
  }
}
