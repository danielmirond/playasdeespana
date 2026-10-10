// src/app/fonts.ts — las cinco familias, instanciadas UNA vez.
//
// Vivían dentro de layout.tsx. Al partir el layout en uno por idioma hay
// que sacarlas: si cada layout llamara a Playfair_Display() por su cuenta,
// next/font generaría dos juegos de clases distintos, los tokens
// --font-playfair quedarían declarados en wrappers diferentes y la ficha
// caería al fallback sin avisar. Eso es FOUT y CLS en la página que más
// tráfico tiene, y el CLS de la ficha hoy es 0.
import { Playfair_Display, DM_Sans, JetBrains_Mono, Literata, Schibsted_Grotesk } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['400', '500'],
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
    : `${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`
}
