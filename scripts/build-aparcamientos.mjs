#!/usr/bin/env node
// scripts/build-aparcamientos.mjs — sidecar de aparcamientos, por playa y
// por pueblo, desde el extracto de OpenStreetMap de España.
//
// PARA QUÉ. «Dónde aparcar en Nerja» un domingo de agosto es de las
// búsquedas más desesperadas que hay, y la respuesta útil no es un mapa:
// es a qué playa se puede llegar en coche y a cuál conviene ir en autobús
// porque no hay sitio. El inventario oficial nos dice si la playa tiene
// aparcamiento, si está vigilado y de qué tamaño es; OSM pone encima los
// aparcamientos reales, con nombre, si son de pago y a cuántos metros.
//
// DOS ÁMBITOS, NO UNO. Se guardan los de cada playa (radio 1,2 km, que es
// lo que alguien anda cargando con la sombrilla) y también los del pueblo
// (radio 1,5 km del centro), porque medio tráfico de esta consulta no va a
// la arena: va al casco y a los días de temporal.
//
// Pipeline, con osmium (brew install osmium-tool):
//   curl -L -o spain.osm.pbf https://download.geofabrik.de/europe/spain-latest.osm.pbf
//   osmium tags-filter spain.osm.pbf nwr/amenity=parking -o parkings.osm.pbf
//   osmium export parkings.osm.pbf -f geojsonseq -o parkings.geojsonl \
//     --geometry-types=point,polygon
//
//   node scripts/build-aparcamientos.mjs /tmp/parkings.geojsonl
//
// Salida: public/data/aparcamientos.json
//   { pool: [ap…], playas: { "lat:lng": [idx…] }, municipios: { slug: [idx…] } }
import { createReadStream, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const IN = process.argv[2]
if (!IN) { console.error('Uso: node scripts/build-aparcamientos.mjs <parkings.geojsonl>'); process.exit(1) }
const OUT = resolve(ROOT, 'public/data/aparcamientos.json')

const RADIO_PLAYA_M = 1200       // lo que se anda con la nevera a cuestas
const RADIO_PUEBLO_M = 1500
const POR_PLAYA = 6
const POR_PUEBLO = 10

const hav = (la1, lo1, la2, lo2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLa = r(la2 - la1), dLo = r(lo2 - lo1)
  const x = Math.sin(dLa / 2) ** 2 + Math.cos(r(la1)) * Math.cos(r(la2)) * Math.sin(dLo / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

function centroide(g) {
  if (!g) return null
  if (g.type === 'Point') return { lat: g.coordinates[1], lon: g.coordinates[0] }
  const anillo = g.type === 'Polygon' ? g.coordinates[0] : g.coordinates?.[0]?.[0]
  if (!anillo?.length) return null
  let sx = 0, sy = 0
  for (const [x, y] of anillo) { sx += x; sy += y }
  return { lat: sy / anillo.length, lon: sx / anillo.length }
}

/** Lo que de verdad importa de un aparcamiento: si puedo dejar el coche,
 *  cuánto me cuesta y si cabe. El resto de etiquetas de OSM no se guarda. */
function util(t) {
  // Fuera lo que no sirve para aparcar un turismo.
  if (t.access === 'private' || t.access === 'no') return null
  if (/^(motorcycle|bicycle)$/.test(t.parking ?? '')) return null
  if (t.motorcar === 'no') return null

  const plazas = Number(t.capacity) || null
  const pago = t.fee === 'yes' ? true : t.fee === 'no' ? false : null
  return {
    n: t.name || t['addr:street'] || null,
    f: pago === null ? undefined : pago ? 1 : 0,     // 1 de pago, 0 gratis, ausente no se sabe
    c: plazas && plazas > 0 && plazas < 20000 ? plazas : undefined,
    t: t.parking === 'multi-storey' ? 'altura'
      : t.parking === 'underground' ? 'subterraneo'
      : t.parking === 'surface' ? 'superficie' : undefined,
    pmr: Number(t['capacity:disabled']) > 0 || t['capacity:disabled'] === 'yes' ? 1 : undefined,
    tarifa: t.charge || undefined,
    max: t.maxstay || undefined,
  }
}

// ——— 1. Dónde hay que mirar ————————————————————————————————————
const toSlug = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
const puntosPlaya = playas.filter(p => p.lat && p.lng)
  .map(p => ({ k: `${p.lat.toFixed(4)}:${p.lng.toFixed(4)}`, lat: p.lat, lon: p.lng }))
// Centro del pueblo: la mediana de sus playas, que en la costa cae cerca del casco.
const porMuni = new Map()
for (const p of playas) {
  if (!p.lat || !p.lng) continue
  const s = toSlug(p.municipio)
  if (!porMuni.has(s)) porMuni.set(s, [])
  porMuni.get(s).push(p)
}
const mediana = xs => { const o = [...xs].sort((a, b) => a - b); return o[Math.floor(o.length / 2)] }
const puntosMuni = [...porMuni].map(([slug, ps]) => ({
  slug, lat: mediana(ps.map(p => p.lat)), lon: mediana(ps.map(p => p.lng)),
}))
console.log(`${puntosPlaya.length} playas · ${puntosMuni.length} municipios`)

// Rejilla para no comparar cada aparcamiento con cada punto.
const CELDA = 0.02                                   // ~2 km
const celda = (la, lo) => `${Math.round(la / CELDA)}:${Math.round(lo / CELDA)}`
const rejilla = new Map()
const apunta = (p, tipo) => {
  for (let dla = -1; dla <= 1; dla++) for (let dlo = -1; dlo <= 1; dlo++) {
    const c = `${Math.round(p.lat / CELDA) + dla}:${Math.round(p.lon / CELDA) + dlo}`
    if (!rejilla.has(c)) rejilla.set(c, [])
    rejilla.get(c).push({ ...p, tipo })
  }
}
puntosPlaya.forEach(p => apunta(p, 'playa'))
puntosMuni.forEach(p => apunta(p, 'muni'))

// ——— 2. Recorrer el extracto ————————————————————————————————————
const pool = []
const dePlaya = new Map()      // clave de playa → [{i, d}]
const deMuni = new Map()       // slug del municipio → [{i, d}]
let leidas = 0, utiles = 0

const rl = createInterface({ input: createReadStream(IN), crlfDelay: Infinity })
for await (const linea of rl) {
  if (!linea.trim()) continue
  leidas++
  let f
  try { f = JSON.parse(linea.replace(/^\x1e/, '')) } catch { continue }
  const t = f.properties ?? {}
  const datos = util(t)
  if (!datos) continue
  const c = centroide(f.geometry)
  if (!c) continue

  const cerca = rejilla.get(celda(c.lat, c.lon))
  if (!cerca?.length) continue

  let idx = -1
  for (const p of cerca) {
    const d = hav(c.lat, c.lon, p.lat, p.lon)
    const limite = p.tipo === 'playa' ? RADIO_PLAYA_M : RADIO_PUEBLO_M
    if (d > limite) continue
    if (idx === -1) { idx = pool.push({ ...datos, la: +c.lat.toFixed(5), lo: +c.lon.toFixed(5) }) - 1; utiles++ }
    const mapa = p.tipo === 'playa' ? dePlaya : deMuni
    const clave = p.tipo === 'playa' ? p.k : p.slug
    if (!mapa.has(clave)) mapa.set(clave, [])
    mapa.get(clave).push({ i: idx, d: Math.round(d) })
  }
  if (leidas % 200000 === 0) process.stderr.write(`\r  ${leidas} leídas · ${utiles} en zona`)
}
process.stderr.write('\n')

// ——— 3. Quedarse con los más cercanos y escribir ————————————————
const recorta = (mapa, n) => Object.fromEntries([...mapa]
  .map(([k, v]) => [k, v.sort((a, b) => a.d - b.d).slice(0, n).map(x => [x.i, x.d])])
  .filter(([, v]) => v.length))

const salida = { pool, playas: recorta(dePlaya, POR_PLAYA), municipios: recorta(deMuni, POR_PUEBLO) }
writeFileSync(OUT, JSON.stringify(salida))
console.log(`\naparcamientos en el pool: ${pool.length}`)
console.log(`playas con alguno a ${RADIO_PLAYA_M} m:    ${Object.keys(salida.playas).length}`)
console.log(`municipios con alguno a ${RADIO_PUEBLO_M} m: ${Object.keys(salida.municipios).length}`)
console.log(`con precio conocido: ${pool.filter(p => p.f !== undefined).length} · con plazas: ${pool.filter(p => p.c).length}`)
