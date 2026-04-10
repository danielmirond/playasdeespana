#!/usr/bin/env node
// validate-miteco-merge.js
// DRY-RUN: compara OSM ↔ MITECO y genera reporte sin modificar nada
//
// Uso: npm run validate:miteco
//
// Genera:
//   - Estadísticas de matching
//   - Ejemplos de matches (exactos, dudosos, huérfanas)
//   - public/data/merge-preview.json con todo el análisis

const https = require('https')
const fs    = require('fs')
const path  = require('path')

const DATA_DIR    = path.join(__dirname, '..', 'public', 'data')
const PLAYAS_JSON = path.join(DATA_DIR, 'playas.json')
const PREVIEW     = path.join(DATA_DIR, 'merge-preview.json')

const MITECO_URL =
  'https://opendata.arcgis.com/api/v3/datasets/84ddbc8cf4104a579d579f6441fcaa8a_0/downloads/data?format=geojson&spatialRefId=4326'

function get(url) {
  return new Promise((res, rej) => {
    const req = https.get(url, { headers: { 'User-Agent': 'playas-espana.com/1.0' } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        return get(r.headers.location).then(res).catch(rej)
      }
      let d = ''
      r.on('data', c => d += c)
      r.on('end', () => res({ status: r.statusCode, body: d }))
    })
    req.on('error', rej)
    req.setTimeout(180000, () => { req.destroy(); rej(new Error('Timeout')) })
  })
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)))
}

// Similaridad de texto 0..1 (basada en tokens comunes)
function similitud(a, b) {
  const norm = s => String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(playa|platja|praia|cala|el|la|los|las|de|del|da|do|y)\b/gi, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/).filter(Boolean)
  const ta = new Set(norm(a))
  const tb = new Set(norm(b))
  if (ta.size === 0 || tb.size === 0) return 0
  let common = 0
  for (const t of ta) if (tb.has(t)) common++
  return common / Math.max(ta.size, tb.size)
}

function slugify(str) {
  return String(str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-')
}

async function main() {
  console.log('='.repeat(60))
  console.log('validate-miteco-merge.js — DRY RUN (no modifica nada)')
  console.log('='.repeat(60))

  // Cargar OSM
  const osm = JSON.parse(fs.readFileSync(PLAYAS_JSON, 'utf8'))
  console.log(`\n[1] OSM: ${osm.length} playas`)

  // Descargar MITECO
  console.log('\n[2] Descargando MITECO...')
  const { status, body } = await get(MITECO_URL)
  if (status !== 200) { console.error(`HTTP ${status}`); process.exit(1) }
  const data = JSON.parse(body)
  const miteco = (data.features ?? [])
    .filter(f => f.properties?.Nombre?.trim())
    .map(f => {
      const p = f.properties
      const [lng, lat] = f.geometry?.coordinates ?? [0, 0]
      const nombre    = (p.Nombre ?? '').trim()
      const municipio = (p['Término_M'] ?? '').trim()
      return {
        nombre,
        municipio,
        provincia: (p.Provincia ?? '').trim(),
        lat: parseFloat(Number(lat).toFixed(6)),
        lng: parseFloat(Number(lng).toFixed(6)),
        slug: slugify(`${nombre} ${municipio}`),
      }
    })
    .filter(p => p.lat >= 27 && p.lat <= 44 && p.lng >= -19 && p.lng <= 5)
  console.log(`  ${miteco.length} playas MITECO válidas`)

  // Indexar MITECO por provincia
  const mPorProv = {}
  for (const m of miteco) {
    const k = m.provincia.toLowerCase()
    if (!mPorProv[k]) mPorProv[k] = []
    mPorProv[k].push(m)
  }

  // Cruzar
  console.log('\n[3] Haciendo matching (<500m, misma provincia)...')
  const matches = []          // {osm, miteco, dist, similitud, calidad}
  const huerfanas_osm = []    // OSM sin match
  const usadas_miteco = new Set()

  for (const o of osm) {
    if (!o.slug) continue
    const k = (o.provincia ?? '').toLowerCase()
    const candidatos = mPorProv[k] ?? miteco
    let best = null
    let bestDist = Infinity
    for (const m of candidatos) {
      if (usadas_miteco.has(m.slug)) continue
      const d = haversine(o.lat, o.lng, m.lat, m.lng)
      if (d < bestDist && d < 500) {
        bestDist = d
        best = m
      }
    }
    if (best) {
      usadas_miteco.add(best.slug)
      const sim = similitud(o.nombre, best.nombre)
      // Calidad del match
      let calidad
      if (bestDist < 100 && sim >= 0.5) calidad = 'EXCELENTE'
      else if (bestDist < 250 && sim >= 0.3) calidad = 'BUENO'
      else if (bestDist < 500 && sim >= 0.2) calidad = 'DUDOSO'
      else calidad = 'SOSPECHOSO'
      matches.push({
        osm_slug: o.slug,
        osm_nombre: o.nombre,
        osm_municipio: o.municipio,
        miteco_slug: best.slug,
        miteco_nombre: best.nombre,
        miteco_municipio: best.municipio,
        dist_m: bestDist,
        similitud: parseFloat(sim.toFixed(2)),
        calidad,
        cambio_slug: o.slug !== best.slug,
      })
    } else {
      huerfanas_osm.push({
        slug: o.slug,
        nombre: o.nombre,
        municipio: o.municipio,
        provincia: o.provincia,
      })
    }
  }

  const huerfanas_miteco = miteco.filter(m => !usadas_miteco.has(m.slug))

  // Categorías
  const excelentes = matches.filter(m => m.calidad === 'EXCELENTE')
  const buenas     = matches.filter(m => m.calidad === 'BUENO')
  const dudosas    = matches.filter(m => m.calidad === 'DUDOSO')
  const sospechosas = matches.filter(m => m.calidad === 'SOSPECHOSO')
  const cambianSlug = matches.filter(m => m.cambio_slug)

  // Reporte
  console.log('\n' + '='.repeat(60))
  console.log('REPORTE DE MATCHING')
  console.log('='.repeat(60))
  console.log(`\nTotales:`)
  console.log(`  OSM:              ${osm.length}`)
  console.log(`  MITECO:           ${miteco.length}`)
  console.log(`  Matches:          ${matches.length}  (${Math.round(matches.length / osm.length * 100)}% de OSM)`)
  console.log(`  Huérfanas OSM:    ${huerfanas_osm.length}  (OSM sin MITECO)`)
  console.log(`  Huérfanas MITECO: ${huerfanas_miteco.length}  (MITECO sin OSM)`)
  console.log(`\nCalidad de matches:`)
  console.log(`  EXCELENTE  (<100m + nombre similar):     ${excelentes.length}`)
  console.log(`  BUENO      (<250m + nombre similar):     ${buenas.length}`)
  console.log(`  DUDOSO     (<500m + nombre algo parec.): ${dudosas.length}`)
  console.log(`  SOSPECHOSO (<500m + nombre distinto):    ${sospechosas.length}`)
  console.log(`\nRedirects 301 necesarios: ${cambianSlug.length}  (slugs que cambian)`)

  // Ejemplos
  console.log('\n' + '='.repeat(60))
  console.log('EJEMPLOS DE MATCHES')
  console.log('='.repeat(60))

  console.log('\n--- 10 EXCELENTES (estos son seguros) ---')
  excelentes.slice(0, 10).forEach(m => {
    console.log(`  ${m.osm_slug}`)
    console.log(`    ↳ ${m.miteco_slug}  (${m.dist_m}m, sim=${m.similitud})`)
  })

  console.log('\n--- 10 DUDOSOS (revisar manualmente) ---')
  dudosas.slice(0, 10).forEach(m => {
    console.log(`  OSM:    "${m.osm_nombre}" (${m.osm_municipio})`)
    console.log(`  MITECO: "${m.miteco_nombre}" (${m.miteco_municipio})`)
    console.log(`    ↳ ${m.dist_m}m, sim=${m.similitud}`)
  })

  console.log('\n--- 10 SOSPECHOSOS (probablemente mal) ---')
  sospechosas.slice(0, 10).forEach(m => {
    console.log(`  OSM:    "${m.osm_nombre}" (${m.osm_municipio})`)
    console.log(`  MITECO: "${m.miteco_nombre}" (${m.miteco_municipio})`)
    console.log(`    ↳ ${m.dist_m}m, sim=${m.similitud}`)
  })

  console.log('\n--- 10 OSM HUÉRFANAS (sin match MITECO) ---')
  huerfanas_osm.slice(0, 10).forEach(o => {
    console.log(`  ${o.slug}  (${o.municipio}, ${o.provincia})`)
  })

  console.log('\n--- 10 MITECO HUÉRFANAS (sin match OSM) ---')
  huerfanas_miteco.slice(0, 10).forEach(m => {
    console.log(`  ${m.slug}  (${m.municipio}, ${m.provincia})`)
  })

  // Guardar preview completo
  const preview = {
    timestamp: new Date().toISOString(),
    summary: {
      osm_total: osm.length,
      miteco_total: miteco.length,
      matches: matches.length,
      huerfanas_osm: huerfanas_osm.length,
      huerfanas_miteco: huerfanas_miteco.length,
      calidad: {
        excelentes: excelentes.length,
        buenos: buenas.length,
        dudosos: dudosas.length,
        sospechosos: sospechosas.length,
      },
      redirects_necesarios: cambianSlug.length,
    },
    matches: matches.slice(0, 500),       // primeros 500 para revisar
    huerfanas_osm: huerfanas_osm.slice(0, 200),
    huerfanas_miteco: huerfanas_miteco.slice(0, 200),
  }
  fs.writeFileSync(PREVIEW, JSON.stringify(preview, null, 2))
  console.log(`\n✓ Preview guardado en ${PREVIEW}`)
  console.log('\nRevisa el archivo y si todo se ve bien ejecuta:')
  console.log('  npm run sync:playas-miteco')
}

main().catch(e => { console.error(e); process.exit(1) })
