#!/usr/bin/env node
// scripts/build-banderas-sb-map.mjs — Mapeo offline de las playas de SafeBeach
// → slug nuestro, por coordenadas.
//
// SafeBeach es la plataforma privada que usan los servicios de socorrismo de
// unos 44 municipios de la Comunitat Valenciana, Illes Balears y Murcia. No
// hay API: cada municipio tiene una página en info.safebeach.es con el JSON
// embebido en el HTML como `window.SB_MARKERS`. No existe endpoint global ni
// sitemap, así que la lista de municipios se mantiene aquí.
//
// A diferencia de Bizkaia y Gipuzkoa, aquí SÍ hay coordenadas, así que el
// emparejamiento es automático y por distancia, nunca por nombre.
//
// El mapa se guarda como slug → { m: municipio, l: localizador } para que el
// runtime solo pida la página del municipio de esa playa, no las 44.
//
// Uso: node scripts/build-banderas-sb-map.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/banderas-sb-map.json')
const MAX_DIST_M = 350

// Municipios dados de alta, verificados uno a uno (200 con array no vacío).
// Un slug inexistente devuelve 404 y uno dado de alta sin playas cargadas
// devuelve 200 con array vacío, así que se distinguen.
const MUNICIPIOS = [
  // Comunitat Valenciana
  'guardamar-del-segura', 'valencia', 'xeraco', 'denia', 'torrevieja', 'calpe',
  'sueca', 'sagunto', 'teulada', 'benissa', 'peniscola', 'almenara', 'puçol',
  // Illes Balears
  'calvia', 'manacor', 'palma-de-mallorca', 'capdepera', 'pollensa', 'santanyi',
  'campos', 'ses-salines', 'muro', 'felanitx', 'alcudia', 'arta', 'son-servera',
  'andratx', 'llucmajor', 'soller', 'escorca',
  'santa-eulalia-del-rio', 'sant-josep-de-sa-talaia', 'sant-antoni-de-portmany',
  'formentera', 'sant-joan-de-labritja', 'ibiza',
  'ciutadella', 'es-mercadal', 'alaior', 'ferreries', 'mao', 'sant-lluis',
  'es-migjorn-gran',
  // Múrcia
  'san-pedro-del-pinatar',
  // Asturias (dados de alta, pocas playas)
  'castropol', 'coana',
]

const hav = (lat1, lon1, lat2, lon2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

async function marcadores(muni) {
  const res = await fetch(`https://info.safebeach.es/${muni}`, {
    headers: { 'User-Agent': 'playas-espana.com (+https://playas-espana.com) mapeo offline' },
  })
  if (!res.ok) return { muni, http: res.status, playas: [] }
  const html = await res.text()
  const m = /SB_MARKERS\s*=\s*(\[[\s\S]*?\])\s*;/.exec(html)
  if (!m) return { muni, http: res.status, playas: [] }
  try { return { muni, http: res.status, playas: JSON.parse(m[1]) } }
  catch { return { muni, http: res.status, playas: [] } }
}

async function main() {
  const excluidas = new Set([
    ...JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf8')),
    ...Object.keys(JSON.parse(readFileSync(resolve(ROOT, 'src/data/duplicados.json'), 'utf8'))),
  ])
  const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
    .filter(p => p?.slug && p.lat && p.lng && !excluidas.has(p.slug))

  const map = {}
  const audit = []
  let totalSB = 0, sinFicha = 0
  for (const muni of MUNICIPIOS) {
    const { http, playas: ps } = await marcadores(muni)
    let casadas = 0
    for (const sb of ps) {
      const la = parseFloat(sb.lat), lo = parseFloat(sb.lng)
      if (!Number.isFinite(la) || !Number.isFinite(lo)) continue
      totalSB++
      let best = null, bestD = Infinity
      for (const p of playas) {
        const d = hav(la, lo, p.lat, p.lng)
        if (d < bestD) { bestD = d; best = p }
      }
      if (!best || bestD > MAX_DIST_M) { sinFicha++; continue }
      const prev = audit.find(a => a.slug === best.slug)
      if (prev && prev.d <= bestD) continue
      if (prev) { delete map[prev.slug]; audit.splice(audit.indexOf(prev), 1) }
      map[best.slug] = { m: muni, l: String(sb.localizador) }
      audit.push({ slug: best.slug, d: Math.round(bestD), suya: sb.nombre, nuestra: best.nombre, muni })
      casadas++
    }
    console.log(`  ${muni.padEnd(26)} http=${http} playas=${String(ps.length).padStart(2)} casadas=${casadas}`)
    await new Promise(r => setTimeout(r, 300))   // cortesía: no martillear
  }

  writeFileSync(OUT, JSON.stringify(map, null, 1) + '\n')
  console.log(`\nSafeBeach: ${totalSB} playas · casadas ${Object.keys(map).length} · sin ficha nuestra ${sinFicha}`)
  audit.sort((a, b) => b.d - a.d)
  console.log('\nlas 12 más lejanas (revisar a ojo):')
  for (const a of audit.slice(0, 12)) {
    console.log(` ${String(a.d).padStart(4)}m · ${a.suya.slice(0, 26).padEnd(28)} → ${a.nuestra.slice(0, 24).padEnd(26)} [${a.muni}]`)
  }
}

main()
