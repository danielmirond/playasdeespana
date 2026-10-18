#!/usr/bin/env node
// scripts/build-calidad-eea.mjs — Clasificación oficial de aguas de baño
// (Directiva 2006/7/CE) por playa, desde el dataset de la Agencia Europea
// de Medio Ambiente. Cubre toda la UE, así que resuelve España y Portugal
// con la misma pasada.
//
// Sustituye a public/data/calidad-agua.json, que tenía 20 entradas con
// claves que no eran los slugs del sitio: de las 5.098 playas casaba UNA.
// Las demás fichas enseñaban el valor por defecto del componente
// («Excelente · 99 % · 2024») rotulado como dato de la EEA.
//
// Pipeline previo (manual, ~3 min; el .xlsx pesa 43 MB y no se versiona):
//   curl -L -o bw.zip https://sdi.eea.europa.eu/datashare/s/mBEEM7LmkgwEFKR/download
//   unzip bw.zip
//   python3 -I -c "
//   import openpyxl, json
//   ws = openpyxl.load_workbook('…/bw_assessment_eea_datahub_1990_2025.xlsx',
//                               read_only=True)['bw_assessment_datahub_1990_2025']
//   mejor = {}
//   for r in ws.iter_rows(min_row=2, values_only=True):
//       if r[0] not in ('ES','PT') or r[6] is None or r[9] is None: continue
//       p = mejor.get(r[1])
//       if p is None or r[9] > p['season']:
//           mejor[r[1]] = {'cc': r[0], 'name': r[3], 'lon': float(r[6]),
//                          'lat': float(r[7]), 'season': int(r[9]), 'quality': r[10]}
//   json.dump(mejor, open('bw-es-pt.json','w'), ensure_ascii=False)"
//
// Uso: node scripts/build-calidad-eea.mjs <bw-es-pt.json>
// Salida: public/data/calidad-eea.json  { slug: { nivel, temporada, punto, bwid, distancia_m } }
//
// CRITERIO DE CRUCE, y por qué es estricto:
// la cercanía sola NO sirve. Las playas son largas y las vecinas caen a
// menos de 100 m: medido, 1.123 playas tienen un punto de baño a <100 m,
// y «Casablanca» tiene el de «Nagüeles» a 108 m. Atribuirle esa
// clasificación sería inventarla con un dato oficial de otra playa.
// Por eso se exige ADEMÁS que el nombre case, y se acepta el punto más
// cercano que lo cumpla dentro de 1.500 m. Lo que no casa se queda sin
// clasificación: la ficha entonces no dibuja la tarjeta, que es el
// resultado correcto.

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const IN = process.argv[2]
if (!IN) { console.error('Uso: node scripts/build-calidad-eea.mjs <bw-es-pt.json>'); process.exit(1) }
const OUT = resolve(ROOT, 'public/data/calidad-eea.json')
const RADIO_M = 1500

// "1 - Excellent" → "Excelente". El componente ya conoce estos cuatro
// niveles y sus colores; «Not classified» se descarta, no se traduce a
// nada, porque significa justamente que no hay clasificación.
const NIVELES = {
  '1 - Excellent': 'Excelente',
  '2 - Good': 'Buena',
  '3 - Sufficient': 'Suficiente',
  '3 - Good or Sufficient': 'Suficiente',
  '4 - Poor': 'Deficiente',
}

const hav = (lat1, lon1, lat2, lon2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

// Palabras que no distinguen una playa de otra, en los cuatro idiomas que
// aparecen en los nombres oficiales (castellano, portugués, catalán y las
// formas con artículo salado de Baleares).
const STOP = new Set(['playa', 'praia', 'platja', 'plaia', 'cala', 'el', 'la', 'los', 'las',
  'de', 'del', 'dels', 'd', 'l', 'es', 'sa', 's', 'do', 'da', 'dos', 'das', 'i', 'y', 'e'])
const palabras = (s) => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9ñ ]+/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w))

// Casan si comparten al menos el 60 % de las palabras significativas del
// más corto. El umbral sale de revisar los pares: deja pasar «Playa de la
// Torre Derribada» ↔ «PLAYA TORRE DERRIBADA PM1» (los códigos PM1/PM2 son
// del punto de muestreo) y corta «Casablanca» ↔ «Nagüeles».
const casa = (a, b) => {
  const A = new Set(palabras(a)), B = new Set(palabras(b))
  if (!A.size || !B.size) return false
  let c = 0
  for (const w of A) if (B.has(w)) c++
  return c > 0 && c >= Math.min(A.size, B.size) * 0.6
}

function cruzar(playas, puntos, grid, etiqueta) {
  const out = {}
  let sinPunto = 0, sinNombre = 0, sinNivel = 0
  for (const p of playas) {
    const cl = Math.floor(p.lat / 0.05), co = Math.floor(p.lng / 0.05)
    const cands = []
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      for (const c of grid.get(`${cl + dy}:${co + dx}`) ?? []) {
        const d = hav(p.lat, p.lng, c.lat, c.lon)
        if (d <= RADIO_M) cands.push({ ...c, d })
      }
    }
    if (!cands.length) { sinPunto++; continue }
    cands.sort((a, b) => a.d - b.d)
    const m = cands.find(c => casa(p.nombre, c.name))
    if (!m) { sinNombre++; continue }
    const nivel = NIVELES[m.quality]
    if (!nivel) { sinNivel++; continue }
    out[p.slug] = {
      nivel,
      temporada: m.season,
      punto: m.name,
      bwid: m.bwid,
      distancia_m: Math.round(m.d),
    }
  }
  console.log(`${etiqueta}: ${Object.keys(out).length} con clasificación · ` +
    `${sinNombre} sin coincidencia de nombre · ${sinPunto} sin punto a ${RADIO_M} m · ` +
    `${sinNivel} con punto pero sin clasificar`)
  return out
}

const crudo = JSON.parse(readFileSync(IN, 'utf8'))
const puntos = Object.entries(crudo).map(([bwid, v]) => ({ bwid, ...v }))
const grid = new Map()
for (const c of puntos) {
  const k = `${Math.floor(c.lat / 0.05)}:${Math.floor(c.lon / 0.05)}`
  ;(grid.get(k) ?? grid.set(k, []).get(k)).push(c)
}
console.log(`puntos de baño: ${puntos.length} (ES ${puntos.filter(p => p.cc === 'ES').length} · PT ${puntos.filter(p => p.cc === 'PT').length})`)

const es = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
  .filter(p => p?.slug && p.lat && p.lng)
const pt = JSON.parse(readFileSync(resolve(ROOT, 'public/data/praias-portugal.json'), 'utf8'))
  .filter(p => p?.slug && p.lat && p.lng)

const mapa = { ...cruzar(es, puntos, grid, 'España'), ...cruzar(pt, puntos, grid, 'Portugal') }
const ordenado = Object.fromEntries(Object.keys(mapa).sort().map(k => [k, mapa[k]]))
writeFileSync(OUT, JSON.stringify(ordenado) + '\n')
console.log(`→ ${OUT} (${Object.keys(ordenado).length} playas, ${(JSON.stringify(ordenado).length / 1024).toFixed(0)} KB)`)
