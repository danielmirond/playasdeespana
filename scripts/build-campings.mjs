#!/usr/bin/env node
// scripts/build-campings.mjs — sidecar de campings desde el extracto de
// OpenStreetMap, para que las landings dejen de depender de Overpass.
//
// POR QUÉ EXISTE. Los campings se pedían a Overpass EN RUNTIME, y las 24
// landings provinciales llevaban meses sirviendo «No se han encontrado
// campings»: el mirror principal devolvía 406 por el User-Agent, la
// consulta de bbox provincial no cabía en los cinco segundos de
// presupuesto, y el buildGuard corta la red durante el build, así que la
// página nacía vacía y se quedaba así. Google rastreó e indexó esas
// páginas igual: 6.702 impresiones en 90 días para páginas sin nada.
//
// La cura no es afinar el timeout, es no depender de una API en tiempo
// de petición para un dato que cambia dos veces al año. Mismo patrón
// que aparcamientos, chiringuitos o yoga: se cosecha offline y se sirve
// de un JSON.
//
// FRENTE A GOOGLE PLACES: costaría 0 € (81 llamadas de las 5.000
// gratuitas al mes), pero Places no da `cabins`/`static_caravans`, que
// es de donde sale el campo `bungalows` —935 impresiones medidas— y
// tampoco incluye las áreas municipales sin ficha de negocio.
//
// Pipeline (osmium: brew install osmium-tool). Canarias va APARTE,
// porque Geofabrik la publica bajo África y no dentro de España:
//   curl -L -o spain.osm.pbf https://download.geofabrik.de/europe/spain-latest.osm.pbf
//   curl -L -o canarias.osm.pbf https://download.geofabrik.de/africa/canary-islands-latest.osm.pbf
//   for n in spain canarias; do
//     osmium tags-filter $n.osm.pbf nwr/tourism=camp_site,caravan_site -o camp-$n.pbf
//     osmium export camp-$n.pbf -f geojsonseq -o camp-$n.geojsonl --geometry-types=point,polygon
//   done
//   node scripts/build-campings.mjs /tmp/camp-spain.geojsonl /tmp/camp-canarias.geojsonl
//
// Salida: public/data/campings.json
//   { actualizado, pool: [camping…], provincias: { slug: [idx…] } }
import { createReadStream, readFileSync, writeFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ENTRADAS = process.argv.slice(2)
if (!ENTRADAS.length) {
  console.error('Uso: node scripts/build-campings.mjs <camp.geojsonl> [canarias.geojsonl …]')
  process.exit(1)
}
const OUT = resolve(ROOT, 'public/data/campings.json')

/** Un camping a más de 15 km de cualquier playa no es un camping de playa. */
const RADIO_MAX_M = 15000

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

// Las MISMAS reglas que src/lib/campings.ts, para que el sidecar y el
// camino de runtime produzcan objetos idénticos.
function categoria(t) {
  const stars = parseInt(t['stars'] ?? t['tourism:stars'] ?? '0')
  if (stars > 0) return Math.min(stars, 5)
  const n = (t.name ?? '').toLowerCase()
  if (n.includes('resort') || n.includes('lujo') || n.includes('premium')) return 5
  if (n.includes('glamping') || n.includes('1ª') || n.includes('primera')) return 4
  if (n.includes('2ª') || n.includes('segunda')) return 3
  if (n.includes('3ª') || n.includes('tercera')) return 2
  if (t.tourism === 'caravan_site') return 2
  return 3
}

function servicios(t) {
  const out = []
  if (t.swimming_pool === 'yes' || t.swimming_pool === 'outdoor') out.push('Piscina')
  if (t.playground === 'yes') out.push('Parque infantil')
  if (t.restaurant === 'yes' || t.amenity === 'restaurant') out.push('Restaurante')
  if (t.bar === 'yes' || t.amenity === 'bar') out.push('Bar')
  if (t.supermarket === 'yes' || t.shop === 'supermarket') out.push('Supermercado')
  if (t['sanitary_dump_station'] === 'yes' || t.sanitary === 'yes') out.push('Vaciado')
  if (t.power_supply === 'yes' || t.electricity === 'yes') out.push('Enganche eléctrico')
  if (t.shower === 'yes' || t.showers === 'yes') out.push('Duchas')
  if (t.washing_machine === 'yes' || t.laundry === 'yes') out.push('Lavandería')
  if (t.wifi === 'yes' || t.internet_access === 'wlan' || t.internet_access === 'yes') out.push('WiFi')
  return out
}

const slugify = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// ——— 1. Playas, para situar cada camping ————————————————————————
const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
  .filter(p => p?.slug && p.lat && p.lng)
const CELDA = 0.15
const rejilla = new Map()
for (const p of playas) {
  const k = `${Math.round(p.lat / CELDA)}:${Math.round(p.lng / CELDA)}`
  if (!rejilla.has(k)) rejilla.set(k, [])
  rejilla.get(k).push(p)
}
const cerca = (la, lo) => {
  const ci = Math.round(la / CELDA), cj = Math.round(lo / CELDA)
  const out = []
  for (let i = ci - 1; i <= ci + 1; i++) for (let j = cj - 1; j <= cj + 1; j++) {
    const v = rejilla.get(`${i}:${j}`)
    if (v) out.push(...v)
  }
  return out
}

// ——— 2. Recorrer los extractos ——————————————————————————————————
const pool = []
const porProvincia = new Map()
let leidas = 0

for (const ENTRADA of ENTRADAS) {
  const antes = pool.length
  const rl = createInterface({ input: createReadStream(ENTRADA), crlfDelay: Infinity })
  for await (const linea of rl) {
    if (!linea.trim()) continue
    leidas++
    let f
    try { f = JSON.parse(linea.replace(/^\x1e/, '')) } catch { continue }
    const t = f.properties ?? {}
    if (!t.name) continue                       // sin nombre no se puede listar
    if (t.access === 'private') continue
    const c = centroide(f.geometry)
    if (!c) continue

    // Playa más cercana: sitúa el camping y da el dato que nos distingue.
    let mejor = null, mejorD = Infinity
    for (const p of cerca(c.lat, c.lon)) {
      const d = hav(c.lat, c.lon, p.lat, p.lng)
      if (d < mejorD) { mejorD = d; mejor = p }
    }
    if (!mejor || mejorD > RADIO_MAX_M) continue

    const soloCaravanas = t.tourism === 'caravan_site'
    const glamping = /glamping|bungalow|cabin|lodge/i.test(t.name)
    let perros
    if (t.dog === 'yes' || t.dogs === 'yes') perros = true
    else if (t.dog === 'no' || t.dogs === 'no') perros = false

    const camping = {
      id: `osm-${f.id ?? `${c.lat.toFixed(5)}:${c.lon.toFixed(5)}`}`,
      nombre: String(t.name).slice(0, 80),
      tipo: glamping ? 'Glamping' : soloCaravanas ? 'Autocaravanas' : 'Camping',
      categoria: categoria(t),
      distancia_m: Math.round(mejorD),
      servicios: servicios(t),
      tiendas: t.tents !== 'no' && !soloCaravanas,
      autocaravanas: t.caravans !== 'no' || soloCaravanas,
      bungalows: t.cabins === 'yes' || t.static_caravans === 'yes',
      la: +c.lat.toFixed(5),
      lo: +c.lon.toFixed(5),
      playa: { slug: mejor.slug, nombre: mejor.nombre, municipio: mejor.municipio, distancia_m: Math.round(mejorD) },
    }
    if (perros !== undefined) camping.perros = perros
    if (t.website ?? t['contact:website']) camping.website = (t.website ?? t['contact:website']).slice(0, 120)
    if (t.phone ?? t['contact:phone']) camping.telefono = (t.phone ?? t['contact:phone']).slice(0, 30)

    const idx = pool.push(camping) - 1
    const ps = slugify(mejor.provincia)
    if (!porProvincia.has(ps)) porProvincia.set(ps, [])
    porProvincia.get(ps).push(idx)
  }
  // Por fichero: un extracto que aporta cero delata un archipiélago ausente.
  console.log(`  ${ENTRADA.split('/').pop()}: ${pool.length - antes} campings en zona`)
}

for (const lista of porProvincia.values()) {
  lista.sort((a, b) => pool[a].distancia_m - pool[b].distancia_m)
}

const salida = {
  actualizado: new Date().toISOString().slice(0, 10),
  pool,
  provincias: Object.fromEntries([...porProvincia].sort()),
}
writeFileSync(OUT, JSON.stringify(salida))
console.log(`\nfeatures leídas: ${leidas}`)
console.log(`campings a ≤${RADIO_MAX_M / 1000} km de una playa: ${pool.length}`)
console.log(`provincias con alguno: ${Object.keys(salida.provincias).length}`)
console.log(`con bungalows: ${pool.filter(c => c.bungalows).length} · a ≤300 m de la arena: ${pool.filter(c => c.distancia_m <= 300).length}`)
