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

// Override manual: slugs extranjeros con provincia ES válida PERO coords fuera
// de España que las reglas geográficas no atrapan limpiamente (p.ej. un lago
// de Francia importado como "Girona").
const EXTRA = new Set([
  'plage-de-montbel', // lago de Montbel, Ariège (Francia), etiquetado Girona
])

// Safe-list: playas ESPAÑOLAS reales que las reglas marcan por error (p.ej.
// provincia con encoding roto que no casa con PROV_ES). Nunca se excluyen.
const SAFE = new Set([
  'praia-do-olmo', // Os Olmos, A Coruña (provincia con mojibake "A Coru??a")
])

// Detecta coords fuera del territorio español aunque la provincia sea válida.
// Casos reales del dataset OSM: costa de Argelia etiquetada "Almería", costa
// portuguesa etiquetada "Huelva", etc.
function fueraDeEspana(p) {
  const lat = Number(p?.lat), lng = Number(p?.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false
  // Argelia: la costa española con longitud positiva (Murcia→Baleares) está
  // toda en lat ≥ 37.4; por debajo de 37.3 con lng>0.2 es norte de África.
  if (lat < 37.3 && lng > 0.2) return true
  // Portugal atlántico peninsular: lng < -7.6 en latitud peninsular (36–41.8)
  // es Portugal (Algarve/Setúbal). OJO: acotado a lat ≥ 36 para NO marcar
  // Canarias (lat 27–29.5, también a lng < -7.6 pero territorio español).
  // Galicia (lng < -7.6) queda fuera por lat ≥ 41.8.
  if (lat >= 36 && lat < 41.8 && lng < -7.6) return true
  return false
}

const extranjeras = playas
  .filter(p => p?.slug && !SAFE.has(p.slug) && (
    !p.provincia || !PROV_ES.has(p.provincia) || fueraDeEspana(p) || EXTRA.has(p.slug)
  ))
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
