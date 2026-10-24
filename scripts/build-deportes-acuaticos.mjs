#!/usr/bin/env node
// scripts/build-deportes-acuaticos.mjs — escuelas y alquileres de surf,
// kayak, paddle surf, kite y windsurf por municipio, desde Google Places.
//
// UNA PÁGINA, NO TRES. Las búsquedas de surf, kayak y kite devuelven en
// gran medida los MISMOS negocios: en Tarifa, «Explora Watersports —
// Kitesurf, Wingfoil & Surf school» sale en las tres. Montar una página
// por deporte sería listar a la misma gente tres veces con el título
// cambiado. Aquí se deduplica por place_id y cada negocio se etiqueta con
// lo que dice su propio nombre.
//
// POR QUÉ SOLO 68 MUNICIPIOS DE ENTRADA. Son los que tienen playa de surf
// en el inventario. 136 llamadas en vez de 1.168: si la página funciona
// se amplía; si no, no hay 400 páginas que desindexar.
//
// POR QUÉ DOS CONSULTAS Y NO CUATRO. Medido sobre cinco costas: «escuela
// de surf» da 5-10 y «alquiler de kayak y paddle surf» 9-10, y entre las
// dos ya sale casi todo. «Escuela de kitesurf» devolvía 10 en Sanxenxo,
// que no es destino de kite: Text Search estaba dando náuticas genéricas.
// «Club náutico» colaba negocios de otro municipio.
//
// Uso: node scripts/build-deportes-acuaticos.mjs [--todos] [--minimo=4]
// Salida: public/data/deportes-acuaticos.json

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/data/deportes-acuaticos.json')
const TODOS = process.argv.includes('--todos')
const MINIMO = Number((process.argv.find(a => a.startsWith('--minimo=')) ?? '').split('=')[1] ?? '4') || 4

let KEY = process.env.GOOGLE_PLACES_API_KEY
if (!KEY) {
  try { KEY = readFileSync(resolve(ROOT, '.env.local'), 'utf8').match(/^GOOGLE_PLACES_API_KEY=(.+)$/m)?.[1]?.trim() } catch {}
}
if (!KEY) { console.error('Falta GOOGLE_PLACES_API_KEY'); process.exit(1) }

const RADIO_M = 12000
const MIN_RESENAS = 5
const CONSULTAS = ['escuela de surf', 'alquiler de kayak y paddle surf']

// Qué ofrece cada negocio, según lo que él mismo pone en su nombre. No se
// deduce: un sitio que no dice «kite» no se etiqueta de kite.
const ETIQUETAS = [
  ['surf', /\bsurf(ing|camp|school)?\b/i],
  ['kayak', /kayak|piragu|canoa/i],
  ['sup', /paddle|sup\b|padel surf/i],
  ['kite', /kite/i],
  ['windsurf', /windsurf/i],
  ['wing', /wing ?(foil|surf)/i],
  ['vela', /\bvela\b|sailing/i],
]
// Lo que NO es un negocio de deportes acuáticos aunque Text Search lo cuele.
const ES_ACUATICO = /surf|kayak|piragu|canoa|paddle|sup\b|kite|wind|wing|vela|sailing|n[áa]utic|water ?sports|escuela/i

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const hav = (lat1, lon1, lat2, lon2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

// Mismo filtro que usa el sitio (lib/playas.ts): el dataset arrastra
// playas extranjeras, duplicadas y retiradas. Sin esto se colaba
// Albufeira, que es portuguesa, entre los municipios españoles.
const EXCLUIDAS = new Set([
  ...JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf8')),
  ...Object.keys(JSON.parse(readFileSync(resolve(ROOT, 'src/data/duplicados.json'), 'utf8'))),
  ...Object.keys(JSON.parse(readFileSync(resolve(ROOT, 'src/data/playas-retiradas.json'), 'utf8'))),
])

const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
  .filter(p => p?.slug && p.lat && p.lng && p.municipio && !EXCLUIDAS.has(p.slug))

const muni = new Map()
for (const p of playas) {
  const k = slugify(p.municipio)
  if (!muni.has(k)) muni.set(k, { nombre: p.municipio, playas: [], surf: false })
  const v = muni.get(k)
  v.playas.push(p)
  if (p.actividades?.surf) v.surf = true
}
const objetivo = [...muni.keys()].filter(k => TODOS ? muni.get(k).playas.length >= 2 : muni.get(k).surf).sort()
console.log(`municipios: ${objetivo.length} × ${CONSULTAS.length} consultas = ${objetivo.length * CONSULTAS.length} llamadas`)

const salida = {}
let i = 0, llamadas = 0, descartados = 0
for (const slug of objetivo) {
  i++
  const m = muni.get(slug)
  const lat = m.playas.reduce((a, p) => a + p.lat, 0) / m.playas.length
  const lng = m.playas.reduce((a, p) => a + p.lng, 0) / m.playas.length
  const vistos = new Map()

  for (const q of CONSULTAS) {
    try {
      const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://www.playas-espana.com/',
          'X-Goog-Api-Key': KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.location,places.websiteUri,places.nationalPhoneNumber',
        },
        body: JSON.stringify({
          textQuery: `${q} en ${m.nombre}`,
          maxResultCount: 10,
          locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: RADIO_M } },
        }),
      })
      llamadas++
      if (!r.ok) { console.warn(`  ✗ ${slug} [${q}]: HTTP ${r.status}`); continue }
      const d = await r.json()
      for (const p of d.places ?? []) {
        const n = p.displayName?.text
        if (!n || !p.location || vistos.has(p.id)) continue
        if (!ES_ACUATICO.test(n)) { descartados++; continue }
        if ((p.userRatingCount ?? 0) < MIN_RESENAS) { descartados++; continue }
        // Distancia a la PLAYA más cercana, no al centroide: con el
        // centroide, un municipio de costa larga pierde los negocios del
        // pueblo. Es el fallo que costó recosechar los centros de buceo.
        let cerca = null
        for (const pl of m.playas) {
          const dd = hav(p.location.latitude, p.location.longitude, pl.lat, pl.lng)
          if (!cerca || dd < cerca.m) cerca = { n: pl.nombre, slug: pl.slug, m: Math.round(dd) }
        }
        if (!cerca || cerca.m > RADIO_M) { descartados++; continue }
        const hace = ETIQUETAS.filter(([, re]) => re.test(n)).map(([t]) => t)
        vistos.set(p.id, {
          id: p.id, n,
          nota: p.rating ?? null,
          resenas: p.userRatingCount ?? 0,
          web: p.websiteUri ?? null,
          tel: p.nationalPhoneNumber ?? null,
          playa: cerca.n, playaSlug: cerca.slug, m: cerca.m,
          hace,
        })
      }
    } catch (e) { console.warn(`  ✗ ${slug} [${q}]: ${e.message}`) }
    await new Promise(r => setTimeout(r, 120))
  }

  const lista = [...vistos.values()]
    .sort((a, b) => (b.nota ?? 0) * Math.log10((b.resenas || 1) + 1) - (a.nota ?? 0) * Math.log10((a.resenas || 1) + 1))
  if (lista.length >= MINIMO) salida[slug] = { nombre: m.nombre, negocios: lista.slice(0, 10) }
  if (i % 20 === 0) console.log(`  ${i}/${objetivo.length} · publicables: ${Object.keys(salida).length}`)
}

const ord = Object.fromEntries(Object.keys(salida).sort().map(k => [k, salida[k]]))
writeFileSync(OUT, JSON.stringify(ord) + '\n')
const neg = Object.values(ord).flatMap(v => v.negocios)
const porEtq = {}
for (const n of neg) for (const t of n.hace) porEtq[t] = (porEtq[t] ?? 0) + 1
console.log(`\nllamadas: ${llamadas} · municipios publicables (≥${MINIMO}): ${Object.keys(ord).length} · negocios: ${neg.length} · descartados: ${descartados}`)
console.log('por actividad declarada:', porEtq)
console.log(`→ ${OUT}`)
