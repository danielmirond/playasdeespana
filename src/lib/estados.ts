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
}

export const ESTADOS: Record<EstadoBano, EstadoConfig> = {
  CALMA: {
    label:     'CALMA',
    labelEn:   'CALM',
    frase:     'El mar te espera',
    fraseEn:   'The sea is waiting for you',
    dot:       '#5a8a7a',
    bg:        'rgba(90,138,122,.1)',
    text:      '#3a6a5a',
    ringBg:    '#f0e6d0',
    ringColor: '#c4904a',
  },
  BUENA: {
    label:     'BUENA',
    labelEn:   'GOOD',
    frase:     'Condiciones ideales',
    fraseEn:   'Ideal conditions',
    dot:       '#3d6b1f',
    bg:        'rgba(61,107,31,.1)',
    text:      '#2a4a14',
    ringBg:    '#f0ece0',
    ringColor: '#8a7a40',
  },
  AVISO: {
    label:     'AVISO',
    labelEn:   'WARNING',
    frase:     'Entra con precaución',
    fraseEn:   'Enter with caution',
    dot:       '#c48a1e',
    bg:        'rgba(196,138,30,.1)',
    text:      '#7a4a08',
    ringBg:    '#f8f0e0',
    ringColor: '#c89040',
  },
  PELIGRO: {
    label:     'PELIGRO',
    labelEn:   'DANGER',
    frase:     'No recomendado el baño',
    fraseEn:   'Swimming not recommended',
    dot:       '#7a2818',
    bg:        'rgba(122,40,24,.08)',
    text:      '#4a1810',
    ringBg:    '#f8ece8',
    ringColor: '#a04040',
  },
  SURF: {
    label:     'SURF',
    labelEn:   'SURF',
    frase:     'Olas para los valientes',
    fraseEn:   'Waves for the brave',
    dot:       '#2d5266',
    bg:        'rgba(45,82,102,.1)',
    text:      '#1a3a4a',
    ringBg:    '#e8f0f4',
    ringColor: '#2d5266',
  },
  VIENTO: {
    label:     'VIENTO',
    labelEn:   'WINDY',
    frase:     'Cometas y kitesurf',
    fraseEn:   'Kites and kitesurfing',
    dot:       '#7a7a7a',
    bg:        'rgba(122,122,122,.08)',
    text:      '#5a5a5a',
    ringBg:    '#f0ede8',
    ringColor: '#8a8a8a',
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
