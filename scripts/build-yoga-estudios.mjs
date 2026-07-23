#!/usr/bin/env node
// scripts/build-yoga-estudios.mjs
//
// Construye el sidecar de estudios REALES de yoga y pilates cerca de la costa
// (Google Places Text Search) para la vertical /yoga-playa. Reemplaza a la
// antigua plantilla sin datos que la auditoría retiró con 410: esta versión
// solo publica provincias con ≥3 estudios reales (gate de calidad).
//
// Por provincia costera: hasta 3 puntos de muestreo repartidos por su costa
// (centroides de playas del dataset) × Text Search 15 km → dedupe por
// place_id → filtro de calidad (rating y reseñas mínimas) → playa más
// cercana del dataset para dar contexto e interlink.
//
// Coste: ~75 llamadas one-off (25 provincias × 3 puntos), SKU Pro.
// Uso:  node scripts/build-yoga-estudios.mjs      (necesita GOOGLE_PLACES_API_KEY
//       en el entorno o en .env.local)

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/yoga-estudios.json')

// Key desde env o .env.local
let KEY = process.env.GOOGLE_PLACES_API_KEY
if (!KEY) {
  try {
    const env = readFileSync(resolve(ROOT, '.env.local'), 'utf8')
    KEY = env.match(/^GOOGLE_PLACES_API_KEY=(.+)$/m)?.[1]?.trim()
  } catch { /* sin .env.local */ }
}
if (!KEY) { console.error('Falta GOOGLE_PLACES_API_KEY'); process.exit(1) }

const MIN_ESTUDIOS = 3     // gate de calidad por provincia
const MIN_RESENAS = 5      // fuera fichas fantasma
const RADIUS_M = 15000
const PUNTOS_POR_PROV = 3

// Solo provincias costeras REALES: el dataset arrastra "playas" fluviales
// de interior (Cuenca, León, Madrid…) que no pintan nada en un site de
// playas de mar. 'Islas Baleares' se fusiona con 'Baleares' (el dataset
// tiene ambas etiquetas).
const COSTERAS = new Set(['A Coruña', 'Lugo', 'Pontevedra', 'Asturias', 'Cantabria', 'Bizkaia', 'Gipuzkoa', 'Girona', 'Barcelona', 'Tarragona', 'Castellón', 'Valencia', 'Alicante', 'Murcia', 'Almería', 'Granada', 'Málaga', 'Cádiz', 'Huelva', 'Baleares', 'Las Palmas', 'Santa Cruz de Tenerife', 'Ceuta', 'Melilla'])

const hav = (a, b) => {
  const R = 6371, r = d => d * Math.PI / 180
  const dl = r(b.lat - a.lat), dn = r(b.lng - a.lng)
  const x = Math.sin(dl / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dn / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

async function searchText(lat, lng) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://www.playas-espana.com/',
      'X-Goog-Api-Key': KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.location,places.primaryType',
    },
    body: JSON.stringify({
      textQuery: 'estudio de yoga o pilates',
      maxResultCount: 10,
      locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: RADIUS_M } },
    }),
  })
  if (!res.ok) { console.warn('  HTTP', res.status); return [] }
  const data = await res.json()
  return data.places ?? []
}

async function main() {
  const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
    .filter(p => p?.slug && p.lat && p.lng)

  // Agrupar playas por provincia y elegir puntos de muestreo repartidos
  const porProv = new Map()
  for (const p of playas) {
    if (!p.provincia) continue
    const prov = p.provincia === 'Islas Baleares' ? 'Baleares' : p.provincia
    if (!COSTERAS.has(prov)) continue
    ;(porProv.get(prov) ?? porProv.set(prov, []).get(prov)).push(p)
  }

  const out = {}
  let llamadas = 0
  for (const [provincia, lista] of [...porProv.entries()].sort()) {
    if (lista.length < 5) continue // provincias sin costa real en el dataset
    // puntos repartidos: primera, media y última playa por longitud del litoral
    const ordenadas = [...lista].sort((a, b) => a.lat - b.lat || a.lng - b.lng)
    const puntos = [
      ordenadas[0],
      ordenadas[Math.floor(ordenadas.length / 2)],
      ordenadas[ordenadas.length - 1],
    ].slice(0, PUNTOS_POR_PROV)

    const vistos = new Map()
    for (const pt of puntos) {
      const places = await searchText(pt.lat, pt.lng)
      llamadas++
      for (const pl of places) {
        if (!pl.id || !pl.displayName?.text) continue
        if ((pl.userRatingCount ?? 0) < MIN_RESENAS) continue
        if (!vistos.has(pl.id)) {
          vistos.set(pl.id, {
            googleId: pl.id,
            nombre: pl.displayName.text,
            rating: Math.round((pl.rating ?? 0) * 10) / 10,
            reseñas: pl.userRatingCount ?? 0,
            tipo: pl.primaryType === 'pilates_studio' ? 'Pilates' : pl.primaryType === 'yoga_studio' ? 'Yoga' : 'Yoga / Pilates',
            lat: pl.location?.latitude, lng: pl.location?.longitude,
          })
        }
      }
      await new Promise(r => setTimeout(r, 250))
    }

    // playa más cercana del dataset para cada estudio (contexto + interlink)
    const estudios = [...vistos.values()].map(e => {
      let best = null
      for (const p of lista) {
        const km = hav({ lat: e.lat, lng: e.lng }, p)
        if (!best || km < best.km) best = { p, km }
      }
      return {
        ...e,
        playaCercana: best && best.km < 8
          ? { slug: best.p.slug, nombre: best.p.nombre, distM: Math.round(best.km * 1000) }
          : null,
      }
    }).sort((a, b) => b.reseñas - a.reseñas)

    if (estudios.length >= MIN_ESTUDIOS) {
      const comunidad = lista[0].comunidad
      out[slugify(provincia)] = { provincia, comunidad, estudios }
      console.log(`✓ ${provincia.padEnd(24)} ${estudios.length} estudios`)
    } else {
      console.log(`✗ ${provincia.padEnd(24)} ${estudios.length} (< ${MIN_ESTUDIOS}, no se publica)`)
    }
  }

  writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
  console.log(`\n${Object.keys(out).length} provincias publicables · ${llamadas} llamadas Places`)
}

main()
