// src/lib/estados.ts
// Brand book v1 — colores semánticos de puntuación (sección 03 + 04)
import type { EstadoBano, DatosMeteo } from '@/types'

export interface EstadoConfig {
  label:     string
  labelEn:   string
  frase:     string
  fraseEn:   string
  dot:       string
  bg:        string
  text:      string
  ringBg:    string
  ringColor: string
  verb:      string
  verbEn:    string
  tileBg:    string
  tileBgDark:string
}

import { tinte } from './tinte'

// El color de cada estado ya vivía en los tokens --sea-*, con exactamente
// los mismos valores: este archivo era una segunda copia que había que
// acordarse de sincronizar. Ahora apunta al token, así que bajo Litoral el
// mar se pinta con su paleta sin tocar nada aquí.
//
// text, ringBg, ringColor y las teselas siguen en hex: son tintes
// decorativos de cada estado, sin token propio en ninguno de los dos
// sistemas. Darles uno es una decisión de diseño, no de limpieza.

export const ESTADOS: Record<EstadoBano, EstadoConfig> = {
  CALMA: {
    label:     'CALMA',
    labelEn:   'CALM',
    frase:     'El mar te espera',
    fraseEn:   'The sea is waiting for you',
    dot:       'var(--sea-calma)',
    bg:        tinte('var(--sea-calma)', 10),
    text:      '#3a6a5a',
    ringBg:    '#f0e6d0',
    ringColor: '#c4904a',
    verb:      'báñate',
    verbEn:    'swim',
    tileBg:    '#c8e8e3',
    tileBgDark:'#0e2e2c',
  },
  BUENA: {
    label:     'BUENA',
    labelEn:   'GOOD',
    frase:     'Condiciones ideales',
    fraseEn:   'Ideal conditions',
    dot:       'var(--sea-buena)',
    bg:        tinte('var(--sea-buena)', 10),
    text:      '#2a4a14',
    ringBg:    '#f0ece0',
    ringColor: '#8a7a40',
    verb:      'apto',
    verbEn:    'suitable',
    tileBg:    '#fae5b0',
    tileBgDark:'#3a2e10',
  },
  AVISO: {
    label:     'AVISO',
    labelEn:   'WARNING',
    frase:     'Entra con precaución',
    fraseEn:   'Enter with caution',
    dot:       'var(--sea-aviso)',
    bg:        tinte('var(--sea-aviso)', 10),
    text:      '#7a4a08',
    ringBg:    '#f8f0e0',
    ringColor: '#c89040',
    verb:      'cuidado',
    verbEn:    'caution',
    tileBg:    '#f4e7cd',
    tileBgDark:'#2e2410',
  },
  PELIGRO: {
    label:     'PELIGRO',
    labelEn:   'DANGER',
    frase:     'No recomendado el baño',
    fraseEn:   'Swimming not recommended',
    dot:       'var(--sea-peligro)',
    bg:        tinte('var(--sea-peligro)', 10),
    text:      '#4a1810',
    ringBg:    '#f8ece8',
    ringColor: '#a04040',
    verb:      'no entres',
    verbEn:    'stay out',
    tileBg:    '#efd9d2',
    tileBgDark:'#2a1410',
  },
  SURF: {
    label:     'SURF',
    labelEn:   'SURF',
    frase:     'Olas para los valientes',
    fraseEn:   'Waves for the brave',
    dot:       'var(--sea-surf)',
    bg:        tinte('var(--sea-surf)', 10),
    text:      '#1a3a4a',
    ringBg:    '#e8f0f4',
    ringColor: '#2d5266',
    verb:      'tabla',
    verbEn:    'board',
    tileBg:    '#d8e2e8',
    tileBgDark:'#142028',
  },
  VIENTO: {
    label:     'VIENTO',
    labelEn:   'WINDY',
    frase:     'Cometas y kitesurf',
    fraseEn:   'Kites and kitesurfing',
    dot:       'var(--sea-viento)',
    bg:        tinte('var(--sea-viento)', 10),
    text:      '#5a5a5a',
    ringBg:    '#f0ede8',
    ringColor: '#8a8a8a',
    verb:      'abrígate',
    verbEn:    'shelter',
    tileBg:    '#e3e3e3',
    tileBgDark:'#1f1f1f',
  },
}

export function calcularEstado(meteo: Pick<DatosMeteo, 'olas' | 'viento'>): EstadoBano {
  const { olas, viento } = meteo
  if (olas >= 2.5 || viento >= 50) return 'PELIGRO'
  if (olas >= 1.5 && viento >= 35) return 'PELIGRO'
  if (olas >= 1.5) return 'SURF'
  if (viento >= 35) return 'VIENTO'
  if (olas >= 0.8 || viento >= 25) return 'AVISO'
  if (olas >= 0.4 || viento >= 15) return 'BUENA'
  return 'CALMA'
}
