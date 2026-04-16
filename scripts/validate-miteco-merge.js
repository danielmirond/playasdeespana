#!/usr/bin/env node
// validate-miteco-merge.js
// DRY-RUN: compara OSM ↔ MITECO y genera reporte sin modificar nada
//
// Uso: npm run validate:miteco
//
// Genera:
//   - Estadísticas de matching (por calidad: excelente/bueno/dudoso/sospechoso)
//   - Ejemplos de matches en cada categoría
//   - public/data/merge-preview.json con el análisis completo
//
// Algoritmo: scripts/lib/miteco-match.js (compartido con sync-playas-miteco.js)

const https = require('https')
const fs    = require('fs')
const path  = require('path')

const { matchAll } = require('./lib/miteco-match')

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

  // Cruzar usando el algoritmo compartido
  console.log('\n[3] Haciendo matching (mutual best, <500m, skip fluvial)...')
  const { matches, huerfanas_osm, huerfanas_miteco } = matchAll(osm, miteco)

  // Categorías
  const excelentes  = matches.filter(m => m.calidad === 'EXCELENTE')
  const buenas      = matches.filter(m => m.calidad === 'BUENO')
  const dudosas     = matches.filter(m => m.calidad === 'DUDOSO')
  const sospechosas = matches.filter(m => m.calidad === 'SOSPECHOSO')
  const mutuas      = matches.filter(m => m.mutual)
  const cambianSlug = matches
    .filter(m => (m.calidad === 'EXCELENTE' || m.calidad === 'BUENO') && m.cambio_slug)

  // Reporte
  console.log('\n' + '='.repeat(60))
  console.log('REPORTE DE MATCHING')
  console.log('='.repeat(60))
  console.log(`\nTotales:`)
  console.log(`  OSM:              ${osm.length}`)
  console.log(`  MITECO:           ${miteco.length}`)
  console.log(`  Matches:          ${matches.length}  (${Math.round(matches.length / osm.length * 100)}% de OSM)`)
  console.log(`  Mutual best:      ${mutuas.length}  (${Math.round(mutuas.length / Math.max(matches.length, 1) * 100)}% son simétricos)`)
  console.log(`  Huérfanas OSM:    ${huerfanas_osm.length}  (OSM sin MITECO utilizable)`)
  console.log(`  Huérfanas MITECO: ${huerfanas_miteco.length}  (MITECO sin OSM utilizable)`)
  console.log(`\nCalidad de matches:`)
  console.log(`  EXCELENTE:   ${excelentes.length.toString().padStart(5)}  (seguros para enriquecer)`)
  console.log(`  BUENO:       ${buenas.length.toString().padStart(5)}  (aceptables)`)
  console.log(`  DUDOSO:      ${dudosas.length.toString().padStart(5)}  (revisar)`)
  console.log(`  SOSPECHOSO:  ${sospechosas.length.toString().padStart(5)}  (descartar)`)
  console.log(`\nSlugs que cambian entre EXCELENTE + BUENO: ${cambianSlug.length}`)
  console.log('  (esta es la cota superior de redirects 301 si tomáramos MITECO como primario)')

  // Ejemplos
  console.log('\n' + '='.repeat(60))
  console.log('EJEMPLOS DE MATCHES')
  console.log('='.repeat(60))

  const fmt = (m, label) => {
    console.log(`  [${label}] dist=${m.dist_m}m  sim=${m.similitud}  mun=${m.municipio_match}  mutual=${m.mutual}`)
    console.log(`    OSM:    "${m.osm_nombre}" (${m.osm_municipio}, ${m.osm_provincia})`)
    console.log(`    MITECO: "${m.miteco_nombre}" (${m.miteco_municipio}, ${m.miteco_provincia})`)
  }

  console.log('\n--- 10 EXCELENTES ---')
  excelentes.slice(0, 10).forEach(m => fmt(m, 'EXC'))

  console.log('\n--- 10 BUENOS ---')
  buenas.slice(0, 10).forEach(m => fmt(m, 'BUE'))

  console.log('\n--- 10 DUDOSOS ---')
  dudosas.slice(0, 10).forEach(m => fmt(m, 'DUD'))

  console.log('\n--- 10 SOSPECHOSOS ---')
  sospechosas.slice(0, 10).forEach(m => fmt(m, 'SOS'))

  console.log('\n--- 10 OSM HUÉRFANAS ---')
  huerfanas_osm.slice(0, 10).forEach(o => {
    console.log(`  ${o.slug}  (${o.municipio}, ${o.provincia})  razón=${o.razon}`)
  })

  console.log('\n--- 10 MITECO HUÉRFANAS ---')
  huerfanas_miteco.slice(0, 10).forEach(m => {
    console.log(`  ${m.slug}  (${m.municipio}, ${m.provincia})`)
  })

  // Guardar preview completo
  const preview = {
    timestamp: new Date().toISOString(),
    algoritmo: 'v2-mutual-best-match',
    summary: {
      osm_total: osm.length,
      miteco_total: miteco.length,
      matches: matches.length,
      mutual_best: mutuas.length,
      huerfanas_osm: huerfanas_osm.length,
      huerfanas_miteco: huerfanas_miteco.length,
      calidad: {
        excelentes: excelentes.length,
        buenos: buenas.length,
        dudosos: dudosas.length,
        sospechosos: sospechosas.length,
      },
      redirects_potenciales: cambianSlug.length,
    },
    // Primeros 500 de cada categoría para revisión manual
    excelentes_sample: excelentes.slice(0, 500),
    buenos_sample: buenas.slice(0, 500),
    dudosos_sample: dudosas.slice(0, 500),
    sospechosos_sample: sospechosas.slice(0, 500),
    huerfanas_osm_sample: huerfanas_osm.slice(0, 200),
    huerfanas_miteco_sample: huerfanas_miteco.slice(0, 200),
  }
  fs.writeFileSync(PREVIEW, JSON.stringify(preview, null, 2))
  console.log(`\n✓ Preview guardado en ${PREVIEW}`)
  console.log('\nRevisa el archivo. Si los EXCELENTE + BUENO se ven bien, ejecuta:')
  console.log('  npm run sync:playas-miteco')
}

main().catch(e => { console.error(e); process.exit(1) })
