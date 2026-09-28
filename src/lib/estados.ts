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
    text:      '#2f7566',
    ringBg:    '#e6f0f4',
    ringColor: '#3f9a8a',
    verb:      'báñate',
    verbEn:    'swim',
    tileBg:    '#cfeae4',
    tileBgDark:'#0e2e2c',
  },
  BUENA: {
    label:     'BUENA',
    labelEn:   'GOOD',
    frase:     'Condiciones ideales',
    fraseEn:   'Ideal conditions',
    dot:       'var(--sea-buena)',
    bg:        tinte('var(--sea-buena)', 10),
    text:      '#1d4d31',
    ringBg:    '#e8f2e9',
    ringColor: '#2e7d4f',
    verb:      'apto',
    verbEn:    'suitable',
    tileBg:    '#d8ecdd',
    tileBgDark:'#12301f',
  },
  AVISO: {
    label:     'AVISO',
    labelEn:   'WARNING',
    frase:     'Entra con precaución',
    fraseEn:   'Enter with caution',
    dot:       'var(--sea-aviso)',
    bg:        tinte('var(--sea-aviso)', 10),
    text:      '#8a5a10',
    ringBg:    '#fbf0e2',
    ringColor: '#b8791d',
    verb:      'cuidado',
    verbEn:    'caution',
    tileBg:    '#fbe9cf',
    tileBgDark:'#33260f',
  },
  PELIGRO: {
    label:     'PELIGRO',
    labelEn:   'DANGER',
    frase:     'No recomendado el baño',
    fraseEn:   'Swimming not recommended',
    dot:       'var(--sea-peligro)',
    bg:        tinte('var(--sea-peligro)', 10),
    text:      '#5c231a',
    ringBg:    '#faeae7',
    ringColor: '#a63a2c',
    verb:      'no entres',
    verbEn:    'stay out',
    tileBg:    '#f7ded8',
    tileBgDark:'#331612',
  },
  SURF: {
    label:     'SURF',
    labelEn:   'SURF',
    frase:     'Olas para los valientes',
    fraseEn:   'Waves for the brave',
    dot:       'var(--sea-surf)',
    bg:        tinte('var(--sea-surf)', 10),
    text:      '#12435a',
    ringBg:    '#e6f0f4',
    ringColor: '#1f6f8b',
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
    text:      '#55666f',
    ringBg:    '#eef2f4',
    ringColor: '#6b7a83',
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
