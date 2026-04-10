// miteco-match.js
// Shared matching logic for OSM ↔ MITECO beach datasets.
//
// Why this module exists:
//   The first matching algorithm was too naive (plain token Jaccard + 500m +
//   same province) and produced ~35% sospechoso matches, mainly because:
//     1. Galician / Catalan / Basque stop words were not filtered.
//     2. Name similarity did not weight municipality agreement.
//     3. Every OSM beach was paired with its nearest MITECO regardless of
//        whether that MITECO's nearest OSM was the same (no mutual check).
//     4. River / inland beaches (fluvial) were compared against MITECO, which
//        is a strictly coastal dataset, so they always produced wrong matches.
//
// The improved algorithm below addresses each of those.

// Stop words across all the languages that appear in Spanish beach names.
const STOP_WORDS = new Set([
  // Castellano
  'playa', 'playas', 'cala', 'calita', 'caleta', 'calo',
  'el', 'la', 'los', 'las', 'del', 'de', 'y', 'en', 'al',
  'san', 'santa', 'sant', 'santo',
  'punta', 'mar', 'porto', 'puerto',
  // Català / Valencià
  'platja', 'platges', 'dels', 'des', 'les', 'sa', 'ses', 'es',
  // Galego / Português
  'praia', 'praina', 'prainha', 'da', 'do', 'dos', 'das', 'o', 'a',
  // Français
  'plage',
  // Euskera
  'hondartza', 'ondartza',
])

// Language variants that point to the same concept (playa).
// Stripping them removes false dissimilarity between "Praia de X" and "Playa de X".
const BEACH_WORDS = new Set([
  'playa', 'playas', 'praia', 'praias', 'platja', 'platges',
  'plage', 'hondartza', 'ondartza', 'cala', 'caleta', 'calita', 'calo',
])

// Common Catalan / Valencià / Galego patronymics → Castellano equivalent.
// Applied before tokenization so "Platja de Sant Joan" and "Playa de San Juan"
// compare as equal. Only safe, well-known 1:1 substitutions.
const NAME_EQUIV = {
  joan: 'juan', josep: 'jose', jaume: 'jaime', carles: 'carlos',
  pere: 'pedro', antoni: 'antonio', andreu: 'andres',
  francesc: 'francisco', miquel: 'miguel', xavier: 'javier',
  xoan: 'juan', xose: 'jose', xosé: 'jose',
}

function stripAccents(s) {
  return String(s || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// Tokenize a string: strip accents, remove stop words, drop single-char tokens,
// and normalize well-known Catalan/Galego patronymics to their Spanish form.
function tokenize(s) {
  return stripAccents(s)
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(t => t && !STOP_WORDS.has(t) && t.length > 1)
    .map(t => NAME_EQUIV[t] || t)
}

// Tokenize without stop words removed (for trigram similarity) but still
// applying patronymic normalization, so "Sant Joan" and "San Juan" match.
function tokensRaw(s) {
  return stripAccents(s)
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(t => NAME_EQUIV[t] || t)
}

// Jaccard similarity on tokens (0..1).
function jaccard(a, b) {
  const ta = new Set(tokenize(a))
  const tb = new Set(tokenize(b))
  if (ta.size === 0 || tb.size === 0) return 0
  let inter = 0
  for (const t of ta) if (tb.has(t)) inter++
  return inter / (ta.size + tb.size - inter)
}

// Character trigram set of a normalized string (for fuzzy/short-name matching).
function trigrams(s) {
  const t = ' ' + tokensRaw(s).join(' ') + ' '
  const g = new Set()
  for (let i = 0; i <= t.length - 3; i++) g.add(t.slice(i, i + 3))
  return g
}

function trigramSim(a, b) {
  const ga = trigrams(a)
  const gb = trigrams(b)
  if (ga.size === 0 || gb.size === 0) return 0
  let inter = 0
  for (const t of ga) if (gb.has(t)) inter++
  return inter / Math.max(ga.size, gb.size)
}

// Combined name similarity (0..1).
// 55% tokens (good for distinct words) + 45% trigrams (good for short names,
// typos and partial matches across languages like "Muro" ↔ "Es Muro").
function similitud(a, b) {
  return 0.55 * jaccard(a, b) + 0.45 * trigramSim(a, b)
}

// Municipality agreement (0..1). Uses plain Jaccard on normalized tokens
// because municipality names are usually short and consistent.
function municipioMatch(a, b) {
  const ta = new Set(tokenize(a))
  const tb = new Set(tokenize(b))
  if (ta.size === 0 || tb.size === 0) return 0
  let inter = 0
  for (const t of ta) if (tb.has(t)) inter++
  return inter / Math.max(ta.size, tb.size)
}

// MITECO is a coastal dataset. River beaches will never match — we flag them
// so the caller can skip matching entirely (and count them as orphans OSM).
function esFluvial(nombre) {
  if (!nombre) return false
  return /\b(fluvial|rio|río|embalse|presa|lago|pantano)\b/i.test(nombre)
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

// Scoring function: combined distance + name similarity + municipality bonus.
// Returns a number in [0..1], higher is better.
function scoreMatch(o, m, dist) {
  if (dist > 500) return -1
  const sim = similitud(o.nombre, m.nombre)
  const mun = municipioMatch(o.municipio, m.municipio)
  // Linear distance decay: 1 at 0 m, 0 at 500 m.
  const distFactor = 1 - (dist / 500)
  // Weights: 40% distance, 45% name similarity, 15% municipality.
  // Municipality is a soft bonus because OSM and MITECO use inconsistent
  // naming ("Santa Cruz de Tenerife" vs "Santa Cruz Tenerife").
  return 0.40 * distFactor + 0.45 * sim + 0.15 * mun
}

// Classify a match into quality buckets.
function classify(dist, sim, munMatch) {
  // EXCELENTE: very close + names match clearly
  if (dist < 100 && sim >= 0.5) return 'EXCELENTE'
  // Same spot + same municipality is essentially the same beach even if names
  // differ (e.g. "Praia das Catedrais" vs "Playa de las Catedrales" — 0.18 on
  // tokens/trigrams but the same place). Municipality agreement is the safety
  // net that makes this rule safe.
  if (dist < 60 && munMatch >= 0.6) return 'EXCELENTE'
  // Or close-ish but with both name AND municipality support
  if (dist < 200 && sim >= 0.4 && munMatch >= 0.5) return 'EXCELENTE'
  // BUENO: reasonable proximity with decent name signal
  if (dist < 250 && sim >= 0.35) return 'BUENO'
  if (dist < 400 && sim >= 0.45) return 'BUENO'
  // Close distance + municipality match but weaker name signal
  if (dist < 150 && munMatch >= 0.6 && sim >= 0.2) return 'BUENO'
  // DUDOSO: still somewhat plausible
  if (dist < 400 && sim >= 0.25) return 'DUDOSO'
  if (dist < 200 && sim >= 0.15) return 'DUDOSO'
  // Everything else is suspicious and should NOT be used as a redirect source.
  return 'SOSPECHOSO'
}

// Build a best-match map from OSM to MITECO for a list of candidates,
// returning {match, score, dist, sim, munMatch} or null.
function findBest(o, candidatos) {
  let best = null
  let bestScore = -Infinity
  let bestDist = Infinity
  for (const m of candidatos) {
    const d = haversine(o.lat, o.lng, m.lat, m.lng)
    if (d > 500) continue
    const s = scoreMatch(o, m, d)
    if (s > bestScore) {
      bestScore = s
      best = m
      bestDist = d
    }
  }
  if (!best) return null
  return {
    match: best,
    score: bestScore,
    dist: bestDist,
    sim: similitud(o.nombre, best.nombre),
    munMatch: municipioMatch(o.municipio, best.municipio),
  }
}

// Main matching routine.
// Returns { matches, huerfanas_osm, huerfanas_miteco }.
//
// Uses mutual best-match: an OSM beach O pairs with MITECO M only if
// M's best OSM candidate (by the same score) is also O. This prevents
// the dense-cluster problem where two different OSM beaches in a tight
// area both point to the same MITECO and one gets wrongly reassigned.
function matchAll(osm, miteco) {
  // Index MITECO by province (lowercased).
  const mPorProv = {}
  for (const m of miteco) {
    const k = stripAccents(m.provincia || '')
    if (!mPorProv[k]) mPorProv[k] = []
    mPorProv[k].push(m)
  }

  // Index OSM by province too (for reverse lookup).
  const oPorProv = {}
  for (const o of osm) {
    const k = stripAccents(o.provincia || '')
    if (!oPorProv[k]) oPorProv[k] = []
    oPorProv[k].push(o)
  }

  const matches = []
  const huerfanas_osm = []

  // First pass: for each OSM, find its best MITECO candidate.
  const osmBest = new Map() // osm.slug -> {match, score, ...}
  for (const o of osm) {
    if (!o.slug) continue
    if (esFluvial(o.nombre)) {
      huerfanas_osm.push({ ...o, razon: 'fluvial' })
      continue
    }
    const k = stripAccents(o.provincia || '')
    const candidatos = mPorProv[k] ?? []
    const best = findBest(o, candidatos)
    if (best) osmBest.set(o.slug, { o, ...best })
    else huerfanas_osm.push({ ...o, razon: 'sin_candidatos' })
  }

  // Second pass: for each MITECO, find its best OSM candidate.
  const mitecoBest = new Map() // miteco.slug -> {match (osm), score, ...}
  for (const m of miteco) {
    if (!m.slug) continue
    const k = stripAccents(m.provincia || '')
    const candidatos = oPorProv[k] ?? []
    let best = null
    let bestScore = -Infinity
    let bestDist = Infinity
    for (const o of candidatos) {
      if (esFluvial(o.nombre)) continue
      const d = haversine(m.lat, m.lng, o.lat, o.lng)
      if (d > 500) continue
      const s = scoreMatch(o, m, d)
      if (s > bestScore) {
        bestScore = s
        best = o
        bestDist = d
      }
    }
    if (best) {
      mitecoBest.set(m.slug, {
        osm: best,
        score: bestScore,
        dist: bestDist,
        sim: similitud(best.nombre, m.nombre),
        munMatch: municipioMatch(best.municipio, m.municipio),
      })
    }
  }

  // Keep only mutual best pairs. Demote non-mutual pairs to "SOSPECHOSO" so
  // the caller can still inspect them in the preview but they won't qualify
  // as EXCELENTE or BUENO redirects.
  const usadas_miteco = new Set()
  const usadas_osm = new Set()
  for (const [slug, entry] of osmBest.entries()) {
    const { o, match: m, dist, sim, munMatch } = entry
    const reverse = mitecoBest.get(m.slug)
    const isMutual = reverse && reverse.osm.slug === o.slug
    let calidad = classify(dist, sim, munMatch)
    if (!isMutual && calidad !== 'SOSPECHOSO') calidad = 'DUDOSO'
    matches.push({
      osm_slug: o.slug,
      osm_nombre: o.nombre,
      osm_municipio: o.municipio,
      osm_provincia: o.provincia,
      osm_lat: o.lat,
      osm_lng: o.lng,
      miteco_slug: m.slug,
      miteco_nombre: m.nombre,
      miteco_municipio: m.municipio,
      miteco_provincia: m.provincia,
      miteco_lat: m.lat,
      miteco_lng: m.lng,
      dist_m: dist,
      similitud: parseFloat(sim.toFixed(2)),
      municipio_match: parseFloat(munMatch.toFixed(2)),
      mutual: isMutual,
      calidad,
      cambio_slug: o.slug !== m.slug,
    })
    if (calidad === 'EXCELENTE' || calidad === 'BUENO') {
      usadas_miteco.add(m.slug)
      usadas_osm.add(o.slug)
    }
  }

  // OSM beaches whose best MITECO match was rejected become orphans too.
  for (const o of osm) {
    if (!o.slug) continue
    if (esFluvial(o.nombre)) continue
    if (usadas_osm.has(o.slug)) continue
    if (osmBest.has(o.slug)) continue // already recorded via matches list
    if (huerfanas_osm.find(h => h.slug === o.slug)) continue
    huerfanas_osm.push({ ...o, razon: 'score_bajo' })
  }

  const huerfanas_miteco = miteco.filter(m => !usadas_miteco.has(m.slug))

  return {
    matches,
    huerfanas_osm,
    huerfanas_miteco,
    usadas_miteco,
    usadas_osm,
  }
}

module.exports = {
  STOP_WORDS,
  BEACH_WORDS,
  stripAccents,
  tokenize,
  jaccard,
  trigramSim,
  similitud,
  municipioMatch,
  esFluvial,
  haversine,
  scoreMatch,
  classify,
  findBest,
  matchAll,
}
