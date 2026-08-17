#!/usr/bin/env node
// scripts/build-banderas-and-map.mjs — Mapeo offline id de playa de la Junta
// de Andalucía → slug de nuestra playa. Se ejecuta UNA vez (o cuando cambie
// el catálogo); el runtime solo hace lookups contra el sidecar.
//
// Fuente: API de recursos turísticos de la Junta (maps.andalucia.org), la que
// alimenta el visor "Playas Seguras de Andalucía" del IECA. 506 playas de las
// cinco provincias con bandera en vivo. Sin clave. No está enlazada en ninguna
// web: se llega a ella por el JS del visor, y tiene Swagger público.
//
//   POST /rest/beach/paginated         → catálogo (nombre, coords, territorios)
//   POST /rest/webapp/beach/paginated  → estado en vivo (ligero, ~97 KB, 1 s)
//
// OJO con las coordenadas: x_coord es LONGITUD e y_coord es LATITUD.
//
// Matching por distancia, umbral 350 m, igual que Canarias y por el mismo
// motivo: casar por nombre pone el aviso en la playa equivocada.
//
// Uso: node scripts/build-banderas-and-map.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/banderas-and-map.json')
const API = 'https://maps.andalucia.org/rest-turistico/rest'
const MAX_DIST_M = 350
const PROV_AND = new Set(['Almería', 'Cádiz', 'Granada', 'Huelva', 'Málaga'])

const hav = (lat1, lon1, lat2, lon2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

async function main() {
  const res = await fetch(`${API}/beach/paginated`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept-Language': 'es' },
    body: JSON.stringify({ item_number: -1, page_size: -1, filters: { 'resource_type.code': ['TIPRECPLAYA'] } }),
  })
  if (!res.ok) { console.error(`✗ catálogo devolvió HTTP ${res.status}`); process.exit(1) }
  const { list } = await res.json()

  const and = []
  for (const b of list ?? []) {
    const la = parseFloat(b.y_coord), lo = parseFloat(b.x_coord)
    if (!Number.isFinite(la) || !Number.isFinite(lo)) continue
    and.push({ id: b.id, nombre: b.name, la, lo })
  }

  const excluidas = new Set([
    ...JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf8')),
    ...Object.keys(JSON.parse(readFileSync(resolve(ROOT, 'src/data/duplicados.json'), 'utf8'))),
  ])
  const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
    .filter(p => p?.slug && p.lat && p.lng && PROV_AND.has(p.provincia) && !excluidas.has(p.slug))
  console.log(`dataset Junta: ${and.length} playas · catálogo: ${playas.length} fichas andaluzas`)

  // slug → id[]: igual que Canarias, una ficha puede agrupar varios tramos
  // (la Junta trocea algunos arenales largos). Manda la peor bandera.
  const map = {}
  const audit = []
  for (const c of and) {
    let best = null, bestD = Infinity
    for (const p of playas) {
      const d = hav(c.la, c.lo, p.lat, p.lng)
      if (d < bestD) { bestD = d; best = p }
    }
    if (!best || bestD > MAX_DIST_M) continue
    ;(map[best.slug] ??= []).push(c.id)
    audit.push({ slug: best.slug, d: Math.round(bestD), suya: c.nombre, nuestra: best.nombre })
  }

  writeFileSync(OUT, JSON.stringify(map, null, 1) + '\n')
  const total = Object.values(map).reduce((n, a) => n + a.length, 0)
  console.log(`mapeadas: ${total}/${and.length} playas → ${Object.keys(map).length} fichas nuestras`)

  // Control explícito del caso que motivó todo esto: las seis playas de
  // Málaga capital que el 15-ago-2026 quedaron con el baño prohibido por
  // E. coli y que nuestras fichas mostraban como "BUENA".
  const CONTROL = ['Misericordia', 'Sacaba', 'San Andrés', 'Guadalmar', 'El Palo', 'Campo de Golf']
  console.log('\ncontrol (las seis de Málaga capital del 15-ago):')
  for (const nombre of CONTROL) {
    const hit = audit.find(a => a.suya.toLowerCase().includes(nombre.toLowerCase()))
    console.log(hit ? `  ✓ ${hit.suya.padEnd(26)} → ${hit.slug} (${hit.d} m)` : `  ✗ ${nombre}: SIN MAPEAR`)
  }

  audit.sort((a, b) => b.d - a.d)
  console.log('\nlas 10 más lejanas (revisar a ojo):')
  for (const a of audit.slice(0, 10)) {
    console.log(` ${String(a.d).padStart(4)}m · ${a.suya.slice(0, 30).padEnd(32)} → ${a.nuestra.slice(0, 26)}`)
  }
}

main()
