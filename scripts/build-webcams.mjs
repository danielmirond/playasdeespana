#!/usr/bin/env node
// scripts/build-webcams.mjs
//
// Construye el sidecar de webcams de PLAYA/COSTA de España para el hub /webcams.
// Recorre anclas repartidas por cada provincia costera, consulta Windy Webcams
// API v3 (nearby), filtra por categoría beach/coast, dedup por webcamId y mapea
// cada cam a la playa más cercana del dataset (para provincia, comunidad y
// enlace a ficha). Escribe src/data/webcams-espana.json.
//
// Uso: node scripts/build-webcams.mjs
// Requiere WINDY_API_KEY (lo lee de .env.local o del entorno).

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function loadKey() {
  if (process.env.WINDY_API_KEY) return process.env.WINDY_API_KEY
  try {
    const env = readFileSync(resolve(ROOT, '.env.local'), 'utf-8')
    const m = env.match(/^WINDY_API_KEY=(.+)$/m)
    return m ? m[1].trim() : ''
  } catch { return '' }
}
const KEY = loadKey()
if (!KEY) { console.error('Falta WINDY_API_KEY'); process.exit(1) }

const PROV_ES = new Set([
  'Almería','Cádiz','Granada','Huelva','Málaga','Asturias','Cantabria',
  'A Coruña','Lugo','Pontevedra','Bizkaia','Gipuzkoa','Barcelona','Girona',
  'Tarragona','Castellón','Valencia','Alicante','Murcia','Baleares',
  'Islas Baleares','Las Palmas','Santa Cruz de Tenerife','Ceuta','Melilla',
])
const CATS_PLAYA = new Set(['beach', 'coast'])
const RADIUS_KM = 20
const ANCLAS_POR_PROV = 12

const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf-8'))
const ex = new Set(JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf-8')))
const servibles = playas.filter(p => p?.slug && !ex.has(p.slug) && p.lat && p.lng)

function haversine(aLat, aLng, bLat, bLng) {
  const R = 6371000, toRad = d => d * Math.PI / 180
  const dLat = toRad(bLat - aLat), dLng = toRad(bLng - aLng)
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(aLat))*Math.cos(toRad(bLat))*Math.sin(dLng/2)**2
  return 2 * R * Math.asin(Math.sqrt(s))
}

// Anclas: por provincia, repartidas geográficamente (orden por lng, muestreo uniforme).
const porProv = new Map()
for (const p of servibles) {
  if (!PROV_ES.has(p.provincia)) continue
  const list = porProv.get(p.provincia) ?? []
  list.push(p)
  porProv.set(p.provincia, list)
}
const anclas = []
for (const [, list] of porProv) {
  list.sort((a, b) => a.lng - b.lng)
  const n = Math.min(ANCLAS_POR_PROV, list.length)
  for (let k = 0; k < n; k++) {
    anclas.push(list[Math.floor((k + 0.5) * list.length / n)])
  }
}
console.log(`Anclas: ${anclas.length} (${porProv.size} provincias)`)

const sleep = ms => new Promise(r => setTimeout(r, ms))
const byId = new Map()

for (let i = 0; i < anclas.length; i++) {
  const a = anclas[i]
  const url = `https://api.windy.com/webcams/api/v3/webcams?nearby=${a.lat},${a.lng},${RADIUS_KM}&include=images,player,location,categories&limit=50&lang=es`
  try {
    const res = await fetch(url, { headers: { 'x-windy-api-key': KEY } })
    if (res.ok) {
      const d = await res.json()
      for (const w of (d.webcams ?? [])) {
        if (w.status !== 'active' || !w.location) continue
        const cats = (w.categories ?? []).map(c => c.id)
        if (!cats.some(c => CATS_PLAYA.has(c))) continue
        const embed = w.player?.live ?? w.player?.day ?? null
        if (!embed) continue
        if (!byId.has(w.webcamId)) {
          byId.set(w.webcamId, {
            id: String(w.webcamId),
            title: w.title,
            lat: w.location.latitude,
            lon: w.location.longitude,
            thumb: w.images?.current?.preview ?? w.images?.current?.thumbnail ?? null,
            embedUrl: embed,
          })
        }
      }
    }
  } catch (e) {
    process.stdout.write('x')
  }
  if (i % 20 === 0) process.stdout.write(`\n[${i}/${anclas.length}] ${byId.size} cams `)
  await sleep(180)
}
console.log(`\nWebcams únicas de playa/costa: ${byId.size}`)

// Mapear cada webcam a la playa servible más cercana → provincia, comunidad, ficha.
const cams = [...byId.values()].map(w => {
  let best = null, bestD = Infinity
  for (const p of servibles) {
    const d = haversine(w.lat, w.lon, p.lat, p.lng)
    if (d < bestD) { bestD = d; best = p }
  }
  return {
    ...w,
    provincia: best?.provincia ?? 'España',
    comunidad: best?.comunidad ?? '',
    playaSlug: best?.slug ?? null,
    playaNombre: best?.nombre ?? null,
    municipio: best?.municipio ?? null,
    distM: Math.round(bestD),
  }
})
// Descarta webcams cuya playa más cercana esté a >8 km (probablemente interior/puerto sin playa cerca).
const limpias = cams.filter(c => c.distM <= 8000)
limpias.sort((a, b) => (a.comunidad || '').localeCompare(b.comunidad) || (a.provincia || '').localeCompare(b.provincia) || (a.title || '').localeCompare(b.title))

const out = resolve(ROOT, 'src/data/webcams-espana.json')
writeFileSync(out, JSON.stringify(limpias, null, 2) + '\n')
console.log(`Escritas ${limpias.length} webcams a ${out} (descartadas ${cams.length - limpias.length} lejos de playa)`)

const porC = {}
for (const c of limpias) porC[c.comunidad] = (porC[c.comunidad] || 0) + 1
console.log('Por comunidad:', Object.entries(porC).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}:${v}`).join(' · '))
