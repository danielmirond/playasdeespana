#!/usr/bin/env node
// scripts/corregir-provincia-descripcion.mjs — la provincia que dice el texto
// tiene que ser la del registro.
//
// EL FALLO. La descripción de cada ficha empieza con «ubicada en el municipio
// de X, en la provincia de Y». En 58 fichas esa Y contradice el campo
// provincia: Bolonia salía en Málaga siendo de Cádiz, y cuatro playas de
// Tenerife salían en Las Palmas. El campo manda, porque es el que alimenta
// la miga, los enlaces y el schema; el que estaba mal era el texto.
//
//   node scripts/corregir-provincia-descripcion.mjs           (solo informa)
//   node scripts/corregir-provincia-descripcion.mjs --aplicar
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const F = resolve(ROOT, 'public/data/playas.json')
const APLICAR = process.argv.includes('--aplicar')

const norm = s => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const RE = /(en la provincia de )([A-ZÁÉÍÓÚÑ][\wáéíóúñüÁÉÍÓÚÑ ]*?)(?=[,.])/

const playas = JSON.parse(readFileSync(F, 'utf8'))
let tocadas = 0
for (const p of playas) {
  if (!p.descripcion) continue
  const m = p.descripcion.match(RE)
  if (!m) continue
  const dicha = norm(m[2]), real = norm(p.provincia)
  if (!real || real.includes(dicha) || dicha.includes(real)) continue
  console.log(`${p.slug}: «${m[2].trim()}» → «${p.provincia}»`)
  if (APLICAR) p.descripcion = p.descripcion.replace(RE, `$1${p.provincia}`)
  tocadas++
}
console.log(`\n${tocadas} descripciones con la provincia equivocada`)
if (APLICAR) {
  writeFileSync(F, JSON.stringify(playas))
  console.log('escrito public/data/playas.json')
} else if (tocadas) {
  console.log('(nada escrito; repite con --aplicar)')
}
