#!/usr/bin/env node
// scripts/fix-municipio-nombres.mjs — un municipio, un nombre, una URL.
//
// EL FALLO. El dataset trae los municipios bilingües con las dos formas y
// en los dos órdenes: «Xàbia/Jávea» (9 playas) y «Jávea/Xàbia» (5). Como
// la URL sale del nombre, había DOS páginas de Jávea a medias, con slug
// ilegible (/municipio/xabiajavea) y ninguna con todas sus playas. Search
// Console pedía /municipio/javea y le dábamos 404. Lo mismo con Alicante,
// Peñíscola, Elche, Oropesa, Castellón, Villajoyosa, Sagunto, Burriana...
// y con alias sueltos: «La Coruña» junto a «A Coruña», «Palma de Mallorca»
// junto a «Palma», «Port d'Alcúdia» como si fuera municipio.
//
// LA REGLA. Nombre en castellano cuando existe (es el idioma del sitio y el
// que se busca), y la grafía oficial cuando solo hay una. Un solo nombre,
// sin barra. Las URLs viejas se redirigen en next.config (301) al slug
// nuevo, con sus subpáginas.
//
// Es idempotente. Corre después de cada sync del dataset:
//   node scripts/fix-municipio-nombres.mjs --dry
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const dry = process.argv.includes('--dry')

/** Nombre en el dataset → nombre canónico. */
export const ALIAS = {
  'Alacant/Alicante': 'Alicante',
  'Peníscola/Peñíscola': 'Peñíscola',
  'Xàbia/Jávea': 'Jávea', 'Jávea/Xàbia': 'Jávea',
  'la Vila Joiosa/Villajoyosa': 'Villajoyosa', 'Villajoyosa/La Vila Joiosa': 'Villajoyosa',
  'Donostia/San Sebastián': 'San Sebastián',
  'Orpesa/Oropesa del Mar': 'Oropesa del Mar', 'Oropesa del Mar/Orpesa': 'Oropesa del Mar',
  'Benicasim/Benicàssim': 'Benicàssim',
  'Sagunt/Sagunto': 'Sagunto',
  'Elche/Elx': 'Elche', 'Elx/Elche': 'Elche',
  'Borriana/Burriana': 'Burriana',
  'Castellón de la Plana/Castelló de la Plana': 'Castellón de la Plana', 'Castelló de la Plana/Castellón de la Plana': 'Castellón de la Plana',
  'Benitachell/el Poble Nou de Benitatxell': 'Benitachell', 'el Poble Nou de Benitatxell/Benitachell': 'Benitachell',
  'Chilches/Xilxes': 'Chilches',
  'Arce/Artzi': 'Arce',
  'Alboraia/Alboraya': 'Alboraya',
  'Guesálaz/Gesalatz': 'Guesálaz',
  'La Coruña': 'A Coruña',
  'Palma de Mallorca': 'Palma',
  "Port d'Alcúdia": 'Alcúdia',
  'Eivissa': 'Ibiza',
  'Area metropolitana de Ciutadella': 'Ciutadella de Menorca',
}

const toSlug = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

/** slug viejo → slug nuevo, para next.config y para los sidecars. */
export const SLUGS = Object.fromEntries(Object.entries(ALIAS).map(([a, b]) => [toSlug(a), toSlug(b)]).filter(([a, b]) => a !== b))

// 1. Dataset de playas.
const playasFile = join(ROOT, 'public/data/playas.json')
const playas = JSON.parse(readFileSync(playasFile, 'utf8'))
let cambiadas = 0
for (const p of playas) if (ALIAS[p.municipio]) { p.municipio = ALIAS[p.municipio]; cambiadas++ }
console.log(`playas.json: ${cambiadas} playas renombradas`)

// 2. Sidecars con clave o campo por slug de municipio. Cuando el slug nuevo
//    ya existe (dos mitades del mismo municipio), se fusionan.
function renombrarClaves(obj) {
  let n = 0
  for (const [viejo, nuevo] of Object.entries(SLUGS)) {
    if (!(viejo in obj)) continue
    if (!(nuevo in obj)) obj[nuevo] = obj[viejo]
    else if (Array.isArray(obj[nuevo]) && Array.isArray(obj[viejo])) obj[nuevo] = [...obj[nuevo], ...obj[viejo]]
    delete obj[viejo]; n++
  }
  return n
}
const mareasFile = join(ROOT, 'src/data/mareas-map.json')
const mareas = JSON.parse(readFileSync(mareasFile, 'utf8'))
console.log(`mareas-map.json: ${renombrarClaves(mareas)} claves`)

const poisFile = join(ROOT, 'public/data/municipio-pois.json')
const pois = JSON.parse(readFileSync(poisFile, 'utf8'))
let np = 0
for (const [viejo, nuevo] of Object.entries(SLUGS)) {
  if (!(viejo in pois)) continue
  if (!(nuevo in pois)) { pois[nuevo] = pois[viejo]; pois[nuevo].nombre = ALIAS[Object.keys(ALIAS).find(k => toSlug(k) === viejo)] ?? pois[nuevo].nombre }
  delete pois[viejo]; np++
}
console.log(`municipio-pois.json: ${np} claves`)

const sbFile = join(ROOT, 'src/data/banderas-sb-map.json')
const sb = JSON.parse(readFileSync(sbFile, 'utf8'))
let nsb = 0
const recorre = v => { if (Array.isArray(v)) v.forEach(recorre); else if (v && typeof v === 'object') { if (typeof v.m === 'string' && SLUGS[v.m]) { v.m = SLUGS[v.m]; nsb++ } Object.values(v).forEach(recorre) } }
recorre(sb)
console.log(`banderas-sb-map.json: ${nsb} campos m`)

const samFile = join(ROOT, 'src/data/samboat-municipios.json')
const sam = JSON.parse(readFileSync(samFile, 'utf8'))
let nsam = 0
for (const m of sam.municipios) if (SLUGS[m.municipio]) { m.municipio = SLUGS[m.municipio]; m.nombre = ALIAS[m.nombre] ?? m.nombre; nsam++ }
console.log(`samboat-municipios.json: ${nsam} municipios`)

if (dry) { console.log('(--dry: no se escribe nada)'); process.exit(0) }
writeFileSync(playasFile, JSON.stringify(playas))   // el dataset va en una línea
writeFileSync(mareasFile, JSON.stringify(mareas, null, 2))
writeFileSync(poisFile, JSON.stringify(pois))
writeFileSync(sbFile, JSON.stringify(sb, null, 1))
writeFileSync(samFile, JSON.stringify(sam, null, 2))
console.log('\nRedirecciones para next.config (slug viejo → nuevo):')
for (const [a, b] of Object.entries(SLUGS)) console.log(`  ${a} → ${b}`)
