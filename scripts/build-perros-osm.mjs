#!/usr/bin/env node
// scripts/build-perros-osm.mjs — playas que admiten perros, según OSM.
//
// EL HUECO. El inventario del Ministerio marca 28 playas caninas en toda
// España, y el hub /playas-perros enseñaba 25. No es que España tenga 25
// playas para perros: es que ese campo casi nadie lo rellena.
//
// QUÉ APORTA OSM. 60 playas con etiqueta de perros, de las que 19 no
// estaban. Poco en absoluto, mucho en relativo: el hub crece un 76 %.
//
// Y 63 con `dog=no`, que valen igual o más: en el inventario, 5.070 fichas
// tienen `perros: false` y ahí dentro se confunden «está prohibido» con
// «nadie lo ha anotado». Un `dog=no` mapeado es una prohibición real.
//
// NO SE PISA EL CAMPO OFICIAL. `perros` sigue siendo del Ministerio; esto
// va aparte y con su fuente, como los aseos de OSM. Que a una playa la
// llamen «canina» en el mapa no la convierte en legal: la ordenanza la
// pone el ayuntamiento y cambia cada temporada. Eso lo dice la página.
//
// Consulta (bbox de España):
//   nwr[natural=beach][dog]; nwr[leisure=beach_resort][dog];
//   nwr[natural=beach][name~"canin|perro|gossos|cans",i];  → out center tags;
//
//   node scripts/build-perros-osm.mjs /tmp/perros.json
//
// Salida: public/data/perros-osm.json  → { slug: {d, n?, m} }
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const IN = process.argv[2]
if (!IN) { console.error('Uso: node scripts/build-perros-osm.mjs <perros.json>'); process.exit(1) }
const OUT = resolve(ROOT, 'public/data/perros-osm.json')

const RADIO_M = 400
const PERMITE = new Set(['yes', 'leashed', 'designated'])

// «Cansadoura» contiene «cans» y no es una playa canina. La palabra tiene
// que ir suelta, no dentro de otra.
const RE_NOMBRE = /(^|[\s(.,\-/])(canin[ao]s?|perros|gossos|cans)([\s).,\-/]|$)/i

const hav = (la1, lo1, la2, lo2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLa = r(la2 - la1), dLo = r(lo2 - lo1)
  const x = Math.sin(dLa / 2) ** 2 + Math.cos(r(la1)) * Math.cos(r(la2)) * Math.sin(dLo / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

const ext = JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf8'))
const EXT = new Set(Array.isArray(ext) ? ext : Object.keys(ext))
const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
  .filter(p => p.lat && p.lng && !EXT.has(p.slug))

const datos = JSON.parse(readFileSync(IN, 'utf8')).elements ?? []
const salida = {}
let permiten = 0, prohiben = 0, sinCasar = 0

for (const e of datos) {
  const t = e.tags ?? {}
  const porNombre = !t.dog && RE_NOMBRE.test(t.name ?? '')
  if (!PERMITE.has(t.dog) && t.dog !== 'no' && !porNombre) continue

  const la = e.lat ?? e.center?.lat, lo = e.lon ?? e.center?.lon
  if (!la || !lo) continue

  let mejor = null, dm = Infinity
  for (const p of playas) {
    if (Math.abs(p.lat - la) > 0.01 || Math.abs(p.lng - lo) > 0.01) continue
    const d = hav(la, lo, p.lat, p.lng)
    if (d < dm) { dm = d; mejor = p }
  }
  if (!mejor || dm > RADIO_M) { sinCasar++; continue }

  const estado = t.dog === 'no' ? 'no' : (t.dog && PERMITE.has(t.dog) ? t.dog : 'nombre')
  // Si una playa tiene dos anotaciones, manda la que permite: suele ser una
  // zona canina dentro de una playa donde el resto está prohibido.
  const previo = salida[mejor.slug]
  if (previo && previo.d !== 'no') continue
  salida[mejor.slug] = { d: estado, ...(t.name ? { n: t.name } : {}), m: Math.round(dm) }
}

for (const v of Object.values(salida)) v.d === 'no' ? prohiben++ : permiten++

writeFileSync(OUT, JSON.stringify(salida, null, 1))
const oficiales = new Set(playas.filter(p => p.perros === true).map(p => p.slug))
const nuevas = Object.entries(salida).filter(([s, v]) => v.d !== 'no' && !oficiales.has(s)).length
console.log(`playas con etiqueta de perros en OSM: ${permiten + prohiben}`)
console.log(`  permiten: ${permiten} (${nuevas} que el inventario no tenía)`)
console.log(`  prohíben: ${prohiben}`)
console.log(`  sin casar con ninguna ficha: ${sinCasar}`)
console.log(`el hub pasa de ${oficiales.size} a ${oficiales.size + nuevas}`)
