// src/lib/cuaderno.ts — "Mi cuaderno de playas": la capa de pertenencia.
//
// Sin cuentas ni registro, como todo lo social del sitio (favoritas,
// reportes): el cuaderno vive en localStorage del dispositivo. Guardamos
// los METADATOS de la playa en el momento de marcarla (nombre, provincia,
// comunidad) para que la página /mi-cuaderno no tenga que cargar el
// catálogo de 5.000 playas en cliente.
//
// El único rastro en servidor es un contador agregado y anónimo por playa
// (KV `estuve:{slug}`) para la prueba social "N bañistas estuvieron aquí".

export interface VisitaCuaderno {
  n: string   // nombre
  m: string   // municipio
  p: string   // provincia
  c: string   // comunidad
  ts: number  // cuándo se marcó
}
export type Cuaderno = Record<string, VisitaCuaderno>

const KEY = 'cuaderno_playas_v1'

export function leerCuaderno(): Cuaderno {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') } catch { return {} }
}

export function estuveEn(slug: string): boolean {
  return slug in leerCuaderno()
}

export function marcarVisita(slug: string, v: Omit<VisitaCuaderno, 'ts'>): Cuaderno {
  const c = leerCuaderno()
  c[slug] = { ...v, ts: Date.now() }
  try { localStorage.setItem(KEY, JSON.stringify(c)) } catch {}
  return c
}

export function borrarVisita(slug: string): Cuaderno {
  const c = leerCuaderno()
  delete c[slug]
  try { localStorage.setItem(KEY, JSON.stringify(c)) } catch {}
  return c
}

// ── Insignias ────────────────────────────────────────────────────────
// Motor puro y determinista: (cuaderno, nº reportes) → insignias.
// Los reportes se cuentan de las claves `rep:*` que ya escribe
// ReportarEstado — enviar un reporte también suma para el cuaderno.

export interface Insignia {
  id: string
  emoji: string
  nombre: string
  descripcion: string
  /** null = conseguida; si no, texto de qué falta */
  progreso: string | null
}

const NORTE = new Set(['Galicia', 'Asturias', 'Cantabria', 'País Vasco'])
const MEDITERRANEO = new Set(['Cataluña', 'Comunitat Valenciana', 'Murcia', 'Islas Baleares'])
const ISLAS = new Set(['Islas Baleares', 'Canarias'])

export function contarReportesLocales(): { total: number; medusas: number } {
  if (typeof window === 'undefined') return { total: 0, medusas: 0 }
  let total = 0, medusas = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k?.startsWith('rep:')) continue
      total++
      if (k.endsWith(':medusas')) medusas++
    }
  } catch {}
  return { total, medusas }
}

export function calcularInsignias(cuaderno: Cuaderno, reportes: { total: number; medusas: number }, top100: Set<string>): Insignia[] {
  const visitas = Object.entries(cuaderno)
  const n = visitas.length
  const comunidades = new Set(visitas.map(([, v]) => v.c).filter(Boolean))
  const provincias = new Set(visitas.map(([, v]) => v.p).filter(Boolean))
  const tieneNorte = [...comunidades].some(c => NORTE.has(c))
  const tieneMed = [...comunidades].some(c => MEDITERRANEO.has(c))
  const nIslas = visitas.filter(([, v]) => ISLAS.has(v.c)).length
  const nTop = visitas.filter(([slug]) => top100.has(slug)).length

  const conteo = (falta: number, unidad: string): string | null =>
    falta <= 0 ? null : `te faltan ${falta} ${unidad}`

  return [
    { id: 'primera-arena', emoji: '🏖️', nombre: 'Primera arena',
      descripcion: 'Tu primera playa en el cuaderno',
      progreso: n >= 1 ? null : 'marca tu primera playa' },
    { id: 'explorador', emoji: '🗺️', nombre: 'Pie de playa',
      descripcion: '5 playas visitadas',
      progreso: conteo(5 - n, n === 4 ? 'playa' : 'playas') },
    { id: 'rumbo-fijo', emoji: '🧭', nombre: 'Rumbo fijo',
      descripcion: '15 playas visitadas',
      progreso: conteo(15 - n, 'playas') },
    { id: 'lobo-de-mar', emoji: '🌊', nombre: 'Lobo de mar',
      descripcion: '30 playas visitadas',
      progreso: conteo(30 - n, 'playas') },
    { id: 'leyenda', emoji: '👑', nombre: 'Leyenda del litoral',
      descripcion: '75 playas visitadas',
      progreso: conteo(75 - n, 'playas') },
    { id: 'tres-provincias', emoji: '📍', nombre: 'Sin fronteras',
      descripcion: 'Playas de 3 provincias distintas',
      progreso: conteo(3 - provincias.size, 'provincias') },
    { id: 'vuelta-espana', emoji: '🚩', nombre: 'Vuelta a España',
      descripcion: 'Playas de 5 comunidades distintas',
      progreso: conteo(5 - comunidades.size, 'comunidades') },
    { id: 'dos-mares', emoji: '⚓', nombre: 'Dos mares',
      descripcion: 'Has pisado el Cantábrico y el Mediterráneo',
      progreso: tieneNorte && tieneMed ? null : tieneNorte ? 'te falta el Mediterráneo' : tieneMed ? 'te falta el norte' : 'te faltan los dos mares' },
    { id: 'isleno', emoji: '🏝️', nombre: 'Isleño',
      descripcion: 'Una playa de Baleares o Canarias',
      progreso: nIslas >= 1 ? null : 'te falta pisar una isla' },
    { id: 'cazador-top', emoji: '🏆', nombre: 'Cazador del top',
      descripcion: 'Una playa del top 100 de España 2026',
      progreso: nTop >= 1 ? null : 'visita una del ranking' },
    { id: 'coleccionista-top', emoji: '💎', nombre: 'Coleccionista',
      descripcion: '10 playas del top 100 de España 2026',
      progreso: conteo(10 - nTop, 'del top 100') },
    { id: 'vigia', emoji: '🔭', nombre: 'Vigía',
      descripcion: 'Tu primer reporte de estado de una playa',
      progreso: reportes.total >= 1 ? null : 'envía un reporte desde una ficha' },
    { id: 'centinela', emoji: '🪼', nombre: 'Centinela de medusas',
      descripcion: 'Avisaste de medusas a otros bañistas',
      progreso: reportes.medusas >= 1 ? null : 'reporta medusas cuando las veas' },
  ]
}
