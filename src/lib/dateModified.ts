// src/lib/dateModified.ts
//
// Devuelve la fecha de última modificación REAL de cada tipo de página.
//
// Por qué importa (Google Content Warehouse):
//   - lastSignificantUpdate: Google detecta dateModified falsos. Si pones
//     `new Date()` cada build pero el contenido no cambia, Google aprende
//     a ignorarte (incluso te demota por timestamp spam).
//   - semanticDateInfo: extrae fechas del HTML, JSON-LD y URL. Deben ser
//     coherentes entre sí.
//
// Estrategia:
//   - Páginas data-driven (ficha, listings de playas) → mtime de
//     `public/data/playas.json` (cambia con cada sync MITECO).
//   - Páginas editoriales (medusas, calidad-agua, etc.) → git log del
//     archivo .tsx; si no hay git (Vercel build sin .git), cae a stat.
//   - Sync con datos meteo en tiempo real → ahora, sin schema.

import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { BUILD_ISO } from './build-info'

// Los checkouts de Vercel fijan el mtime de TODOS los archivos a una época
// fake (2018-10-20) y el clone shallow hace fallar el git log por archivo.
// Cualquier fecha anterior a esto es basura de plataforma, no una fecha real
// del contenido → se sustituye por la fecha del build (write-build-info.mjs).
const MIN_FECHA_CREIBLE = '2020-01-01'

const ROOT = process.cwd()

// Memoizamos: cada path se calcula una sola vez por proceso de build.
const cache = new Map<string, string>()

/**
 * Última modificación de un archivo en formato ISO 8601.
 * Prioridad: git log → fs.statSync → fecha de build.
 */
export function getFileLastModified(relativePath: string): string {
  if (cache.has(relativePath)) return cache.get(relativePath)!
  const abs = path.join(ROOT, relativePath)

  // 1. git log (más fiable: refleja el commit, no el checkout)
  try {
    const iso = execSync(
      `git log -1 --format=%cI -- "${relativePath}"`,
      { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim()
    if (iso && iso.length > 10) {
      cache.set(relativePath, iso)
      return iso
    }
  } catch {
    // git no disponible (Vercel build con shallow clone puede fallar): ok
  }

  // 2. fs mtime — solo si es creíble (ver MIN_FECHA_CREIBLE arriba)
  try {
    const stat = fs.statSync(abs)
    const iso = stat.mtime.toISOString()
    const creible = iso >= MIN_FECHA_CREIBLE ? iso : BUILD_ISO
    cache.set(relativePath, creible)
    return creible
  } catch {
    // 3. fallback: fecha real del build (estable durante todo el deploy,
    // NO new Date() por request — eso es timestamp spam para Google)
    cache.set(relativePath, BUILD_ISO)
    return BUILD_ISO
  }
}

/**
 * Fecha de la última sincronización del dataset principal de playas.
 * Refleja cuándo cambiaron los datos servidos en /playas/[slug] y listados.
 */
export function getPlayasDataModified(): string {
  return getFileLastModified('public/data/playas.json')
}

/**
 * Última modificación combinada de un editorial: el archivo de la página,
 * sus dependencias de copy más comunes (lib/copy.ts, lib/faqsPlaya.ts), y
 * los datasets que usa. Devuelve la más reciente.
 */
export function getEditorialModified(pageRelativePath: string, dataPaths: string[] = []): string {
  const dates = [
    getFileLastModified(pageRelativePath),
    ...dataPaths.map(getFileLastModified),
  ]
  return dates.sort().pop()!  // ISO 8601 es lexicográficamente comparable
}

/**
 * Fecha humana relativa: "actualizado hace 2 horas / 3 días / 1 mes".
 * Para mostrar al usuario en el hero. NO usarlo en JSON-LD ni meta tags.
 */
export function relativeTime(iso: string, locale: 'es' | 'en' = 'es'): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diffMs = Date.now() - t
  const diffMin = Math.round(diffMs / 60_000)
  const diffH = Math.round(diffMs / 3_600_000)
  const diffD = Math.round(diffMs / 86_400_000)

  if (locale === 'en') {
    if (diffMin < 60)  return `updated ${diffMin} min ago`
    if (diffH   < 48)  return `updated ${diffH} h ago`
    if (diffD   < 30)  return `updated ${diffD} d ago`
    if (diffD   < 365) return `updated ${Math.round(diffD / 30)} mo ago`
    return `updated ${Math.round(diffD / 365)} y ago`
  }
  if (diffMin < 60)  return `actualizado hace ${diffMin} min`
  if (diffH   < 48)  return `actualizado hace ${diffH} h`
  if (diffD   < 30)  return `actualizado hace ${diffD} d`
  if (diffD   < 365) return `actualizado hace ${Math.round(diffD / 30)} meses`
  return `actualizado hace ${Math.round(diffD / 365)} años`
}
