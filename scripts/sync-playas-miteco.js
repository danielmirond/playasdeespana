#!/usr/bin/env node
// sync-playas-miteco.js
// Genera playas.json combinado: MITECO (primario) + OSM (huérfanas)
// Y slug-redirects.json para 301 de URLs viejas
//
// Estrategia:
//   1. Descarga MITECO (dataset oficial, ~3500 playas)
//   2. Lee playas.json actual (OSM, ~5000 playas)
//   3. Para cada OSM busca MITECO más cercana (<500m, misma provincia)
//   4. Si hay match → MITECO gana (slug oficial), OSM se descarta pero
//      su slug va a redirects.json
//   5. Si no hay match → OSM se mantiene con sus datos
//   6. Resultado: playas.json con slugs oficiales + redirects.json
//
// Uso: npm run sync:playas-miteco

const https = require('https')
const fs    = require('fs')
const path  = require('path')

const DATA_DIR     = path.join(__dirname, '..', 'public', 'data')
const PLAYAS_JSON  = path.join(DATA_DIR, 'playas.json')
const REDIRECTS    = path.join(DATA_DIR, 'slug-redirects.json')
const SLUG_INDEX   = path.join(DATA_DIR, 'slug-index.json')

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

function slugify(str) {
  return String(str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function uniqueSlug(base, used) {
  let slug = base || 'playa', i = 2
  while (used.has(slug)) slug = `${base}-${i++}`
  used.add(slug)
  return slug
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

function provinciaAComunidad(prov) {
  const map = {
    'A Coruña': 'Galicia', 'Lugo': 'Galicia', 'Pontevedra': 'Galicia',
    'Asturias': 'Asturias', 'Cantabria': 'Cantabria',
    'Bizkaia': 'País Vasco', 'Gipuzkoa': 'País Vasco',
    'Girona': 'Cataluña', 'Barcelona': 'Cataluña', 'Tarragona': 'Cataluña',
    'Castellón': 'Comunitat Valenciana', 'Valencia': 'Comunitat Valenciana', 'Alicante': 'Comunitat Valenciana',
    'Murcia': 'Murcia',
    'Almería': 'Andalucía', 'Granada': 'Andalucía', 'Málaga': 'Andalucía', 'Cádiz': 'Andalucía', 'Huelva': 'Andalucía',
    'Las Palmas': 'Canarias', 'Santa Cruz de Tenerife': 'Canarias',
    'Illes Balears': 'Islas Baleares', 'Baleares': 'Islas Baleares',
    'Ceuta': 'Ceuta', 'Melilla': 'Melilla',
  }
  return map[prov] ?? 'España'
}

// Normaliza un feature MITECO al formato Playa
function normalizarMiteco(f) {
  const p = f.properties
  const [lng, lat] = f.geometry?.coordinates ?? [0, 0]
  const nombre    = (p.Nombre ?? '').trim()
  const municipio = (p['Término_M'] ?? p.Termino_M ?? '').trim()
  const provincia = (p.Provincia ?? '').trim()
  const comunidad = (p['Comunidad_'] ?? '').trim() || provinciaAComunidad(provincia)

  return {
    source:    'miteco',
    id:        String(p.Identifica ?? p.OBJECTID),
    nombre,
    municipio,
    provincia,
    comunidad,
    lat:  parseFloat(Number(lat).toFixed(6)),
    lng:  parseFloat(Number(lng).toFixed(6)),

    // Físicos
    longitud:    numero(p.Longitud),
    anchura:     numero(p.Anchura),
    composicion: (p['Composici'] ?? '').trim() || null,
    tipo:        (p['Tipo_de_ar'] ?? '').trim() || null,
    descripcion: (p.Descripci ?? '').trim() || null,
    nombres_alt: (p.Nombre_alt ?? '').trim() || null,

    // Servicios
    bandera:     si(p.Bandera_az),
    socorrismo:  si(p['Auxilio_y_']),
    accesible:   si(p.Acceso_dis),
    duchas:      si(p.Duchas),
    parking:     si(p.Aparcamien),
    nudista:     si(p.Nudismo),
    aseos:       si(p.Aseos),
    lavapies:    si(p.Lavapies),
    papelera:    si(p.Papelera),
    telefonos:   si(p['Teléfonos']),
    limpieza:    si(p.Servicio_l),
    oficina_turismo: si(p.Oficina_tu),

    // Alquileres
    alquiler_sombrillas: si(p.Alquiler_s),
    alquiler_hamacas:    si(p.Alquiler_h),
    alquiler_nautico:    si(p.Alquiler_n),
    zona_infantil:  si(p.Zona_infan),
    zona_deportiva: si(p.Zona_depor),
    club_nautico:   si(p['Club_naút']),

    // Características
    grado_ocupacion: (p.Grado_ocup ?? '').trim() || null,
    grado_urbano:    (p.Grado_urba ?? '').trim() || null,
    condiciones:     (p.Condicione ?? '').trim() || null,
    paseo_maritimo:  si(p.Paseo_mar),
    tipo_paseo:      (p.Tipo_paseo ?? '').trim() || null,
    vegetacion:      si(p['Vegetació']),
    zona_fondeo:     si(p.Zona_fonde),
    fachada_litoral: (p.Fachada_Li ?? '').trim() || null,
    espacio_protegido: si(p.Espacio_pr),

    // Acceso
    forma_acceso:  (p.Forma_de_a ?? '').trim() || null,
    carretera:     (p['Carretera_'] ?? '').trim() || null,
    autobus:       si(p['Autobús']),
    autobus_tipo:  (p['Autobús_t'] ?? '').trim() || null,
    establecimientos: si(p.Establecim),
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

// Quita null/undefined/'' para no inflar el JSON
function limpiar(obj) {
  const out = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined || v === '') continue
    out[k] = v
  }
  return out
}

async function main() {
  console.log('='.repeat(60))
  console.log('sync-playas-miteco.js — MITECO + OSM con redirects 301')
  console.log('='.repeat(60))

  // 1. Leer playas.json actual (OSM)
  if (!fs.existsSync(PLAYAS_JSON)) {
    console.error(`✗ No existe ${PLAYAS_JSON}`)
    process.exit(1)
  }
  const osmPlayas = JSON.parse(fs.readFileSync(PLAYAS_JSON, 'utf8'))
  console.log(`\n[1] Playas OSM cargadas: ${osmPlayas.length}`)

  // 2. Descargar MITECO
  console.log('\n[2] Descargando MITECO...')
  const { status, body } = await get(MITECO_URL)
  if (status !== 200) {
    console.error(`  ✗ HTTP ${status}`)
    process.exit(1)
  }
  const mitecoData = JSON.parse(body)
  const mitecoRaw = mitecoData.features ?? []
  console.log(`  ${mitecoRaw.length} features descargadas`)

  const mitecoPlayas = mitecoRaw
    .filter(f => f.properties?.Nombre?.trim())
    .map(normalizarMiteco)
    .filter(p => p.lat >= 27 && p.lat <= 44 && p.lng >= -19 && p.lng <= 5)
  console.log(`  ${mitecoPlayas.length} playas MITECO válidas`)

  // 3. Asignar slugs a MITECO (usando nombre+municipio como base)
  console.log('\n[3] Generando slugs MITECO...')
  const usedSlugs = new Set()
  for (const m of mitecoPlayas) {
    const base = slugify(`${m.nombre} ${m.municipio}`.trim())
    m.slug = uniqueSlug(base, usedSlugs)
  }

  // 4. Índice espacial MITECO por provincia
  const mitecoPorProv = {}
  for (const m of mitecoPlayas) {
    const prov = (m.provincia ?? '').toLowerCase()
    if (!mitecoPorProv[prov]) mitecoPorProv[prov] = []
    mitecoPorProv[prov].push(m)
  }

  // 5. Cruzar OSM con MITECO para generar redirects y encontrar huérfanas
  console.log('\n[4] Cruzando OSM ↔ MITECO (matching por <500m + provincia)...')
  const redirects = {}       // { osmSlug: mitecoSlug }
  const osmMatched = new Set()
  const mitecoMatched = new Set()

  for (const o of osmPlayas) {
    if (!o.slug) continue
    const prov = (o.provincia ?? '').toLowerCase()
    const candidatos = mitecoPorProv[prov] ?? mitecoPlayas
    let best = null
    let bestDist = Infinity
    for (const m of candidatos) {
      if (mitecoMatched.has(m.slug)) continue // ya usada
      const d = haversine(o.lat, o.lng, m.lat, m.lng)
      if (d < bestDist && d < 500) {
        bestDist = d
        best = m
      }
    }
    if (best) {
      osmMatched.add(o.slug)
      mitecoMatched.add(best.slug)
      // Solo añadir redirect si el slug CAMBIA
      if (o.slug !== best.slug) {
        redirects[o.slug] = best.slug
      }
    }
  }
  console.log(`  OSM matched:    ${osmMatched.size} / ${osmPlayas.length}`)
  console.log(`  OSM huérfanas:  ${osmPlayas.length - osmMatched.size}`)
  console.log(`  Redirects 301:  ${Object.keys(redirects).length}`)

  // 6. Construir playas.json final:
  //    - MITECO (todas)
  //    - + OSM huérfanas (las que no tienen match)
  console.log('\n[5] Construyendo playas.json final...')
  const finalPlayas = []

  // 6a. MITECO primero (todas con sus slugs oficiales)
  for (const m of mitecoPlayas) {
    finalPlayas.push(limpiar(m))
  }

  // 6b. OSM huérfanas (mantienen su slug original)
  //     Renombramos slugs que colisionen con MITECO
  for (const o of osmPlayas) {
    if (osmMatched.has(o.slug)) continue // ya incluida vía MITECO
    // Evitar colisión con slugs MITECO
    let slug = o.slug
    if (usedSlugs.has(slug)) {
      slug = uniqueSlug(`${slug}-osm`, usedSlugs)
      redirects[o.slug] = slug // redirect del slug viejo al nuevo
    } else {
      usedSlugs.add(slug)
    }
    finalPlayas.push(limpiar({ ...o, slug, source: o.source ?? 'osm' }))
  }

  console.log(`  Total final: ${finalPlayas.length} playas`)
  console.log(`    MITECO: ${mitecoPlayas.length}`)
  console.log(`    OSM huérfanas: ${finalPlayas.length - mitecoPlayas.length}`)

  // 7. Guardar
  fs.writeFileSync(PLAYAS_JSON, JSON.stringify(finalPlayas, null, 2))
  console.log(`\n✓ ${PLAYAS_JSON}`)

  fs.writeFileSync(REDIRECTS, JSON.stringify(redirects, null, 2))
  console.log(`✓ ${REDIRECTS} (${Object.keys(redirects).length} redirects)`)

  const slugIndex = {}
  for (const p of finalPlayas) slugIndex[p.slug] = p.slug
  fs.writeFileSync(SLUG_INDEX, JSON.stringify(slugIndex, null, 2))
  console.log(`✓ ${SLUG_INDEX}`)

  // Stats
  console.log('\n' + '='.repeat(60))
  console.log('ENRIQUECIMIENTO MITECO')
  console.log('='.repeat(60))
  const stats = {
    descripcion:      finalPlayas.filter(p => p.descripcion).length,
    hospital:         finalPlayas.filter(p => p.hospital).length,
    puerto_deportivo: finalPlayas.filter(p => p.puerto_deportivo).length,
    grado_ocupacion:  finalPlayas.filter(p => p.grado_ocupacion).length,
    tipo_arena:       finalPlayas.filter(p => p.tipo).length,
    paseo_maritimo:   finalPlayas.filter(p => p.paseo_maritimo).length,
    zona_infantil:    finalPlayas.filter(p => p.zona_infantil).length,
    alquiler:         finalPlayas.filter(p => p.alquiler_sombrillas).length,
    web_ayuntamiento: finalPlayas.filter(p => p.web_ayuntamiento).length,
    url_miteco:       finalPlayas.filter(p => p.url_miteco).length,
  }
  for (const [k, v] of Object.entries(stats)) {
    console.log(`  ${k.padEnd(22)} ${String(v).padStart(5)} / ${finalPlayas.length}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })
