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
  bg: '#f5ecd5', surface: '#faf4e6',
  ink: '#2a1a08', inkSoft: '#524030', inkMute: '#6a5840',
  line: 'rgba(42,26,8,.14)', accent: '#6b400a', onPhoto: '#ffffff',
  score: { excelente:'#3d6b1f', muybueno:'#7a8a30', aceptable:'#c48a1e',
           limitado:'#a04818', noapto:'#7a2818', sindato:'#7a6858' },
  ilustracion: ['#a8b8c4', '#c8c090', '#b8a06a'],
  serif: 'Playfair Display, Georgia, serif',
}

const LITORAL: PaletaOG = {
  bg: '#f7f5f1', surface: '#fffefc',
  ink: '#12110e', inkSoft: '#3d3a33', inkMute: '#6e6a5f',
  line: 'rgba(18,17,14,.08)', accent: '#12110e',   // la interacción no lleva color
  onPhoto: '#fffefc',
  score: { excelente:'#2f6b39', muybueno:'#5c7734', aceptable:'#9a7433',
           limitado:'#9c4a20', noapto:'#862a22', sindato:'#6e6a5f' },
  ilustracion: ['#b9c2c4', '#d8d4c9', '#c4bcaa'],
  serif: 'Literata, Georgia, serif',
}

/** La paleta del sistema activo. Se resuelve en servidor, como los flags. */
export const paletaOG = (): PaletaOG =>
  tieneFlag('ds_litoral_tokens') ? LITORAL : ARENA
