// src/lib/bandera-roja.ts — qué se deja de vender cuando el mar está cerrado.
//
// No es una regla de estilo: es una decisión sobre qué clase de producto es
// este. Con bandera roja no se cobra por enviar a alguien al agua.
//
// El criterio, y de él salen las dos reglas:
//
//   ¿Este bloque invita a meterse en el agua, o a estar en esa playa, HOY?
//
// DURA — no se renderiza. Todo lo que pone al usuario en el agua hoy. Es
// seguridad, no tono. Condicional de render, nunca `display: none`: no debe
// viajar al DOM, porque un bloque oculto sigue contando impresiones y sigue
// estando ahí para quien lea el HTML.
//
// BLANDA — se queda, pero baja y se calla. Comercio legítimo un día de
// temporal porque no es de hoy ni es de agua. Dos condiciones: va DESPUÉS
// del texto explicativo, nunca pegado al aviso; y el copy imperativo con
// urgencia pasa a registro neutro. No se vende prisa el día que el mar
// está cerrado.
//
// Lo que NO es solución: dejarlo todo y bajar la opacidad. O se renderiza o
// no; un patrocinio a medio gas sigue cobrando igual.

import type { BanderaPlaya } from './seguridad'

/** ¿Hay bandera roja hoy, venga de donde venga la cascada? */
/**
 * ATENCIÓN al alcance de la regla.
 *
 * BLOQUES_DUROS lo aplica el <Reorder> de FichaBody, que solo puede filtrar
 * a SUS PROPIOS HIJOS. Cualquier bloque de monetización que se renderice
 * fuera de ese árbol — hermano de <FichaBody> en la page, dentro del
 * <aside>, o en una plantilla futura — no lo alcanza y sobrevive al aviso.
 *
 * Pasó de verdad: el CTA de alquiler de barcos vivía en playas/[slug]/page
 * como hermano de la ficha y siguió vendiendo travesías en día de bandera
 * roja durante toda la vida de la regla. Se detectó forzando la bandera y
 * comprobando el HTML, no leyendo el código: en el código las dos mitades
 * parecen correctas por separado.
 *
 * Si añades monetización fuera del Reorder, llama a hayBanderaRoja() ahí.
 */
export function hayBanderaRoja(b: BanderaPlaya | null | undefined): boolean {
  return b?.color === 'roja'
}

/**
 * Regla DURA. Estos identificadores de sección no se renderizan.
 *
 * - `cta-ctx`  el recomendador contextual: su premisa es «hoy es día de…»,
 *              y con bandera roja hoy no es día de nada.
 * - `cta-barco`, `buceo`, `surf`  agua directa.
 * - `chiringuitos`  el de la propia playa: invita a estar ahí hoy.
 * - `afiliados`  bloque «Reserva ahora», recomendación de actividad.
 */
export const BLOQUES_DUROS = new Set([
  'cta-ctx', 'cta-barco', 'buceo', 'surf', 'chiringuitos', 'afiliados',
])

/**
 * Regla BLANDA. Se quedan, pero bajan por debajo del texto largo y pierden
 * el imperativo. Alojamiento, autocaravana, ferries, parking, mesa y Amazon:
 * nada de eso es de hoy ni es de agua.
 */
export const BLOQUES_BLANDOS = new Set([
  'dormir', 'campings', 'ferries', 'trafico', 'comer', 'asistente',
])

/**
 * AdSense es el caso incómodo: dinero pasivo, no contextual y con creativo
 * no auditable. No se puede excluir por categoría desde aquí, así que la
 * única herramienta es la distancia — va lo más lejos posible del aviso.
 */
export const BLOQUE_PASIVO = 'ad'

/**
 * Reordena las secciones de la ficha para un día de bandera roja.
 *
 * Devuelve el orden ya filtrado: fuera los duros, y los blandos + AdSense
 * empujados detrás del texto largo. El resto conserva su posición relativa.
 */
export function ordenBanderaRoja(orden: readonly string[]): string[] {
  const anclaTextoLargo = orden.indexOf('texto-seo')
  const principal: string[] = []
  const diferidos: string[] = []

  orden.forEach((id, i) => {
    if (BLOQUES_DUROS.has(id)) return                       // no viaja al DOM
    if (BLOQUES_BLANDOS.has(id) || id === BLOQUE_PASIVO) {
      // Solo se difiere lo que iba ANTES del texto largo; lo que ya estaba
      // después se queda donde está — moverlo no aporta nada.
      if (anclaTextoLargo === -1 || i < anclaTextoLargo) { diferidos.push(id); return }
    }
    principal.push(id)
  })

  if (!diferidos.length) return principal
  const corte = principal.indexOf('texto-seo')
  if (corte === -1) return [...principal, ...diferidos]
  return [
    ...principal.slice(0, corte + 1),
    ...diferidos,
    ...principal.slice(corte + 1),
  ]
}

/**
 * Copy sin urgencia para los bloques blandos. El día que el mar está
 * cerrado, «reserva hoy» y «últimas plazas» son de mal gusto además de
 * poco creíbles.
 */
/**
 * Etiqueta neutra para el botón de los bloques blandos.
 *
 * Se SUSTITUYE la llamada entera, no se reescribe la frase. El primer
 * intento fue un neutralizador por expresiones regulares y producía
 * castellano roto: «¡Reserva hoy! Últimas plazas» salía como
 * «ver disponibilidad disponibilidad». Editar copy con sustituciones es
 * una mala idea — la variante neutra se escribe, no se deriva.
 */
export const CTA_NEUTRO = 'Ver disponibilidad'

/**
 * ¿Este bloque debe perder el imperativo hoy? Solo los blandos: los duros
 * ya no existen y el pasivo no tiene copy nuestro que cambiar.
 */
export const pierdeUrgencia = (id: string): boolean => BLOQUES_BLANDOS.has(id)
