#!/usr/bin/env node
// scripts/build-buceo-places.mjs — centros de buceo por municipio desde
// Google Places (Text Search, SKU Pro).
//
// POR QUÉ, teniendo ya OSM. OpenStreetMap tiene 87 tiendas de buceo en
// TODA España y mezcladas con puntos de inmersión; medido. Google
// devuelve 8 solo en Tarifa y 10 en Adeje, con nota y número de reseñas.
// Para una sección que la gente usa para elegir dónde reservar, la
// diferencia es la sección entera.
//
// COSTE. Una llamada por municipio con página de buceo: 401. El tramo
// gratuito del SKU Pro son 5.000 al mes, así que 0 €. Se cosecha UNA vez
// y queda en el sidecar; el runtime no llama a Google.
//
// LO QUE NO SE INVENTA. La titulación PADI solo se marca cuando el
// propio nombre del centro la declara («PADI 5* Dive Center»). Google no
// publica un campo de certificación y deducirla sería ponerle un sello a
// un negocio que no lo ha dicho.
//
// Uso: node scripts/build-buceo-places.mjs [--limite=N]
// Salida: public/data/buceo-places.json

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/data/buceo-places.json')
const LIMITE = Number((process.argv.find(a => a.startsWith('--limite=')) ?? '').split('=')[1] ?? '0') || 0

let KEY = process.env.GOOGLE_PLACES_API_KEY
if (!KEY) {
  try { KEY = readFileSync(resolve(ROOT, '.env.local'), 'utf8').match(/^GOOGLE_PLACES_API_KEY=(.+)$/m)?.[1]?.trim() } catch {}
}
if (!KEY) { console.error('Falta GOOGLE_PLACES_API_KEY'); process.exit(1) }

const RADIO_M = 12000
const MIN_RESENAS = 5      // fuera fichas fantasma
// Text Search devuelve de todo: escuelas náuticas, tiendas de deporte y
// algún hotel. Se exige que el nombre diga a qué se dedica.
const ES_BUCEO = /buceo|diving|dive|divers|scuba|sub\b|submarin|mergullo|immersi|snorkel|apnea|padi|ssi\b/i

const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const hav = (lat1, lon1, lat2, lon2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

const vida = JSON.parse(readFileSync(resolve(ROOT, 'public/data/vida-marina.json'), 'utf8'))
const praiasPt = new Set(JSON.parse(readFileSync(resolve(ROOT, 'public/data/praias-portugal.json'), 'utf8')).map(p => p.slug))
const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
  .filter(p => p?.slug && p.lat && p.lng && p.municipio && !praiasPt.has(p.slug))

// Centro del litoral de cada municipio y sus playas, para dar contexto.
const muni = new Map()
for (const p of playas) {
  const k = slugify(p.municipio)
  if (!muni.has(k)) muni.set(k, { nombre: p.municipio, playas: [], lat: 0, lng: 0 })
  const v = muni.get(k); v.playas.push(p); v.lat += p.lat; v.lng += p.lng
}
for (const v of muni.values()) { v.lat /= v.playas.length; v.lng /= v.playas.length }

// Solo donde hay página de buceo: una llamada por página, ni una de más.
let objetivo = Object.keys(vida).filter(s => muni.has(s))
if (LIMITE) objetivo = objetivo.slice(0, LIMITE)
console.log(`municipios a consultar: ${objetivo.length} (1 llamada cada uno)`)

const salida = {}
let i = 0, llamadas = 0, centros = 0, descartados = 0
for (const slug of objetivo) {
  i++
  const m = muni.get(slug)
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
        textQuery: `centro de buceo en ${m.nombre}`,
        maxResultCount: 10,
        locationBias: { circle: { center: { latitude: m.lat, longitude: m.lng }, radius: RADIO_M } },
      }),
    })
    llamadas++
    if (!r.ok) { console.warn(`  ✗ ${slug}: HTTP ${r.status}`); continue }
    const d = await r.json()
    const lista = []
    for (const p of d.places ?? []) {
      const n = p.displayName?.text
      if (!n || !p.location) continue
      if (!ES_BUCEO.test(n)) { descartados++; continue }
      if ((p.userRatingCount ?? 0) < MIN_RESENAS) { descartados++; continue }
      // Distancia a la PLAYA más cercana del municipio, no al centroide.
      //
      // Con el centroide, Tarifa se quedaba en 1 centro de los 8 que hay:
      // su costa es larguísima y el punto medio cae lejos del pueblo,
      // donde están las escuelas. Lo que importa es si el centro está
      // cerca de alguna playa del municipio, no del promedio de todas.
      let cerca = null
      for (const pl of m.playas) {
        const dd = hav(p.location.latitude, p.location.longitude, pl.lat, pl.lng)
        if (!cerca || dd < cerca.m) cerca = { n: pl.nombre, m: Math.round(dd) }
      }
      if (!cerca || cerca.m > RADIO_M) { descartados++; continue }
      lista.push({
        id: p.id, n,
        nota: p.rating ?? null,
        resenas: p.userRatingCount ?? 0,
        web: p.websiteUri ?? null,
        tel: p.nationalPhoneNumber ?? null,
        la: +p.location.latitude.toFixed(5), lo: +p.location.longitude.toFixed(5),
        playa: cerca?.n ?? null, m: cerca?.m ?? null,
        // Solo si el propio centro lo dice en su nombre.
        padi: /padi/i.test(n),
      })
    }
    if (lista.length) {
      lista.sort((a, b) => (b.nota ?? 0) * Math.log10((b.resenas || 1) + 1) - (a.nota ?? 0) * Math.log10((a.resenas || 1) + 1))
      salida[slug] = lista.slice(0, 8)
      centros += salida[slug].length
    }
  } catch (e) { console.warn(`  ✗ ${slug}: ${e.message}`) }
  if (i % 50 === 0) console.log(`  ${i}/${objetivo.length} · municipios con centros: ${Object.keys(salida).length}`)
  await new Promise(r => setTimeout(r, 120))
}

const ord = Object.fromEntries(Object.keys(salida).sort().map(k => [k, salida[k]]))
writeFileSync(OUT, JSON.stringify(ord) + '\n')
console.log(`\nllamadas: ${llamadas} · municipios con centros: ${Object.keys(ord).length} · centros: ${centros} · descartados por nombre, reseñas o distancia: ${descartados}`)
console.log(`→ ${OUT}`)
