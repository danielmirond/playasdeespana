// src/lib/calidad-indexacion.ts
//
// Score de calidad de una ficha de playa para decidir si debe ir al
// sitemap y permitir indexación en Google. NO es la calidad del agua
// (eso es src/lib/calidad.ts, getCalidad).
//
// Motivación: el dataset incluye ~5054 entradas OSM. Muchas son ruido
// que se ha colado en el índice: playas anónimas con slugs tipo
// "-14", "acces-plage-3", "a-area-pequena-5", o entradas fuera de
// España (Argelia, Marruecos, Francia). Indexar todo eso baja la
// señal de calidad del dominio y diluye el crawl-budget.
//
// Solución: scorear cada ficha 0-100 y aplicar:
//   - score >= UMBRAL_INDEX  → sitemap + robots:index
//   - score <  UMBRAL_INDEX  → fuera de sitemap + robots:noindex
//   - extranjera             → middleware devuelve 410 Gone

import type { Playa } from '@/types'

// Provincias españolas reales (más Ceuta/Melilla). Cualquier valor
// fuera de este Set se considera "extranjera" → 410.
export const PROV_ES = new Set<string>([
  // Andalucía
  'Almería', 'Cádiz', 'Granada', 'Huelva', 'Málaga',
  // Cornisa cantábrica
  'Asturias', 'Cantabria',
  // Galicia
  'A Coruña', 'La Coruña', 'Lugo', 'Pontevedra',
  // País Vasco
  'Vizcaya', 'Bizkaia', 'Guipúzcoa', 'Gipuzkoa',
  // Cataluña
  'Barcelona', 'Girona', 'Tarragona',
  // Valencia
  'Castellón', 'Castelló', 'Valencia', 'València', 'Alicante', 'Alacant',
  // Murcia
  'Murcia',
  // Baleares
  'Islas Baleares', 'Illes Balears', 'Baleares',
  // Canarias
  'Las Palmas', 'Santa Cruz de Tenerife',
  // Ciudades autónomas
  'Ceuta', 'Melilla',
])

export const UMBRAL_INDEX = 40

/**
 * Devuelve true si la provincia de la playa no es española.
 * Se usa en middleware para responder 410 Gone (mejor que 404 — le
 * dice a Google que esto NO vuelve y debe purgar del índice).
 */
export function esExtranjera(playa: { provincia?: string }): boolean {
  if (!playa.provincia) return true
  return !PROV_ES.has(playa.provincia)
}

/**
 * Detecta slugs basura del dataset OSM:
 *   - empiezan por '-'        ("-14", "-otro")
 *   - acaban con '-N' o '-NN' ("acces-plage-3", "a-area-pequena-5")
 *   - longitud < 6 chars      ("ses", "cala")
 *   - solo dígitos en el sufijo y palabras genéricas sin más
 */
export function slugBasura(slug: string): boolean {
  if (!slug) return true
  if (slug.startsWith('-')) return true
  if (slug.length < 6) return true
  // Termina en -N (1-3 dígitos) Y la parte antes es corta o genérica.
  const tail = slug.match(/-(\d{1,3})$/)
  if (tail) {
    const head = slug.slice(0, -tail[0].length)
    // "acces-plage-3" → head="acces-plage". Si es solo genéricas, basura.
    const palabras = head.split('-').filter(p => p.length >= 3)
    const genericas = new Set(['playa', 'beach', 'plage', 'praia', 'cala', 'caleta', 'platja', 'acces', 'access', 'punta', 'area'])
    const propias = palabras.filter(p => !genericas.has(p))
    if (propias.length === 0) return true
  }
  return false
}

/**
 * Score 0-100 de calidad indexable. Penaliza slugs basura, nombres
 * cortos, ausencia de datos clave. La provincia extranjera la maneja
 * el middleware (no llega aquí).
 *
 * Umbrales:
 *   100  bandera azul + datos completos + buen slug
 *    70  ficha normal con nombre propio y servicios
 *    40  UMBRAL — bajo esto no indexamos
 *    0   slug basura + sin datos
 */
export function scoreCalidadFicha(p: Pick<Playa, 'slug' | 'nombre' | 'provincia' | 'bandera' | 'longitud' | 'lat' | 'lng' | 'socorrismo' | 'parking' | 'accesible'>): number {
  if (esExtranjera(p)) return 0
  let s = 100

  // Slug
  if (slugBasura(p.slug)) s -= 50

  // Nombre
  const nombre = (p.nombre ?? '').trim()
  if (!nombre || nombre.length < 4) s -= 30
  if (/^playa\s*\d*$/i.test(nombre)) s -= 20      // "Playa", "Playa 2"
  if (/^(beach|plage|acces|access)\b/i.test(nombre)) s -= 25

  // Coords (sin coords no es ficha viable)
  if (!p.lat || !p.lng) s -= 30

  // Señales positivas (compensan)
  if (p.bandera) s += 10
  if (p.longitud && p.longitud > 0) s += 5
  if (p.socorrismo) s += 3
  if (p.parking) s += 2
  if (p.accesible) s += 2

  return Math.max(0, Math.min(100, s))
}

/**
 * Helper conveniente para el page.tsx y sitemap.
 */
export function esIndexable(p: Parameters<typeof scoreCalidadFicha>[0]): boolean {
  return scoreCalidadFicha(p) >= UMBRAL_INDEX
}
