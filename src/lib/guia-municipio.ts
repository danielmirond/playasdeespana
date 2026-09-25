// src/lib/guia-municipio.ts — Itinerarios deterministas de 1 día y 3 días.
//
// LA FILOSOFÍA. Nada de prosa generativa: la guía elige sitios por reglas y
// los ensarta por proximidad. Cada parada lleva un dato objetivo: nombre,
// tipo, duración típica de su categoría y distancia real a la siguiente.
// Si un hueco no tiene sitio que ponerle, el hueco desaparece.
//
// LO QUE FALLABA (medido en Gijón, Tarifa, Cadaqués, Sanxenxo, Torrevieja):
// el orden lo decidía solo «tiene Wikipedia», así que el «casco histórico»
// eran un memorial y una chimenea; las playas se elegían por dispersión
// máxima, lo que mandaba a Aboño o Atlanterra a 20 km de la ciudad; el
// 1 día y el Día 1 eran la misma lista; el Día 2 desaparecía si no había
// parque; y una «Sala de Exposiciones» a 24 km era la «cultura» del Día 3.
//
// AHORA. Cada día es UN clúster andable: se elige un ancla (el sitio con
// más peso: foto, resumen, artículo) y se completa con lo que queda a paso
// de paseo; el orden dentro del día es el del vecino más próximo. La playa
// de cada día es la más cercana al clúster entre las bien equipadas, no la
// más lejana. Memoriales, galerías, salas y bibliotecas nunca son ancla:
// solo entran si están de camino. Hay hueco de comida cuando la mañana
// llega a las 13:30 y la playa ocupa la tarde entera.
//
// LOS TIEMPOS SON HEURÍSTICOS: duración mediana por categoría, nunca
// horario de apertura. El pie de la guía lo deja claro.

import type { MunicipioPois, Poi } from './municipio-pois'
import type { Playa } from '@/types'

// —————————————————————————————————————————————————————————————
// Geometría
// —————————————————————————————————————————————————————————————

/** Metros entre dos puntos (Haversine). */
export function distanciaMetros(la1: number, lo1: number, la2: number, lo2: number): number {
  const R = 6371000
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(la2 - la1)
  const dLon = rad(lo2 - lo1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(la1)) * Math.cos(rad(la2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** "800 m a pie · 11 min", "2,5 km · autobús o taxi" o "9 km · coche". */
export function describirTraslado(metros: number): string {
  if (metros < 1500) {
    const min = Math.max(1, Math.round(metros / 75))     // ~4,5 km/h
    return `${Math.round(metros)} m a pie · ${min} min`
  }
  const km = (metros / 1000).toFixed(1).replace('.', ',')
  if (metros < 4000) return `${km} km · autobús o taxi`
  return `${km} km · coche`
}

/** Minutos de traslado que suma el reloj. Andando 75 m/min; a partir de
 *  1,5 km se supone transporte y se cuenta 10 min fijos + 1 min por km. */
function minutosTraslado(metros: number): number {
  if (metros < 60) return 0
  if (metros < 1500) return Math.ceil(metros / 75)
  return 10 + Math.ceil(metros / 1000)
}

type Punto = { lat: number; lng: number }
const dist = (a: Punto, b: Punto) => distanciaMetros(a.lat, a.lng, b.lat, b.lng)

// —————————————————————————————————————————————————————————————
// Reglas de selección
// —————————————————————————————————————————————————————————————

/** Radio de un clúster: lo que se anda en una mañana sin coger nada. */
const RADIO_CLUSTER_M = 1500
/** Hasta dónde se va a la playa desde el clúster antes de preferir otra. */
const RADIO_PLAYA_M = 6000

/** Tipos que nunca abren un día. Entran solo si están de camino. */
const NO_ANCLA = /^(Memorial|Galer[ií]a|Sala|Centro cultural|Biblioteca|Molino|Molino de agua|Muelle|Atracción|Cine|Teatro)$/i
/** Nombres que delatan un sitio menor aunque el tipo sea «Monumento». */
const NOMBRE_MENOR = /\b(ruins of|restos de|sala de exposiciones|exposicion|capilla|ermita de|fuente|cruz|cruceiro|lavadero|puente|escultura|estatua|mural)\b/i

/** Peso editorial: con qué contarse (foto, resumen), luego artículo, luego web. */
function peso(p: Poi): number {
  let n = (p.foto ? 4 : 0) + (p.resumen ? 3 : 0) + (p.wikipedia ? 2 : 0) + (p.website ? 1 : 0)
  if (/^(Castillo|Fortificación|Catedral|Faro)$/i.test(p.tipo)) n += 2
  if (/^(Ruinas|Yacimiento)$/i.test(p.tipo)) n -= 1        // a igualdad, antes el museo que el pozo
  if (NOMBRE_MENOR.test(p.nombre)) n -= 3
  return n
}

// Un mirador no abre el día: es la parada de la tarde. Ancla solo si no hay otra cosa.
const esAncla = (p: Poi) => !NO_ANCLA.test(p.tipo) && p.tipo !== 'Mirador' && !NOMBRE_MENOR.test(p.nombre) && peso(p) >= 2
const esMirador = (p: Poi) => /^(Mirador|Faro)$/i.test(p.tipo)
const esMuseo = (p: Poi) => /^(Museo|Acuario|Zoo)$/i.test(p.tipo)
const esParque = (p: Poi) => /^(Parque|Jardín)$/i.test(p.tipo)
const nombreLimpio = (p: Poi) => p.nombre.split(';')[0].split(' / ')[0].trim()

/** Duración típica por tipo (medianas de guías reales). */
const DURACION: Record<string, number> = {
  Museo: 90, Galería: 45, Acuario: 90, Zoo: 120, Atracción: 30,
  Mirador: 30, Faro: 30, Molino: 20, 'Molino de agua': 20, Muelle: 30,
  Teatro: 60, Cine: 120, 'Centro cultural': 45, Biblioteca: 30,
  Castillo: 75, Fortificación: 75, Monumento: 30, Memorial: 15,
  Iglesia: 30, Catedral: 45, Ruinas: 30, Yacimiento: 45, Torre: 30,
  Parque: 60, Jardín: 75,
}
const DURACION_DEFECTO = 40
const DURACION_PLAYA_TARDE = 180
const DURACION_COMIDA = 90
const HORA_INICIO = 10 * 60
const HORA_COMIDA_MIN = 13 * 60 + 30   // si la mañana llega aquí, se come
const HORA_COMIDA_PRONTO = 13 * 60     // y nunca antes de esta: si la mañana acaba antes, hay rato libre

const duracionMin = (tipo: string) => DURACION[tipo] ?? DURACION_DEFECTO

// —————————————————————————————————————————————————————————————
// Tipos de salida
// —————————————————————————————————————————————————————————————

export interface Parada {
  hora: string
  nombre: string
  tipo: string
  duracionMin: number
  slug?: string
  href?: string
  wikipedia?: string
  pmr?: boolean
  playa?: boolean
  banderaAzul?: boolean
  socorrismo?: boolean
  /** Hueco sin sitio concreto (comer). No lleva foto ni enlace. */
  hueco?: boolean
  trasladoDescripcion?: string
}

export interface Guia {
  titulo: string
  subtitulo?: string
  paradas: Parada[]
}

type ParadaCruda = Omit<Parada, 'hora' | 'trasladoDescripcion'> & Punto

function paradaDePoi(p: Poi): ParadaCruda {
  return {
    nombre: nombreLimpio(p), tipo: p.tipo, duracionMin: duracionMin(p.tipo),
    href: p.website ?? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`,
    wikipedia: p.wikipedia, pmr: p.pmr, lat: p.lat, lng: p.lng,
  }
}

function paradaDePlaya(p: Playa, duracion = DURACION_PLAYA_TARDE): ParadaCruda {
  return {
    nombre: p.nombre, tipo: 'Playa', duracionMin: duracion, playa: true, slug: p.slug,
    banderaAzul: !!p.bandera, socorrismo: !!p.socorrismo, lat: p.lat, lng: p.lng,
  }
}

function paradaComer(donde: Punto): ParadaCruda {
  return { nombre: 'Comer', tipo: 'Comida', duracionMin: DURACION_COMIDA, hueco: true, lat: donde.lat, lng: donde.lng }
}

// —————————————————————————————————————————————————————————————
// Reloj
// —————————————————————————————————————————————————————————————

function hhmm(minutos: number): string {
  const h = Math.floor(minutos / 60)
  const m = minutos % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Pone hora a cada parada sumando duración + traslado real. El hueco de
 *  comer va siempre antes de la playa de la tarde (nunca después de tres
 *  horas de arena) y, si no hay playa, cuando la mañana llega a las 13:30.
 *  Nunca antes de las 13:00: si la mañana acaba pronto, el reloj espera. */
function encadenar(lista: ParadaCruda[]): Parada[] {
  // Primera pasada: dónde cae la comida.
  const conComida: ParadaCruda[] = []
  let reloj = HORA_INICIO
  let comido = false
  for (let i = 0; i < lista.length; i++) {
    const p = lista[i]
    if (i > 0 && !comido && (p.playa || reloj >= HORA_COMIDA_MIN)) {
      reloj = Math.max(reloj, HORA_COMIDA_PRONTO) + DURACION_COMIDA
      conComida.push(paradaComer(lista[i - 1]))
      comido = true
    }
    conComida.push(p)
    reloj += p.duracionMin + (lista[i + 1] ? minutosTraslado(dist(p, lista[i + 1])) : 0)
  }
  // Segunda pasada: horas y traslados. La comida está donde la parada
  // anterior, así que esa no pinta traslado y la comida sí.
  const out: Parada[] = []
  reloj = HORA_INICIO
  for (let i = 0; i < conComida.length; i++) {
    const p = conComida[i]
    const sig = conComida[i + 1]
    if (p.hueco) reloj = Math.max(reloj, HORA_COMIDA_PRONTO)
    const { lat: _la, lng: _lo, ...resto } = p
    const d = sig ? dist(p, sig) : 0
    out.push({ ...(resto as Parada), hora: hhmm(reloj), trasladoDescripcion: sig && d > 60 ? describirTraslado(d) : undefined })
    reloj += p.duracionMin + (sig ? minutosTraslado(d) : 0)
  }
  return out
}

// —————————————————————————————————————————————————————————————
// Construcción de clústeres
// —————————————————————————————————————————————————————————————

interface Sel { pois: Poi[]; playas: Playa[]; usados: Set<string> }

const libre = (s: Sel, p: Poi) => !s.usados.has(p.nombre)
const usar = (s: Sel, p: Poi | null | undefined) => { if (p) s.usados.add(p.nombre); return p ?? null }

/** El sitio con más peso que puede abrir un día. */
function ancla(s: Sel, filtro: (p: Poi) => boolean = () => true): Poi | null {
  const cands = s.pois.filter(p => libre(s, p) && esAncla(p) && filtro(p))
  if (!cands.length) cands.push(...s.pois.filter(p => libre(s, p) && !NO_ANCLA.test(p.tipo) && filtro(p)))
  return cands.sort((a, b) => peso(b) - peso(a))[0] ?? null
}

/** Rellena alrededor de un ancla con lo que queda a paso de paseo, por
 *  peso; luego ordena la mañana por vecino más próximo desde el ancla. */
function cluster(s: Sel, centro: Poi, maximo: number, evitar: (p: Poi) => boolean = () => false): Poi[] {
  const cerca = s.pois
    .filter(p => libre(s, p) && p !== centro && !evitar(p) && dist(p, centro) <= RADIO_CLUSTER_M)
    .filter(p => (!NO_ANCLA.test(p.tipo) && !NOMBRE_MENOR.test(p.nombre)) || peso(p) >= 4)
    .sort((a, b) => peso(b) - peso(a))
    .slice(0, maximo - 1)
  // Como mucho un mirador por mañana: tres seguidos no son un casco.
  let mirs = esMirador(centro) ? 1 : 0
  const filtrada = cerca.filter(p => !esMirador(p) || mirs++ < 1)
  const restantes = [...filtrada]
  const orden: Poi[] = [centro]
  while (restantes.length) {
    const ult = orden[orden.length - 1]
    restantes.sort((a, b) => dist(a, ult) - dist(b, ult))
    orden.push(restantes.shift()!)
  }
  orden.forEach(p => usar(s, p))
  return orden
}

const equipamiento = (p: Playa) => (p.bandera ? 5 : 0) + (p.socorrismo ? 2 : 0) + (p.accesible ? 1 : 0) + (p.parking ? 1 : 0)

/** La playa del día: la más cercana al punto de las bien equipadas, sin
 *  repetir. Si ninguna queda a menos de 6 km: null en modo estricto, y si
 *  no, la más cercana a secas (nunca «la mejor» a 20 km). */
function playaCerca(s: Sel, ref: Punto, usadas: Set<string>, estricto = true): Playa | null {
  const libres = s.playas.filter(p => !usadas.has(p.slug))
  if (!libres.length) return null
  const cercanas = libres.filter(p => dist(p, ref) <= RADIO_PLAYA_M)
  if (!cercanas.length && estricto) return null
  const pool = cercanas.length ? cercanas : [libres.sort((a, b) => dist(a, ref) - dist(b, ref))[0]]
  // Equipamiento manda, y a igualdad, la más cercana.
  pool.sort((a, b) => (equipamiento(b) - equipamiento(a)) || (dist(a, ref) - dist(b, ref)))
  // Entre las de equipamiento máximo, no vale irse 4 km más lejos por un parking.
  const top = equipamiento(pool[0])
  const elegida = pool.filter(p => equipamiento(p) >= top - 1).sort((a, b) => dist(a, ref) - dist(b, ref))[0]
  usadas.add(elegida.slug)
  return elegida
}

/** El mirador o faro más cercano a un punto, a menos de 3 km. */
function miradorCerca(s: Sel, ref: Punto, maxM = 3000): Poi | null {
  const cands = s.pois.filter(p => libre(s, p) && esMirador(p) && dist(p, ref) <= maxM)
  cands.sort((a, b) => dist(a, ref) - dist(b, ref))
  return usar(s, cands[0])
}

function nuevaSel(pois: MunicipioPois, playas: Playa[]): Sel {
  return {
    pois: [...pois.monumentos, ...pois.museos, ...pois.miradores, ...pois.parques, ...pois.cultura],
    playas,
    usados: new Set(),
  }
}

// —————————————————————————————————————————————————————————————
// Guía de 1 día: lo imprescindible, andando
// —————————————————————————————————————————————————————————————

/** Un día: el sitio con más peso y lo que hay a su alrededor (hasta 3 sitios
 *  por la mañana), comer, la playa más cercana a ese casco por la tarde y,
 *  si lo hay, un mirador o faro cerca de la playa para acabar. */
export function guiaUnDia(pois: MunicipioPois, _topPlaya: Playa | null, playas: Playa[] = _topPlaya ? [_topPlaya] : []): Guia {
  const s = nuevaSel(pois, playas)
  const paradas: ParadaCruda[] = []
  const a = ancla(s)
  if (a) cluster(s, a, 3).forEach(p => paradas.push(paradaDePoi(p)))
  const ref: Punto = paradas[paradas.length - 1] ?? { lat: pois.lat, lng: pois.lng }
  const playa = playaCerca(s, ref, new Set(), false)
  if (playa) {
    paradas.push(paradaDePlaya(playa))
    const m = miradorCerca(s, playa)
    if (m) paradas.push(paradaDePoi(m))
  }
  return { titulo: '1 día', subtitulo: 'Lo imprescindible, andando', paradas: encadenar(paradas) }
}

// —————————————————————————————————————————————————————————————
// Guía de 3 días: tres zonas distintas
// —————————————————————————————————————————————————————————————

/** Tres días, cada uno una zona:
 *   Día 1 · el casco: ancla de más peso + hasta 3 sitios andando + playa
 *           más cercana por la tarde.
 *   Día 2 · de playa: la mejor playa que no sea la del día 1, con un
 *           parque, mirador o faro a menos de 3 km; si no hay nada, la
 *           mañana es un segundo mirador o un museo y la tarde la playa.
 *   Día 3 · otra zona: un ancla lejos del casco del día 1 (>1,8 km) o, si
 *           el pueblo es pequeño, lo mejor que quedó sin ver; playa
 *           cercana; faro para despedirse.
 *  Un día con menos de 3 paradas no se pinta (lo filtra la página). */
export function guiaTresDias(pois: MunicipioPois, playas: Playa[]): Guia[] {
  const s = nuevaSel(pois, playas)
  const playasUsadas = new Set<string>()
  const centro: Punto = { lat: pois.lat, lng: pois.lng }

  // ── Día 1 · el casco ─────────────────────────────────────────
  const d1: ParadaCruda[] = []
  const a1 = ancla(s)
  const c1 = a1 ? cluster(s, a1, 4) : []
  c1.forEach(p => d1.push(paradaDePoi(p)))
  const ref1: Punto = d1[d1.length - 1] ?? centro
  const p1 = playaCerca(s, ref1, playasUsadas, false)
  if (p1) d1.push(paradaDePlaya(p1))

  // ── Día 2 · de playa ─────────────────────────────────────────
  const d2: ParadaCruda[] = []
  // La mejor playa que quede, medida desde el pueblo (no desde el casco).
  const p2 = playaCerca(s, centro, playasUsadas, false) ?? p1
  if (p2) {
    const manana = [
      usar(s, s.pois.filter(p => libre(s, p) && esParque(p) && dist(p, p2) <= 3000).sort((a, b) => peso(b) - peso(a))[0]),
      miradorCerca(s, p2),
    ].filter((p): p is Poi => !!p)
    if (!manana.length) {
      // Sin nada junto a la playa: una mañana corta en el sitio con más peso
      // que quede (museo o monumento), y luego la playa.
      const alt = usar(s, ancla(s, p => esMuseo(p) || esMirador(p)) ?? ancla(s))
      if (alt) manana.push(alt)
    }
    manana.sort((a, b) => dist(a, p2) - dist(b, p2)).reverse()   // lo más lejos primero, se acaba en la playa
    manana.forEach(p => d2.push(paradaDePoi(p)))
    d2.push(paradaDePlaya(p2, 240))                               // día de playa: la tarde entera
    const fin = miradorCerca(s, p2)
    if (fin) d2.push(paradaDePoi(fin))
  }

  // ── Día 3 · otra zona ────────────────────────────────────────
  const d3: ParadaCruda[] = []
  const lejosDelCasco = (p: Poi) => !a1 || dist(p, a1) > RADIO_CLUSTER_M
  const a3 = ancla(s, lejosDelCasco) ?? ancla(s)
  if (a3) {
    cluster(s, a3, 3).forEach(p => d3.push(paradaDePoi(p)))
    const ref3: Punto = d3[d3.length - 1]
    const p3 = playaCerca(s, ref3, playasUsadas) ?? p1
    if (p3) {
      d3.push(paradaDePlaya(p3, 150))
      const faro = usar(s, s.pois.filter(p => libre(s, p) && p.tipo === 'Faro').sort((a, b) => dist(a, p3) - dist(b, p3))[0])
        ?? miradorCerca(s, p3)
      if (faro) d3.push(paradaDePoi(faro))
    }
  }

  return [
    { titulo: 'Día 1', subtitulo: a1 ? `El casco, alrededor de ${nombreLimpio(a1)}` : 'El casco', paradas: encadenar(d1) },
    { titulo: 'Día 2', subtitulo: p2 ? `De playa en ${p2.nombre}` : 'De playa', paradas: encadenar(d2) },
    { titulo: 'Día 3', subtitulo: a3 && a3 !== a1 && lejosDelCasco(a3) ? `Otra zona: ${nombreLimpio(a3)}` : 'Lo que quedó por ver', paradas: encadenar(d3) },
  ]
}
