// src/lib/hora-ideal.ts
// Calcula la mejor franja horaria para ir a la playa combinando:
// - Índice UV (evitar 12:00-16:00 si UV alto)
// - Mareas (bajamar = más arena, más espacio)
// - Sol (amanecer/atardecer)
// - Temperatura del agua (más cálida por la tarde)

import type { MareasDia } from './mareas-lunar'

export interface HoraIdeal {
  franja:    string   // "10:00-12:00"
  razon:     string   // "UV moderado, marea baja, menos gente"
  razonEn:   string
  score:     number   // 0-100
}

interface Input {
  uv:        number | null
  amanecer?: string      // "HH:MM"
  atardecer?: string     // "HH:MM"
  mareas?:   MareasDia
  mes:       number      // 1-12
}

function parseHora(s?: string): number {
  if (!s) return 0
  const [h, m] = s.split(':').map(Number)
  return (h ?? 0) + (m ?? 0) / 60
}

export function calcularHoraIdeal({ uv, amanecer, atardecer, mareas, mes }: Input): HoraIdeal {
  const sunrise = parseHora(amanecer) || 7
  const sunset  = parseHora(atardecer) || 21
  const uvAlto  = (uv ?? 0) >= 8
  const uvMedio = (uv ?? 0) >= 6 && (uv ?? 0) < 8
  const esVerano = mes >= 6 && mes <= 9

  // Encontrar bajamar más próxima a mediodía
  let horaBajamar: number | null = null
  if (mareas?.mareas && mareas.zona !== 'mediterraneo') {
    const bajamares = mareas.mareas
      .filter(m => m.tipo === 'bajamar')
      .map(m => parseHora(m.hora))
      .filter(h => h >= sunrise && h <= sunset)
    // Elegir la bajamar más favorable (entre 10 y 18)
    horaBajamar = bajamares.find(h => h >= 10 && h <= 18) ?? bajamares[0] ?? null
  }

  // Lógica principal
  let inicio: number
  let fin: number
  let razon: string
  let razonEn: string
  let score: number

  if (uvAlto && esVerano) {
    // UV peligroso: mejor temprano o tarde
    if (horaBajamar && horaBajamar < 11) {
      inicio = Math.max(sunrise + 1, 9)
      fin    = Math.min(horaBajamar + 1, 11.5)
      razon  = `UV muy alto a mediodía (${uv}). Bajamar por la mañana: más arena y menos gente`
      razonEn = `Very high UV at noon (${uv}). Low tide in the morning: more sand and fewer people`
      score = 90
    } else {
      inicio = Math.max(sunset - 3, 16)
      fin    = sunset - 0.5
      razon  = `UV muy alto (${uv}). Mejor ir por la tarde: sombra, agua templada y atardecer`
      razonEn = `Very high UV (${uv}). Better go in the afternoon: shade, warm water and sunset`
      score = 85
    }
  } else if (uvMedio) {
    // UV medio: mañana o tarde, evitar pico
    inicio = Math.max(sunrise + 1.5, 9.5)
    fin    = 11.5
    razon  = `UV moderado (${uv}). Mañana es la mejor franja: sol suave y agua tranquila`
    razonEn = `Moderate UV (${uv}). Morning is the best time: soft sun and calm water`
    score = 80
  } else {
    // UV bajo: cualquier hora va bien
    inicio = 11
    fin    = 14
    razon  = `UV bajo (${uv ?? 'N/A'}). Franja central es perfecta: agua más cálida`
    razonEn = `Low UV (${uv ?? 'N/A'}). Midday is perfect: warmer water`
    score = 75
  }

  // Ajuste por bajamar si aplica
  if (horaBajamar !== null && Math.abs(horaBajamar - ((inicio + fin) / 2)) < 2) {
    score = Math.min(100, score + 10)
    razon += `. Bajamar a las ${Math.floor(horaBajamar).toString().padStart(2, '0')}:${Math.round((horaBajamar % 1) * 60).toString().padStart(2, '0')}`
    razonEn += `. Low tide at ${Math.floor(horaBajamar).toString().padStart(2, '0')}:${Math.round((horaBajamar % 1) * 60).toString().padStart(2, '0')}`
  }

  const fmt = (h: number) =>
    `${Math.floor(h).toString().padStart(2, '0')}:${Math.round((h % 1) * 60).toString().padStart(2, '0')}`

  return {
    franja: `${fmt(inicio)}-${fmt(fin)}`,
    razon,
    razonEn,
    score,
  }
}
