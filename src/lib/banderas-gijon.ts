// src/lib/banderas-gijon.ts — Bandera izada en las playas de Gijón.
//
// Única vía municipal con bandera en Asturias. El Principado tiene una API
// regional con 229 playas y datos vivos de ocupación y marea, pero su campo
// `bandera_label` está MUERTO a nivel de base de datos: su propio filtro de
// servidor devuelve cero registros para Verde, Amarilla y Roja. No es que
// hoy no haya; es que no hay ninguno. (Curiosidad: la versión anterior del
// portal, antes de migrar a Liferay, sí leía un banderas.json. Asturias
// tenía bandera y la perdió en la migración.)
//
// DOS RAREZAS DE ESTA API, las dos verificadas:
//
//  1. Exige `Accept: application/json`. Sin esa cabecera devuelve HTML, y
//     con `Accept: */*` devuelve más HTML todavía. Es el tipo de detalle que
//     hace perder una tarde.
//  2. Sus fechas vienen rotas: `fecha_calidad` es "2026-08-2026" (sin día) y
//     la de temperatura del agua, "13-8-13". Por eso NO se usa ninguna fecha
//     de aquí: preferimos no decir cuándo antes que decir una fecha inventada.
//
// Las playas vienen troceadas en zonas —San Lorenzo tiene una bandera por
// escalera— y nosotros tenemos una ficha por playa, así que manda la PEOR de
// sus zonas. Misma regla que Las Canteras en Canarias.
import type { BanderaPlaya } from './seguridad'
import { kvCached } from './kv-cache'
import { cargarConUltimoBueno } from './ultimo-bueno'
import mapa from '@/data/banderas-gijon-map.json'

const MAPA = mapa as Record<string, string>          // nombre en la API → slug
const POR_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(MAPA).map(([n, s]) => [s, n]),
)

const URL_API = 'https://api.gijon.es/recursos/playas/estado'
const SEV = { verde: 0, amarilla: 1, roja: 2 } as const

export interface EstadoOficialGijon {
  bandera: BanderaPlaya | null
  /** Nº de zonas (escaleras) agrupadas en esta ficha */
  zonas: number
}

export function tieneBanderaGijon(slug: string): boolean {
  return slug in POR_SLUG
}

let _snap: { hoy: string; p: Promise<Record<string, { color: 'verde'|'amarilla'|'roja'|null; zonas: number }>> } | null = null

async function getSnapshot() {
  const hoy = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
  if (_snap?.hoy === hoy) return _snap.p
  const p = cargar(hoy)
  _snap = { hoy, p }
  p.catch(() => { if (_snap?.p === p) _snap = null })
  return p
}

function colorDe(v: unknown): 'verde' | 'amarilla' | 'roja' | null {
  const t = String(v ?? '').toLowerCase()
  if (t.includes('verde')) return 'verde'
  if (t.includes('amarill')) return 'amarilla'
  if (t.includes('roj')) return 'roja'
  return null   // null y "-----" son el centinela de "sin bandera"
}

async function cargar(hoy: string) {
  const { datos } = await cargarConUltimoBueno('banderas-gijon', [hoy], 900, async () => {
    const res = await fetch(URL_API, {
      signal: AbortSignal.timeout(4000),
      headers: {
        'Accept': 'application/json',   // obligatorio: sin esto devuelve HTML
        'User-Agent': 'playas-espana.com (+https://playas-espana.com)',
      },
      next: { revalidate: 900 },
    })
    if (!res.ok) return {}
    const filas = await res.json() as Array<Record<string, unknown>>
    const out: Record<string, { color: 'verde'|'amarilla'|'roja'|null; zonas: number }> = {}
    for (const f of filas ?? []) {
      const nombre = String(f.nombre ?? '')
      if (!nombre) continue
      const zonas = Array.isArray(f.zonas) ? f.zonas as Array<Record<string, unknown>> : []
      let peor: 'verde' | 'amarilla' | 'roja' | null = null
      let n = 0
      for (const z of zonas) {
        const c = colorDe(z.bandera)
        if (!c) continue
        n++
        if (!peor || SEV[c] > SEV[peor]) peor = c
      }
      out[nombre] = { color: peor, zonas: n }
    }
    return out
  }, v => !v || Object.keys(v as object).length === 0)
  return datos
}

export async function getBanderaGijon(slug: string): Promise<EstadoOficialGijon | null> {
  const nombre = POR_SLUG[slug]
  if (!nombre) return null
  try {
    const snap = await getSnapshot()
    const f = snap[nombre]
    if (!f || !f.color) return null   // sin vigilancia o sin parte: no es verde
    const varias = f.zonas > 1 ? `, zona más restrictiva de ${f.zonas}` : ''
    const attr = `(Ayuntamiento de Gijón)${varias}`
    const bandera: BanderaPlaya =
      f.color === 'roja'
        ? { color: 'roja', label: 'Bandera roja', labelEn: 'Red flag',
            motivo: `Bandera oficial izada hoy — baño prohibido ${attr}`,
            motivoEn: 'Official flag flying today — no swimming', hex: '#ef4444' }
        : f.color === 'amarilla'
          ? { color: 'amarilla', label: 'Bandera amarilla', labelEn: 'Yellow flag',
              motivo: `Bandera oficial izada hoy ${attr}`,
              motivoEn: 'Official flag flying today', hex: '#f59e0b' }
          : { color: 'verde', label: 'Bandera verde', labelEn: 'Green flag',
              motivo: `Bandera oficial izada hoy en la playa ${attr}`,
              motivoEn: 'Official flag flying today', hex: '#22c55e' }
    return { bandera, zonas: f.zonas }
  } catch {
    return null
  }
}
