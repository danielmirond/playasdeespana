#!/usr/bin/env node
// sync-playas-miteco.js
// Descarga el dataset oficial de playas españolas desde ArcGIS (MITECO)
// https://hub.arcgis.com/datasets/84ddbc8cf4104a579d579f6441fcaa8a_0
//
// Output: public/data/playas.json (con ~40 campos por playa)
//
// Uso: npm run sync:playas-miteco

const https = require('https')
const fs    = require('fs')
const path  = require('path')

const OUT        = path.join(__dirname, '..', 'public', 'data', 'playas.json')
const SLUG_INDEX = path.join(__dirname, '..', 'public', 'data', 'slug-index.json')

// URL del GeoJSON oficial en ArcGIS Hub
// Dataset ID: 84ddbc8cf4104a579d579f6441fcaa8a (Playas españolas - MITECO)
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
    req.setTimeout(120000, () => { req.destroy(); rej(new Error('Timeout')) })
  })
}

function slugify(str) {
  return str.toLowerCase()
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

// Normaliza "Sí"/"No"/"" a boolean
function si(v) {
  if (!v) return false
  const s = String(v).trim().toLowerCase()
  return s === 'sí' || s === 'si' || s === 's' || s === 'yes' || s === 'true'
}

// Extrae número de string "650 metros" → 650
function numero(v) {
  if (!v) return null
  const m = String(v).match(/(\d+(?:\.\d+)?)/)
  return m ? parseFloat(m[1]) : null
}

// Provincia → Comunidad autónoma (fallback por si falta)
function provinciaAComunidad(prov) {
  const map = {
    'A Coruña': 'Galicia', 'Lugo': 'Galicia', 'Pontevedra': 'Galicia',
    'Asturias': 'Asturias',
    'Cantabria': 'Cantabria',
    'Bizkaia': 'País Vasco', 'Gipuzkoa': 'País Vasco',
    'Girona': 'Cataluña', 'Barcelona': 'Cataluña', 'Tarragona': 'Cataluña',
    'Castellón': 'Comunitat Valenciana', 'Valencia': 'Comunitat Valenciana', 'Alicante': 'Comunitat Valenciana',
    'Murcia': 'Murcia',
    'Almería': 'Andalucía', 'Granada': 'Andalucía', 'Málaga': 'Andalucía',
    'Cádiz': 'Andalucía', 'Huelva': 'Andalucía',
    'Las Palmas': 'Canarias', 'Santa Cruz de Tenerife': 'Canarias',
    'Illes Balears': 'Islas Baleares', 'Baleares': 'Islas Baleares',
    'Ceuta': 'Ceuta', 'Melilla': 'Melilla',
  }
  return map[prov] ?? 'España'
}

// Normaliza un feature del GeoJSON de MITECO al formato de la app
function normalizar(f) {
  const p = f.properties
  const [lng, lat] = f.geometry?.coordinates ?? [0, 0]

  const nombre    = (p.Nombre ?? '').trim()
  const municipio = (p['Término_M'] ?? p.Termino_M ?? '').trim()
  const provincia = (p.Provincia ?? '').trim()
  const comunidad = (p['Comunidad_'] ?? p.Comunidad ?? p.Comunidad_ ?? '').trim() || provinciaAComunidad(provincia)

  return {
    id:         String(p.Identifica ?? p.OBJECTID),
    slug:       '', // se rellena después con uniqueSlug
    nombre,
    municipio,
    provincia,
    comunidad,
    lat:        parseFloat(Number(lat).toFixed(6)),
    lng:        parseFloat(Number(lng).toFixed(6)),

    // Datos físicos
    longitud:    numero(p.Longitud),
    anchura:     numero(p.Anchura),
    composicion: (p['Composici'] ?? '').trim() || null,
    tipo:        (p['Tipo_de_ar'] ?? '').trim() || null,

    // Descripción oficial (solo si tiene contenido real)
    descripcion: (p.Descripci ?? '').trim() || null,
    nombres_alt: (p.Nombre_alt ?? '').trim() || null,

    // Servicios booleanos
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

    // Zonas
    zona_infantil:  si(p.Zona_infan),
    zona_deportiva: si(p.Zona_depor),
    club_nautico:   si(p['Club_naút']),

    // Actividades
    actividades: {
      surf:    si(p.Zona_Surf),
      buceo:   si(p.Submarinis),
      snorkel: si(p.Submarinis),
    },

    // Características
    grado_ocupacion: (p.Grado_ocup ?? '').trim() || null,
    grado_urbano:    (p.Grado_urba ?? '').trim() || null,
    condiciones:     (p.Condicione ?? '').trim() || null,
    paseo_maritimo:  si(p.Paseo_mar),
    vegetacion:      si(p['Vegetació']),
    zona_fondeo:     si(p.Zona_fonde),

    // Acceso
    forma_acceso:  (p.Forma_de_a ?? '').trim() || null,
    carretera:     (p['Carretera_'] ?? '').trim() || null,
    autobus:       si(p['Autobús']),
    autobus_tipo:  (p['Autobús_t'] ?? '').trim() || null,
    establecimientos: si(p.Establecim),
    senalizacion:  si(p.Señalizac),

    // Parking detallado
    parking_tipo:     (p.Aparcami_1 ?? '').trim() || null,   // "Vigilado" / "No vigilado"
    parking_plazas:   (p.Aparcami_2 ?? '').trim() || null,   // "Más de 100 plazas"

    // Paseo marítimo detallado
    tipo_paseo:    (p.Tipo_paseo ?? '').trim() || null,      // "Senda Litoral de Mijas"

    // Orientación / fachada litoral
    fachada_litoral: (p.Fachada_Li ?? '').trim() || null,    // "Urbana" / "Natural"
    espacio_protegido: si(p.Espacio_pr),

    // Info útil
    puerto_deportivo: (p.Puerto_dep ?? '').trim() || null,
    puerto_web:       (p.Web_puerto ?? '').trim() || null,
    puerto_dist:      (p['Distancia_'] ?? '').trim() || null,
    hospital:         (p.Hospital ?? '').trim() || null,
    hospital_direc:   (p['Dirección'] ?? '').trim() || null,
    hospital_tel:     (p['Teléfono_'] ?? '').trim() || null,
    hospital_dist:    (p.Distancia1 ?? '').trim() || null,

    // Referencias externas
    ine_municipio:    p['Código_IN'] ?? null,
    web_ayuntamiento: (p.Web_munici ?? '').trim() || null,
    url_miteco:       (p.URL_MAGRAM ?? '').trim() || null,
    observaciones:    (p.Observacio ?? '').trim() || null,
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('sync-playas-miteco.js — Dataset oficial ArcGIS/MITECO')
  console.log('='.repeat(60))

  console.log('\n[MITECO] Descargando GeoJSON oficial...')
  const { status, body } = await get(MITECO_URL)
  console.log(`  HTTP ${status}, ${(body.length / 1024 / 1024).toFixed(2)}MB`)

  if (status !== 200) {
    console.error('  ✗ Error descargando dataset')
    process.exit(1)
  }

  const data = JSON.parse(body)
  const features = data.features ?? []
  console.log(`  ${features.length} playas oficiales`)

  // Normalizar
  console.log('\n[NORMALIZACIÓN] Procesando campos...')
  const playas = features
    .filter(f => f.properties?.Nombre?.trim())
    .map(normalizar)

  // Filtrar por bbox España (incluye Canarias, Ceuta, Melilla)
  const filtradas = playas.filter(p =>
    (p.lat >= 27 && p.lat <= 44 && p.lng >= -19 && p.lng <= 5)
  )
  console.log(`  ${filtradas.length} playas dentro de España (bbox)`)

  // Slugs únicos
  const used = new Set()
  for (const p of filtradas) {
    const base = slugify(`${p.nombre} ${p.municipio}`.trim())
    p.slug = uniqueSlug(base, used)
  }

  // Guardar
  fs.writeFileSync(OUT, JSON.stringify(filtradas, null, 2))
  console.log(`\n✓ ${filtradas.length} playas → ${path.relative(process.cwd(), OUT)}`)

  // Slug index
  const slugIndex = {}
  for (const p of filtradas) slugIndex[p.slug] = p.slug
  fs.writeFileSync(SLUG_INDEX, JSON.stringify(slugIndex, null, 2))

  // Stats
  console.log('\n' + '='.repeat(60))
  console.log('STATS')
  console.log('='.repeat(60))

  const stats = {
    conDescripcion: filtradas.filter(p => p.descripcion).length,
    conBandera:     filtradas.filter(p => p.bandera).length,
    conSocorrismo:  filtradas.filter(p => p.socorrismo).length,
    conAccesible:   filtradas.filter(p => p.accesible).length,
    conPaseo:       filtradas.filter(p => p.paseo_maritimo).length,
    conPuerto:      filtradas.filter(p => p.puerto_deportivo).length,
    conHospital:    filtradas.filter(p => p.hospital).length,
    conZonaInfantil:filtradas.filter(p => p.zona_infantil).length,
    conAlquileres:  filtradas.filter(p => p.alquiler_sombrillas).length,
  }
  for (const [k, v] of Object.entries(stats)) {
    console.log(`  ${k.padEnd(20)} ${String(v).padStart(5)} / ${filtradas.length}`)
  }

  const byCom = {}
  for (const p of filtradas) {
    byCom[p.comunidad] = (byCom[p.comunidad] || 0) + 1
  }
  console.log('\nPor comunidad:')
  Object.entries(byCom).sort((a,b) => b[1]-a[1])
    .forEach(([c, n]) => console.log(`  ${String(n).padStart(5)}  ${c}`))
}

main().catch(e => { console.error(e); process.exit(1) })
