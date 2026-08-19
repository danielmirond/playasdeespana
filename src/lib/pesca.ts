// src/lib/pesca.ts — El equipo de pesca que la tabla de mareas justifica.
//
// POR QUÉ ESTÁ AQUÍ Y NO ES UN ANUNCIO PEGADO. Medido sobre 10.000 queries
// reales del competidor: 43.000 búsquedas mensuales con intención explícita
// de pesca conviven con las de mareas —«pesca» 18.480, «solunar» 11.140,
// «caña» 8.280, «pescar» 4.980— y tablademareas.com titula literalmente
// «Tabla de mareas 2026 de Barcelona para ir de pesca». Quien busca la
// pleamar de mañana en Ferrol es, muchas veces, alguien que va a pescar.
//
// El bloque va DESPUÉS de la tabla solunar, no antes: el producto se gana
// estando junto a algo útil. Y solo en las costas con marea de verdad; en
// el Mediterráneo la página ya dice que el mar apenas se mueve y vender
// allí equipo de surfcasting sería incoherente.
//
// LO QUE DEPENDE DE LA MAREA, que es lo que hace que la lista tenga sentido
// en esta página y no en otra: el surfcasting se hace con la marea subiendo,
// el marisqueo y la pesca a pie en bajamar viva, y la roca pide bota de
// vadeo y chaleco porque la marea que sube te deja aislado. Cada ficha dice
// cuándo sirve, no solo qué es.
//
// SIN ASIN, DE MOMENTO. Los enlaces son de BÚSQUEDA
// (`amazon.es/s?k=...&tag=`), que es el mismo respaldo que ya usa
// AsistentePlaya cuando no hay ASIN. Un ASIN inventado o caducado lleva a
// un producto equivocado o a un 404, y eso es peor que no enlazar: aquí la
// credibilidad es el producto. Cuando haya ASINs verificados uno a uno, se
// rellena el campo y el enlace pasa a `/dp/` sin tocar nada más.
import { AMAZON_TAG } from './amazon-productos'

export interface ArticuloPesca {
  nombre: string
  nombreEn: string
  /** Qué resuelve, ligado a la marea. Sin esto es un catálogo cualquiera. */
  cuando: string
  cuandoEn: string
  /** Búsqueda en Amazon. Se usa mientras no haya ASIN verificado. */
  query: string
  /** ASIN verificado a mano. Vacío hasta que alguien lo compruebe. */
  asin?: string
  /** Solo se muestra donde tiene sentido. */
  zonas?: Array<'atlantico' | 'cantabrico' | 'canarias'>
}

export const ARTICULOS_PESCA: ArticuloPesca[] = [
  {
    nombre: 'Caña de surfcasting', nombreEn: 'Surfcasting rod',
    cuando: 'Para la arena con la marea subiendo, que es cuando entra el pescado a comer a la orilla.',
    cuandoEn: 'For the sand on a rising tide, when fish come in to feed close to shore.',
    query: 'caña surfcasting 4.20 m',
  },
  {
    nombre: 'Plomos de agarre', nombreEn: 'Grip leads',
    cuando: 'Imprescindibles con mareas vivas: la corriente se lleva un plomo liso en cuanto empieza a correr.',
    cuandoEn: 'Essential on spring tides: plain leads drag as soon as the current picks up.',
    query: 'plomo agarre surfcasting 150 g',
  },
  {
    nombre: 'Botas de vadeo', nombreEn: 'Wading boots',
    cuando: 'Para la roca y las pozas de bajamar. La marea que sube es la que aísla: sal antes del cambio.',
    cuandoEn: 'For rocks and low-tide pools. The rising tide is what cuts you off: leave before it turns.',
    query: 'botas vadeo pesca suela fieltro',
  },
  {
    nombre: 'Chaleco de flotación', nombreEn: 'Flotation vest',
    cuando: 'Pesca desde roca en costa abierta. En el Cantábrico y en Galicia la mar de fondo entra sin avisar.',
    cuandoEn: 'Rock fishing on open coast. On the Cantabrian and Galician coasts the swell arrives unannounced.',
    query: 'chaleco flotacion pesca roca',
    zonas: ['cantabrico', 'atlantico'],
  },
  {
    nombre: 'Frontal recargable', nombreEn: 'Rechargeable head torch',
    cuando: 'Las mejores pleamares caen de noche media temporada, y el periodo solunar mayor casi siempre pilla oscuro.',
    cuandoEn: 'Half the season the best high tides fall at night, and the major solunar period usually does too.',
    query: 'frontal pesca recargable rojo',
  },
  {
    nombre: 'Rastrillo de marisqueo', nombreEn: 'Clam rake',
    cuando: 'Solo en bajamar viva, y comprobando antes la normativa y el permiso de la comunidad.',
    cuandoEn: 'Only at spring low tide, and check the local licence first.',
    query: 'rastrillo marisqueo almeja',
    zonas: ['atlantico', 'cantabrico'],
  },
]

export function urlPesca(a: ArticuloPesca): string {
  return a.asin
    ? `https://www.amazon.es/dp/${a.asin}?tag=${AMAZON_TAG}`
    : `https://www.amazon.es/s?k=${encodeURIComponent(a.query)}&tag=${AMAZON_TAG}`
}

export function articulosPara(zona: 'atlantico' | 'cantabrico' | 'mediterraneo' | 'canarias'): ArticuloPesca[] {
  if (zona === 'mediterraneo') return []
  return ARTICULOS_PESCA.filter(a => !a.zonas || a.zonas.includes(zona))
}
