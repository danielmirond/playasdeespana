// src/lib/ultimo-bueno.ts — El último parte bueno, para no dejar huecos.
//
// EL PROBLEMA. Las fuentes de bandera se resuelven con un plazo de 1.500 ms
// y, en frío, la primera renderización lo pierde. Entonces la ficha dice
// «sin bandera» —que es honesto— y la ISR congela ese hueco una hora. El
// dato existía y estaba a un segundo de distancia: simplemente no llegó.
//
// LA SOLUCIÓN, y su límite. Cada carga con éxito deja una copia en una
// clave de vida larga. Si la siguiente lectura falla, se sirve esa copia.
// Lo que se arrastra es de hace minutos, no de hace días.
//
// POR QUÉ HAY UN TOPE DE EDAD Y NO ES NEGOCIABLE. Arrastrar sin límite
// convierte un fallo de red en una mentira: una bandera verde de ayer
// publicada hoy es exactamente el fallo que este proyecto vino a corregir,
// y la app oficial de Gipuzkoa hace justo esto —pinta gris cuando el parte
// no es de hoy—. El tope son 6 horas: cubre de sobra un fallo puntual y una
// mañana fría, y no llega nunca a cruzar de un día de playa al siguiente.
//
// Y el llamador recibe SIEMPRE la edad, para poder decirla. Un dato viejo
// que dice su edad es información; uno que la calla, un engaño.
// getKV se IMPORTA, ya no se duplica.
//
// Este fichero tenía su propia copia, y la copia se quedó sin la corrección
// que sí recibió la de kv-cache: `import('@vercel/kv')` siempre resuelve
// —el paquete comprueba las variables de entorno al LLAMAR, no al
// cargarse—, así que sin KV quedaba un objeto que parecía válido y lanzaba
// en cada operación. Aquí eso costaba caro: el `Promise.race` de 1.200 ms
// de abajo se pagaba ENTERO, y como las siete fuentes de bandera pasan por
// aquí dentro de una carrera con plazo de 1.500 ms, eran siete promesas
// ocupando la carrera casi completa y estorbando a la meteo, que compite en
// la misma tanda.
//
// Dos copias del mismo ayudante con el mismo fallo es justo cómo se llega
// a esto, así que ahora hay una.
import { kvCached, getKV, makeKey } from './kv-cache'

/**
 * Tope por defecto: 6 h, pensado para las banderas.
 *
 * Una bandera es un ACTO ADMINISTRATIVO: se iza por la mañana y se arría por
 * la tarde, así que la de hace cinco horas suele seguir siendo la de hoy. El
 * viento no es un acto administrativo, y por eso la meteo pasa el suyo por
 * `opts.topeMs` — ver el comentario en `getMeteoPlaya`.
 */
const TOPE_MS = 6 * 60 * 60 * 1000

export interface OpcionesUltimoBueno {
  /** Edad máxima que se puede arrastrar. Por defecto 6 h. */
  topeMs?: number
  /**
   * Meter `partes` en la clave de respaldo.
   *
   * Por defecto NO, y es deliberado: las siete fuentes de bandera guardan un
   * snapshot único por fuente y comparten `ultimo:banderas-and` a propósito.
   * Pero para un dato POR COORDENADA —la meteo— esa clave única sería
   * catastrófica: las 5.098 playas compartirían respaldo y cada una serviría
   * el tiempo de otra. Se activa solo donde hace falta, para no cambiar ni un
   * byte de la clave de las banderas, que funcionan y estamos en agosto.
   */
  porClave?: boolean
}

export interface ConEdad<T> {
  datos: T
  /** Milisegundos desde que se leyó de la fuente. 0 = recién traído. */
  edadMs: number
}

/**
 * Igual que kvCached, pero si la carga falla o vuelve vacía, sirve la
 * última que salió bien —siempre que no pase del tope de edad.
 *
 * `vacio` decide qué cuenta como «no ha traído nada»: cada fuente sabe si
 * un objeto sin claves es una respuesta legítima o un fallo.
 */
export async function cargarConUltimoBueno<T>(
  ns: string,
  partes: Array<string | number>,
  ttl: number,
  cargar: () => Promise<T>,
  vacio: (v: T) => boolean,
  opts: OpcionesUltimoBueno = {},
): Promise<ConEdad<T>> {
  const r = await intentar(ns, partes, ttl, cargar, vacio, opts)
  // Los siete llamadores históricos esperan SIEMPRE un objeto, nunca null.
  return r.datos === null ? { datos: {} as T, edadMs: 0 } : (r as ConEdad<T>)
}

/**
 * Igual, pero devuelve `null` cuando no hay nada — ni fresco ni respaldo
 * válido.
 *
 * Existe porque el `{} as T` del original es una trampa para cualquier
 * llamador que compruebe `!== null`: un objeto vacío pasa el filtro y sigue
 * adelante con todos los campos `undefined`. La ficha hace exactamente esa
 * comprobación para decidir si omite bandera, score, frase y FAQ del schema,
 * y esa cadena de honestidad no se puede romper por comodidad.
 */
export async function cargarConUltimoBuenoONulo<T>(
  ns: string,
  partes: Array<string | number>,
  ttl: number,
  cargar: () => Promise<T | null>,
  vacio: (v: T | null) => boolean,
  opts: OpcionesUltimoBueno = {},
): Promise<ConEdad<T | null>> {
  return intentar(ns, partes, ttl, cargar, vacio, opts)
}

async function intentar<T>(
  ns: string,
  partes: Array<string | number>,
  ttl: number,
  cargar: () => Promise<T | null>,
  vacio: (v: T | null) => boolean,
  opts: OpcionesUltimoBueno,
): Promise<ConEdad<T | null>> {
  const tope = opts.topeMs ?? TOPE_MS
  // Con `makeKey`, no concatenando a mano: redondea las coordenadas a cuatro
  // decimales igual que `kvCached`, y si no coincidieran, la misma playa
  // generaría dos claves —una para el dato fresco y otra para su respaldo— y
  // el respaldo no se encontraría nunca.
  const claveUltimo = opts.porClave ? makeKey(`ultimo:${ns}`, partes) : `ultimo:${ns}`
  try {
    const fresco = await kvCached(ns, partes, ttl, cargar)
    if (!vacio(fresco)) {
      const kv = await getKV()
      if (kv) {
        // AWAIT, nunca fire-and-forget: en serverless un set sin esperar
        // muere con la respuesta y la copia no se escribe jamás.
        await Promise.race([
          kv.set(claveUltimo, { t: Date.now(), d: fresco }, { ex: 60 * 60 * 12 }),
          new Promise(r => setTimeout(r, 1200)),
        ]).catch(() => {})
      }
      return { datos: fresco, edadMs: 0 }
    }
  } catch { /* seguimos al respaldo */ }

  try {
    const kv = await getKV()
    if (!kv) throw new Error('sin kv')
    // Con plazo, como el de kv-cache: un `kv.get` sin límite se come el
    // presupuesto entero de la ficha cuando KV no contesta, y este get se
    // ejecuta justo cuando ya hemos fallado una vez —o sea, en el peor
    // momento posible para esperar ocho segundos más.
    const guardado = await Promise.race([
      kv.get(claveUltimo),
      new Promise<null>(r => setTimeout(() => r(null), 300)),
    ]) as { t: number; d: T } | null
    if (!guardado?.t) throw new Error('sin copia')
    const edadMs = Date.now() - guardado.t
    if (edadMs > tope) throw new Error('demasiado viejo')
    return { datos: guardado.d, edadMs }
  } catch {
    return { datos: null, edadMs: 0 }
  }
}

/** Texto para que la ficha diga la edad en vez de callarla. */
export function textoEdad(edadMs: number, locale: 'es' | 'en' = 'es'): string | null {
  if (edadMs < 60_000) return null              // recién traído: no se dice nada
  const min = Math.round(edadMs / 60_000)
  if (min < 60) return locale === 'en' ? `${min} min ago` : `hace ${min} min`
  const h = Math.round(min / 60)
  return locale === 'en' ? `${h} h ago` : `hace ${h} h`
}
