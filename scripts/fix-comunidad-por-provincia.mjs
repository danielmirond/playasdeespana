#!/usr/bin/env node
// scripts/fix-comunidad-por-provincia.mjs — pone la comunidad que falta.
//
// EL FALLO. 148 playas de Castellón, Valencia, Alicante y Ourense traían
// «España» en el campo `comunidad`. No es una grafía rara: es que no había
// dato y alguien lo rellenó con el país. Y una playa de Asturias figuraba en
// Galicia.
//
// POR QUÉ IMPORTA MÁS DE LO QUE PARECE. Además de la miga de pan («Inicio ›
// España › Alicante») y de un hub fantasma en /comunidad/espana, el aviso de
// temporal de Meteoalarm se busca por el nombre de la comunidad: con «España»
// no había código NUTS y esas playas se quedaban sin avisos.
//
// CÓMO LO DECIDE. Por mayoría dentro de la propia provincia: si 117 playas de
// Alicante dicen «Comunitat Valenciana» y 78 dicen «España», gana la primera.
// Así no hay tabla que mantener y la grafía es siempre la que ya usa el resto
// del catálogo. «España» nunca puede ganar, aunque sea mayoría.
//
// Es idempotente: se puede correr después de cada sync sin miedo.
//
//   node scripts/fix-comunidad-por-provincia.mjs --dry   # solo informa
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const FILE = join(dirname(fileURLToPath(import.meta.url)), '../public/data/playas.json')
const dry = process.argv.includes('--dry')
const NO_ES_COMUNIDAD = new Set(['España', 'Espana', '', null, undefined])

const playas = JSON.parse(readFileSync(FILE, 'utf8'))

// Recuento por provincia, descartando los valores que no son una comunidad.
const conteo = new Map()
for (const p of playas) {
  if (NO_ES_COMUNIDAD.has(p.comunidad)) continue
  const c = conteo.get(p.provincia) ?? new Map()
  c.set(p.comunidad, (c.get(p.comunidad) ?? 0) + 1)
  conteo.set(p.provincia, c)
}
const mayoritaria = new Map(
  [...conteo].map(([prov, c]) => [prov, [...c].sort((a, b) => b[1] - a[1])[0][0]]),
)

let tocadas = 0
const porProvincia = new Map()
for (const p of playas) {
  const buena = mayoritaria.get(p.provincia)
  if (!buena || p.comunidad === buena) continue
  porProvincia.set(`${p.provincia}: ${p.comunidad ?? '(vacío)'} → ${buena}`,
    (porProvincia.get(`${p.provincia}: ${p.comunidad ?? '(vacío)'} → ${buena}`) ?? 0) + 1)
  if (!dry) p.comunidad = buena
  tocadas++
}

for (const [linea, n] of [...porProvincia].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${linea}`)
console.log(`\n${tocadas} playas ${dry ? 'se corregirían' : 'corregidas'}.`)

if (!dry && tocadas) {
  // El fichero vive en una sola línea con un espacio tras cada coma y cada
  // dos puntos. Se respeta al pie de la letra: con el formato por defecto de
  // JSON.stringify el diff serían 5.098 playas en vez de las 149 tocadas, y
  // nadie podría revisarlo.
  writeFileSync(FILE, comoEstaba(playas))   // sin salto final: así estaba
  console.log('public/data/playas.json reescrito.')
}

/** El mismo formato que ya tenía: `, ` entre elementos y `: ` tras la clave. */
function comoEstaba(datos) {
  return JSON.stringify(datos, null, 1).replace(/\n\s*/g, ' ')
    .replace(/\{ /g, '{').replace(/ \}/g, '}')
    .replace(/\[ /g, '[').replace(/ \]/g, ']')
}
