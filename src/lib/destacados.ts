// src/lib/destacados.ts — espacios patrocinados en la ficha.
//
// Un negocio paga por aparecer destacado en la sección que le toca de la
// ficha de una playa (o de todas las de un municipio). NO entra en la
// lista de POIs: va en su propia tarjeta, encima y rotulada.
//
// Tres reglas que no se negocian, porque son las que permiten vender esto
// sin gastar la credibilidad que sostiene el resto del sitio:
//
//  1. SE DICE QUE ES PUBLICIDAD. La tarjeta lleva «Patrocinado» visible,
//     igual que cada dato del sitio dice de dónde sale. Un anuncio que no
//     se identifica se apoya en la credibilidad de las mediciones que
//     tiene al lado, y esa no está en venta.
//  2. NO SE INVENTA NOTA. El destacado no lleva estrellas ni reseñas: no
//     las hemos medido y comprarlas sería exactamente la cifra inventada
//     que este proyecto lleva meses quitando.
//  3. EL ENLACE VA rel="sponsored nofollow". Es lo que Google exige para
//     un enlace pagado; sin eso te la juegas a una acción manual, y el
//     negocio tampoco compra enlaces, compra visitas.
//
// La vigencia se comprueba al renderizar: un contrato que vence deja de
// pintarse solo, sin que nadie tenga que acordarse.
import datos from '@/data/destacados.json'

export type SeccionDestacado = 'comer' | 'dormir' | 'campings' | 'buceo' | 'actividades'

export interface Destacado {
  /** Playa concreta. Si falta, aplica a todo el municipio. */
  slug?: string
  /** Slug de municipio: cubre todas sus playas. */
  municipio?: string
  seccion: SeccionDestacado
  nombre: string
  /** Una línea, la escribe el negocio. Sin superlativos del sitio. */
  texto: string
  href: string
  telefono?: string
  foto?: string
  /** ISO corto, AAAA-MM-DD. Fuera de rango no se pinta. */
  desde: string
  hasta: string
}

const TODOS = datos as unknown as Destacado[]

const vigente = (d: Destacado, hoyISO: string) => d.desde <= hoyISO && hoyISO <= d.hasta

/**
 * El destacado de una sección, si lo hay. Gana el de la playa concreta
 * sobre el del municipio: quien paga por una playa paga por estar ahí,
 * no por competir con el que compró el municipio entero.
 */
export function getDestacado(
  seccion: SeccionDestacado,
  slug: string,
  municipioSlug: string,
  hoyISO: string,
): Destacado | null {
  const candidatos = TODOS.filter(d => d.seccion === seccion && vigente(d, hoyISO))
  return candidatos.find(d => d.slug === slug)
      ?? candidatos.find(d => !d.slug && d.municipio === municipioSlug)
      ?? null
}
