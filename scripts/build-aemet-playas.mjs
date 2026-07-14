#!/usr/bin/env node
// scripts/build-aemet-playas.mjs
//
// Mapea las 591 playas del maestro público de AEMET (Playas_codigos.csv,
// accesible sin API key) contra nuestro dataset por distancia haversine
// (<1.2 km) con desempate por similitud de nombre. Escribe
// src/data/aemet-playas.json { slugNuestro: { codigo, nombre, distM } }.
//
// El código AEMET (7 dígitos: INE municipio + índice) es el que consume
// la predicción oficial de playa vía opendata (src/lib/aemet.ts, requiere
// AEMET_API_KEY). Este script NO necesita key.
//
// Uso: node scripts/build-aemet-playas.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CSV_URL = 'https://www.aemet.es/documentos/es/eltiempo/prediccion/playas/Playas_codigos.csv'
const OUT = resolve(ROOT, 'src/data/aemet-playas.json')
const MAX_KM = 1.2

// "38º 34' 31\"" / "-00º 03' 52\"" → grados decimales
function dms(str) {
  const m = String(str).trim().match(/^(-?)(\d+)º\s*(\d+)'\s*(\d+)"?$/)
  if (!m) return null
  const sign = m[1] === '-' ? -1 : 1
  return sign * (Number(m[2]) + Number(m[3]) / 60 + Number(m[4]) / 3600)
}

const hav = (a, b) => {
  const R = 6371, r = d => d * Math.PI / 180
  const dl = r(b.lat - a.lat), dn = r(b.lng - a.lng)
  const x = Math.sin(dl / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dn / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

const norm = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\b(playa|platja|praia|hondartza|de|del|de la|la|el|les|los|las|d')\b/g, ' ')
  .replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

function similitud(a, b) {
  const ta = new Set(norm(a).split(' ').filter(w => w.length >= 3))
  const tb = new Set(norm(b).split(' ').filter(w => w.length >= 3))
  if (!ta.size || !tb.size) return 0
  let hits = 0
  for (const t of ta) if (tb.has(t)) hits++
  return hits / Math.max(ta.size, tb.size)
}

async function main() {
  const res = await fetch(CSV_URL, { headers: { 'User-Agent': 'PlayasDeEspana/1.0 (playas-espana.com)' } })
  const buf = Buffer.from(await res.arrayBuffer())
  const csv = new TextDecoder('latin1').decode(buf)

  const aemet = csv.split(/\r?\n/).slice(1).filter(Boolean).map(line => {
    const [id, nombre, , , , municipio, latS, lngS] = line.split(';')
    const lat = dms(latS), lng = dms(lngS)
    if (!id || lat == null || lng == null) return null
    return { id, nombre, municipio, lat, lng }
  }).filter(Boolean)

  const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
    .filter(p => p?.slug && p.lat && p.lng)

  // Para cada playa AEMET: candidata nuestra más cercana (con bonus de nombre)
  const porSlug = new Map() // slug → { codigo, nombre, distM, score }
  let matched = 0
  for (const a of aemet) {
    let best = null
    for (const p of playas) {
      if (Math.abs(p.lat - a.lat) > 0.02 || Math.abs(p.lng - a.lng) > 0.025) continue
      const km = hav(a, p)
      if (km > MAX_KM) continue
      const sim = similitud(a.nombre, p.nombre)
      const score = km - sim * 0.6   // 60% de similitud "compensa" 600 m
      if (!best || score < best.score) best = { p, km, sim, score }
    }
    if (!best) continue
    matched++
    const prev = porSlug.get(best.p.slug)
    if (!prev || best.score < prev.score) {
      porSlug.set(best.p.slug, {
        codigo: a.id, nombre: a.nombre, distM: Math.round(best.km * 1000), score: best.score,
      })
    }
  }

  const out = {}
  for (const [slug, v] of [...porSlug.entries()].sort()) {
    out[slug] = { codigo: v.codigo, nombre: v.nombre, distM: v.distM }
  }
  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
  console.log(`AEMET: ${aemet.length} playas en maestro · ${matched} con match <${MAX_KM}km · ${Object.keys(out).length} slugs mapeados`)
  const lejos = Object.entries(out).filter(([, v]) => v.distM > 700)
  console.log(`(matches a >700m: ${lejos.length} — revisar muestra abajo)`)
  lejos.slice(0, 5).forEach(([s, v]) => console.log(`  ${s} ← ${v.nombre} (${v.distM}m)`))
}

main()
