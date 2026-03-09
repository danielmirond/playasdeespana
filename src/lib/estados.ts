// src/lib/estados.ts
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
    dot:       '#22c55e',
    bg:        'rgba(34,197,94,.12)',
    text:      '#2a5e2a',
    ringBg:    '#f0e6d0',
    ringColor: '#c4904a',
  },
  BUENA: {
    label:     'BUENA',
    labelEn:   'GOOD',
    frase:     'Condiciones ideales',
    fraseEn:   'Ideal conditions',
    dot:       '#3b82f6',
    bg:        'rgba(59,130,246,.1)',
    text:      '#1e3a7e',
    ringBg:    '#e8f0f8',
    ringColor: '#4a7ab8',
  },
  AVISO: {
    label:     'AVISO',
    labelEn:   'WARNING',
    frase:     'Entra con precaución',
    fraseEn:   'Enter with caution',
    dot:       '#f59e0b',
    bg:        'rgba(245,158,11,.12)',
    text:      '#7a4008',
    ringBg:    '#f8f0e0',
    ringColor: '#c89040',
  },
  PELIGRO: {
    label:     'PELIGRO',
    labelEn:   'DANGER',
    frase:     'No recomendado el baño',
    fraseEn:   'Swimming not recommended',
    dot:       '#ef4444',
    bg:        'rgba(239,68,68,.1)',
    text:      '#7a1010',
    ringBg:    '#f8ecec',
    ringColor: '#c04040',
  },
  SURF: {
    label:     'SURF',
    labelEn:   'SURF',
    frase:     'Olas para los valientes',
    fraseEn:   'Waves for the brave',
    dot:       '#0ea5e9',
    bg:        'rgba(14,165,233,.1)',
    text:      '#0a3a5e',
    ringBg:    '#e8f4fb',
    ringColor: '#2a7ab8',
  },
  VIENTO: {
    label:     'VIENTO',
    labelEn:   'WINDY',
    frase:     'Cometas y kitesurf',
    fraseEn:   'Kites and kitesurfing',
    dot:       '#eab308',
    bg:        'rgba(234,179,8,.12)',
    text:      '#6a4a08',
    ringBg:    '#f8f4e0',
    ringColor: '#b89030',
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
