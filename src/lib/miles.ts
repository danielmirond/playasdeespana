// src/lib/miles.ts — separador de miles que no depende de dónde se ejecute.
//
// `toLocaleString('es-ES')` depende de los datos ICU con los que se haya
// compilado cada entorno, y los de Node y los del navegador no siempre
// coinciden. Medido en el Node de este proyecto:
//
//   (4491).toLocaleString('es-ES')  →  "4491"      ← sin separador
//   lo mismo en el navegador        →  "4.491"
//
// En una página que se renderiza en las dos partes eso no es un detalle
// tipográfico: es un mismatch de hidratación. React descarta el HTML del
// servidor, repinta el árbol entero y de paso se lleva por delante todo
// script que estuviera tocando ese DOM —así se quedó congelada la
// píldora contextual de la ficha durante semanas, sin un solo error
// visible que lo delatara—.
//
// lib/playas ya formateaba TOTAL_PLAYAS a mano por este mismo motivo.
// Esto lo saca a un sitio común para que la próxima cifra no repita el
// hallazgo desde cero.

/**
 * Un entero con puntos de millar, siempre igual en servidor y cliente.
 *
 * Solo separador de miles: no redondea, no pone decimales y no traduce
 * nada. Para números con decimales, formatéalos antes y pásalos hechos.
 */
export function miles(n: number): string {
  if (!Number.isFinite(n)) return ''
  const negativo = n < 0
  const entero = String(Math.trunc(Math.abs(n)))
  return (negativo ? '-' : '') + entero.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
