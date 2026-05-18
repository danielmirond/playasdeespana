#!/usr/bin/env node
// scripts/extract-extranjeras.mjs
//
// Extrae slugs de playas con provincia fuera de España y los escribe
// en src/data/slugs-extranjeras.json. El middleware lo carga para
// responder 410 Gone.
//
// Uso: node scripts/extract-extranjeras.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const PROV_ES = new Set([
  'Almería', 'Cádiz', 'Granada', 'Huelva', 'Málaga',
  'Asturias', 'Cantabria',
  'A Coruña', 'La Coruña', 'Lugo', 'Pontevedra',
  'Vizcaya', 'Bizkaia', 'Guipúzcoa', 'Gipuzkoa',
  'Barcelona', 'Girona', 'Tarragona',
  'Castellón', 'Castelló', 'Valencia', 'València', 'Alicante', 'Alacant',
  'Murcia',
  'Islas Baleares', 'Illes Balears', 'Baleares',
  'Las Palmas', 'Santa Cruz de Tenerife',
  'Ceuta', 'Melilla',
])

const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf-8'))

const extranjeras = playas
  .filter(p => p?.slug && (!p.provincia || !PROV_ES.has(p.provincia)))
  .map(p => p.slug)

const out = resolve(ROOT, 'src/data/slugs-extranjeras.json')
writeFileSync(out, JSON.stringify(extranjeras.sort(), null, 2) + '\n')

console.log(`Escritas ${extranjeras.length} slugs extranjeras a ${out}`)
console.log('Sample:', extranjeras.slice(0, 10))

// Stats por provincia
const porProv = {}
for (const p of playas) {
  if (p?.provincia && !PROV_ES.has(p.provincia)) {
    porProv[p.provincia] = (porProv[p.provincia] ?? 0) + 1
  }
}
console.log('\nDistribución por provincia (top 20):')
Object.entries(porProv).sort((a, b) => b[1] - a[1]).slice(0, 20).forEach(([k, v]) => {
  console.log(`  ${v.toString().padStart(5)} ${k}`)
})
