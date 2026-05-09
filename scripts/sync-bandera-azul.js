#!/usr/bin/env node
// scripts/sync-bandera-azul.js
//
// Actualiza public/data/playas.json con el listado oficial de Bandera Azul.
//
// Input: scripts/data/bandera-azul-2026.json
//   (formato: [{ comunidad, provincia, municipio, playa, marker? }, ...])
//
// Comportamiento:
//   1. Para cada entrada del listado, encuentra la mejor playa coincidente
//      en playas.json usando matching por slug aproximado de nombre+municipio.
//   2. Marca bandera=true en las matcheadas.
//   3. NO desactiva automáticamente las que estaban a true y no aparecen en
//      el listado (evita falsos negativos del parsing). Para quitar banderas
//      retiradas, usar el flag --strict (descativará todas las que no estén
//      explícitamente en el listado nuevo).
//
// Genera además:
//   - scripts/data/bandera-azul-2026-unmatched.json: entradas del listado
//     que no encontraron match → revisión manual.
//   - scripts/data/bandera-azul-diff.json: cambios aplicados (added, kept,
//     would-be-deactivated).
//
// Uso:
//   npm run sync:bandera-azul             # solo añade/confirma
//   npm run sync:bandera-azul -- --strict # también desactiva las no listadas
//   npm run sync:bandera-azul -- --dry    # solo log, no escribe

const fs   = require('fs')
const path = require('path')

const STRICT = process.argv.includes('--strict')
const DRY    = process.argv.includes('--dry')

const ROOT       = path.join(__dirname, '..')
const PLAYAS_JSON = path.join(ROOT, 'public', 'data', 'playas.json')
const LIST_JSON   = path.join(__dirname, 'data', 'bandera-azul-2026.json')
const UNMATCHED   = path.join(__dirname, 'data', 'bandera-azul-2026-unmatched.json')
const DIFF_JSON   = path.join(__dirname, 'data', 'bandera-azul-2026-diff.json')

function slug(s) {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[''`´]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Distancia Levenshtein simple
function levenshtein(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const m = []
  for (let i = 0; i <= b.length; i++) m[i] = [i]
  for (let j = 0; j <= a.length; j++) m[0][j] = j
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      m[i][j] = b[i-1] === a[j-1]
        ? m[i-1][j-1]
        : 1 + Math.min(m[i-1][j], m[i][j-1], m[i-1][j-1])
    }
  }
  return m[b.length][a.length]
}

// Score: 0..1. 1 = match perfecto. <0.6 = no match.
function similarityScore(aSlug, bSlug) {
  if (aSlug === bSlug) return 1
  const dist = levenshtein(aSlug, bSlug)
  const maxLen = Math.max(aSlug.length, bSlug.length)
  if (maxLen === 0) return 0
  return 1 - dist / maxLen
}

function pickBestMatch(entry, candidates) {
  // candidates es lista de playas en el mismo municipio (o cercanas)
  const targetSlug = slug(entry.playa)
  let best = null
  let bestScore = 0
  for (const p of candidates) {
    const ps = slug(p.nombre)
    let score = similarityScore(targetSlug, ps)
    // Boost si el slug aparece como substring de la otra
    if (ps.includes(targetSlug) || targetSlug.includes(ps)) {
      score = Math.max(score, 0.9)
    }
    if (score > bestScore) { bestScore = score; best = p }
  }
  return { best, bestScore }
}

function main() {
  if (!fs.existsSync(LIST_JSON)) {
    console.error(`[sync-bandera-azul] No existe ${LIST_JSON}`)
    console.error('Ejecuta primero el parser del PDF (parse-bba3.py) y guarda el output ahí.')
    process.exit(1)
  }

  const playas = JSON.parse(fs.readFileSync(PLAYAS_JSON, 'utf8'))
  const lista  = JSON.parse(fs.readFileSync(LIST_JSON, 'utf8'))

  console.log(`Playas: ${playas.length}`)
  console.log(`Lista BBA 2026: ${lista.length}`)
  console.log(`Modo: ${STRICT ? 'STRICT (desactiva no listadas)' : 'incremental'}${DRY ? ' (DRY)' : ''}`)

  // Index por municipio slug → array de playas
  const byMun = new Map()
  for (const p of playas) {
    const ms = slug(p.municipio)
    if (!byMun.has(ms)) byMun.set(ms, [])
    byMun.get(ms).push(p)
  }

  const diff = { added: [], kept: [], deactivated: [], unmatched: [] }
  const matched = new Set() // slugs de playa matcheadas

  for (const entry of lista) {
    const munSlug = slug(entry.municipio)
    let candidates = byMun.get(munSlug) ?? []
    // Si no hay match exacto de municipio, buscamos en municipios cercanos
    if (candidates.length === 0) {
      // probar variantes con/sin "de la", etc.
      const variants = [
        munSlug.replace(/-de-la-/g, '-'),
        munSlug.replace(/-del-/g, '-'),
        munSlug.replace(/^el-|^la-|^los-|^las-/, ''),
      ]
      for (const v of variants) {
        if (byMun.has(v)) {
          candidates = byMun.get(v)
          break
        }
      }
    }
    if (candidates.length === 0) {
      diff.unmatched.push({ ...entry, reason: 'municipio no encontrado' })
      continue
    }
    const { best, bestScore } = pickBestMatch(entry, candidates)
    if (!best || bestScore < 0.6) {
      diff.unmatched.push({ ...entry, reason: `mejor match score=${bestScore.toFixed(2)} (${best?.nombre ?? '-'})` })
      continue
    }

    matched.add(best.slug)
    if (best.bandera === true) {
      diff.kept.push({ slug: best.slug, nombre: best.nombre, municipio: best.municipio })
    } else {
      diff.added.push({ slug: best.slug, nombre: best.nombre, municipio: best.municipio, score: bestScore })
      if (!DRY) best.bandera = true
    }
  }

  // Strict mode: desactivar las que estaban a true y no están en la lista
  if (STRICT) {
    for (const p of playas) {
      if (p.bandera === true && !matched.has(p.slug)) {
        diff.deactivated.push({ slug: p.slug, nombre: p.nombre, municipio: p.municipio })
        if (!DRY) p.bandera = false
      }
    }
  }

  // Escribir
  if (!DRY) {
    fs.writeFileSync(PLAYAS_JSON, JSON.stringify(playas, null, 2))
  }
  fs.mkdirSync(path.dirname(UNMATCHED), { recursive: true })
  fs.writeFileSync(UNMATCHED, JSON.stringify(diff.unmatched, null, 2))
  fs.writeFileSync(DIFF_JSON, JSON.stringify(diff, null, 2))

  console.log()
  console.log(`Resultado:`)
  console.log(`  ✓ Match con bandera ya activa: ${diff.kept.length}`)
  console.log(`  + Añadidas (bandera=true):     ${diff.added.length}`)
  console.log(`  ? Sin match (revisar):          ${diff.unmatched.length}`)
  if (STRICT) console.log(`  − Desactivadas:                ${diff.deactivated.length}`)
  console.log()
  console.log(`Diff completo: ${DIFF_JSON}`)
  console.log(`Sin match:     ${UNMATCHED}`)
}

main()
