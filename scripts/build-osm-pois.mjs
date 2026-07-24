#!/usr/bin/env node
// scripts/build-osm-pois.mjs — Sidecar OFFLINE de POIs de OpenStreetMap
// (restaurantes, hoteles, campings, buceo) por playa, desde el extracto de
// Geofabrik. Sustituye a Overpass en runtime: los mirrors públicos
// estrangulan a las IPs de Vercel (verificado: 19s y 0 resultados) y este
// camino es gratuito, ilimitado y bajo nuestro control.
//
// Pipeline previo (documentado, ~2 min):
//   curl -L -o spain-latest.osm.pbf https://download.geofabrik.de/europe/spain-latest.osm.pbf
//   osmium tags-filter spain-latest.osm.pbf \
//     nwr/amenity=restaurant,bar,cafe \
//     nwr/tourism=hotel,hostel,guest_house,camp_site \
//     nwr/shop=scuba_diving nwr/sport=scuba_diving -o pois.osm.pbf
//   osmium export pois.osm.pbf -f geojsonseq -o pois.geojsonl --geometry-types=point,polygon
//
// Uso: node scripts/build-osm-pois.mjs /ruta/a/pois.geojsonl
//
// Salida: public/data/osm-pois.json
//   { pool: [poi, …], zonas: { "lat:lng": { r: [idx…], h: [idx…], c: [idx…], b: [idx…] } } }
// Clave de zona = coords de la playa a 4 decimales (lo que reciben las libs
// en runtime). Pool deduplicado para que playas vecinas compartan POIs.

import { createReadStream, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const IN = process.argv[2]
if (!IN) { console.error('Uso: node scripts/build-osm-pois.mjs <pois.geojsonl>'); process.exit(1) }
const OUT = resolve(ROOT, 'public/data/osm-pois.json')

// Límites por playa: lo que la ficha renderiza (dieta RSC ya vigente).
const LIMITES = {
  r: { n: 6, radioKm: 3 },   // restaurantes/bares/cafés
  h: { n: 6, radioKm: 5 },   // hoteles/hostales/casas de huéspedes
  c: { n: 4, radioKm: 10 },  // campings
  b: { n: 4, radioKm: 8 },   // buceo
}

const hav = (lat1, lon1, lat2, lon2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

function centroide(geom) {
  if (geom.type === 'Point') return { lon: geom.coordinates[0], lat: geom.coordinates[1] }
  if (geom.type === 'Polygon') {
    const ring = geom.coordinates[0] ?? []
    if (!ring.length) return null
    let sx = 0, sy = 0
    for (const [x, y] of ring) { sx += x; sy += y }
    return { lon: sx / ring.length, lat: sy / ring.length }
  }
  if (geom.type === 'MultiPolygon') {
    const ring = geom.coordinates[0]?.[0] ?? []
    if (!ring.length) return null
    let sx = 0, sy = 0
    for (const [x, y] of ring) { sx += x; sy += y }
    return { lon: sx / ring.length, lat: sy / ring.length }
  }
  return null
}

function categoria(tags) {
  const a = tags.amenity, t = tags.tourism
  if (a === 'restaurant' || a === 'bar' || a === 'cafe') return 'r'
  if (t === 'hotel' || t === 'hostel' || t === 'guest_house') return 'h'
  if (t === 'camp_site') return 'c'
  if (tags.shop === 'scuba_diving' || tags.sport === 'scuba_diving') return 'b'
  return null
}

const TIPO = {
  restaurant: 'Restaurante', bar: 'Bar', cafe: 'Cafetería',
  hotel: 'Hotel', hostel: 'Hostal', guest_house: 'Casa de huéspedes',
}

async function main() {
  // 1) Cargar y clasificar POIs con nombre
  const pois = []       // pool global
  const grid = new Map() // celda 0.05° → índices del pool
  const cell = (lat, lon) => `${Math.floor(lat / 0.05)}:${Math.floor(lon / 0.05)}`

  const rl = createInterface({ input: createReadStream(IN), crlfDelay: Infinity })
  let leidos = 0
  for await (const line of rl) {
    if (!line.trim()) continue
    leidos++
    let f
    try { f = JSON.parse(line.replace(/\x1e/g, '')) } catch { continue }
    const tags = f.properties ?? {}
    const cat = categoria(tags)
    if (!cat || !tags.name) continue
    const c = centroide(f.geometry ?? {})
    if (!c || !Number.isFinite(c.lat) || !Number.isFinite(c.lon)) continue

    const poi = {
      n: tags.name.slice(0, 60),
      k: cat,
      t: TIPO[tags.amenity ?? tags.tourism] ?? (cat === 'b' ? 'Centro de buceo' : 'Camping'),
      la: +c.lat.toFixed(5),
      lo: +c.lon.toFixed(5),
    }
    const web = tags.website ?? tags['contact:website']
    const tel = tags.phone ?? tags['contact:phone']
    if (web && web.length < 90) poi.w = web
    if (tel && tel.length < 25) poi.p = tel
    if (cat === 'h' && tags.stars && /^[1-5]$/.test(String(tags.stars).trim()[0])) poi.e = +String(tags.stars).trim()[0]
    const idx = pois.push(poi) - 1
    // registrar en su celda y las 8 vecinas no: solo la suya (buscamos con expansión)
    const key = cell(poi.la, poi.lo)
    ;(grid.get(key) ?? grid.set(key, []).get(key)).push(idx)
  }
  console.log(`features leídas: ${leidos} · POIs útiles (con nombre): ${pois.length}`)

  // 2) Por playa: candidatos de celdas vecinas → top-N por distancia
  const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
    .filter(p => p?.slug && p.lat && p.lng)

  const zonas = {}
  let zonasConAlgo = 0
  for (const p of playas) {
    const candidatos = []
    const cLat = Math.floor(p.lat / 0.05), cLon = Math.floor(p.lng / 0.05)
    // 0.05° ≈ 5.5 km; con radio 2 celdas cubrimos ~11-16 km (suficiente para el mayor radio)
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const ids = grid.get(`${cLat + dy}:${cLon + dx}`)
      if (ids) candidatos.push(...ids)
    }
    if (!candidatos.length) continue

    const porCat = { r: [], h: [], c: [], b: [] }
    for (const idx of candidatos) {
      const poi = pois[idx]
      const d = hav(p.lat, p.lng, poi.la, poi.lo)
      if (d <= LIMITES[poi.k].radioKm * 1000) porCat[poi.k].push([idx, Math.round(d)])
    }
    const zona = {}
    let algo = false
    for (const k of ['r', 'h', 'c', 'b']) {
      if (!porCat[k].length) continue
      porCat[k].sort((a, b) => a[1] - b[1])
      zona[k] = porCat[k].slice(0, LIMITES[k].n).map(([idx]) => idx)
      algo = true
    }
    if (algo) {
      zonas[`${p.lat.toFixed(4)}:${p.lng.toFixed(4)}`] = zona
      zonasConAlgo++
    }
  }

  writeFileSync(OUT, JSON.stringify({ pool: pois, zonas }))
  const mb = (JSON.stringify({ pool: pois, zonas }).length / 1048576).toFixed(1)
  console.log(`playas con POIs: ${zonasConAlgo}/${playas.length} · sidecar: ${mb} MB → ${OUT}`)
}

main()
