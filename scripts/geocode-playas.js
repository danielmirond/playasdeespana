#!/usr/bin/env node
// geocode-playas.js — point-in-polygon con GeoJSON oficial IGN
// Fuente: https://github.com/codeforamerica/click_that_hood (spain-provinces)

const fs    = require('fs')
const path  = require('path')
const https = require('https')

const PLAYAS_IN  = path.join(__dirname, '..', 'public', 'data', 'playas.json')
const PLAYAS_OUT = path.join(__dirname, '..', 'public', 'data', 'playas.json')

// GeoJSON con polígonos reales de las 52 provincias españolas
const GEOJSON_URLS = [
  // IGN via CartoCiudad — mejor precisión
  'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/spain/spain-provinces.json',
  // Fallback: click_that_hood
  'https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/spain-provinces.geojson',
]

const PROV_A_COMUNIDAD = {
  'Almería': 'Andalucía', 'Cádiz': 'Andalucía', 'Córdoba': 'Andalucía',
  'Granada': 'Andalucía', 'Huelva': 'Andalucía', 'Jaén': 'Andalucía',
  'Málaga': 'Andalucía', 'Sevilla': 'Andalucía',
  'Huesca': 'Aragón', 'Teruel': 'Aragón', 'Zaragoza': 'Aragón',
  'Asturias': 'Asturias',
  'Islas Baleares': 'Baleares', 'Illes Balears': 'Baleares', 'Baleares': 'Baleares',
  'Las Palmas': 'Canarias', 'Santa Cruz de Tenerife': 'Canarias',
  'Cantabria': 'Cantabria',
  'Albacete': 'Castilla-La Mancha', 'Ciudad Real': 'Castilla-La Mancha',
  'Cuenca': 'Castilla-La Mancha', 'Guadalajara': 'Castilla-La Mancha', 'Toledo': 'Castilla-La Mancha',
  'Ávila': 'Castilla y León', 'Burgos': 'Castilla y León', 'León': 'Castilla y León',
  'Palencia': 'Castilla y León', 'Salamanca': 'Castilla y León', 'Segovia': 'Castilla y León',
  'Soria': 'Castilla y León', 'Valladolid': 'Castilla y León', 'Zamora': 'Castilla y León',
  'Barcelona': 'Cataluña', 'Girona': 'Cataluña', 'Lleida': 'Cataluña', 'Tarragona': 'Cataluña',
  'Badajoz': 'Extremadura', 'Cáceres': 'Extremadura',
  'A Coruña': 'Galicia', 'Lugo': 'Galicia', 'Ourense': 'Galicia', 'Pontevedra': 'Galicia',
  'La Rioja': 'La Rioja',
  'Madrid': 'Madrid',
  'Murcia': 'Murcia',
  'Navarra': 'Navarra',
  'Álava': 'País Vasco', 'Araba': 'País Vasco',
  'Gipuzkoa': 'País Vasco', 'Guipúzcoa': 'País Vasco',
  'Bizkaia': 'País Vasco', 'Vizcaya': 'País Vasco',
  'Alicante': 'C. Valenciana', 'Alacant': 'C. Valenciana',
  'Castellón': 'C. Valenciana', 'Castelló': 'C. Valenciana',
  'Valencia': 'C. Valenciana', 'València': 'C. Valenciana',
  'Ceuta': 'Ceuta', 'Melilla': 'Melilla',
}

// Ray casting point-in-polygon
function pointInRing(px, py, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if (((yi > py) !== (yj > py)) && px < (xj - xi) * (py - yi) / (yj - yi) + xi)
      inside = !inside
  }
  return inside
}

function pointInGeometry(lng, lat, geometry) {
  if (geometry.type === 'Polygon') {
    return pointInRing(lng, lat, geometry.coordinates[0])
  }
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some(poly => pointInRing(lng, lat, poly[0]))
  }
  return false
}

// Extraer nombre de provincia del properties del GeoJSON
function getNombreProvincia(props) {
  return props.name || props.NAME || props.nombre || props.NOMBRE ||
         props.provincia || props.Provincia || props.nom || props.NOM || ''
}

function fetchURL(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'playasdeespana/1.0' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchURL(res.headers.location).then(resolve)
      }
      if (res.statusCode !== 200) { resolve(null); return }
      let body = ''
      res.on('data', d => body += d)
      res.on('end', () => {
        try { resolve(JSON.parse(body)) }
        catch { resolve(null) }
      })
    }).on('error', () => resolve(null))
    setTimeout(() => resolve(null), 15000)
  })
}

// Canarias necesita tratamiento especial por su bbox
function esCanarias(lat, lng) {
  return (lat >= 27.4 && lat <= 29.5 && lng >= -18.2 && lng <= -13.3) ||
         (lat >= 27.6 && lat <= 28.6 && lng >= -14.1 && lng <= -13.3)
}

function provCanarias(lat, lng) {
  // Islas occidentales = Santa Cruz de Tenerife
  const occidentales = lng < -15.4 ||
    (lat > 28.0 && lng < -14.5)  // La Gomera, La Palma, El Hierro
  return occidentales ? 'Santa Cruz de Tenerife' : 'Las Palmas'
}

async function main() {
  console.log('='.repeat(60))
  console.log('geocode-playas.js — Point-in-polygon con GeoJSON IGN')
  console.log('='.repeat(60))

  const playas = JSON.parse(fs.readFileSync(PLAYAS_IN, 'utf8'))
  console.log(`\nPlayas a geocodificar: ${playas.length}`)

  // Intentar descargar GeoJSON
  let features = []
  for (const url of GEOJSON_URLS) {
    console.log(`\n[GeoJSON] Descargando: ${url.substring(0, 70)}...`)
    const data = await fetchURL(url)
    if (data?.features?.length > 0) {
      features = data.features
      console.log(`  ✓ ${features.length} provincias cargadas`)
      break
    }
    // TopoJSON fallback
    if (data?.objects) {
      const key = Object.keys(data.objects)[0]
      const topo = data.objects[key]
      console.log(`  ✓ TopoJSON detectado (${key}) — usando bbox fallback`)
    }
    console.log(`  ✗ Fallo, probando siguiente...`)
  }

  if (features.length === 0) {
    console.log('\n  ✗ No se pudo descargar GeoJSON — usando bbox mejorado')
  }

  console.log(`\n[GEOCODE] Procesando ${playas.length} playas...`)

  let asignadas = 0
  let porPip = 0
  let porBbox = 0

  const resultado = playas.map((p, i) => {
    if (i % 500 === 0) process.stdout.write(`  ${i}/${playas.length}...\r`)

    // Canarias — tratamiento especial siempre
    if (esCanarias(p.lat, p.lng)) {
      asignadas++
      porBbox++
      const prov = provCanarias(p.lat, p.lng)
      return { ...p, provincia: prov, comunidad: 'Canarias' }
    }

    // Point-in-polygon con GeoJSON
    if (features.length > 0) {
      for (const f of features) {
        if (pointInGeometry(p.lng, p.lat, f.geometry)) {
          const rawNombre = getNombreProvincia(f.properties)
          // Normalizar nombre
          const provincia = rawNombre.trim()
          const comunidad = PROV_A_COMUNIDAD[provincia] ?? buscarComunidad(provincia)
          if (comunidad) {
            asignadas++
            porPip++
            return { ...p, provincia, comunidad }
          }
        }
      }
    }

    // Fallback bbox mejorado
    const geo = bboxMejorado(p.lat, p.lng)
    if (geo.comunidad !== 'Sin comunidad') asignadas++
    porBbox++
    return { ...p, ...geo }
  })

  console.log(`\n\n  ✓ Asignadas: ${asignadas}/${playas.length}`)
  console.log(`  Point-in-polygon: ${porPip}`)
  console.log(`  Bbox/fallback: ${porBbox}`)

  // Stats por comunidad
  const porComunidad = {}
  resultado.forEach(p => {
    porComunidad[p.comunidad] = (porComunidad[p.comunidad] ?? 0) + 1
  })

  console.log('\nDistribución:')
  Object.entries(porComunidad)
    .sort((a, b) => b[1] - a[1])
    .forEach(([c, n]) => console.log(`  ${String(n).padStart(5)}  ${c}`))

  fs.writeFileSync(PLAYAS_OUT, JSON.stringify(resultado, null, 2))
  console.log(`\n✓ ${resultado.length} playas → playas.json`)
}

// Búsqueda fuzzy en el mapa de provincias
function buscarComunidad(nombre) {
  const n = nombre.toLowerCase()
  for (const [k, v] of Object.entries(PROV_A_COMUNIDAD)) {
    if (k.toLowerCase().includes(n) || n.includes(k.toLowerCase())) return v
  }
  return null
}

// Bbox mejorado — más granular que el anterior
function bboxMejorado(lat, lng) {
  // Baleares
  if (lat > 38.6 && lat < 40.2 && lng > 1.0 && lng < 4.4)
    return { provincia: 'Islas Baleares', comunidad: 'Baleares' }

  // Ceuta
  if (lat > 35.8 && lat < 35.95 && lng > -5.4 && lng < -5.2)
    return { provincia: 'Ceuta', comunidad: 'Ceuta' }

  // Melilla
  if (lat > 35.25 && lat < 35.35 && lng > -2.98 && lng < -2.9)
    return { provincia: 'Melilla', comunidad: 'Melilla' }

  // Galicia
  if (lat > 43.5 && lng < -7.8) return { provincia: 'A Coruña', comunidad: 'Galicia' }
  if (lat > 43.0 && lat < 43.8 && lng > -9.3 && lng < -7.0) {
    if (lng < -7.8) return { provincia: 'A Coruña', comunidad: 'Galicia' }
    return { provincia: 'Lugo', comunidad: 'Galicia' }
  }
  if (lat > 41.8 && lat < 43.2 && lng < -7.5)
    return { provincia: lng < -8.5 ? 'Pontevedra' : 'Ourense', comunidad: 'Galicia' }

  // Asturias
  if (lat > 43.2 && lat < 43.7 && lng > -7.2 && lng < -4.5)
    return { provincia: 'Asturias', comunidad: 'Asturias' }

  // Cantabria
  if (lat > 43.1 && lat < 43.55 && lng > -4.6 && lng < -3.2)
    return { provincia: 'Cantabria', comunidad: 'Cantabria' }

  // País Vasco
  if (lat > 43.0 && lat < 43.55 && lng > -3.5 && lng < -1.7) {
    if (lng < -2.8) return { provincia: 'Bizkaia', comunidad: 'País Vasco' }
    if (lng < -2.1) return { provincia: 'Gipuzkoa', comunidad: 'País Vasco' }
    return { provincia: 'Gipuzkoa', comunidad: 'País Vasco' }
  }

  // Navarra (costa muy pequeña)
  if (lat > 43.2 && lat < 43.4 && lng > -1.8 && lng < -1.6)
    return { provincia: 'Navarra', comunidad: 'Navarra' }

  // Cataluña
  if (lng > 0.7 && lat > 40.5) {
    if (lat > 41.9) return { provincia: 'Girona', comunidad: 'Cataluña' }
    if (lat > 41.0) return { provincia: 'Barcelona', comunidad: 'Cataluña' }
    return { provincia: 'Tarragona', comunidad: 'Cataluña' }
  }

  // C. Valenciana
  if (lng > -0.65 && lng < 0.55 && lat > 37.8 && lat < 40.8) {
    if (lat > 39.9) return { provincia: 'Castellón', comunidad: 'C. Valenciana' }
    if (lat > 38.9) return { provincia: 'Valencia', comunidad: 'C. Valenciana' }
    return { provincia: 'Alicante', comunidad: 'C. Valenciana' }
  }
  if (lng > -0.9 && lng < 0.0 && lat > 38.0 && lat < 39.0)
    return { provincia: 'Alicante', comunidad: 'C. Valenciana' }

  // Murcia
  if (lat > 37.3 && lat < 38.3 && lng > -2.0 && lng < -0.6)
    return { provincia: 'Murcia', comunidad: 'Murcia' }

  // Andalucía — costa con más detalle
  if (lat > 35.8 && lat < 38.5) {
    if (lng < -7.0)  return { provincia: 'Huelva', comunidad: 'Andalucía' }
    if (lng < -6.2)  return { provincia: 'Cádiz', comunidad: 'Andalucía' }
    if (lng < -5.85) return { provincia: 'Cádiz', comunidad: 'Andalucía' }
    if (lng < -4.8)  return { provincia: 'Málaga', comunidad: 'Andalucía' }
    if (lng < -3.5)  return { provincia: lat < 37.1 ? 'Granada' : 'Málaga', comunidad: 'Andalucía' }
    if (lng < -2.3)  return { provincia: 'Granada', comunidad: 'Andalucía' }
    if (lng < -1.5)  return { provincia: 'Almería', comunidad: 'Andalucía' }
    return { provincia: 'Almería', comunidad: 'Andalucía' }
  }

  return { provincia: 'Desconocida', comunidad: 'Sin comunidad' }
}

main().catch(console.error)
