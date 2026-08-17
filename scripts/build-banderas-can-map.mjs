#!/usr/bin/env node
// scripts/build-banderas-can-map.mjs — Mapeo offline id de playa del sistema
// de socorrismo del Gobierno de Canarias (DGSE) → slug de nuestra playa, más
// el sidecar de playas de USO PROHIBIDO. Se ejecuta UNA vez (o cuando cambie
// el catálogo); el runtime solo hace lookups contra los sidecars.
//
// Fuente: https://www3.gobiernodecanarias.org/aplicaciones/infoplayas/socorrismo/api
//   /beach  → catálogo de 763 playas con coords, municipio, isla, socorrismo
//             y `clasificacion` (Libre / Peligrosa / Uso Prohibido)
//   /flags  → bandera en vivo, join por beach_location_id → beach.id
// Sin clave, CORS abierto. No es un dataset publicado sino la API interna de
// su visor público: sin licencia declarada, así que se atribuye siempre.
//
// Matching por distancia, umbral 350 m. Deliberadamente NO se casa por nombre:
// medido en este mismo dataset, «El Pozo» casa por nombre con playa-del-pozo,
// pero por coordenadas es playa-la-hornilla, a 9 m. El nombre habría puesto el
// aviso en la playa equivocada Y se lo habría quitado a la correcta. Con 550
// fichas de nombre repetido en el catálogo, no es un riesgo teórico.
//
// Uso: node scripts/build-banderas-can-map.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_MAP   = resolve(ROOT, 'src/data/banderas-can-map.json')
const OUT_PROHI = resolve(ROOT, 'src/data/playas-prohibidas.json')
const API = 'https://www3.gobiernodecanarias.org/aplicaciones/infoplayas/socorrismo/api'
const MAX_DIST_M = 350
// Solo ASCII: las cabeceras HTTP son ByteString y un guion largo revienta fetch.
const UA = 'playas-espana.com (+https://playas-espana.com) mapeo offline'

const hav = (lat1, lon1, lat2, lon2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

async function main() {
  const res = await fetch(`${API}/beach`, { headers: { 'User-Agent': UA } })
  if (!res.ok) { console.error(`✗ /beach devolvió HTTP ${res.status}`); process.exit(1) }
  const { data } = await res.json()

  const can = []
  for (const b of data ?? []) {
    const la = parseFloat(b.latitude), lo = parseFloat(b.longitude)
    if (!Number.isFinite(la) || !Number.isFinite(lo)) continue
    can.push({ id: b.id, nombre: b.name, la, lo,
      municipio: b.municipality_entity?.name ?? '', isla: b.municipality_entity?.island ?? '',
      clasificacion: b.clasificacion ?? '' })
  }

  // Solo se compara contra fichas canarias vivas: cruzar todo el catálogo
  // nacional invita a que una coincidencia peninsular gane por casualidad.
  const excluidas = new Set([
    ...JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf8')),
    ...Object.keys(JSON.parse(readFileSync(resolve(ROOT, 'src/data/duplicados.json'), 'utf8'))),
  ])
  const PROV_CAN = new Set(['Las Palmas', 'Santa Cruz de Tenerife'])
  const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
    .filter(p => p?.slug && p.lat && p.lng && PROV_CAN.has(p.provincia) && !excluidas.has(p.slug))
  console.log(`dataset DGSE: ${can.length} playas · catálogo: ${playas.length} fichas canarias`)

  // slug → id[] DGSE. Es una LISTA a propósito, no un id suelto: Las Canteras
  // viene troceada en 7 sectores con bandera independiente (verificado: los
  // sectores 1-4 en verde y 5-7 en amarilla el mismo día) y nosotros tenemos
  // una sola ficha. Si nos quedáramos con el sector más cercano, un sector en
  // roja quedaría tapado por un vecino en verde. El runtime se queda con la
  // PEOR de las banderas del grupo.
  const map = {}
  const audit = []
  for (const c of can) {
    let best = null, bestD = Infinity
    for (const p of playas) {
      const d = hav(c.la, c.lo, p.lat, p.lng)
      if (d < bestD) { bestD = d; best = p }
    }
    if (!best || bestD > MAX_DIST_M) continue
    ;(map[best.slug] ??= []).push(c.id)
    audit.push({ slug: best.slug, id: c.id, d: Math.round(bestD),
      suya: c.nombre, nuestra: best.nombre, clasificacion: c.clasificacion })
  }

  writeFileSync(OUT_MAP, JSON.stringify(map, null, 1) + '\n')
  const total = Object.values(map).reduce((n, a) => n + a.length, 0)
  console.log(`mapeadas: ${total}/${can.length} playas DGSE → ${Object.keys(map).length} fichas nuestras`)
  const agrupadas = Object.entries(map).filter(([, a]) => a.length > 1)
  if (agrupadas.length) {
    console.log(`\n${agrupadas.length} fichas agrupan varios tramos (manda la peor bandera):`)
    for (const [slug, ids] of agrupadas.sort((a, b) => b[1].length - a[1].length).slice(0, 8)) {
      console.log(`  ${String(ids.length).padStart(2)} tramos · ${slug}`)
    }
  }

  // ── Sidecar de uso prohibido ─────────────────────────────────────────
  // No es tiempo real: es la clasificación permanente del catálogo oficial.
  // Publicamos fichas de estas playas sin decir que el baño está prohibido.
  // Si una ficha agrupa varios tramos y UNO solo está prohibido, la ficha
  // queda marcada. Es la asimetría de seguridad: en la duda, avisar de más.
  const prohibidas = {}
  for (const a of audit) {
    if (a.clasificacion !== 'Uso Prohibido') continue
    prohibidas[a.slug] = { nombre: a.suya, municipio: can.find(c => c.id === a.id)?.municipio ?? '' }
  }
  writeFileSync(OUT_PROHI, JSON.stringify(prohibidas, null, 1) + '\n')
  console.log(`uso prohibido: ${Object.keys(prohibidas).length} fichas → ${OUT_PROHI}`)

  // Auditoría a ojo: las 12 más lejanas dentro del umbral son donde vive el error.
  audit.sort((a, b) => b.d - a.d)
  console.log('\nlas 12 más lejanas (revisar a ojo antes de subir):')
  for (const a of audit.slice(0, 12)) {
    console.log(` ${String(a.d).padStart(4)}m · ${a.suya.slice(0, 30).padEnd(32)} → ${a.nuestra.slice(0, 26).padEnd(28)} [${a.slug}]`)
  }
}

main()
