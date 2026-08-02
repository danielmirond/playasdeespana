#!/usr/bin/env node
// scripts/harvest-rutas.mjs — tiempos REALES de coche desde las ciudades de
// interior a las playas que les enseñamos, a sidecar permanente.
//
// QUÉ SUSTITUYE
// La página /playas-cerca-de/[ciudad] calcula hoy el tiempo como distancia
// en línea recta × 1,25 a 100 km/h. Es honesta —lo declara— pero es una
// regla de tres. Madrid → El Saler: la estimación da 4 h 30; la carretera
// real son 4 h 08 y 362 km. La diferencia no es el error, es que una cifra
// medida se puede subrayar como medida.
//
// POR QUÉ OSRM Y NO GOOGLE ROUTES
// No es el precio: es que con OSRM no existe la posibilidad de una factura.
// Después del cargo de 231 € de Places, esa propiedad vale más que la
// precisión extra del tráfico en tiempo real — que además aquí no sirve,
// porque el dato se congela en un sidecar. Y encaja con la casa, que ya va
// sobre OSM en Overpass, el sidecar de Geofabrik y CartoCiudad.
//
// COSTE Y VOLUMEN
// El endpoint /table devuelve una matriz entera en una petición: las N
// playas de una ciudad en una sola llamada. 18 ciudades = 18 llamadas.
// Servidor público de demostración, así que se va despacio a propósito.
//
// LO QUE NO DA
// Tiempos sin tráfico, en flujo libre. Para "¿salgo ya?" no vale; para
// "¿a cuánto me queda esta playa?" es exactamente lo que hace falta.
//
// Uso: node scripts/harvest-rutas.mjs [--playas=40]

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT  = resolve(ROOT, 'src/data/rutas-coche.json')

const arg = (n, d) => { const v = process.argv.find(a => a.startsWith(`--${n}=`)); return v ? v.slice(n.length + 3) : d }
// Un superconjunto de las 8 que la página pinta: si mañana muestra más, o
// cambia el orden al ordenar por tiempo real, el sidecar ya lo cubre.
const N_PLAYAS = Number(arg('playas', 40))
const PAUSA_MS = 1500          // cortesía con el servidor público
const OSRM = 'https://router.project-osrm.org/table/v1/driving'

// ── Ciudades: se leen del .ts para no duplicar la tabla ─────────────────
const src = readFileSync(resolve(ROOT, 'src/data/ciudades-interior.ts'), 'utf8')
const CIUDADES = [...src.matchAll(/slug:\s*'([^']+)',\s*ciudad:\s*'([^']+)',\s*lat:\s*([-\d.]+),\s*lng:\s*([-\d.]+)/g)]
  .map(m => ({ slug: m[1], ciudad: m[2], lat: Number(m[3]), lng: Number(m[4]) }))

if (!CIUDADES.length) {
  console.error('No se han podido leer las ciudades de src/data/ciudades-interior.ts')
  process.exit(1)
}

// ── Playas candidatas: las mismas que getPlayasCercaDe considera ────────
const EXCLUIDAS = new Set([
  ...JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf8')),
  ...Object.keys(JSON.parse(readFileSync(resolve(ROOT, 'src/data/duplicados.json'), 'utf8'))),
])
const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
  .filter(p => p?.slug && p.parking && typeof p.lat === 'number' && typeof p.lng === 'number' && !EXCLUIDAS.has(p.slug))

const hav = (a, b, c, d) => {
  const R = 6371, r = x => x * Math.PI / 180
  const dl = r(c - a), dn = r(d - b)
  const x = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dn / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

const espera = ms => new Promise(r => setTimeout(r, ms))

console.log(`${CIUDADES.length} ciudades × ${N_PLAYAS} playas · ${CIUDADES.length} llamadas a OSRM\n`)

const out = {}
let fallos = 0

for (const c of CIUDADES) {
  const cand = playas
    .map(p => ({ p, km: hav(c.lat, c.lng, p.lat, p.lng) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, N_PLAYAS)

  // OSRM quiere lon,lat. El origen va primero y se marca como única fuente.
  const coords = [`${c.lng},${c.lat}`, ...cand.map(x => `${x.p.lng},${x.p.lat}`)].join(';')
  const url = `${OSRM}/${coords}?sources=0&annotations=duration,distance`

  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'playas-espana.com harvest (contacto: daniel.mirond@gmail.com)' } })
    if (!res.ok) { console.log(`  ✗ ${c.ciudad}: HTTP ${res.status}`); fallos++; await espera(PAUSA_MS); continue }
    const d = await res.json()
    if (d.code !== 'Ok') { console.log(`  ✗ ${c.ciudad}: ${d.code}`); fallos++; await espera(PAUSA_MS); continue }

    const dur = d.durations?.[0] ?? []
    const dis = d.distances?.[0] ?? []
    const fila = {}
    cand.forEach((x, i) => {
      const s = dur[i + 1], m = dis[i + 1]      // el índice 0 es el origen
      if (s == null || m == null) return        // sin ruta: se omite, no se inventa
      fila[x.p.slug] = { min: Math.round(s / 60), km: Math.round(m / 1000) }
    })
    out[c.slug] = fila
    const n = Object.keys(fila).length
    const ej = cand[0]
    console.log(`  ✓ ${c.ciudad.padEnd(14)} ${n} rutas · la más cercana: ${ej.p.nombre} → ${fila[ej.p.slug]?.min ?? '?'} min`)
  } catch (e) {
    console.log(`  ✗ ${c.ciudad}: ${e.message}`)
    fallos++
  }
  await espera(PAUSA_MS)
}

writeFileSync(OUT, JSON.stringify(out) + '\n')

const total = Object.values(out).reduce((a, f) => a + Object.keys(f).length, 0)
console.log(`\nCiudades con datos ${Object.keys(out).length}/${CIUDADES.length}`)
console.log(`Rutas guardadas    ${total}`)
if (fallos) console.log(`Fallos             ${fallos} (reejecuta: el servidor público a veces limita)`)
console.log(`Sidecar            src/data/rutas-coche.json`)
