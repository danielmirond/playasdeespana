// src/lib/barcos-municipio.ts — qué se puede contar de una salida en barco
// desde un municipio, con datos que ya tenemos.
//
// POR QUÉ. Las landings de alquiler de SamBoat y Click&Boat rellenan con
// cómo llegar por autopista y con la temperatura media anual. Ninguna dice
// desde qué puerto se sale, dónde hay fondeo balizado o qué viento estropea
// el día. Nosotros tenemos las tres cosas playa a playa, de MITECO, y el
// viento con nombre por zona. Ahí está la única ventaja defendible: ellos
// tienen el inventario, nosotros la costa.
//
// LO QUE SE INVENTA: nada. Cada frase de la página sale de un campo. Si un
// municipio no tiene fondeo balizado en los datos, no se dice que lo tenga
// ni se rellena con una frase equivalente: se calla ese bloque. Por eso
// unas páginas son más largas que otras, y está bien que lo sean.
import samboatData from '@/data/samboat-municipios.json'
import type { Playa } from '@/types'
import { vientosDeLaZona } from '@/lib/vientos'

export interface SamboatMunicipio {
  municipio: string
  nombre: string
  provincia: string
  playas: number
  samboat: string
  url: string
  /** Barcos que SamBoat lista en la zona, no solo dentro del término. */
  barcos: number
  precioMin: number | null
  conPatron: number
  /** 'obligatoria' → allí no alquilan sin titulación; 'opcional' → hay de las dos. */
  licencia: 'obligatoria' | 'opcional' | null
  tipos: string[]
}

const DATOS = samboatData as { actualizado: string; municipios: SamboatMunicipio[] }
const POR_SLUG = new Map(DATOS.municipios.map(m => [m.municipio, m]))

export const ACTUALIZADO_SAMBOAT = DATOS.actualizado
export const MUNICIPIOS_CON_BARCOS = DATOS.municipios

export const datosSamboat = (slug: string): SamboatMunicipio | null => POR_SLUG.get(slug) ?? null
export const tieneBarcos = (slug: string): boolean => POR_SLUG.has(slug)

export interface Puerto { nombre: string; km: number | null; playas: number }
export interface PlayaBarco { slug: string; nombre: string; nota?: string }

export interface CostaEnBarco {
  puertos: Puerto[]
  /** Playas con zona de fondeo balizada en la ficha de MITECO. */
  fondeo: PlayaBarco[]
  /** Playas cuyo acceso a pie es difícil o que solo se alcanzan por mar. */
  soloPorMar: PlayaBarco[]
  protegidas: PlayaBarco[]
  /** Playas con alquiler náutico en la propia arena (kayak, paddle, motos). */
  alquilerEnLaArena: PlayaBarco[]
  /** Las que suelen tener mar o viento: el aviso honesto antes de reservar. */
  expuestas: PlayaBarco[]
  vientos: Array<{ nombre: string; efecto: string; umbral: number }>
  /**
   * Cómo se llama aquí la pradera que no hay que arar con el ancla. La
   * posidonia es mediterránea: decírselo a alguien que fondea en la ría de
   * Pontevedra delata que el texto está hecho con plantilla. En Canarias son
   * sebadales, y en el Atlántico y el Cantábrico, praderas marinas.
   */
  pradera: string
}

const KM = (x: string | undefined): number | null => {
  if (!x) return null
  const n = parseFloat(String(x).replace(',', '.').replace(/[^\d.]/g, ''))
  return Number.isFinite(n) ? n : null
}

const ref = (p: Playa, nota?: string): PlayaBarco => ({ slug: p.slug, nombre: p.nombre, nota })

/**
 * MITECO trae la misma playa dos veces con la grafía de dos administraciones
 * —«El Cura» y «Platja del Cura», «Montalvo» y «Praia de Montalbo»— y
 * `duplicados.json` solo cubre las que alguien ha ido cazando a mano. En una
 * lista corrida eso se lee fatal: «El Cura, Platja del Cura y Los Náufragos»
 * parecen tres sitios y son dos. Se comparan sin el sustantivo genérico
 * (playa, praia, platja, cala…), sin artículos y con b y v igualadas, que es
 * justo donde discrepan las dos grafías; se conserva el nombre más corto.
 */
const GENERICO = /^(playa|praia|platja|platya|cala|caleta|el|la|els|les|los|las|de|del|d|dels|des|es|sa|s)$/
const clave = (nombre: string) => nombre
  .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .split(/[^a-z0-9]+/).filter(w => w && !GENERICO.test(w))
  .join('-').replace(/b/g, 'v')

function sinDuplicados(items: PlayaBarco[]): PlayaBarco[] {
  const vistos = new Map<string, PlayaBarco>()
  for (const it of items) {
    const k = clave(it.nombre)
    const previo = vistos.get(k)
    if (!previo || it.nombre.length < previo.nombre.length) vistos.set(k, it)
  }
  return [...vistos.values()]
}

/**
 * Ordena por lo que le importa a quien va en barco: primero lo que está más
 * cerca del puerto del que sale. A falta de distancia real por mar, el
 * criterio es el nombre, que al menos es estable entre renders.
 */
const porNombre = (a: PlayaBarco, b: PlayaBarco) => a.nombre.localeCompare(b.nombre, 'es')

export function costaEnBarco(playas: Playa[]): CostaEnBarco {
  const puertos = new Map<string, { km: number | null; playas: number }>()
  for (const p of playas) {
    const nombre = (p as unknown as { puerto_deportivo?: string }).puerto_deportivo
    if (!nombre) continue
    const km = KM((p as unknown as { puerto_dist?: string }).puerto_dist)
    const cur = puertos.get(nombre) ?? { km: null, playas: 0 }
    cur.playas++
    if (km != null && (cur.km == null || km < cur.km)) cur.km = km
    puertos.set(nombre, cur)
  }

  const campo = <T,>(k: string) => (p: Playa) => (p as unknown as Record<string, T>)[k]
  const acceso = campo<string>('forma_acceso')
  const cond = campo<string>('condiciones')

  const centro = playas.find(p => p.lat && p.lng)

  return {
    puertos: [...puertos.entries()]
      .map(([nombre, v]) => ({ nombre, km: v.km, playas: v.playas }))
      .sort((a, b) => b.playas - a.playas || (a.km ?? 99) - (b.km ?? 99))
      .slice(0, 4),
    fondeo: sinDuplicados(playas.filter(p => campo<boolean>('zona_fondeo')(p) === true).map(p => ref(p))).sort(porNombre),
    // «Barco» en `forma_acceso` es literal en MITECO: son playas a las que no
    // se llega de otra forma, o a las que llegar a pie es una caminata. Es el
    // argumento de venta más honesto que tenemos, porque es el único que
    // describe algo que solo se consigue con barco.
    soloPorMar: sinDuplicados(playas
      .filter(p => /barco/i.test(acceso(p) ?? '') || /muy dif|dif[ií]cil/i.test(acceso(p) ?? ''))
      .map(p => ref(p, /barco/i.test(acceso(p) ?? '') ? 'también por mar' : 'a pie, difícil')))
      .sort(porNombre),
    protegidas: sinDuplicados(playas.filter(p => campo<boolean>('espacio_protegido')(p) === true).map(p => ref(p))).sort(porNombre),
    alquilerEnLaArena: sinDuplicados(playas.filter(p => campo<boolean>('alquiler_nautico')(p) === true).map(p => ref(p))).sort(porNombre),
    expuestas: sinDuplicados(playas
      .filter(p => /fuerte|ventosa/i.test(cond(p) ?? ''))
      .map(p => ref(p, (cond(p) ?? '').toLowerCase())))
      .sort(porNombre),
    vientos: centro ? vientosDeLaZona(centro.lat, centro.lng) : [],
    pradera: !centro ? 'praderas marinas'
      : centro.lat < 29.5 ? 'sebadales'
      : centro.lng > -5.6 ? 'praderas de posidonia'
      : 'praderas marinas',
  }
}

/** «0,05 km» no lo dice nadie: son 50 metros. */
export function distancia(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${String(km).replace('.', ',')} km`
}

/**
 * El enlace de afiliado. `samboatAwinUrl` ya existía para las 21 landings
 * antiguas y se reutiliza tal cual: si algún día se arregla el identificador
 * de Awin —hoy va el literal «playasdeespana» donde Awin espera un número—,
 * se arregla en un solo sitio.
 */
export const clickref = (slug: string) => `playasdeespana_municipio_${slug}`
