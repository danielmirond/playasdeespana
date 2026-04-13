// src/lib/scoring.ts — Motor de decisión: score 0-100 por playa.
//
// Responde la pregunta: "¿Ir a esta playa hoy?" con un número y un
// semáforo (excelente / media / mala). Consume datos meteo actuales
// + atributos estáticos de la playa.
//
// El score se usa en:
//   - Home "Top playas hoy" (ordenar desc)
//   - Home "Evita hoy" (ordenar asc)
//   - Ficha "Recomendación de hoy"
//   - Filtros rápidos ("sin viento", "mar calmo", etc.)

import type { Playa } from '@/types'

export interface MeteoInput {
  agua:    number   // °C
  olas:    number   // m
  viento:  number   // km/h
  uv:      number   // 0-11+
}

export interface PlayaScore {
  score:    number   // 0-100
  label:    string   // 'Excelente' | 'Buena' | 'Regular' | 'Mala'
  labelEn:  string
  emoji:    string   // 🟢 🟡 🔴
  color:    string   // hex para UI
  reasons:  string[] // frases cortas que explican el score
  reasonsEn: string[]
}

// ── Pesos ──────────────────────────────────────────────────────────
// Suman 100. Ajustables sin romper la escala.
const W = {
  mar:       30,   // olas + viento combinados (lo que más importa para ir a bañarse)
  agua:      20,   // temperatura del agua (confort)
  uv:        10,   // UV (moderado > bajo > extremo)
  servicios: 20,   // socorrismo, duchas, parking, accesible, bandera
  ocupacion: 10,   // grado de ocupación (bajo = mejor para relax, alto ≠ malo del todo)
  acceso:    10,   // forma de acceso, parking, autobús
}

// ── Sub-scores ─────────────────────────────────────────────────────
function scoreMar(olas: number, viento: number): { s: number; reasons: string[]; reasonsEn: string[] } {
  const reasons: string[] = []
  const reasonsEn: string[] = []

  // Olas: 0-0.5 perfecto, 0.5-1.5 ok, >2 peligro
  let olasScore: number
  if (olas <= 0.3)       { olasScore = 100 }
  else if (olas <= 0.6)  { olasScore = 90 }
  else if (olas <= 1.0)  { olasScore = 70; reasons.push('Oleaje moderado'); reasonsEn.push('Moderate waves') }
  else if (olas <= 1.5)  { olasScore = 45; reasons.push('Oleaje fuerte'); reasonsEn.push('Rough waves') }
  else if (olas <= 2.5)  { olasScore = 20; reasons.push('Mar agitado'); reasonsEn.push('Rough sea') }
  else                   { olasScore = 5;  reasons.push('Mar muy agitado'); reasonsEn.push('Very rough sea') }

  // Viento: 0-10 ideal, 10-20 ok, 20-30 molesto, >30 peligroso
  let vientoScore: number
  if (viento <= 8)       { vientoScore = 100 }
  else if (viento <= 15) { vientoScore = 85 }
  else if (viento <= 22) { vientoScore = 60; reasons.push('Algo de viento'); reasonsEn.push('Some wind') }
  else if (viento <= 35) { vientoScore = 30; reasons.push('Mucho viento'); reasonsEn.push('Very windy') }
  else                   { vientoScore = 5;  reasons.push('Viento peligroso'); reasonsEn.push('Dangerous wind') }

  return { s: olasScore * 0.5 + vientoScore * 0.5, reasons, reasonsEn }
}

function scoreAgua(temp: number): { s: number; reasons: string[]; reasonsEn: string[] } {
  const reasons: string[] = []
  const reasonsEn: string[] = []
  let s: number
  if (temp >= 24)      { s = 100; reasons.push(`Agua cálida (${temp}°C)`);     reasonsEn.push(`Warm water (${temp}°C)`) }
  else if (temp >= 21) { s = 85;  reasons.push(`Agua agradable (${temp}°C)`);  reasonsEn.push(`Pleasant water (${temp}°C)`) }
  else if (temp >= 18) { s = 60;  reasons.push(`Agua templada (${temp}°C)`);   reasonsEn.push(`Cool water (${temp}°C)`) }
  else if (temp >= 15) { s = 35;  reasons.push(`Agua fresca (${temp}°C)`);     reasonsEn.push(`Cold water (${temp}°C)`) }
  else                 { s = 15;  reasons.push(`Agua fría (${temp}°C)`);       reasonsEn.push(`Very cold water (${temp}°C)`) }
  return { s, reasons, reasonsEn }
}

function scoreUV(uv: number): { s: number; reasons: string[]; reasonsEn: string[] } {
  const reasons: string[] = []
  const reasonsEn: string[] = []
  let s: number
  if (uv <= 2)       { s = 50;  reasons.push('UV bajo');      reasonsEn.push('Low UV') }
  else if (uv <= 5)  { s = 100; reasons.push('UV moderado');  reasonsEn.push('Moderate UV') }
  else if (uv <= 7)  { s = 80;  reasons.push('UV alto');      reasonsEn.push('High UV') }
  else if (uv <= 10) { s = 45;  reasons.push('UV muy alto — protección obligatoria'); reasonsEn.push('Very high UV — sun protection required') }
  else               { s = 20;  reasons.push('UV extremo');   reasonsEn.push('Extreme UV') }
  return { s, reasons, reasonsEn }
}

function scoreServicios(playa: Playa): { s: number; reasons: string[]; reasonsEn: string[] } {
  const reasons: string[] = []
  const reasonsEn: string[] = []
  let pts = 0
  if (playa.bandera)     { pts += 30; reasons.push('Bandera Azul');  reasonsEn.push('Blue Flag') }
  if (playa.socorrismo)  { pts += 25; reasons.push('Socorrismo');    reasonsEn.push('Lifeguard') }
  if (playa.duchas)        pts += 15
  if (playa.parking)       pts += 15
  if (playa.accesible)   { pts += 10; reasons.push('Accesible PMR'); reasonsEn.push('Wheelchair accessible') }
  if (playa.aseos)         pts += 5
  return { s: Math.min(pts, 100), reasons, reasonsEn }
}

function scoreOcupacion(playa: Playa): number {
  const g = (playa.grado_ocupacion ?? '').toLowerCase()
  if (g.includes('bajo'))  return 100
  if (g.includes('medio')) return 70
  if (g.includes('alto'))  return 40
  return 65 // desconocido → neutral
}

function scoreAcceso(playa: Playa): number {
  let s = 50
  if (playa.parking) s += 20
  if (playa.autobus) s += 15
  const acc = (playa.forma_acceso ?? '').toLowerCase()
  if (acc.includes('fácil') || acc.includes('facil')) s += 15
  else if (acc.includes('difícil') || acc.includes('dificil')) s -= 20
  return Math.max(0, Math.min(100, s))
}

// ── Score final ────────────────────────────────────────────────────
export function calcularPlayaScore(playa: Playa, meteo: MeteoInput): PlayaScore {
  const mar   = scoreMar(meteo.olas, meteo.viento)
  const agua  = scoreAgua(meteo.agua)
  const uv    = scoreUV(meteo.uv)
  const srv   = scoreServicios(playa)
  const ocu   = scoreOcupacion(playa)
  const acc   = scoreAcceso(playa)

  const score = Math.round(
    mar.s   * (W.mar / 100) +
    agua.s  * (W.agua / 100) +
    uv.s    * (W.uv / 100) +
    srv.s   * (W.servicios / 100) +
    ocu     * (W.ocupacion / 100) +
    acc     * (W.acceso / 100)
  )

  // Flatten top reasons (max 3, most impactful)
  const allReasons = [...mar.reasons, ...agua.reasons, ...uv.reasons, ...srv.reasons]
  const allReasonsEn = [...mar.reasonsEn, ...agua.reasonsEn, ...uv.reasonsEn, ...srv.reasonsEn]

  let label: string, labelEn: string, emoji: string, color: string
  if (score >= 75) {
    label = 'Excelente'; labelEn = 'Excellent'; emoji = '🟢'; color = '#22c55e'
  } else if (score >= 55) {
    label = 'Buena'; labelEn = 'Good'; emoji = '🟡'; color = '#eab308'
  } else if (score >= 35) {
    label = 'Regular'; labelEn = 'Fair'; emoji = '🟠'; color = '#f97316'
  } else {
    label = 'Mala'; labelEn = 'Poor'; emoji = '🔴'; color = '#ef4444'
  }

  return {
    score,
    label,
    labelEn,
    emoji,
    color,
    reasons: allReasons.slice(0, 3),
    reasonsEn: allReasonsEn.slice(0, 3),
  }
}

// ── Filtros de condición ───────────────────────────────────────────
// Usados por los CTAs del hero: "sin viento", "tranquilas", "familiares"
export function esSinViento(meteo: MeteoInput): boolean {
  return meteo.viento <= 12
}

export function esMarCalmo(meteo: MeteoInput): boolean {
  return meteo.olas <= 0.5 && meteo.viento <= 15
}

export function esFamiliar(playa: Playa, meteo: MeteoInput): boolean {
  return esMarCalmo(meteo) && !!playa.socorrismo && !!playa.duchas
}
