// src/lib/copyPlaya.ts
//
// Copy corto y único por playa para meta description y intro visible
// de la ficha. Resuelve dos problemas del brand review:
//
//  Problema #6 — meta description idéntica en las 2500 fichas
//    (solo cambiaba el nombre). Google detecta thin/duplicate
//    content. Aquí elegimos una plantilla por atributos: bandera
//    azul, longitud, composición, actividades.
//
//  Problema #7 — primer párrafo visible above-the-fold era boilerplate
//    de footer ("Estado del mar y guía de las 5.000+ playas españolas...").
//    Aquí generamos UNA frase factual con tipo + longitud + ubicación +
//    servicios concretos.
//
// Ambas funciones son DETERMINISTAS (mismo input → mismo output) para
// evitar mismatch SSR/CSR y para que Google vea contenido estable.

import type { Playa } from '@/types'

const COMPOSICION_DESC: Record<string, string> = {
  'arena':           'arena fina',
  'arena gruesa':    'arena gruesa y dorada',
  'arena dorada':    'arena dorada',
  'arena blanca':    'arena blanca',
  'arena negra':     'arena volcánica negra',
  'grava':           'guijarros',
  'roca':            'roca y charcos naturales',
  'mixta':           'arena y grava',
}

function actividadesActivas(playa: Playa): string[] {
  const a = playa.actividades ?? {}
  const out: string[] = []
  if (a.surf) out.push('surf')
  if (a.windsurf) out.push('windsurf')
  if (a.kite) out.push('kitesurf')
  if (a.snorkel) out.push('snorkel')
  if (a.buceo) out.push('buceo')
  if (a.paddle) out.push('paddle')
  if (a.kayak) out.push('kayak')
  return out
}

function serviciosClave(playa: Playa): string[] {
  const out: string[] = []
  if (playa.bandera) out.push('bandera azul')
  if (playa.socorrismo) out.push('socorrismo')
  if (playa.duchas) out.push('duchas')
  if (playa.parking) out.push('aparcamiento')
  if (playa.accesible) out.push('accesible')
  return out
}

/**
 * Meta description ≤160 chars, varía según atributos.
 *
 * Plantillas (5):
 *   A. Bandera azul + ≥2 servicios  → "Playa de bandera azul..."
 *   B. Actividades acuáticas        → "Playa para surf/snorkel..."
 *   C. Cala/pequeña sin servicios   → "Cala salvaje de roca..."
 *   D. Familiar/calmada (arena fina, longitud media+) → "Playa familiar..."
 *   E. Genérica (fallback)
 *
 * Termina SIEMPRE con "Estado del mar hoy" para captar la intent
 * "{nombre} hoy" que es la query principal.
 */
export function descripcionPlaya(playa: Playa, nombreSeo: string): string {
  const muni = playa.municipio
  const prov = playa.provincia
  const servs = serviciosClave(playa)
  const acts = actividadesActivas(playa)
  const long = playa.longitud ?? 0
  const comp = (playa.composicion ?? '').toLowerCase()
  const compTxt = COMPOSICION_DESC[comp] ?? 'arena'
  const esRoca = comp.includes('roca') || comp.includes('grava')
  const esCorta = long > 0 && long < 100

  // A. Bandera azul + servicios concretos
  if (playa.bandera && servs.length >= 2) {
    const top2 = servs.filter(s => s !== 'bandera azul').slice(0, 2).join(' y ')
    return `${nombreSeo}, playa con bandera azul en ${muni} (${prov}), con ${top2}. Estado del mar hoy: temperatura del agua, oleaje y viento.`.slice(0, 160)
  }

  // B. Actividades acuáticas
  if (acts.length > 0) {
    const top = acts.slice(0, 2).join(' y ')
    return `${nombreSeo} en ${muni} (${prov}), buena para ${top}. Estado del mar hoy: oleaje, viento y temperatura del agua.`.slice(0, 160)
  }

  // C. Cala salvaje (roca/grava sin servicios)
  if (esRoca && servs.length === 0) {
    return `${nombreSeo}, cala de ${compTxt} en ${muni} (${prov}). Estado del mar hoy: oleaje, agua y guía para visitarla.`.slice(0, 160)
  }

  // D. Cala pequeña (< 100m)
  if (esCorta) {
    return `${nombreSeo}, cala de ${compTxt} de ${long} m en ${muni} (${prov}). Estado del mar hoy: oleaje, viento y agua.`.slice(0, 160)
  }

  // E. Familiar / por defecto
  const longTxt = long > 100 ? ` de ${long} m` : ''
  return `${nombreSeo}, playa de ${compTxt}${longTxt} en ${muni} (${prov}). Estado del mar hoy: temperatura del agua, oleaje y viento.`.slice(0, 160)
}

/**
 * Intro breve visible above-the-fold. 1-2 frases factuales.
 * NO menciona "hoy" porque el HTML estará cacheado.
 * NO incluye verbos meteorológicos cambiantes (oleaje, viento, etc.)
 * porque esos van en la sección dinámica del hero.
 *
 * Estructura:
 *   - Frase 1: tipo + longitud + ubicación
 *   - Frase 2 (opcional): servicios + actividades
 */
export function introBrevePlaya(playa: Playa, nombreSeo: string): string {
  const muni = playa.municipio
  const prov = playa.provincia
  const long = playa.longitud ?? 0
  const anchura = playa.anchura ?? 0
  const comp = (playa.composicion ?? '').toLowerCase()
  const compTxt = COMPOSICION_DESC[comp] ?? 'arena'

  const partes: string[] = []

  // Frase 1: tipo + dimensiones + ubicación
  const dims: string[] = []
  if (long > 0)    dims.push(`${long} m de longitud`)
  if (anchura > 0) dims.push(`${anchura} m de anchura media`)
  const dimsTxt = dims.length > 0 ? ` (${dims.join(', ')})` : ''
  partes.push(`${nombreSeo} es una playa de ${compTxt}${dimsTxt} en ${muni}, ${prov}.`)

  // Frase 2: distintivos. Solo si hay bandera azul O servicios completos
  // O actividades. Si no, omitimos (mejor frase corta que rellena).
  const servs = serviciosClave(playa).filter(s => s !== 'bandera azul')
  const acts = actividadesActivas(playa)
  const trozos: string[] = []
  if (playa.bandera) trozos.push('Distinguida con la Bandera Azul')
  if (servs.length >= 2) trozos.push(`con ${servs.slice(0, 3).join(', ')}`)
  if (acts.length > 0)   trozos.push(`buena para ${acts.slice(0, 2).join(' y ')}`)
  if (trozos.length > 0) {
    // Capitalizar primera frase si empieza con minuscula tras coma
    const f2 = trozos.join(', ')
    partes.push(f2.charAt(0).toUpperCase() + f2.slice(1) + '.')
  }

  return partes.join(' ')
}
