#!/usr/bin/env node
// scripts/build-servicios-osm.mjs — lo que hay mapeado junto a la arena.
//
// QUÉ NO ES ESTO. No rellena los campos del inventario oficial. Medido
// contra las 3.500 playas donde sí tenemos ficha del Ministerio, OSM acierta
// el 78 % cuando dice que hay duchas y solo encuentra el 29 % de las que
// existen. Con esa precisión, escribir «tiene duchas» sería equivocarse una
// de cada cuatro veces en el dato por el que alguien decide si va con niños
// o en silla de ruedas.
//
// QUÉ ES. Una lista de objetos mapeados con su distancia, igual que los
// campings o los aparcamientos. «A 120 m hay unos aseos» es verdad al cien
// por cien: habla de lo que hay anotado en el mapa, no de lo que tiene la
// playa. Y donde no hay nada anotado, no dice nada.
//
// Datos: Overpass, una vez (bbox de España):
//   nwr[amenity=toilets]; nwr[amenity=shower]; nwr[amenity=drinking_water];
//   nwr[emergency=lifeguard_tower]; nwr[emergency=lifeguard];
//   nwr[amenity=lifeguard];  → out center tags;
//
//   node scripts/build-servicios-osm.mjs /tmp/serv.json
//
// Salida: public/data/servicios-osm.json
//   { pool: [{t, n?, pmr?, f?, la, lo}], playas: { "lat:lng": [[idx, metros]…] } }
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const IN = process.argv[2]
if (!IN) { console.error('Uso: node scripts/build-servicios-osm.mjs <serv.json>'); process.exit(1) }
const OUT = resolve(ROOT, 'public/data/servicios-osm.json')

// 300 m: lo que se anda descalzo desde la toalla. Más lejos ya no es un
// servicio de la playa, es un servicio del pueblo.
const RADIO_M = 300
const POR_PLAYA = 6

const hav = (la1, lo1, la2, lo2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLa = r(la2 - la1), dLo = r(lo2 - lo1)
  const x = Math.sin(dLa / 2) ** 2 + Math.cos(r(la1)) * Math.cos(r(la2)) * Math.sin(dLo / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

function clasifica(t) {
  if (t.amenity === 'toilets') return 'aseos'
  if (t.amenity === 'shower') return 'duchas'
  if (t.amenity === 'drinking_water') return 'agua'
  if (t.emergency === 'lifeguard_tower' || t.emergency === 'lifeguard' || t.amenity === 'lifeguard') return 'socorrista'
  return null
}

const datos = JSON.parse(readFileSync(IN, 'utf8'))
const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
  .filter(p => p.lat && p.lng)

const CELDA = 0.004
const rejilla = new Map()
for (const p of playas) {
  const k = `${Math.round(p.lat / CELDA)}:${Math.round(p.lng / CELDA)}`
  if (!rejilla.has(k)) rejilla.set(k, [])
  rejilla.get(k).push(p)
}

const pool = []
const porPlaya = new Map()
let leidos = 0, enZona = 0

for (const e of datos.elements ?? []) {
  leidos++
  const t = e.tags ?? {}
  const tipo = clasifica(t)
  if (!tipo) continue
  if (t.access === 'private' || t.access === 'no') continue
  const la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon
  if (!la || !lo) continue

  let idx = -1
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    const k = `${Math.round(la / CELDA) + dx}:${Math.round(lo / CELDA) + dy}`
    for (const p of rejilla.get(k) ?? []) {
      const d = hav(la, lo, p.lat, p.lng)
      if (d > RADIO_M) continue
      if (idx === -1) {
        idx = pool.push({
          t: tipo,
          ...(t.name ? { n: t.name } : {}),
          ...(t.wheelchair === 'yes' ? { pmr: 1 } : {}),
          ...(t.fee === 'yes' ? { f: 1 } : t.fee === 'no' ? { f: 0 } : {}),
          la: +la.toFixed(5), lo: +lo.toFixed(5),
        }) - 1
        enZona++
      }
      const clave = `${p.lat.toFixed(4)}:${p.lng.toFixed(4)}`
      if (!porPlaya.has(clave)) porPlaya.set(clave, [])
      porPlaya.get(clave).push([idx, Math.round(d)])
    }
  }
}

const playasOut = Object.fromEntries([...porPlaya]
  .map(([k, v]) => {
    // Uno de cada tipo, el más cercano: seis fuentes de agua seguidas no
    // informan de nada.
    const vistos = new Set()
    const unicos = v.sort((a, b) => a[1] - b[1]).filter(([i]) => {
      const t = pool[i].t
      if (vistos.has(t)) return false
      vistos.add(t); return true
    })
    return [k, unicos.slice(0, POR_PLAYA)]
  }))

writeFileSync(OUT, JSON.stringify({ pool, playas: playasOut }))
console.log(`elementos leídos:            ${leidos}`)
console.log(`a menos de ${RADIO_M} m de una playa: ${enZona}`)
console.log(`playas con algo cerca:       ${Object.keys(playasOut).length}`)
const porTipo = {}
for (const p of pool) porTipo[p.t] = (porTipo[p.t] ?? 0) + 1
console.log(`por tipo:`, JSON.stringify(porTipo))
