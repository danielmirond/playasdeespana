// src/lib/tinte.ts — teñir un color sin saber de qué color se trata.
//
// El patrón que había por todo el repo era `${color}14`: pegarle dos
// dígitos de alfa al final del hex. Funciona, pero solo con hex, y ata
// cada llamada a que el color nunca deje de serlo. En cuanto la escala de
// veredicto pasó a var(--excelente), esas plantillas producían
// `var(--excelente)14` — CSS inválido que el navegador tira en silencio:
// el borde simplemente desaparece y nadie se entera.
//
// color-mix() no tiene ese problema: acepta hex, var(), currentColor y
// cualquier cosa que resuelva a color. Es lo que ya usa el sistema de
// tokens, así que además esto deja de ser una excepción.
//
// La equivalencia con el alfa hexadecimal es directa: 0x14 = 20 → 8%.
// No se ha traducido dígito a dígito, se ha redondeado al porcentaje
// legible más cercano, que es lo que se quería decir desde el principio.

/** Fondo teñido: el color a `pct`% sobre nada. */
export const tinte = (color: string, pct: number): string =>
  `color-mix(in srgb, ${color} ${pct}%, transparent)`

/** Trazo teñido, la misma mezcla — existe solo para que lea bien. */
export const trazo = (color: string, pct: number): string =>
  `1px solid ${tinte(color, pct)}`
