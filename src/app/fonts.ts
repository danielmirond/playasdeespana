// src/app/fonts.ts — las cinco familias, instanciadas UNA vez.
//
// Vivían dentro de layout.tsx. Al partir el layout en uno por idioma hay
// que sacarlas: si cada layout llamara a Playfair_Display() por su cuenta,
// next/font generaría dos juegos de clases distintos, los tokens
// --font-playfair quedarían declarados en wrappers diferentes y la ficha
// caería al fallback sin avisar. Eso es FOUT y CLS en la página que más
// tráfico tiene, y el CLS de la ficha hoy es 0.
import { Libre_Franklin, JetBrains_Mono, Literata, Schibsted_Grotesk } from 'next/font/google'

// ——— Sistema E3 (oct-2026) ———————————————————————————————————
// Libre Franklin sustituye al par Playfair + DM Sans. Es un revival de
// Franklin Gothic: grotesca institucional, de rótulo de organismo
// público, que es la voz que pide un sitio que publica dato oficial.
//
// Sustituye a LAS DOS, no solo a la display: el sistema no tiene
// segunda familia de texto, así que --font-serif y --font-sans apuntan
// las dos aquí (ver CRITICAL_CSS en RootShell). Eso quita dos familias
// del bundle en un sitio 90 % móvil.
//
// Lo que se pierde, y conviene saberlo: las cifras de score y medición
// iban en serif a propósito —«voz de medio»— y ahora van en grotesca.
// Y la cursiva deja de ser una segunda voz: donde antes había <em>, el
// énfasis lo lleva el peso 600.
const franklin = Libre_Franklin({
  subsets: ['latin'],
  variable: '--font-franklin',
  display: 'swap',
  weight: ['200', '400', '500', '600', '700'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  // Antes era '--font-mono', que chocaba con el token --font-mono de la hoja
  // y producía `--font-mono: var(--font-mono, …)` — autorreferencia inválida
  // que caía al nombre de familia literal. Ahora la fuente y el token tienen
  // nombres distintos y ambas hojas la referencian igual.
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400'],
})

// ——— Sistema Litoral ———————————————————————————————————————
// Literata es VARIABLE (200–900) con itálica real y cifras tabulares: se
// sirve el archivo variable, no instancias estáticas, porque el sistema usa
// 400 de cuerpo, 500 de display y 700 de énfasis. Sin rango variable harían
// falta tres ficheros y la negrita sintética que el handoff prohíbe.
const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['opsz'],
})
const schibsted = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-schibsted',
  display: 'swap',
})
// JetBrains lo comparten las dos hojas vía --font-jetbrains.

/** Las tres variables CSS que toca servir según el flag tipográfico. */
export function clasesDeFuente(tipoLitoral: boolean): string {
  return tipoLitoral
    ? `${literata.variable} ${schibsted.variable} ${jetbrainsMono.variable}`
    : `${franklin.variable} ${jetbrainsMono.variable}`
}
