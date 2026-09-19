// src/lib/guia-municipio.ts — Itinerarios deterministas de 1 día y 3 días.
//
// LA FILOSOFÍA DE ESTE MÓDULO. Nada de prosa generativa. La guía se construye
// eligiendo POIs por reglas mecánicas y ensartándolos por proximidad. Cada
// parada muestra un dato objetivo: nombre + tipo + duración estándar por
// categoría + distancia haversine al siguiente. Si un slot no tiene POI que
// asignarle (p. ej. no hay cines abiertos ese día), el slot se salta — no se
// rellena con «disfruta de la gastronomía local».
//
// POR QUÉ DIFERENTE POR DÍA. Sin tipología por día, la guía de 3 días
// serviría el mismo museo por la mañana los tres días. Cada día tiene una
// intención distinta: casco histórico + comer + baño (día 1), naturaleza +
// segunda playa + mirador (día 2), museo/cultura + comida + despedida (día 3).
// Con esa restricción, los POIs se distribuyen sin repeticiones y la guía
// tiene el ritmo que una guía real tendría.
//
// LOS TIEMPOS SON HEURÍSTICOS, NO VERIFICADOS. Duración media por
// categoría; nunca horario de apertura, que la ficha real de OSM rara vez
// lleva. El pie de la guía deja claro que hay que verificar antes de ir.

import type { MunicipioPois, Poi } from './municipio-pois'
import type { Playa } from '@/types'

// —————————————————————————————————————————————————————————————
// Utilidades geométricas
// —————————————————————————————————————————————————————————————

/** Metros entre dos puntos, esferoide simplificado (Haversine). */
export function distanciaMetros(la1: number, lo1: number, la2: number, lo2: number): number {
  const R = 6371000
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(la2 - la1)
  const dLon = rad(lo2 - lo1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** Cadena "800 m a pie · 11 min" o "5 km · coche". Punto de corte razonable
 *  para andar: 1.5 km, que es más o menos 20 min a paso de paseo. */
export function describirTraslado(metros: number): string {
  if (metros < 1500) {
    const min = Math.max(1, Math.round(metros / 75))     // 75 m/min = ~4,5 km/h
    return `${Math.round(metros)} m a pie · ${min} min`
  }
  const km = (metros / 1000).toFixed(1).replace('.', ',')
  if (metros < 4000) return `${km} km · autobús o taxi`
  return `${km} km · coche`
}

// —————————————————————————————————————————————————————————————
// Reglas de selección
// —————————————————————————————————————————————————————————————

/** Prioriza POIs con artículo en Wikipedia (proxy de «icónico»). Cuando la
 *  fuente no lo lleva se conserva el orden original: OSM ya suele ir por
 *  relevancia. */
function ranked(pois: Poi[]): Poi[] {
  return [...pois].sort((a, b) => {
    const aw = a.wikipedia ? 1 : 0
    const bw = b.wikipedia ? 1 : 0
    return bw - aw
  })
}

/** Duración estándar por tipo de POI. Son medianas de guías reales, no
 *  compromiso — el pie deja claro que se ajuste al ritmo del viajero. */
const DURACION: Record<string, number> = {
  Museo:            90,
  Galería:          60,
  Acuario:          90,
  Zoo:              120,
  Atracción:        45,
  Mirador:          30,
  Faro:             30,
  Molino:           20,
  'Molino de agua': 20,
  Muelle:           30,
  Teatro:           120,
  Cine:             120,
  'Centro cultural':60,
  Biblioteca:       30,
  Castillo:         75,
  Fortificación:    90,
  Monumento:        30,
  Memorial:         15,
  Iglesia:          30,
  Catedral:         45,
  Ruinas:           30,
  Yacimiento:       45,
  Torre:            30,
  Parque:           60,
  Jardín:           90,
}
const DURACION_DEFECTO = 45
const DURACION_PLAYA_H = 3     // baño típico de tarde
const DURACION_COMIDA = 90
const DURACION_CENA = 90

function duracionMin(tipo: string): number {
  return DURACION[tipo] ?? DURACION_DEFECTO
}

// —————————————————————————————————————————————————————————————
// Tipos de la salida
// —————————————————————————————————————————————————————————————

export interface Parada {
  hora: string                    // "10:00"
  nombre: string
  tipo: string                    // etiqueta de chip
  duracionMin: number
  slug?: string                   // href si es playa
  href?: string                   // Google Maps al POI, o link externo
  wikipedia?: string
  pmr?: boolean
  playa?: boolean                 // banderas para la ficha en vez de mapa externo
  banderaAzul?: boolean
  socorrismo?: boolean
  trasladoDescripcion?: string    // al siguiente slot
}

export interface Guia {
  titulo: string
  subtitulo?: string
  paradas: Parada[]
}

// —————————————————————————————————————————————————————————————
// Formato de horas mecánico
// —————————————————————————————————————————————————————————————

function hhmm(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Encadenar paradas: hora inicial fija; cada parada ocupa su duración; la
 *  distancia al siguiente se añade como texto informativo (no suma tiempo,
 *  para no acumular errores). Última parada no lleva traslado. */
function encadenar(
  paradasSinHora: Omit<Parada, 'hora' | 'trasladoDescripcion'>[],
  horaInicioMin: number,
): Parada[] {
  const out: Parada[] = []
  let ahora = horaInicioMin
  for (let i = 0; i < paradasSinHora.length; i++) {
    const p = paradasSinHora[i]
    const sig = paradasSinHora[i + 1]
    let trasladoTxt: string | undefined
    if (sig && typeof (p as any).lat === 'number' && typeof (sig as any).lat === 'number') {
      const d = distanciaMetros((p as any).lat, (p as any).lng, (sig as any).lat, (sig as any).lng)
      if (d > 30) trasladoTxt = describirTraslado(d)
    }
    out.push({
      ...(p as Parada),
      hora: hhmm(ahora),
      trasladoDescripcion: trasladoTxt,
    })
    // Avanzamos el reloj: duración de la parada + una holgura fija de 15 min
    // por traslado (no depende de la distancia real; una guía no es un plano
    // de metro y sobrestimar es peor que subestimar a esta escala).
    ahora += p.duracionMin + (sig ? 15 : 0)
  }
  return out
}

// —————————————————————————————————————————————————————————————
// Utilidades de mapping: Poi/Playa → Parada bruta
// —————————————————————————————————————————————————————————————

// Extendemos la parada con lat/lng temporalmente para poder calcular la
// distancia al siguiente en encadenar(); no salen al consumidor.
type ParadaCruda = Omit<Parada, 'hora' | 'trasladoDescripcion'> & { lat: number; lng: number }

function paradaDePoi(p: Poi, duracion?: number): ParadaCruda {
  return {
    nombre: p.nombre,
    tipo: p.tipo,
    duracionMin: duracion ?? duracionMin(p.tipo),
    href: p.website ?? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`,
    wikipedia: p.wikipedia,
    pmr: p.pmr,
    lat: p.lat,
    lng: p.lng,
  }
}

function paradaDePlaya(p: Playa, tipo = 'Baño', duracion = DURACION_PLAYA_H * 60): ParadaCruda {
  return {
    nombre: p.nombre,
    tipo,
    duracionMin: duracion,
    playa: true,
    slug: p.slug,
    banderaAzul: !!p.bandera,
    socorrismo: !!p.socorrismo,
    lat: p.lat,
    lng: p.lng,
  }
}

/** Coge el POI más próximo a `ref` de una lista, sin repetir los ya usados.
 *  Devuelve null cuando la lista queda vacía. */
function cercano(pool: Poi[], ref: { lat: number; lng: number } | null, usados: Set<string>): Poi | null {
  const libres = pool.filter(p => !usados.has(p.nombre))
  if (!libres.length) return null
  if (!ref) return libres[0]
  let best = libres[0]
  let bestD = distanciaMetros(ref.lat, ref.lng, best.lat, best.lng)
  for (let i = 1; i < libres.length; i++) {
    const d = distanciaMetros(ref.lat, ref.lng, libres[i].lat, libres[i].lng)
    if (d < bestD) { best = libres[i]; bestD = d }
  }
  return best
}

// —————————————————————————————————————————————————————————————
// Guía de 1 día
// —————————————————————————————————————————————————————————————

/** Guía de un día. Slots (todos opcionales; se saltan si falta el dato):
 *   10:00  monumento icónico
 *   11:30  monumento cercano
 *   12:30  museo top
 *   14:15  comida (osmRestaurantes se resuelve fuera; aquí solo playa)
 *   16:00  playa top
 *   19:30  faro o mirador (atardecer)
 *   20:30  cena (no la resolvemos aquí — es una etiqueta genérica). */
export function guiaUnDia(
  pois: MunicipioPois,
  topPlaya: Playa | null,
): Guia {
  const paradas: ParadaCruda[] = []
  const usados = new Set<string>()

  const monumentos = ranked(pois.monumentos)
  const museos = ranked(pois.museos)
  const miradores = ranked(pois.miradores)

  // Slot 1: monumento con más peso.
  if (monumentos[0]) {
    paradas.push(paradaDePoi(monumentos[0]))
    usados.add(monumentos[0].nombre)
  }

  // Slot 2: segundo monumento, el más cercano al primero.
  const monCerca = cercano(monumentos, paradas[paradas.length - 1] ?? null, usados)
  if (monCerca) {
    paradas.push(paradaDePoi(monCerca))
    usados.add(monCerca.nombre)
  }

  // Slot 3: museo, elegido por peso Wikipedia.
  if (museos[0]) {
    paradas.push(paradaDePoi(museos[0]))
    usados.add(museos[0].nombre)
  }

  // Slot 4: playa (con horas de tarde).
  if (topPlaya) paradas.push(paradaDePlaya(topPlaya))

  // Slot 5: mirador o faro (para el atardecer).
  const mir = cercano(miradores, paradas[paradas.length - 1] ?? null, usados)
  if (mir) {
    paradas.push(paradaDePoi(mir))
    usados.add(mir.nombre)
  }

  // Hora inicial: 10:00.
  return {
    titulo: '1 día',
    subtitulo: 'Cómo aprovechar la ciudad en una jornada',
    paradas: encadenar(paradas, 10 * 60),
  }
}

// —————————————————————————————————————————————————————————————
// Guía de 3 días
// —————————————————————————————————————————————————————————————

/** Guía de tres días con tipología distinta por día. Slots:
 *   Día 1 (Casco histórico): 2 monumentos → museo top → playa 1ª
 *   Día 2 (Naturaleza y aire libre): jardín/parque → playa 2ª → mirador
 *   Día 3 (Cultura y despedida): 2 museos → playa 3ª → faro
 *
 *  Cuando no hay dato para un slot, el slot desaparece. Cuando no hay
 *  segunda o tercera playa distinta a la del día anterior, se reutiliza la
 *  mejor con un turno horario distinto. */
export function guiaTresDias(
  pois: MunicipioPois,
  playas: Playa[],
): Guia[] {
  const usadosGlobal = new Set<string>()
  const monumentos = ranked(pois.monumentos)
  const museos = ranked(pois.museos)
  const parques = ranked([...pois.parques])
  const miradores = ranked(pois.miradores)
  const usarPoi = (p: Poi | null) => { if (p) usadosGlobal.add(p.nombre); return p }

  // Playas por diversidad geográfica: la mejor, la más alejada de esa, y la
  // tercera más alejada del promedio. Sin sofisticaciones — con haversine
  // basta para no acabar en la misma cala tres veces.
  const playasDif = elegirPlayasDiferentes(playas, 3)

  // ── DÍA 1 ────────────────────────────────────────────────────
  const d1: ParadaCruda[] = []
  const m1a = usarPoi(monumentos[0]); if (m1a) d1.push(paradaDePoi(m1a))
  const m1b = usarPoi(cercano(monumentos, d1[d1.length - 1] ?? null, usadosGlobal))
  if (m1b) d1.push(paradaDePoi(m1b))
  const mus1 = usarPoi(museos[0]); if (mus1) d1.push(paradaDePoi(mus1))
  if (playasDif[0]) d1.push(paradaDePlaya(playasDif[0], 'Baño', 60))   // el día 1 la playa es corta: la ciudad manda

  // ── DÍA 2 ────────────────────────────────────────────────────
  const d2: ParadaCruda[] = []
  const par2 = usarPoi(parques[0]); if (par2) d2.push(paradaDePoi(par2))
  if (playasDif[1]) d2.push(paradaDePlaya(playasDif[1]))
  const mir2 = usarPoi(cercano(miradores, d2[d2.length - 1] ?? null, usadosGlobal))
  if (mir2) d2.push(paradaDePoi(mir2))

  // ── DÍA 3 ────────────────────────────────────────────────────
  const d3: ParadaCruda[] = []
  const mus3a = usarPoi(museos.find(m => !usadosGlobal.has(m.nombre)) ?? null)
  if (mus3a) d3.push(paradaDePoi(mus3a))
  const mus3b = usarPoi(museos.find(m => !usadosGlobal.has(m.nombre)) ?? null)
  if (mus3b) d3.push(paradaDePoi(mus3b))
  if (playasDif[2] ?? playasDif[0]) d3.push(paradaDePlaya(playasDif[2] ?? playasDif[0]))
  const faro3 = usarPoi(miradores.find(m => m.tipo === 'Faro' && !usadosGlobal.has(m.nombre)) ?? cercano(miradores, d3[d3.length - 1] ?? null, usadosGlobal))
  if (faro3) d3.push(paradaDePoi(faro3))

  return [
    { titulo: 'Día 1', subtitulo: 'Casco histórico',           paradas: encadenar(d1, 10 * 60) },
    { titulo: 'Día 2', subtitulo: 'Naturaleza y aire libre',    paradas: encadenar(d2, 10 * 60) },
    { titulo: 'Día 3', subtitulo: 'Cultura y despedida',        paradas: encadenar(d3, 10 * 60) },
  ]
}

/** Selecciona hasta N playas del listado que estén lo más dispersas posible.
 *  Empieza por la mejor equipada y añade la más lejana a las ya elegidas.
 *  Cuando no hay dispersión, devuelve simplemente las N primeras. */
function elegirPlayasDiferentes(playas: Playa[], n: number): Playa[] {
  if (!playas.length) return []
  const equipadas = [...playas].sort((a, b) =>
    ((b.bandera ? 5 : 0) + (b.socorrismo ? 2 : 0) + (b.accesible ? 1 : 0) + (b.parking ? 1 : 0)) -
    ((a.bandera ? 5 : 0) + (a.socorrismo ? 2 : 0) + (a.accesible ? 1 : 0) + (a.parking ? 1 : 0)))
  const salida: Playa[] = [equipadas[0]]
  while (salida.length < n && equipadas.length > salida.length) {
    let bestIdx = -1
    let bestMinD = -1
    for (let i = 1; i < equipadas.length; i++) {
      if (salida.includes(equipadas[i])) continue
      let minD = Infinity
      for (const s of salida) {
        const d = distanciaMetros(equipadas[i].lat, equipadas[i].lng, s.lat, s.lng)
        if (d < minD) minD = d
      }
      if (minD > bestMinD) { bestMinD = minD; bestIdx = i }
    }
    if (bestIdx >= 0) salida.push(equipadas[bestIdx])
    else break
  }
  return salida
}
