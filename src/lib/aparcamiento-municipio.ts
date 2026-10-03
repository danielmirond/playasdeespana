// src/lib/aparcamiento-municipio.ts — a qué playa se puede llegar en coche.
//
// LA PREGUNTA REAL. «Dónde aparcar en Nerja» no la escribe quien busca un
// mapa: la escribe quien sale de casa un domingo de agosto y no quiere dar
// vueltas. La respuesta útil tiene tres partes, y las tres están en los
// datos: a qué playa del pueblo es fácil llegar en coche, dónde se deja
// exactamente, y a cuál conviene ir en autobús porque no hay sitio.
//
// DOS FUENTES QUE SE COMPLEMENTAN. El inventario oficial dice si la playa
// tiene aparcamiento, si está vigilado y de qué tamaño es, en tramos. Eso
// vale para comparar playas entre sí, que es lo que nadie publica junto.
// OpenStreetMap pone encima los aparcamientos concretos, con nombre, si
// son de pago y a cuántos metros de la arena.
//
// LO QUE NO SE PROMETE: ni ocupación en tiempo real, ni precio fiable. Solo
// uno de cada cuatro aparcamientos de OSM trae la tarifa. La página lo dice.
import { cache } from 'react'
import type { Playa } from '@/types'

export interface Aparcamiento {
  nombre: string | null
  metros: number
  /** true de pago, false gratis, null no consta en OpenStreetMap. */
  pago: boolean | null
  plazas: number | null
  tipo: 'superficie' | 'altura' | 'subterraneo' | null
  pmr: boolean
  tarifa: string | null
  maxEstancia: string | null
  lat: number
  lng: number
}

export interface PlayaAparcar {
  slug: string
  nombre: string
  /** Del inventario oficial, no de OSM. */
  tieneAparcamiento: boolean
  vigilado: boolean
  /** «Más de 100 plazas» y similares, tal cual lo publica el inventario. */
  tamano: string | null
  autobus: boolean
  bandera: boolean
  /** Los de OpenStreetMap a menos de 1,2 km. */
  cerca: Aparcamiento[]
  /** Cuanto más alto, más fácil dejar el coche. Solo ordena. */
  facilidad: number
}

interface Sidecar {
  pool: { n?: string | null; f?: 0 | 1; c?: number; t?: string; pmr?: 1; tarifa?: string; max?: string; la: number; lo: number }[]
  playas: Record<string, [number, number][]>
  municipios: Record<string, [number, number][]>
}

let _sidecar: Sidecar | null | undefined
async function getSidecar(): Promise<Sidecar | null> {
  if (_sidecar !== undefined) return _sidecar
  try {
    const { default: data } = await import('@/../public/data/aparcamientos.json', { assert: { type: 'json' } })
    _sidecar = data as unknown as Sidecar
  } catch {
    _sidecar = null
  }
  return _sidecar
}

const expand = (s: Sidecar, i: number, d: number): Aparcamiento => {
  const p = s.pool[i]
  return {
    nombre: p.n ?? null,
    metros: d,
    pago: p.f === undefined ? null : p.f === 1,
    // Una capacidad de dos o tres plazas no describe un aparcamiento: suele
    // ser el hueco reservado que alguien anotó en el nodo. No se enseña.
    plazas: p.c && p.c >= 8 ? p.c : null,
    tipo: (p.t as Aparcamiento['tipo']) ?? null,
    pmr: p.pmr === 1,
    tarifa: p.tarifa ?? null,
    maxEstancia: p.max ?? null,
    lat: p.la,
    lng: p.lo,
  }
}

/** «Más de 100 plazas» → 3. Solo para ordenar; el texto se pinta tal cual. */
function pesoTamano(t: string | null | undefined): number {
  if (!t) return 0
  if (/m[áa]s de 100|150|200/i.test(t)) return 3
  if (/entre 50 y 100/i.test(t)) return 2
  if (/menos de 50/i.test(t)) return 1
  return 0
}

/**
 * Las playas del municipio ordenadas por lo fácil que es dejar el coche, y
 * los aparcamientos que hay junto a cada una.
 *
 * La facilidad no es una nota de la playa: es cuánto cuesta aparcar en
 * ella. Pesa el aparcamiento oficial y su tamaño, suma los de OSM que haya
 * al lado y descuenta nada por no tener: una playa sin aparcamiento pero
 * con autobús se ordena abajo, que es donde tiene que estar, pero se
 * publica igual con su alternativa.
 */
export const aparcamientosDelMunicipio = cache(async (playas: Playa[], slugMunicipio: string): Promise<{
  playas: PlayaAparcar[]
  /** Los del casco urbano, para quien no va a la arena. */
  enElPueblo: Aparcamiento[]
}> => {
  const s = await getSidecar()
  if (!s) return { playas: [], enElPueblo: [] }

  const lista: PlayaAparcar[] = playas.map(p => {
    const clave = `${p.lat.toFixed(4)}:${p.lng.toFixed(4)}`
    const cerca = (s.playas[clave] ?? []).map(([i, d]) => expand(s, i, d))
    const tamano = (p as unknown as { parking_plazas?: string }).parking_plazas ?? null
    // Ojo: el inventario escribe «No vigilado» y «Vigilado», así que buscar
    // «vigilado» a secas daba por vigilados los 1.669 que no lo están.
    const tipoAparcamiento = (p as unknown as { parking_tipo?: string }).parking_tipo ?? ''
    const vigilado = /^\s*vigilado/i.test(tipoAparcamiento)
    const gratis = cerca.filter(a => a.pago === false).length

    const facilidad =
      (p.parking ? 10 : 0) +
      pesoTamano(tamano) * 4 +
      (vigilado ? 3 : 0) +
      Math.min(cerca.length, 4) * 2 +
      gratis * 2

    return {
      slug: p.slug,
      nombre: p.nombre,
      tieneAparcamiento: !!p.parking,
      vigilado,
      tamano,
      autobus: !!(p as unknown as { autobus?: boolean }).autobus,
      bandera: !!p.bandera,
      cerca,
      facilidad,
    }
  })

  lista.sort((a, b) => b.facilidad - a.facilidad || a.nombre.localeCompare(b.nombre))

  // Los del pueblo, quitando los que ya salen pegados a alguna playa.
  const yaSalen = new Set(lista.flatMap(p => p.cerca.map(a => `${a.lat}:${a.lng}`)))
  const enElPueblo = (s.municipios[slugMunicipio] ?? [])
    .map(([i, d]) => expand(s, i, d))
    .filter(a => !yaSalen.has(`${a.lat}:${a.lng}`))
    .slice(0, 6)

  return { playas: lista, enElPueblo }
})

/** Lo que merece una línea propia: tener nombre, o decir algo que ayude a
 *  decidir. Seis «Aparcamiento sin nombre» seguidos no son información, son
 *  ruido; el resto se resume en una frase con el recuento. */
export function reparte(cerca: Aparcamiento[]): { listar: Aparcamiento[]; resto: number; restoGratis: number } {
  const dicenAlgo = cerca.filter(a => a.nombre || a.pago !== null || a.plazas || a.pmr)
  const listar = (dicenAlgo.length ? dicenAlgo : cerca).slice(0, 3)
  const fuera = cerca.filter(a => !listar.includes(a))
  return { listar, resto: fuera.length, restoGratis: fuera.filter(a => a.pago === false).length }
}

/** Se publica cuando hay algo que decidir: dos playas comparables, o
 *  aparcamientos concretos que enseñar. Con menos, la ficha de la playa ya
 *  lo cuenta y esta página sería un eco. */
export const MINIMO_PLAYAS = 3
export async function tieneAparcamiento(playas: Playa[], slug: string): Promise<boolean> {
  if (playas.length < MINIMO_PLAYAS) return false
  const { playas: ps, enElPueblo } = await aparcamientosDelMunicipio(playas, slug)
  const conDato = ps.filter(p => p.tieneAparcamiento || p.cerca.length).length
  return conDato >= 2 || (conDato >= 1 && enElPueblo.length >= 2)
}

/** «1,2 km» o «380 m». */
export const metros = (m: number): string =>
  m >= 1000 ? `${(m / 1000).toFixed(1).replace('.', ',')} km` : `${m} m`
