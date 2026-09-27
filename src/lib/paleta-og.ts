// src/lib/paleta-og.ts — la paleta como VALORES, para Satori.
//
// Las imágenes OG se generan con Satori (next/og), que no es un navegador:
// no resuelve `var(--x)` ni la cascada. Necesita hex literales. Por eso el
// OG es el único sitio del repo donde escribir colores a mano es correcto
// — pero el sistema tiene que seguir mandando, así que se elige la paleta
// entera según el flag en vez de dejar los hex sueltos por la ruta.
//
// Mantener las dos paletas aquí, juntas y con el mismo nombre de rol, es lo
// que hace visible una divergencia: si alguien cambia --score-mid en la
// hoja y no aquí, se ve de un vistazo.

import { tieneFlag } from './flags'

export interface PaletaOG {
  bg: string
  surface: string
  ink: string
  inkSoft: string
  inkMute: string
  line: string
  accent: string
  /** Texto sobre la foto. Siempre claro; la foto ya lleva su degradado. */
  onPhoto: string
  score: { excelente: string; muybueno: string; aceptable: string; limitado: string; noapto: string; sindato: string }
  /** Los tres tonos del degradado ilustrado (solo en tarjetas sin foto). */
  ilustracion: [string, string, string]
  /** Familia para el título. Satori usa las fuentes que se le registran. */
  serif: string
}

const ARENA: PaletaOG = {
  bg: '#f8fbfc', surface: '#ffffff',
  ink: '#0f2a3d', inkSoft: '#2f4d62', inkMute: '#4d6675',
  line: 'rgba(15,42,61,.14)', accent: '#1f6f8b', onPhoto: '#ffffff',
  score: { excelente:'#2e7d4f', muybueno:'#6a8f3a', aceptable:'#c2711a',
           limitado:'#b0522a', noapto:'#a63a2c', sindato:'#6b7a83' },
  ilustracion: ['#8fcbdc', '#cfe6ee', '#3d93b0'],
  serif: 'Playfair Display, Georgia, serif',
}

const LITORAL: PaletaOG = {
  bg: '#f8fbfc', surface: '#ffffff',
  ink: '#0f2a3d', inkSoft: '#2f4d62', inkMute: '#4d6675',
  line: 'rgba(15,42,61,.10)', accent: '#0f2a3d',   // la interacción no lleva color
  onPhoto: '#ffffff',
  score: { excelente:'#2e7d4f', muybueno:'#5f8a3a', aceptable:'#b8791d',
           limitado:'#b0522a', noapto:'#a63a2c', sindato:'#6b7a83' },
  ilustracion: ['#b9c2c4', '#d8d4c9', '#c4bcaa'],
  serif: 'Literata, Georgia, serif',
}

/**
 * La paleta del sistema activo. Se resuelve en servidor, como los flags.
 *
 * El color lo manda ds_litoral_tokens y la familia ds_litoral_type, por
 * separado: son dos flags distintos y el manual pide poder medir la
 * tipografía sola. Antes bastaba con tokens para las dos cosas, y con el
 * tipo apagado la tarjeta social anunciaba Literata mientras el sitio
 * servía Playfair.
 */
export const paletaOG = (): PaletaOG => {
  const base = tieneFlag('ds_litoral_tokens') ? LITORAL : ARENA
  return tieneFlag('ds_litoral_type')
    ? { ...base, serif: 'Literata, Georgia, serif' }
    : { ...base, serif: 'Playfair Display, Georgia, serif' }
}
