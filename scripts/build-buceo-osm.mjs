#!/usr/bin/env node
// scripts/build-buceo-osm.mjs — puntos de inmersión y escuelas de buceo
// por municipio, desde OpenStreetMap vía Overpass.
//
// POR QUÉ SEPARADOS. OSM etiqueta con `sport=scuba_diving` tanto el sitio
// donde se bucea como, a veces, la tienda. El sidecar general de POIs los
// metía en el mismo saco y el resultado era llamar «centro de buceo» a
// Cala d'Aiguafreda, que es una cala. Aquí se parten en dos: `shop` es la
// escuela —tiene teléfono y web— y el resto es punto de inmersión.
//
// LO QUE HAY, medido: 98 escuelas y 119 puntos en toda España. Poco para
// las escuelas (Google Places daría más), pero los puntos de inmersión no
// los tiene nadie ordenados por municipio con el estado del mar al lado.
//
// Uso: node scripts/build-buceo-osm.mjs
// Salida: public/data/buceo-osm.json
//   { "<municipio>": { escuelas: [{n,web,tel,la,lo}], sitios: [{n,la,lo,playa,m}] } }

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/data/buceo-osm.json')
// Más lejos de esto no es «buceo en este municipio», es buceo en otro.
const RADIO_M = 12000

const Q = `[out:json][timeout:160];
area["ISO3166-1"="ES"][admin_level=2]->.es;
(
  nwr["shop"="scuba_diving"](area.es);
  nwr["sport"="scuba_diving"](area.es);
);
out tags center;`

const hav = (lat1, lon1, lat2, lon2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}
const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const res = await fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  headers: { 'User-Agent': 'playas-espana.com (+https://playas-espana.com)' },
  body: new URLSearchParams({ data: Q }),
  signal: AbortSignal.timeout(200000),
})
const { elements } = await res.json()
console.log(`elementos de Overpass: ${elements.length}`)

const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
const praiasPt = new Set(JSON.parse(readFileSync(resolve(ROOT, 'public/data/praias-portugal.json'), 'utf8')).map(p => p.slug))
const arr = (Array.isArray(playas) ? playas : Object.values(playas))
  .filter(p => p?.slug && p.lat && p.lng && p.municipio && !praiasPt.has(p.slug))

const salida = {}
let escuelas = 0, sitios = 0, huerfanos = 0
for (const e of elements) {
  const la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon
  const t = e.tags ?? {}
  // Sin nombre no se publica: una fila que dice «Centro de buceo» y nada
  // más no le sirve a nadie.
  if (!la || !lo || !t.name) continue

  // Se adjudica a la playa más cercana, y de ella sale el municipio. Es
  // el mismo criterio que arregló las áreas de autocaravana que siete
  // municipios se disputaban.
  let mejor = null
  for (const p of arr) {
    const d = hav(la, lo, p.lat, p.lng)
    if (d <= RADIO_M && (!mejor || d < mejor.d)) mejor = { d, p }
  }
  if (!mejor) { huerfanos++; continue }

  const slug = slugify(mejor.p.municipio)
  salida[slug] ??= { escuelas: [], sitios: [] }
  const base = { n: t.name, la: +la.toFixed(5), lo: +lo.toFixed(5) }
  if (t.shop === 'scuba_diving') {
    salida[slug].escuelas.push({
      ...base,
      web: t.website ?? t['contact:website'] ?? null,
      tel: t.phone ?? t['contact:phone'] ?? null,
    })
    escuelas++
  } else {
    salida[slug].sitios.push({ ...base, playa: mejor.p.nombre, m: Math.round(mejor.d) })
    sitios++
  }
}

for (const v of Object.values(salida)) {
  v.escuelas.sort((a, b) => a.n.localeCompare(b.n))
  v.sitios.sort((a, b) => a.m - b.m)
}
const ord = Object.fromEntries(Object.keys(salida).sort().map(k => [k, salida[k]]))
writeFileSync(OUT, JSON.stringify(ord) + '\n')
console.log(`escuelas: ${escuelas} · puntos de inmersión: ${sitios} · sin playa a ${RADIO_M / 1000} km: ${huerfanos}`)
console.log(`municipios: ${Object.keys(ord).length} → ${OUT}`)
