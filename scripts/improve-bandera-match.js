// scripts/improve-bandera-match.js
// Segunda pasada de matching para Bandera Azul 2026: recupera playas que el
// sync principal dejó "sin match" por (a) municipios bilingües (Alacant/Alicante),
// (b) prefijos "Playa de"/"Platja de" en el nombre OSM, (c) variantes leves de
// topónimo. Reporta por buckets de confianza y SOLO aplica los seguros.
//
// Uso:
//   node scripts/improve-bandera-match.js            # informe (no escribe)
//   node scripts/improve-bandera-match.js --apply    # aplica AUTO (score>=0.55)
//
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const PLAYAS_JSON = path.join(ROOT, 'public', 'data', 'playas.json')
const LIST_JSON = path.join(__dirname, 'data', 'bandera-azul-2026.json')

const APPLY = process.argv.includes('--apply')
const AUTO_THRESHOLD = 0.55 // dentro del municipio correcto

function slug(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['’`´]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// quita prefijos genericos del NOMBRE de playa para comparar
function corePlaya(s) {
  let x = (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  x = x.replace(/^(playa|platja|cala|caló|calo|s'arenal|arenal)\s+(de\s+l[ao]s\s+|de\s+l[ao]\s+|de\s+|d'|de\s+n')?/i, '')
  x = x.replace(/['’`´]/g, '')
  x = x.replace(/[^a-z0-9]+/g, ' ').trim()
  return x
}

function lev(a, b) {
  const m = a.length, n = b.length
  if (!m) return n
  if (!n) return m
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
  return dp[m][n]
}

function sim(a, b) {
  a = corePlaya(a); b = corePlaya(b)
  if (!a || !b) return 0
  if (a === b) return 1
  // substring boost
  if (a.includes(b) || b.includes(a)) return 0.9
  // token overlap boost
  const ta = new Set(a.split(' ').filter(Boolean))
  const tb = new Set(b.split(' ').filter(Boolean))
  const inter = [...ta].filter((t) => tb.has(t)).length
  const tokenScore = inter / Math.max(ta.size, tb.size)
  const maxlen = Math.max(a.length, b.length)
  const levScore = 1 - lev(a, b) / maxlen
  return Math.max(levScore, tokenScore >= 0.5 ? 0.7 + 0.2 * tokenScore : tokenScore)
}

// municipio bilingue / token-subset
function muniMatch(listMuniSlug, playaMuniSlug) {
  if (!listMuniSlug || !playaMuniSlug) return false
  if (listMuniSlug === playaMuniSlug) return true
  // partes separadas por "/" en el dato OSM (alacant/alicante -> alacant, alicante)
  const parts = playaMuniSlug.split(/\/|--/).map((p) => p.replace(/^-+|-+$/g, ''))
  if (parts.includes(listMuniSlug)) return true
  // token-subset: todos los tokens de la lista estan en el municipio OSM
  const lt = listMuniSlug.split('-').filter(Boolean)
  const pt = new Set(playaMuniSlug.split('-').filter(Boolean))
  if (lt.length && lt.every((t) => pt.has(t))) return true
  // o al reves (OSM mas corto)
  const ptArr = playaMuniSlug.split('-').filter(Boolean)
  const ltSet = new Set(lt)
  if (ptArr.length && ptArr.every((t) => ltSet.has(t))) return true
  return false
}

const playas = JSON.parse(fs.readFileSync(PLAYAS_JSON, 'utf8'))
const lista = JSON.parse(fs.readFileSync(LIST_JSON, 'utf8'))

// indice playas por municipio slug
const byMuni = new Map()
for (const p of playas) {
  const ms = slug(p.municipio)
  if (!byMuni.has(ms)) byMuni.set(ms, [])
  byMuni.get(ms).push(p)
}
const allMuniSlugs = [...byMuni.keys()]

// que esta YA en true (para no recontar) -> usamos referencia directa a objetos
const buckets = { auto: [], review: [], none: [] }
let alreadyTrue = 0

for (const item of lista) {
  const lms = slug(item.municipio)
  // resuelve municipio (exacto, bilingue, subset)
  let muniSlug = byMuni.has(lms) ? lms : allMuniSlugs.find((ms) => muniMatch(lms, ms))
  if (!muniSlug) {
    buckets.none.push({ ...item, reason: 'municipio no encontrado (ni bilingue)' })
    continue
  }
  const candidates = byMuni.get(muniSlug)
  let best = null, bestScore = -1
  for (const c of candidates) {
    const s = sim(item.playa, c.nombre)
    if (s > bestScore) { bestScore = s; best = c }
  }
  if (best && best.bandera === true && bestScore >= AUTO_THRESHOLD) {
    alreadyTrue++
    continue
  }
  const rec = {
    municipio: item.municipio,
    muniOSM: best ? best.municipio : muniSlug,
    playa: item.playa,
    osm: best ? best.nombre : null,
    slug: best ? best.slug : null,
    score: +bestScore.toFixed(2),
    yaTrue: best ? best.bandera === true : false,
  }
  if (best && bestScore >= AUTO_THRESHOLD) buckets.auto.push({ ...rec, _ref: best })
  else if (best && bestScore >= 0.4) buckets.review.push(rec)
  else buckets.none.push(rec)
}

// aplica AUTO
let applied = 0
if (APPLY) {
  for (const r of buckets.auto) {
    if (r._ref && r._ref.bandera !== true) { r._ref.bandera = true; applied++ }
  }
  fs.writeFileSync(PLAYAS_JSON, JSON.stringify(playas, null, 2))
}

const totalTrue = playas.filter((p) => p.bandera === true).length
const out = []
out.push(`Modo: ${APPLY ? 'APPLY' : 'DRY (informe)'}`)
out.push(`AUTO (score>=${AUTO_THRESHOLD}, mun. correcto): ${buckets.auto.length}`)
out.push(`REVIEW (0.40-${AUTO_THRESHOLD}): ${buckets.review.length}`)
out.push(`NONE (sin candidato / municipio ausente): ${buckets.none.length}`)
out.push(`Ya estaban true (resueltas por municipio): ${alreadyTrue}`)
if (APPLY) out.push(`>>> Aplicadas nuevas bandera=true: ${applied}`)
out.push(`Total bandera=true ahora: ${totalTrue}`)
out.push('')
out.push('=== AUTO (se aplican) ===')
for (const r of buckets.auto) out.push(`  [${r.score}] ${r.municipio} :: "${r.playa}"  ->  "${r.osm}" (${r.muniOSM})${r.yaTrue ? ' [ya true]' : ''}`)
out.push('')
out.push('=== REVIEW (decidir a mano) ===')
for (const r of buckets.review) out.push(`  [${r.score}] ${r.municipio} :: "${r.playa}"  ?  "${r.osm}" (${r.muniOSM})`)
out.push('')
out.push('=== NONE ===')
for (const r of buckets.none) out.push(`  ${r.municipio} :: "${r.playa}"  ${r.osm ? '(top: ' + r.osm + ' ' + r.score + ')' : '(' + (r.reason || 'sin candidato') + ')'}`)

const report = out.join('\n')
fs.writeFileSync(path.join(__dirname, 'data', 'bandera-azul-2026-improve-report.txt'), report)
console.log(report)
