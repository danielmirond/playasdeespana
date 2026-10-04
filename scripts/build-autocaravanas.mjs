#!/usr/bin/env node
// scripts/build-autocaravanas.mjs — sidecar de áreas de autocaravana.
//
// PARA QUÉ. Quien viaja en autocaravana por la costa no busca una playa:
// busca dónde pasar la noche sin que le llamen la atención, dónde vaciar y
// a qué playa puede llegar con siete metros de vehículo. Lo primero está en
// OpenStreetMap (tourism=caravan_site y los parkings con motorhome=yes), lo
// tercero ya lo teníamos en el inventario oficial, en el tamaño del
// aparcamiento de cada playa.
//
// Datos: Overpass, una vez. La consulta está en el README del script:
//   nwr[tourism=caravan_site]; nwr[amenity=parking][motorhome~yes|designated]
//   nwr[amenity=parking][caravan~yes|designated]   (bbox de España)
//
//   node scripts/build-autocaravanas.mjs /tmp/caravan.json
//
// Salida: public/data/autocaravanas.json
//   { pool: [area…], municipios: { slug: [[idx, metros]…] } }
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const IN = process.argv[2]
if (!IN) { console.error('Uso: node scripts/build-autocaravanas.mjs <caravan.json>'); process.exit(1) }
const OUT = resolve(ROOT, 'public/data/autocaravanas.json')

// Generoso a propósito: un área de pernocta a 12 km sigue sirviendo para
// dormir y bajar a la playa por la mañana. Un aparcamiento, no.
const RADIO_MUNI_M = 12000
const POR_MUNI = 8

const hav = (la1, lo1, la2, lo2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLa = r(la2 - la1), dLo = r(lo2 - lo1)
  const x = Math.sin(dLa / 2) ** 2 + Math.cos(r(la1)) * Math.cos(r(la2)) * Math.sin(dLo / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}
const si = v => v === 'yes' || v === 'designated' || v === 'customers'

/** Lo que decide si se duerme ahí: si es área o solo un parking que admite
 *  autocaravanas, si tiene los servicios y cuánto cuesta. */
function util(t) {
  if (t.access === 'private' || t.access === 'no') return null
  const area = t.tourism === 'caravan_site'
  return {
    n: t.name || null,
    // 'area' se promete como área de autocaravanas; 'parking' solo como
    // aparcamiento donde caben. La diferencia importa y se pinta distinta.
    k: area ? 'area' : 'parking',
    f: t.fee === 'yes' ? 1 : t.fee === 'no' ? 0 : undefined,
    c: Number(t.capacity) > 0 && Number(t.capacity) < 2000 ? Number(t.capacity) : undefined,
    agua: si(t.drinking_water) || si(t.water_point) ? 1 : undefined,
    vaciado: si(t.sanitary_dump_station) ? 1 : undefined,
    luz: si(t.power_supply) || si(t.electricity) ? 1 : undefined,
    duchas: si(t.shower) ? 1 : undefined,
    aseos: si(t.toilets) ? 1 : undefined,
    tarifa: t.charge || t.fee === 'yes' ? (t.charge || undefined) : undefined,
    max: t.maxstay || undefined,
    web: t.website || t['contact:website'] || undefined,
  }
}

const toSlug = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
const porMuni = new Map()
for (const p of playas) {
  if (!p.lat || !p.lng) continue
  const s = toSlug(p.municipio)
  if (!porMuni.has(s)) porMuni.set(s, [])
  porMuni.get(s).push(p)
}
const mediana = xs => { const o = [...xs].sort((a, b) => a - b); return o[Math.floor(o.length / 2)] }
const munis = [...porMuni].map(([slug, ps]) => ({
  slug, lat: mediana(ps.map(p => p.lat)), lon: mediana(ps.map(p => p.lng)),
}))

const datos = JSON.parse(readFileSync(IN, 'utf8'))
const pool = []
const deMuni = new Map()
for (const e of datos.elements ?? []) {
  const t = e.tags ?? {}
  const d = util(t)
  if (!d) continue
  const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon
  if (!lat || !lon) continue
  let idx = -1
  for (const m of munis) {
    const dist = hav(lat, lon, m.lat, m.lon)
    if (dist > RADIO_MUNI_M) continue
    if (idx === -1) idx = pool.push({ ...d, la: +lat.toFixed(5), lo: +lon.toFixed(5) }) - 1
    if (!deMuni.has(m.slug)) deMuni.set(m.slug, [])
    deMuni.get(m.slug).push([idx, Math.round(dist)])
  }
}
const municipios = Object.fromEntries([...deMuni]
  .map(([k, v]) => [k, v.sort((a, b) => a[1] - b[1]).slice(0, POR_MUNI)]))

writeFileSync(OUT, JSON.stringify({ pool, municipios }))
console.log(`áreas y parkings en zona costera: ${pool.length} (${pool.filter(p => p.k === 'area').length} áreas)`)
console.log(`municipios con alguna a ${RADIO_MUNI_M / 1000} km: ${Object.keys(municipios).length}`)
console.log(`con vaciado: ${pool.filter(p => p.vaciado).length} · con agua: ${pool.filter(p => p.agua).length} · gratis: ${pool.filter(p => p.f === 0).length}`)
