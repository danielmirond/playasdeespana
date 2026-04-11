#!/usr/bin/env node
// sync-playas-full.js
// Descarga ~3500 playas de España desde OpenStreetMap (Overpass API)
// Incluye spots de surf, windsurf, snorkel y buceo
// Cruza con datos de servicios de MITECO vía WFS
// Output: public/data/playas.json

const https = require('https')
const fs    = require('fs')
const path  = require('path')

const OUT        = path.join(__dirname, '..', 'public', 'data', 'playas.json')
const SLUG_INDEX = path.join(__dirname, '..', 'public', 'data', 'slug-index.json')
const SPOTS_OUT  = path.join(__dirname, '..', 'public', 'data', 'spots.json')

function post(url, body) {
  return new Promise((res, rej) => {
    const u = new URL(url)
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'playasdeespana.es/1.0',
      }
    }
    const req = https.request(opts, r => {
      let d = ''
      r.on('data', c => d += c)
      r.on('end', () => res({ status: r.statusCode, body: d }))
    })
    req.on('error', rej)
    req.setTimeout(120000, () => { req.destroy(); rej(new Error('Timeout')) })
    req.write(body)
    req.end()
  })
}

function get(url) {
  return new Promise((res, rej) => {
    const req = https.get(url, { headers: { 'User-Agent': 'playasdeespana.es/1.0' } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location)
        return get(r.headers.location).then(res).catch(rej)
      let d = ''
      r.on('data', c => d += c)
      r.on('end', () => res({ status: r.statusCode, body: d }))
    })
    req.on('error', rej)
    req.setTimeout(60000, () => { req.destroy(); rej(new Error('Timeout')) })
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

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

// ── OVERPASS QUERY ─────────────────────────────────────────────
async function fetchOverpass(query, label) {
  console.log(`\n[OSM] ${label}...`)
  try {
    const { status, body } = await post(
      'https://overpass-api.de/api/interpreter',
      `data=${encodeURIComponent(query)}`
    )
    console.log(`  HTTP ${status}, ${(body.length/1024).toFixed(0)}KB`)
    if (status !== 200) return []
    const data = JSON.parse(body)
    return data.elements ?? []
  } catch(e) {
    console.log(`  ✗ ${e.message}`)
    return []
  }
}

// ── PLAYAS ─────────────────────────────────────────────────────
async function fetchPlayas() {
  const query = `[out:json][timeout:120];
(
  node["natural"="beach"](24,-20,44,5);
  way["natural"="beach"](24,-20,44,5);
  relation["natural"="beach"](24,-20,44,5);
);
out center tags;`

  const elements = await fetchOverpass(query, 'Descargando playas')
  console.log(`  ${elements.length} elementos`)

  return elements
    .filter(el => el.tags?.name)
    .map(el => {
      const lat = el.type === 'node' ? el.lat : el.center?.lat
      const lng = el.type === 'node' ? el.lon : el.center?.lon
      if (!lat || !lng) return null
      const tags = el.tags
      // Surface normalization — OSM tiene muchos valores
      const composicionMap = {
        sand:          'Arena',
        pebble:        'Grava/Piedra',
        gravel:        'Gravilla',
        rock:          'Roca',
        rocks:         'Roca',
        shingle:       'Grava',
        fine_gravel:   'Gravilla fina',
        compacted:     'Compacto',
      }
      const composicion = composicionMap[tags.surface] || (tags.surface ? tags.surface : 'Arena')
      // Tipo de playa (beach tag values)
      const tipoMap = {
        sand:   'arena',
        pebble: 'guijarros',
        rock:   'rocosa',
        nude:   'nudista',
      }
      const tipo = tipoMap[tags.beach] || 'arena'
      return {
        nombre:      tags.name,
        municipio:   tags['addr:city'] || tags['addr:municipality'] || tags.municipality || '',
        provincia:   tags['addr:province'] || '',
        comunidad:   tags['addr:state'] || '',
        lat:         parseFloat(lat.toFixed(6)),
        lng:         parseFloat(lng.toFixed(6)),
        tipo,
        composicion,
        // Descripción: description → description:es → description:en
        descripcion: tags['description:es'] || tags['description'] || tags['description:en'] || null,
        nombres_alt: tags['name:es'] || tags['name:en'] || tags['alt_name'] || tags['old_name'] || null,
        // Longitud / anchura / capacity
        longitud:    tags.length ? parseInt(tags.length) : null,
        anchura:     tags.width ? parseInt(tags.width) : null,
        // Servicios base
        socorrismo:  !!(tags.lifeguard === 'yes' || tags['lifeguard:count']),
        duchas:      tags.shower === 'yes',
        // Accesibilidad: 'yes', 'designated' o 'limited' son válidos
        accesible:   ['yes', 'designated', 'limited'].includes(tags.wheelchair),
        parking:     tags.parking === 'yes' || !!tags['parking:free'] || !!tags['amenity:parking'],
        aseos:       tags.toilets === 'yes',
        lavapies:    !!(tags['water:foot_wash'] === 'yes' || tags.footwash === 'yes'),
        papelera:    !!tags.waste_basket || tags.bin === 'yes',
        bandera:     !!(tags['seamark:type'] === 'blue_flag' || tags.blue_flag === 'yes'),
        perros:      !!(tags.dog === 'yes' || tags['dog:leash'] || tags.dogs === 'yes'),
        nudista:     tags.nudism === 'yes' || tags.beach === 'nude',
        oficina_turismo: tags.tourism === 'information',
        // Web + referencias externas
        web_ayuntamiento: tags.website || tags['contact:website'] || tags.url || null,
        wikipedia:   tags.wikipedia || null,
        wikidata:    tags.wikidata || null,
        // Transporte
        autobus:     !!(tags['public_transport'] === 'bus' || tags.bus === 'yes'),
        // Observaciones libres
        observaciones: tags.note || tags['description:es'] || null,
        osm_id:      String(el.id),
        source:      'osm',
        // Actividades detectadas desde tags de la propia playa
        actividades: {
          surf:      !!(tags.sport === 'surfing' || tags['sport:surfing']),
          windsurf:  !!(tags.sport === 'windsurfing' || tags['sport:windsurfing']),
          kite:      !!(tags.sport === 'kiteboarding' || tags['sport:kiteboarding']),
          snorkel:   !!(tags.sport === 'snorkeling' || tags['sport:snorkeling'] || tags.diving === 'yes'),
          buceo:     !!(tags.sport === 'scuba_diving' || tags['sport:scuba_diving']),
          kayak:     !!(tags.sport === 'kayaking' || tags['sport:kayaking']),
          paddle:    !!(tags.sport === 'paddleboarding' || tags['sport:paddleboarding']),
        },
      }
    })
    .filter(Boolean)
}

// ── SPOTS DE SURF ──────────────────────────────────────────────
async function fetchSurfSpots() {
  const query = `[out:json][timeout:60];
(
  node["sport"="surfing"](24,-20,44,5);
  way["sport"="surfing"](24,-20,44,5);
  node["sport"="windsurfing"](24,-20,44,5);
  node["sport"="kiteboarding"](24,-20,44,5);
  node["leisure"="surf_school"](24,-20,44,5);
);
out center tags;`

  const elements = await fetchOverpass(query, 'Descargando spots de surf/wind/kite')
  return elements
    .filter(el => el.tags?.name || el.tags?.sport)
    .map(el => {
      const lat = el.type === 'node' ? el.lat : el.center?.lat
      const lng = el.type === 'node' ? el.lon : el.center?.lon
      if (!lat || !lng) return null
      const tags = el.tags
      const sport = tags.sport || 'surfing'
      return {
        id:     String(el.id),
        nombre: tags.name || `Spot ${sport}`,
        tipo:   sport === 'windsurfing' ? 'windsurf' : sport === 'kiteboarding' ? 'kite' : 'surf',
        lat:    parseFloat(lat.toFixed(6)),
        lng:    parseFloat(lng.toFixed(6)),
        nivel:  tags.skill || tags.difficulty || null,
        escuela: tags.leisure === 'surf_school',
        info:   tags.description || tags.note || null,
      }
    })
    .filter(Boolean)
}

// ── SPOTS DE BUCEO / SNORKEL ───────────────────────────────────
async function fetchDivingSpots() {
  const query = `[out:json][timeout:60];
(
  node["sport"="scuba_diving"](24,-20,44,5);
  node["sport"="snorkeling"](24,-20,44,5);
  node["leisure"="dive_centre"](24,-20,44,5);
  node["amenity"="dive_centre"](24,-20,44,5);
);
out center tags;`

  const elements = await fetchOverpass(query, 'Descargando spots de buceo/snorkel')
  return elements
    .filter(el => el.tags)
    .map(el => {
      const lat = el.type === 'node' ? el.lat : el.center?.lat
      const lng = el.type === 'node' ? el.lon : el.center?.lon
      if (!lat || !lng) return null
      const tags = el.tags
      return {
        id:      String(el.id),
        nombre:  tags.name || 'Punto de buceo',
        tipo:    tags.sport === 'snorkeling' ? 'snorkel' : 'buceo',
        lat:     parseFloat(lat.toFixed(6)),
        lng:     parseFloat(lng.toFixed(6)),
        centro:  !!(tags.leisure === 'dive_centre' || tags.amenity === 'dive_centre'),
        nivel:   tags.skill || tags.difficulty || null,
        max_depth: tags.max_depth ? parseInt(tags.max_depth) : null,
        info:    tags.description || tags.note || null,
      }
    })
    .filter(Boolean)
}

// ── MITECO WFS ─────────────────────────────────────────────────
async function fetchMITECO() {
  console.log('\n[MITECO] Intentando WFS...')
  const url = 'https://wfs.mapama.gob.es/sig/Costas/Playas/wfs.aspx?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=Playas&OUTPUTFORMAT=application/json&COUNT=5000'
  try {
    const { status, body } = await get(url)
    console.log(`  HTTP ${status}`)
    if (status === 200 && body.includes('features')) {
      const data = JSON.parse(body)
      console.log(`  ${data.features?.length ?? 0} playas MITECO`)
      return data.features ?? []
    }
  } catch(e) {
    console.log(`  ✗ ${e.message}`)
  }
  return []
}

// ── CRUZAR SPOTS CON PLAYAS ────────────────────────────────────
function cruzarSpots(playas, surfSpots, divingSpots) {
  console.log('\n[CRUCE] Asociando spots a playas...')
  let asociados = 0

  for (const playa of playas) {
    const cercanosSurf = surfSpots.filter(s => haversine(playa.lat, playa.lng, s.lat, s.lng) < 1000)
    const cercanosDiving = divingSpots.filter(s => haversine(playa.lat, playa.lng, s.lat, s.lng) < 1000)

    if (cercanosSurf.length > 0) {
      playa.actividades.surf     = playa.actividades.surf || cercanosSurf.some(s => s.tipo === 'surf')
      playa.actividades.windsurf = playa.actividades.windsurf || cercanosSurf.some(s => s.tipo === 'windsurf')
      playa.actividades.kite     = playa.actividades.kite || cercanosSurf.some(s => s.tipo === 'kite')
      playa.spots_surf = cercanosSurf.map(s => s.id)
      asociados++
    }

    if (cercanosDiving.length > 0) {
      playa.actividades.snorkel = playa.actividades.snorkel || cercanosDiving.some(s => s.tipo === 'snorkel')
      playa.actividades.buceo   = playa.actividades.buceo || cercanosDiving.some(s => s.tipo === 'buceo')
      playa.spots_buceo = cercanosDiving.map(s => s.id)
    }
  }

  console.log(`  ${asociados} playas con spots de actividades`)
  return playas
}

// ── MAIN ───────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(60))
  console.log('sync-playas-full.js — OSM + MITECO + Actividades')
  console.log('='.repeat(60))

  // Descargas paralelas
  const [playas, surfSpots, divingSpots, mitecoFeatures] = await Promise.all([
    fetchPlayas(),
    fetchSurfSpots(),
    fetchDivingSpots(),
    fetchMITECO(),
  ])

  console.log(`\n  Playas OSM:      ${playas.length}`)
  console.log(`  Spots surf/wind: ${surfSpots.length}`)
  console.log(`  Spots buceo:     ${divingSpots.length}`)
  console.log(`  Playas MITECO:   ${mitecoFeatures.length}`)

  // Enriquecer con MITECO si hay datos
  if (mitecoFeatures.length > 0) {
    console.log('\n[MITECO] Cruzando datos...')
    let cruzadas = 0
    for (const p of playas) {
      let best = null, bestDist = Infinity
      for (const f of mitecoFeatures) {
        const coords = f.geometry?.coordinates
        if (!coords) continue
        const [mLng, mLat] = Array.isArray(coords[0]) ? coords[0] : coords
        const d = haversine(p.lat, p.lng, mLat, mLng)
        if (d < bestDist && d < 500) { bestDist = d; best = f.properties }
      }
      if (best) {
        p.municipio  = best.municipio  || p.municipio
        p.provincia  = best.provincia  || p.provincia
        p.comunidad  = best.comunidad  || p.comunidad
        p.socorrismo = best.socorrismo === 'S' || p.socorrismo
        p.duchas     = best.duchas     === 'S' || p.duchas
        p.accesible  = best.accesible  === 'S' || p.accesible
        p.parking    = best.aparcamiento === 'S' || p.parking
        p.bandera    = best.bandera_azul === 'S'
        p.longitud   = best.longitud_m ? parseInt(best.longitud_m) : p.longitud
        p.anchura    = best.anchura_m  ? parseInt(best.anchura_m)  : p.anchura
        p.composicion = best.composicion || p.composicion
        cruzadas++
      }
    }
    console.log(`  ${cruzadas} playas enriquecidas`)
  }

  // Cruzar spots con playas
  cruzarSpots(playas, surfSpots, divingSpots)

  // Filtrar bbox España
  let final = playas.filter(p =>
    (p.lat >= 27 && p.lat <= 44 && p.lng >= -19 && p.lng <= 5)
  )

  // Deduplicar por proximidad <100m
  console.log(`\n[DEDUP] ${final.length} → `, '')
  const uniq = []
  for (const p of final) {
    if (!uniq.some(u => haversine(p.lat, p.lng, u.lat, u.lng) < 100)) uniq.push(p)
  }
  console.log(`${uniq.length} playas únicas`)
  final = uniq

  // Slugs únicos
  const usedSlugs = new Set()
  for (const p of final) {
    const base = slugify(`${p.nombre} ${p.municipio}`.trim())
    p.slug = uniqueSlug(base, usedSlugs)
  }

  // Guardar playas.json
  fs.writeFileSync(OUT, JSON.stringify(final, null, 2))

  // Guardar spots.json
  const allSpots = [
    ...surfSpots.map(s => ({ ...s, categoria: 'surf' })),
    ...divingSpots.map(s => ({ ...s, categoria: 'buceo' })),
  ]
  fs.writeFileSync(SPOTS_OUT, JSON.stringify(allSpots, null, 2))

  // Slug index
  const slugIndex = {}
  for (const p of final) slugIndex[p.slug] = p.slug
  fs.writeFileSync(SLUG_INDEX, JSON.stringify(slugIndex, null, 2))

  // Stats
  console.log(`\n${'='.repeat(60)}`)
  console.log(`✓ ${final.length} playas → playas.json`)
  console.log(`✓ ${allSpots.length} spots → spots.json`)

  const conSurf    = final.filter(p => p.actividades?.surf).length
  const conWind    = final.filter(p => p.actividades?.windsurf).length
  const conKite    = final.filter(p => p.actividades?.kite).length
  const conSnorkel = final.filter(p => p.actividades?.snorkel).length
  const conBuceo   = final.filter(p => p.actividades?.buceo).length

  console.log(`\nActividades detectadas:`)
  console.log(`  🏄 Surf:      ${conSurf}`)
  console.log(`  🏄 Windsurf:  ${conWind}`)
  console.log(`  🪁 Kite:      ${conKite}`)
  console.log(`  🤿 Snorkel:   ${conSnorkel}`)
  console.log(`  🤿 Buceo:     ${conBuceo}`)

  const byCom = {}
  for (const p of final) {
    const c = p.comunidad || 'Sin comunidad'
    byCom[c] = (byCom[c] || 0) + 1
  }
  console.log('\nTop comunidades:')
  Object.entries(byCom).sort((a,b) => b[1]-a[1]).slice(0,10)
    .forEach(([c,n]) => console.log(`  ${String(n).padStart(4)}  ${c}`))
}

main().catch(e => { console.error(e); process.exit(1) })
