#!/usr/bin/env node
// sync-playas-miteco.js
// FUSIONA el dataset oficial MITECO con el playas.json existente (OSM)
//
// Estrategia:
//   1. Lee public/data/playas.json actual (OSM)
//   2. Descarga el GeoJSON oficial MITECO
//   3. Para cada playa OSM, busca la MITECO más cercana (<500m)
//   4. Enriquece la playa OSM con los campos MITECO (descripcion, hospital, etc.)
//   5. Mantiene los slugs originales para no romper SEO
//   6. Guarda el resultado fusionado
//
// Uso: npm run sync:playas-miteco

const https = require('https')
const fs    = require('fs')
const path  = require('path')

const PLAYAS_JSON = path.join(__dirname, '..', 'public', 'data', 'playas.json')
const MITECO_URL =
  'https://opendata.arcgis.com/api/v3/datasets/84ddbc8cf4104a579d579f6441fcaa8a_0/downloads/data?format=geojson&spatialRefId=4326'

function get(url) {
  return new Promise((res, rej) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'playas-espana.com/1.0' },
    }, r => {
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
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function si(v) {
  if (!v) return false
  const s = String(v).trim().toLowerCase()
  return s === 'sí' || s === 'si' || s === 's' || s === 'yes'
}

function numero(v) {
  if (!v) return null
  const m = String(v).match(/(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : null
}

// Extrae solo los campos MITECO (sin pisar lo de OSM)
function camposMiteco(p) {
  return {
    // Descriptivos
    descripcion: (p.Descripci ?? '').trim() || null,
    nombres_alt: (p.Nombre_alt ?? '').trim() || null,

    // Datos físicos adicionales
    longitud_miteco: numero(p.Longitud),
    anchura_miteco:  numero(p.Anchura),
    tipo_arena:      (p['Tipo_de_ar'] ?? '').trim() || null,

    // Características
    grado_ocupacion: (p.Grado_ocup ?? '').trim() || null,
    grado_urbano:    (p.Grado_urba ?? '').trim() || null,
    condiciones:     (p.Condicione ?? '').trim() || null,
    fachada_litoral: (p.Fachada_Li ?? '').trim() || null,
    tipo_paseo:      (p.Tipo_paseo ?? '').trim() || null,

    // Booleans adicionales (no pisan OSM si OSM tenía true)
    aseos:       si(p.Aseos),
    lavapies:    si(p.Lavapies),
    papelera:    si(p.Papelera),
    telefonos:   si(p['Teléfonos']),
    limpieza:    si(p.Servicio_l),
    oficina_turismo: si(p.Oficina_tu),
    paseo_maritimo:  si(p.Paseo_mar),
    vegetacion:      si(p['Vegetació']),
    zona_fondeo:     si(p.Zona_fonde),
    espacio_protegido: si(p.Espacio_pr),

    // Alquileres
    alquiler_sombrillas: si(p.Alquiler_s),
    alquiler_hamacas:    si(p.Alquiler_h),
    alquiler_nautico:    si(p.Alquiler_n),

    // Zonas
    zona_infantil:  si(p.Zona_infan),
    zona_deportiva: si(p.Zona_depor),
    club_nautico:   si(p['Club_naút']),

    // Acceso
    forma_acceso:  (p.Forma_de_a ?? '').trim() || null,
    carretera:     (p['Carretera_'] ?? '').trim() || null,
    autobus_tipo:  (p['Autobús_t'] ?? '').trim() || null,
    establecimientos: si(p.Establecim),
    senalizacion:  si(p.Señalizac),
    parking_tipo:     (p.Aparcami_1 ?? '').trim() || null,
    parking_plazas:   (p.Aparcami_2 ?? '').trim() || null,

    // Puerto
    puerto_deportivo: (p.Puerto_dep ?? '').trim() || null,
    puerto_web:       (p.Web_puerto ?? '').trim() || null,
    puerto_dist:      (p['Distancia_'] ?? '').trim() || null,

    // Hospital
    hospital:        (p.Hospital ?? '').trim() || null,
    hospital_direc:  (p['Dirección'] ?? '').trim() || null,
    hospital_tel:    (p['Teléfono_'] ?? '').trim() || null,
    hospital_dist:   (p.Distancia1 ?? '').trim() || null,

    // Referencias
    ine_municipio:    p['Código_IN'] ?? null,
    web_ayuntamiento: (p.Web_munici ?? '').trim() || null,
    url_miteco:       (p.URL_MAGRAM ?? '').trim() || null,
  }
}

// Quita campos null/false/vacíos para no inflar el JSON
function limpiar(obj) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || v === false || v === '') continue
    out[k] = v
  }
  return out
}

async function main() {
  console.log('='.repeat(60))
  console.log('sync-playas-miteco.js — FUSIÓN con playas.json existente')
  console.log('='.repeat(60))

  // 1. Leer playas.json actual (OSM)
  if (!fs.existsSync(PLAYAS_JSON)) {
    console.error(`✗ No existe ${PLAYAS_JSON}`)
    console.error('  Ejecuta primero: npm run sync:playas')
    process.exit(1)
  }
  const playas = JSON.parse(fs.readFileSync(PLAYAS_JSON, 'utf8'))
  console.log(`\n[1] Playas OSM cargadas: ${playas.length}`)

  // 2. Descargar MITECO
  console.log('\n[2] Descargando dataset MITECO...')
  const { status, body } = await get(MITECO_URL)
  if (status !== 200) {
    console.error(`  ✗ HTTP ${status}`)
    process.exit(1)
  }
  const mitecoData = JSON.parse(body)
  const mitecoFeatures = mitecoData.features ?? []
  console.log(`  ${mitecoFeatures.length} features MITECO descargadas`)

  // 3. Construir índice espacial por provincia para fusión eficiente
  console.log('\n[3] Fusionando por proximidad (<500m)...')
  const porProv = {}
  for (const f of mitecoFeatures) {
    const prov = (f.properties?.Provincia ?? '').trim().toLowerCase()
    if (!porProv[prov]) porProv[prov] = []
    porProv[prov].push(f)
  }

  let cruzadas = 0
  for (const p of playas) {
    const prov = (p.provincia ?? '').trim().toLowerCase()
    const candidatos = porProv[prov] ?? mitecoFeatures
    let best = null
    let bestDist = Infinity
    for (const f of candidatos) {
      const [lng, lat] = f.geometry?.coordinates ?? [0, 0]
      const d = haversine(p.lat, p.lng, lat, lng)
      if (d < bestDist && d < 500) {
        bestDist = d
        best = f.properties
      }
    }
    if (best) {
      Object.assign(p, limpiar(camposMiteco(best)))
      cruzadas++
    }
  }
  console.log(`  ${cruzadas} / ${playas.length} playas enriquecidas (${Math.round(cruzadas / playas.length * 100)}%)`)

  // 4. Guardar (manteniendo los slugs originales)
  fs.writeFileSync(PLAYAS_JSON, JSON.stringify(playas, null, 2))
  console.log(`\n✓ Guardado ${playas.length} playas → ${path.relative(process.cwd(), PLAYAS_JSON)}`)

  // Stats
  console.log('\n' + '='.repeat(60))
  console.log('STATS DE ENRIQUECIMIENTO')
  console.log('='.repeat(60))
  const stats = {
    descripcion:      playas.filter(p => p.descripcion).length,
    hospital:         playas.filter(p => p.hospital).length,
    puerto_deportivo: playas.filter(p => p.puerto_deportivo).length,
    grado_ocupacion:  playas.filter(p => p.grado_ocupacion).length,
    tipo_arena:       playas.filter(p => p.tipo_arena).length,
    paseo_maritimo:   playas.filter(p => p.paseo_maritimo).length,
    zona_infantil:    playas.filter(p => p.zona_infantil).length,
    alquiler_sombrillas: playas.filter(p => p.alquiler_sombrillas).length,
    web_ayuntamiento: playas.filter(p => p.web_ayuntamiento).length,
    url_miteco:       playas.filter(p => p.url_miteco).length,
  }
  for (const [k, v] of Object.entries(stats)) {
    console.log(`  ${k.padEnd(22)} ${String(v).padStart(5)} / ${playas.length}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
