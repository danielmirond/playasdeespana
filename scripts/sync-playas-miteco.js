#!/usr/bin/env node
// sync-playas-miteco.js
// Enriquece playas.json con datos oficiales MITECO (descripción, hospital,
// puerto, servicios, etc.) SIN cambiar slugs ni perder playas OSM.
//
// Estrategia (enrichment-only, segura):
//   1. Carga OSM (playas.json) — se mantiene como fuente primaria.
//   2. Descarga MITECO (dataset oficial, ~3500 playas costeras).
//   3. Cruza ambos usando scripts/lib/miteco-match (mutual best, skip fluvial,
//      scoring por distancia + similitud + municipio).
//   4. Para cada match EXCELENTE o BUENO: copia los 40+ campos MITECO a la
//      playa OSM correspondiente. El slug OSM se preserva (cero redirects).
//   5. Los matches DUDOSO y SOSPECHOSO se ignoran.
//   6. Las playas OSM sin match o fluviales se dejan tal cual.
//   7. MITECO huérfanas (MITECO sin OSM) se añaden como nuevas playas con el
//      slug canónico generado desde nombre+municipio.
//
// Uso: npm run sync:playas-miteco
//
// Genera:
//   - public/data/playas.json   (OSM + enrichment + MITECO huérfanas)
//   - public/data/slug-index.json
//
// IMPORTANTE: no produce redirects porque ningún slug OSM cambia.

const https = require('https')
const fs    = require('fs')
const path  = require('path')

const { matchAll, esFluvial } = require('./lib/miteco-match')

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

// Campos MITECO que queremos copiar sobre la playa OSM durante el
// enriquecimiento. Todo lo que no esté aquí se deja como esté en OSM.
const MITECO_ENRICH_FIELDS = [
  // Físicos
  'longitud', 'anchura', 'composicion', 'tipo', 'descripcion', 'nombres_alt',
  // Servicios
  'bandera', 'socorrismo', 'accesible', 'duchas', 'parking', 'nudista',
  'aseos', 'lavapies', 'papelera', 'telefonos', 'limpieza', 'oficina_turismo',
  // Alquileres y zonas
  'alquiler_sombrillas', 'alquiler_hamacas', 'alquiler_nautico',
  'zona_infantil', 'zona_deportiva', 'club_nautico',
  // Características
  'grado_ocupacion', 'grado_urbano', 'condiciones', 'paseo_maritimo',
  'tipo_paseo', 'vegetacion', 'zona_fondeo', 'fachada_litoral',
  'espacio_protegido',
  // Acceso
  'forma_acceso', 'carretera', 'autobus', 'autobus_tipo', 'establecimientos',
  'parking_tipo', 'parking_plazas',
  // Puerto
  'puerto_deportivo', 'puerto_web', 'puerto_dist',
  // Hospital
  'hospital', 'hospital_direc', 'hospital_tel', 'hospital_dist',
  // Referencias
  'ine_municipio', 'web_ayuntamiento', 'url_miteco',
]

// Campos donde MITECO siempre gana cuando hay match EXCELENTE/BUENO.
// Incluye nombre y localidad completa: MITECO es la fuente oficial del
// ministerio y resuelve tanto el nombre canónico de la playa como la
// provincia/municipio/comunidad, que en OSM están frecuentemente mal
// etiquetados (p.ej. playas de Barcelona marcadas como Tarragona, o
// nombres OSM con grafías locales no oficiales).
const MITECO_AUTHORITATIVE_FIELDS = ['nombre', 'municipio', 'provincia', 'comunidad']

// Copia los campos MITECO sobre la playa OSM sin sobreescribir datos OSM
// preexistentes salvo que el valor MITECO sea más rico. Devuelve un objeto
// nuevo (no muta el original).
function enriquecer(osmPlaya, mitecoPlaya) {
  const out = { ...osmPlaya }

  // Para la localidad (municipio/provincia/comunidad) MITECO siempre gana,
  // porque es la fuente oficial y OSM puede estar mal etiquetado.
  for (const k of MITECO_AUTHORITATIVE_FIELDS) {
    const v = mitecoPlaya[k]
    if (v !== null && v !== undefined && v !== '') out[k] = v
  }

  for (const k of MITECO_ENRICH_FIELDS) {
    const v = mitecoPlaya[k]
    if (v === null || v === undefined || v === '') continue
    // Para booleanos: si OSM no lo tenía o era false, adoptamos el de MITECO
    if (typeof v === 'boolean') {
      if (!out[k]) out[k] = v
      continue
    }
    // Para strings/números: solo sobreescribir si OSM no lo tenía
    if (out[k] === undefined || out[k] === null || out[k] === '') {
      out[k] = v
    }
  }
  // Guardar trazabilidad: qué playa MITECO originó el enriquecimiento
  out.miteco_id = mitecoPlaya.id
  out.source = out.source === 'osm' || !out.source ? 'osm+miteco' : out.source
  return out
}

async function main() {
  console.log('='.repeat(60))
  console.log('sync-playas-miteco.js — ENRICHMENT (OSM primario + MITECO)')
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

  // 3. Asignar identificadores únicos a cada MITECO. Necesarios para el
  //    matcher (usa `m.slug` como clave) y también nos sirven como slug
  //    canónico si la playa acaba siendo huérfana y hay que añadirla.
  console.log('\n[3] Generando identificadores MITECO...')
  const usedSlugs = new Set(osmPlayas.map(o => o.slug).filter(Boolean))
  // Pre-cargamos con slugs OSM para evitar colisión al añadir huérfanas.
  const mitecoSlugSeen = new Set()
  for (const m of mitecoPlayas) {
    const base = slugify(`${m.nombre} ${m.municipio}`.trim()) || 'playa'
    let s = base, i = 2
    while (mitecoSlugSeen.has(s)) s = `${base}-${i++}`
    mitecoSlugSeen.add(s)
    m.slug = s
    m._slugBase = base
  }

  // 4. Matching con el algoritmo compartido (mutual best, skip fluvial, etc.)
  console.log('\n[4] Cruzando OSM ↔ MITECO (algoritmo v2)...')
  const { matches, huerfanas_miteco } = matchAll(osmPlayas, mitecoPlayas)

  const porCalidad = { EXCELENTE: 0, BUENO: 0, DUDOSO: 0, SOSPECHOSO: 0 }
  for (const m of matches) porCalidad[m.calidad]++

  console.log(`  Matches totales:   ${matches.length}`)
  console.log(`    EXCELENTE: ${porCalidad.EXCELENTE}`)
  console.log(`    BUENO:     ${porCalidad.BUENO}`)
  console.log(`    DUDOSO:    ${porCalidad.DUDOSO}  (se ignoran)`)
  console.log(`    SOSPECHOSO:${porCalidad.SOSPECHOSO}  (se ignoran)`)
  console.log(`  MITECO huérfanas:  ${huerfanas_miteco.length}  (se añadirán como nuevas)`)

  // Index MITECO by slug para lookup O(1)
  const mitecoBySlug = new Map(mitecoPlayas.map(m => [m.slug, m]))
  const osmBySlug = new Map(osmPlayas.map(o => [o.slug, o]))

  // Determinar qué playas OSM reciben enriquecimiento
  const enrichmentBySlug = new Map() // osm.slug -> miteco
  for (const m of matches) {
    if (m.calidad !== 'EXCELENTE' && m.calidad !== 'BUENO') continue
    const mitecoPlaya = mitecoBySlug.get(m.miteco_slug)
    if (!mitecoPlaya) continue
    enrichmentBySlug.set(m.osm_slug, mitecoPlaya)
  }
  console.log(`\n[5] Enriquecer ${enrichmentBySlug.size} playas OSM con datos MITECO`)

  // 5c. Fallback CartoCiudad: para las playas OSM sin match MITECO, consultar
  //     el reverse geocoder oficial del IGN (CartoCiudad) y sobrescribir
  //     municipio/provincia/comunidad con los valores oficiales. Evita el
  //     caso Bogatell histórico donde OSM etiqueta una playa de Barcelona
  //     como Tarragona.
  //
  //     Se puede saltar con MITECO_SKIP_CARTOCIUDAD=1.
  const skipCarto = process.env.MITECO_SKIP_CARTOCIUDAD === '1'
  if (!skipCarto) {
    const carto = require('./lib/cartociudad')
    const candidatas = osmPlayas.filter(o =>
      !enrichmentBySlug.has(o.slug) &&
      typeof o.lat === 'number' &&
      typeof o.lng === 'number' &&
      !esFluvial(o.nombre)
    )
    console.log(`\n[5c] CartoCiudad fallback → ${candidatas.length} playas sin match MITECO`)

    let updated = 0
    let abortedDueToFailures = false
    for (let i = 0; i < candidatas.length; i++) {
      const o = candidatas[i]

      // Safety: si CartoCiudad falla 50 veces seguidas abortamos el paso
      // entero para no bloquear el workflow por un outage externo.
      if (carto.stats().consecutiveFailures >= 50) {
        console.warn('\n[5c] 50 fallos consecutivos — abortando CartoCiudad fallback')
        abortedDueToFailures = true
        break
      }

      const data = await carto.reverseGeocode(o.lat, o.lng)
      if (data) {
        o.municipio = data.municipio
        o.provincia = data.provincia
        o.comunidad = data.comunidad || provinciaAComunidad(data.provincia)
        if (data.ine_municipio) o.ine_municipio = data.ine_municipio
        o.source = 'osm+cartociudad'
        updated++
      }

      // Progress cada 100 playas
      if ((i + 1) % 100 === 0) {
        const s = carto.stats()
        process.stdout.write(`\r[5c] ${i + 1}/${candidatas.length} — actualizadas ${updated}, cache ${s.cacheHits}, fail ${s.failed}`)
      }
    }
    const s = carto.stats()
    console.log(`\n[5c] Hecho. Actualizadas: ${updated}/${candidatas.length}`)
    console.log(`     Llamadas reales: ${s.calls}, cache hits: ${s.cacheHits}`)
    console.log(`     Éxitos: ${s.success}, vacías: ${s.empty}, fallos: ${s.failed}, rate-limited: ${s.rateLimited}`)
    if (abortedDueToFailures) console.log('     (paso abortado por fallos consecutivos)')
  } else {
    console.log('\n[5c] CartoCiudad fallback omitido (MITECO_SKIP_CARTOCIUDAD=1)')
  }

  // 5. Construir playas.json final:
  //    - Todas las OSM (enriquecidas las que tengan match válido)
  //    - + MITECO huérfanas (nuevas playas que OSM no tenía)
  const finalPlayas = []

  for (const o of osmPlayas) {
    const mitecoPlaya = enrichmentBySlug.get(o.slug)
    if (mitecoPlaya) {
      finalPlayas.push(limpiar(enriquecer(o, mitecoPlaya)))
    } else {
      finalPlayas.push(limpiar(o))
    }
  }

  // 5b. MITECO huérfanas. Las playas "huérfanas" son MITECO sin match EXCELENTE
  //     ni BUENO, pero muchas de ellas SÍ tienen una playa OSM dentro de 500 m
  //     que el matcher no pudo confirmar con suficiente confianza (matches
  //     SOSPECHOSO o DUDOSO). Añadirlas todas duplicaría playas.
  //
  //     Por defecto NO las añadimos — enrichment puro, cambio neto = 0 playas.
  //     Para activarlo explícitamente: MITECO_ADD_ORPHANS=1 npm run sync:playas-miteco
  const addOrphans = process.env.MITECO_ADD_ORPHANS === '1'
  let mitecoAddedCount = 0
  if (addOrphans) {
    // Solo añadimos MITECO que NO aparezcan en ningún match (ni siquiera
    // SOSPECHOSO). Eso reduce las duplicaciones al mínimo.
    const mitecoConAlgunMatch = new Set(matches.map(m => m.miteco_slug))
    const trueOrphans = huerfanas_miteco.filter(m => !mitecoConAlgunMatch.has(m.slug))
    console.log(`\n[5b] Añadiendo ${trueOrphans.length} MITECO huérfanas reales`)
    console.log(`     (se ignoran ${huerfanas_miteco.length - trueOrphans.length} que tenían match DUDOSO/SOSPECHOSO)`)
    for (const m of trueOrphans) {
      const base = m._slugBase || slugify(m.nombre) || 'playa'
      const slug = uniqueSlug(base, usedSlugs)
      const nueva = { ...m, slug, source: 'miteco' }
      delete nueva._slugBase
      finalPlayas.push(limpiar(nueva))
      mitecoAddedCount++
    }
  } else {
    console.log(`\n[5b] Huérfanas MITECO: ${huerfanas_miteco.length} ignoradas`)
    console.log('     (para añadirlas: MITECO_ADD_ORPHANS=1 npm run sync:playas-miteco)')
  }

  console.log(`\n[6] Total final: ${finalPlayas.length} playas`)
  console.log(`    OSM mantenidas:       ${osmPlayas.length}`)
  console.log(`    OSM enriquecidas:     ${enrichmentBySlug.size}`)
  console.log(`    MITECO nuevas:        ${mitecoAddedCount}`)

  // 7. Slugs MITECO-primario para playas con Bandera Azul.
  //    Las banderas azules son los listados oficiales: usamos el slug MITECO
  //    canónico como URL primaria y generamos un 301 desde el slug OSM viejo.
  //    Para el resto de playas seguimos con slug OSM (sin redirects).
  const redirects = {}
  const finalSlugsUsed = new Set(finalPlayas.map(p => p.slug))
  let banderaSwitched = 0

  for (const p of finalPlayas) {
    if (!p.bandera) continue                 // solo Bandera Azul
    if (!p.miteco_id) continue               // debe haber sido enriquecida
    const miteco = enrichmentBySlug.get(p.slug) // lookup antes de rename
    if (!miteco) continue
    if (p.slug === miteco.slug) continue     // ya coincide, nada que hacer

    const oldSlug = p.slug
    // Reservamos un slug MITECO único (si colisiona añadimos sufijo)
    let newSlug = miteco.slug
    if (finalSlugsUsed.has(newSlug) && newSlug !== oldSlug) {
      let i = 2
      while (finalSlugsUsed.has(`${newSlug}-${i}`)) i++
      newSlug = `${newSlug}-${i}`
    }

    finalSlugsUsed.delete(oldSlug)
    finalSlugsUsed.add(newSlug)
    p.slug = newSlug
    redirects[oldSlug] = newSlug
    banderaSwitched++
  }

  console.log(`\n[7] Bandera Azul → slug MITECO primario`)
  console.log(`    Slugs cambiados: ${banderaSwitched}`)
  console.log(`    Redirects 301:   ${Object.keys(redirects).length}`)

  // 8. Guardar
  fs.writeFileSync(PLAYAS_JSON, JSON.stringify(finalPlayas, null, 2))
  console.log(`\n✓ ${PLAYAS_JSON}`)

  // Escribimos slug-redirects.json solo si hay entradas. Si queda vacío,
  // borramos el archivo para que Next.js no cargue un objeto inútil.
  if (Object.keys(redirects).length > 0) {
    fs.writeFileSync(REDIRECTS, JSON.stringify(redirects, null, 2))
    console.log(`✓ ${REDIRECTS} (${Object.keys(redirects).length} redirects)`)
  } else if (fs.existsSync(REDIRECTS)) {
    fs.unlinkSync(REDIRECTS)
    console.log(`✓ ${REDIRECTS} borrado (no hay redirects)`)
  }

  const slugIndex = {}
  for (const p of finalPlayas) slugIndex[p.slug] = p.slug
  fs.writeFileSync(SLUG_INDEX, JSON.stringify(slugIndex, null, 2))
  console.log(`✓ ${SLUG_INDEX}`)

  // Stats de enriquecimiento
  console.log('\n' + '='.repeat(60))
  console.log('COBERTURA DE CAMPOS MITECO EN FINAL')
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
