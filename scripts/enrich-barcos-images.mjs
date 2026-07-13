#!/usr/bin/env node
// scripts/enrich-barcos-images.mjs
//
// Pre-resuelve OFFLINE un hero REAL por localidad de alquiler de barco usando
// fuentes libres con atribución (misma filosofía que enrich-playas-images.mjs):
//   1. Wikimedia Commons: geosearch por coordenadas (imágenes junto al lugar)
//   2. Wikimedia Commons: text search "<localidad> <término costero>"
//   3. Openverse (agregador CC)
// Filtra a paisaje (ancho > alto) y descarta mapas/escudos/planos. Guarda
// public/data/barcos-images.json { slug: { url, width, height, credit, source } }.
// En runtime el hero usa este sidecar; si falta, cae al degradado marino.
//
// Uso:  node scripts/enrich-barcos-images.mjs           # todas las no resueltas
//       node scripts/enrich-barcos-images.mjs --force   # re-resolver todas
//       node scripts/enrich-barcos-images.mjs mallorca  # una

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT = resolve(ROOT, 'public/data/barcos-images.json')
const UA = 'PlayasDeEspana/1.0 (https://playas-espana.com; hola@playas-espana.com) image-enrich'

// Localidad → coords (centro costero) + término de búsqueda costero preferente.
const LOCS = [
  { slug: 'mallorca',     q: 'Mallorca cala',        lat: 39.57, lon: 2.65 },
  { slug: 'ibiza',        q: 'Ibiza cala',           lat: 38.98, lon: 1.43 },
  { slug: 'menorca',      q: 'Menorca cala',         lat: 39.95, lon: 4.10 },
  { slug: 'barcelona',    q: 'Barcelona port vell',  lat: 41.375, lon: 2.19 },
  { slug: 'alicante',     q: 'Alicante playa',       lat: 38.34, lon: -0.48 },
  { slug: 'valencia',     q: 'Valencia playa',       lat: 39.46, lon: -0.32 },
  { slug: 'palma',        q: 'Palma de Mallorca bahia', lat: 39.57, lon: 2.65 },
  { slug: 'alcudia',      q: 'Alcudia playa',        lat: 39.85, lon: 3.12 },
  { slug: 'pollenca',     q: 'Port de Pollença',     lat: 39.90, lon: 3.08 },
  { slug: 'tossa-de-mar', q: 'Tossa de Mar platja',  lat: 41.72, lon: 2.93 },
  { slug: 'costa-brava',  q: 'Costa Brava cala',     lat: 41.90, lon: 3.16 },
  { slug: 'lloret-de-mar',q: 'Lloret de Mar platja', lat: 41.70, lon: 2.85 },
  { slug: 'tenerife',     q: 'Tenerife playa costa', lat: 28.29, lon: -16.62 },
  { slug: 'malaga',       q: 'Málaga playa',         lat: 36.72, lon: -4.42 },
  { slug: 'marbella',     q: 'Marbella playa',       lat: 36.51, lon: -4.88 },
  { slug: 'formentera',   q: 'Formentera playa',     lat: 38.70, lon: 1.43 },
  { slug: 'denia',        q: 'Dénia cala',           lat: 38.84, lon: 0.11 },
  { slug: 'javea',        q: 'Xàbia cala',           lat: 38.79, lon: 0.17 },
  { slug: 'salou',        q: 'Salou platja',         lat: 41.08, lon: 1.14 },
  { slug: 'tarifa',       q: 'Tarifa playa',         lat: 36.01, lon: -5.60 },
]

const NEG = /(map|mapa|plano|escudo|coat[_ ]of[_ ]arms|flag|bandera|logo|diagram|chart|sign|se[nñ]al|street|calle|iglesia|church|museo|museu|museum|capella|chapel|ermita|portalada|cartell|convent|castillo interior|aerial map|satellite|topograph|estatua|statue|plaza|square|monument|ISS0|nasa|remote sensing|orbit|pollentia|ruina|ruins|yacimiento)/i
// El título debe hablar de mar/costa CON límites de palabra: sin \b,
// "Portalada" colaba por "port", "Capella" por "cape" y "Museu del Mar" por
// "mar". Con \b solo pasan términos costeros reales.
const POS = /\b(cala|cales|cal[oó]|platja|playa|beach|port|puerto|marina|bah[ií]a|badia|bay|costa|coast|mar|sea|sail|vela|barco|boat|yacht|harbou?r|cliff|acantilado|penyal|cabo|cap|illa|isla|island|espig[oó]n|faro|lighthouse)\b/i

async function fetchJSON(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'application/json' } })
      if (res.ok) return await res.json()
    } catch { /* retry */ }
    await new Promise(r => setTimeout(r, 500 * (i + 1)))
  }
  return null
}

// imageinfo (url + dimensiones + autor/licencia) para una lista de títulos File:
async function commonsImageInfo(titles) {
  if (!titles.length) return []
  const params = new URLSearchParams({
    action: 'query', format: 'json', prop: 'imageinfo',
    iiprop: 'url|size|extmetadata', iiurlwidth: '1600',
    titles: titles.join('|'),
  })
  const data = await fetchJSON(`https://commons.wikimedia.org/w/api.php?${params}`)
  const pages = data?.query?.pages ?? {}
  return Object.values(pages).map(p => {
    const ii = p?.imageinfo?.[0]; if (!ii) return null
    const meta = ii.extmetadata ?? {}
    const author = (meta.Artist?.value ?? '').replace(/<[^>]+>/g, '').trim().slice(0, 80)
    const license = (meta.LicenseShortName?.value ?? '').trim()
    return {
      title: p.title, url: ii.thumburl || ii.url, width: ii.thumbwidth || ii.width,
      height: ii.thumbheight || ii.height, author, license,
    }
  }).filter(Boolean)
}

// El término costero debe estar FUERA del nombre de la localidad: si no,
// cualquier foto de "Lloret de Mar" o "Tossa de Mar" pasa por el "Mar" del
// topónimo (p.ej. "Can Garriga (Lloret de Mar)" — una casa modernista).
const sinLocalidad = (title, locName) => {
  const esc = locName.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9 ]/g, ' ').trim().split(/\s+/).join('[ _,()-]*')
  return (title || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(new RegExp(esc, 'gi'), ' ')
}

const isGoodPhoto = (f, locName = '') =>
  f && /\.(jpe?g)$/i.test(f.title || f.url) && !NEG.test(f.title || '') &&
  POS.test(sinLocalidad(f.title, locName)) &&
  f.width >= 1000 && f.width > f.height * 1.15  // paisaje

// 1) geosearch: títulos de File: cerca de las coords
async function viaGeo(lat, lon, locName) {
  const params = new URLSearchParams({
    action: 'query', format: 'json', list: 'geosearch',
    gsprimary: 'all', gsnamespace: '6', gsradius: '10000', gslimit: '30',
    gscoord: `${lat}|${lon}`,
  })
  const data = await fetchJSON(`https://commons.wikimedia.org/w/api.php?${params}`)
  const titles = (data?.query?.geosearch ?? []).map(g => g.title).slice(0, 30)
  const info = await commonsImageInfo(titles)
  return info.filter(f => isGoodPhoto(f, locName))
}

// 2) text search en Commons
async function viaText(q, locName) {
  const params = new URLSearchParams({
    action: 'query', format: 'json', list: 'search',
    srnamespace: '6', srlimit: '30', srsearch: `${q} filetype:bitmap`,
  })
  const data = await fetchJSON(`https://commons.wikimedia.org/w/api.php?${params}`)
  const titles = (data?.query?.search ?? []).map(s => s.title).slice(0, 30)
  const info = await commonsImageInfo(titles)
  return info.filter(f => isGoodPhoto(f, locName))
}

// 3) Openverse (CC)
async function viaOpenverse(q) {
  const params = new URLSearchParams({ q, license_type: 'all', page_size: '20', mature: 'false' })
  const data = await fetchJSON(`https://api.openverse.org/v1/images/?${params}`)
  return (data?.results ?? []).map(r => {
    if (!r.url || NEG.test(r.title || '') || !POS.test(r.title || '')) return null
    const w = r.width ?? 0, h = r.height ?? 0
    if (w && h && !(w > h * 1.15)) return null
    return { url: r.url, width: w || 1600, height: h || 900, author: (r.creator || '').slice(0, 80), license: (r.license || '').toUpperCase(), title: r.title || '' }
  }).filter(Boolean)
}

function toEntry(f, source) {
  const credit = [f.author, f.license].filter(Boolean).join(' · ')
  return { url: f.url, width: f.width, height: f.height, credit: credit || source, source }
}

async function resolve1(loc) {
  const locName = loc.slug.replace(/-/g, ' ')
  const geo = await viaGeo(loc.lat, loc.lon, locName)
  if (geo.length) return toEntry(geo.sort((a, b) => b.width - a.width)[0], 'wikimedia')
  const txt = await viaText(loc.q, locName)
  if (txt.length) return toEntry(txt.sort((a, b) => b.width - a.width)[0], 'wikimedia')
  const ov = await viaOpenverse(loc.q)
  if (ov.length) return toEntry(ov[0], 'openverse')
  return null
}

async function main() {
  const arg = process.argv.slice(2)
  const force = arg.includes('--force')
  const only = arg.find(a => !a.startsWith('--'))

  let out = {}
  try { out = JSON.parse(await readFile(OUT, 'utf8')) } catch { /* first run */ }

  const targets = LOCS.filter(l => (only ? l.slug === only : true) && (force || !out[l.slug]))
  console.log(`Resolviendo ${targets.length} localidad(es)…`)

  for (const loc of targets) {
    try {
      const entry = await resolve1(loc)
      if (entry) { out[loc.slug] = entry; console.log(`✓ ${loc.slug.padEnd(14)} ${entry.source.padEnd(10)} ${entry.width}x${entry.height}  ${entry.credit.slice(0, 50)}`) }
      else console.log(`✗ ${loc.slug} — sin foto`)
    } catch (e) { console.log(`✗ ${loc.slug} — error: ${e.message}`) }
    await new Promise(r => setTimeout(r, 700))
  }

  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n')
  console.log(`\nGuardado ${Object.keys(out).length} en ${OUT}`)
}

main()
