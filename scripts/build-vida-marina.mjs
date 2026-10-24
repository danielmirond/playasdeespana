#!/usr/bin/env node
// scripts/build-vida-marina.mjs — especies marinas por municipio, desde OBIS
// (Ocean Biodiversity Information System, api.obis.org, sin clave).
//
// Alimenta la subpágina «Snorkel y buceo en X · Especies y vida marina».
// Es un sidecar offline como el resto: en runtime no se llama a nadie.
//
// POR QUÉ POR MUNICIPIO Y NO POR PLAYA. Medido antes de escribir esto:
// con el filtro de profundidad que separa «está en estas aguas» de «lo
// ves con un tubo», 10 de 25 playas españolas no tenían NINGUNA especie
// visible y la mediana era 1. Por municipio la mediana sube a 8 y los
// buenos pasan de 100. La unidad geográfica tiene que encajar con la
// resolución del dato; a nivel de playa, esto no existe.
//
// POR QUÉ HAY UMBRAL. Aun por municipio, 5 de cada 18 salen a cero. Una
// subpágina vacía en la mitad de los municipios es la fábrica de páginas
// flojas que arrastran a las buenas. Solo se publica el que llega a
// MINIMO especies.
//
// Uso: node scripts/build-vida-marina.mjs [--minimo=15]
// Salida: public/data/vida-marina.json
//   { "<municipio-slug>": { nombre, especies: [{ n, clase, registros }], total } }

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/data/vida-marina.json')
const MINIMO = Number((process.argv.find(a => a.startsWith('--minimo=')) ?? '').split('=')[1] ?? '15') || 15

// SIN filtro de profundidad, y no por descuido.
//
// La primera versión pedía enddepth=30 pensando en el límite del buceo
// recreativo. El resultado fue que Galicia salía a cero, lo cual es
// absurdo en una de las costas más ricas de Europa. Medido en A Coruña:
// con el filtro, 4 especies; sin él, 68 —caballa, jurel, anémona,
// estrella de mar—. OBIS descarta en ese filtro los registros que no
// traen profundidad anotada, y en el Atlántico casi ninguno la trae.
//
// Lo que acota la consulta es la GEOGRAFÍA: la caja llega a tres
// kilómetros de la costa. Y la página dice «registradas en su litoral»,
// que es lo que el dato sostiene, en vez de prometer profundidad de
// snorkel que la fuente no sabe.

// Clases que alguien reconoce bajo el agua. Sin plancton, sin bacterias y
// sin aves: un charrán no es vida que veas buceando.
const VISIBLES = new Set([
  'Teleostei', 'Elasmobranchii', 'Cephalopoda', 'Echinoidea',
  'Asteroidea', 'Holothuroidea', 'Hexacorallia', 'Ophiuroidea',
])

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
const praiasPt = new Set(JSON.parse(readFileSync(resolve(ROOT, 'public/data/praias-portugal.json'), 'utf8')).map(p => p.slug))
const arr = (Array.isArray(playas) ? playas : Object.values(playas))
  .filter(p => p?.slug && p.lat && p.lng && p.municipio && !praiasPt.has(p.slug))

const porMuni = new Map()
for (const p of arr) {
  const k = slugify(p.municipio)
  if (!porMuni.has(k)) porMuni.set(k, { nombre: p.municipio, playas: [] })
  porMuni.get(k).playas.push(p)
}
const munis = [...porMuni.entries()].filter(([, v]) => v.playas.length >= 2)
console.log(`municipios con 2+ playas: ${munis.length} · umbral: ${MINIMO} especies`)

const salida = {}
let i = 0, vacios = 0, bajoUmbral = 0
for (const [slug, { nombre, playas: ps }] of munis) {
  i++
  const lats = ps.map(p => p.lat), lons = ps.map(p => p.lng)
  // El litoral del municipio más 3 km mar adentro.
  const d = 0.028
  const wkt = `POLYGON((${Math.min(...lons) - d} ${Math.min(...lats) - d},${Math.max(...lons) + d} ${Math.min(...lats) - d},${Math.max(...lons) + d} ${Math.max(...lats) + d},${Math.min(...lons) - d} ${Math.max(...lats) + d},${Math.min(...lons) - d} ${Math.min(...lats) - d}))`
  try {
    const r = await fetch(
      `https://api.obis.org/v3/checklist?size=1000&geometry=${encodeURIComponent(wkt)}`,
      { headers: { 'User-Agent': 'playas-espana.com (+https://playas-espana.com)' }, signal: AbortSignal.timeout(70000) },
    )
    const d2 = await r.json()
    const esp = (d2.results ?? [])
      .filter(t => VISIBLES.has(t.class) && t.taxonRank === 'Species')
      .map(t => ({ n: t.scientificName, clase: t.class, registros: t.records ?? 0 }))
      .sort((a, b) => b.registros - a.registros)
    if (esp.length === 0) vacios++
    else if (esp.length < MINIMO) bajoUmbral++
    else salida[slug] = { nombre, total: esp.length, especies: esp.slice(0, 60) }
  } catch (e) {
    console.warn(`  ✗ ${slug}: ${e.message}`)
  }
  if (i % 25 === 0) console.log(`  ${i}/${munis.length} · publicables hasta ahora: ${Object.keys(salida).length}`)
  await new Promise(r => setTimeout(r, 300))
}

const ord = Object.fromEntries(Object.keys(salida).sort().map(k => [k, salida[k]]))
writeFileSync(OUT, JSON.stringify(ord) + '\n')
console.log(`\nsin ninguna especie: ${vacios} · por debajo del umbral: ${bajoUmbral} · PUBLICABLES: ${Object.keys(ord).length}`)
console.log(`→ ${OUT} (${(JSON.stringify(ord).length / 1024).toFixed(0)} KB)`)
