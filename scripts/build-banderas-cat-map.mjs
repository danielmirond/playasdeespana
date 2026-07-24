#!/usr/bin/env node
// scripts/build-banderas-cat-map.mjs — Mapeo offline codiplatja (dataset de
// banderas izadas de Transparència Catalunya, resource 4baz-cjv2) → slug de
// nuestra playa. Se ejecuta UNA vez (o cuando cambie el catálogo); el runtime
// solo hace lookups contra el sidecar src/data/banderas-cat-map.json.
//
// Matching por distancia: cada playa del dataset lleva coordenadas
// (coordenada_x = LAT, coordenada_y = LON, así de traicionero). Aceptamos el
// slug más cercano dentro de 600 m; el nombre se guarda para auditar a ojo.
//
// Uso: node scripts/build-banderas-cat-map.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/banderas-cat-map.json')
const MAX_DIST_M = 600

const hav = (lat1, lon1, lat2, lon2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

async function main() {
  // Playas del dataset: una fila por codiplatja con sus coords más recientes.
  const url = 'https://analisi.transparenciacatalunya.cat/resource/4baz-cjv2.json'
    + '?$select=codiplatja,platja,municipi_municipi,max(coordenada_x)+as+la,max(coordenada_y)+as+lo'
    + '&$group=codiplatja,platja,municipi_municipi&$limit=2000'
  const rows = await (await fetch(url)).json()
  // Un codiplatja puede aparecer con variantes de nombre → nos quedamos una.
  const cat = new Map()
  for (const r of rows) {
    const la = parseFloat(r.la), lo = parseFloat(r.lo)
    if (!Number.isFinite(la) || !Number.isFinite(lo)) continue
    if (!cat.has(r.codiplatja)) cat.set(r.codiplatja, { ...r, la, lo })
  }

  const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
    .filter(p => p?.slug && p.lat && p.lng && p.comunidad === 'Cataluña')
  console.log(`dataset: ${cat.size} playas CAT · catálogo: ${playas.length} playas de Cataluña`)

  const map = {}   // slug → codiplatja
  const audit = []
  for (const [codi, c] of cat) {
    let best = null, bestD = Infinity
    for (const p of playas) {
      const d = hav(c.la, c.lo, p.lat, p.lng)
      if (d < bestD) { bestD = d; best = p }
    }
    if (best && bestD <= MAX_DIST_M) {
      // Si dos codiplatja compiten por el mismo slug, gana el más cercano.
      const prev = audit.find(a => a.slug === best.slug)
      if (prev && prev.d <= bestD) continue
      if (prev) { delete map[prev.slug]; audit.splice(audit.indexOf(prev), 1) }
      map[best.slug] = codi
      audit.push({ slug: best.slug, codi, d: Math.round(bestD), cat: c.platja, nuestra: best.nombre })
    }
  }

  writeFileSync(OUT, JSON.stringify(map, null, 1) + '\n')
  console.log(`mapeadas: ${Object.keys(map).length}/${cat.size} → ${OUT}`)
  // Muestra para auditar a ojo (las 10 más lejanas dentro del umbral)
  audit.sort((a, b) => b.d - a.d)
  for (const a of audit.slice(0, 10)) console.log(` ${a.d}m · ${a.cat} (${a.codi}) → ${a.nuestra} [${a.slug}]`)
}

main()
