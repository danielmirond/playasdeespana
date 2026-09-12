#!/usr/bin/env node
// scripts/harvest-samboat.mjs — cruza nuestros municipios con las páginas de
// ciudad de SamBoat y guarda src/data/samboat-municipios.json.
//
// POR QUÉ ESTO Y NO UNA LISTA A MANO. Las 21 landings de barcos que había
// llevaban la URL de SamBoat escrita a mano, y al comprobarlas 11 caían en la
// página genérica de España y 3 daban 404: nadie las había vuelto a mirar
// desde que se escribieron. El sitemap de SamBoat es la única fuente que sabe
// qué ciudades tienen página, y las cifras (barcos, precio mínimo, licencia)
// solo las sabe la página. Así que se leen de ahí y se vuelven a leer cuando
// haga falta, en vez de inventarlas.
//
// QUÉ NO SE GUARDA. La nota agregada (4,88 sobre 215.278 reseñas) es la misma
// en Torrevieja que en Sanxenxo: es de toda la plataforma, no de la ciudad.
// Publicarla junto al nombre de un municipio sería dar por local algo que no
// lo es.
//
//   node scripts/harvest-samboat.mjs            # cruce + fichaje completo
//   node scripts/harvest-samboat.mjs --dry      # solo el cruce, sin fichar
//
// Es una lectura de páginas públicas, sin clave ni coste. Va despacio a
// propósito (0,5 s entre peticiones) porque no hay ninguna prisa.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const SITEMAP = 'https://www.samboat.es/sitemap_es_boat_rental_pages.xml'
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126 Safari/537.36'
const dry = process.argv.includes('--dry')

const norm = (x) => (x ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const dormir = (ms) => new Promise(r => setTimeout(r, ms))

async function texto(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'es-ES,es' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.text()
}

// ---------------------------------------------------------------- municipios
const extranjeras = new Set(JSON.parse(readFileSync(join(RAIZ, 'src/data/slugs-extranjeras.json'), 'utf8')))
const playas = JSON.parse(readFileSync(join(RAIZ, 'public/data/playas.json'), 'utf8'))
  .filter(p => !extranjeras.has(p.slug))

const municipios = new Map()
for (const p of playas) {
  const slug = norm(p.municipio)
  if (!municipios.has(slug)) municipios.set(slug, { slug, nombre: p.municipio, provincia: p.provincia, playas: 0 })
  municipios.get(slug).playas++
}

// ------------------------------------------------------------------- sitemap
console.log('Leyendo el sitemap de SamBoat…')
const xml = await texto(SITEMAP)
const ciudades = new Set(
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map(m => m[1])
    .filter(u => /\/alquiler-barco\/[^/]+$/.test(u))
    .map(u => u.split('/').pop())
)
console.log(`  ${ciudades.size} páginas de ciudad`)

// El slug de SamBoat lleva sufijo y no siempre el mismo: «torrevieja-espana»,
// «calvia-espagne» (en francés, cosa suya), «la-linea-de-la-concepcion-spain»,
// «marbella-andalucia-espana» o pelado («salou»). Se prueban en orden y luego
// se comprueba en la propia página que el país es España — sin eso, Cartagena
// casaba con la de Colombia y San José con la de Estados Unidos.
const SUFIJOS = ['', '-espana', '-espagne', '-spain']
const REGIONES = ['andalucia', 'cataluna', 'comunidad-valenciana', 'islas-baleares', 'canarias',
  'galicia', 'murcia', 'region-de-murcia', 'asturias', 'cantabria', 'pais-vasco']

// Los que ningún patrón puede adivinar, porque SamBoat les pone otro nombre.
// Se comprueba igual que el resto: si la página deja de existir o cambia de
// país, el fichaje la descarta sola.
const ALIAS = {
  palma: 'palma-de-mallorca-islas-baleares-espana',   // «Palma» a secas no existe allí
}

function candidato(slug) {
  if (slug in ALIAS && ciudades.has(ALIAS[slug])) return ALIAS[slug]
  for (const s of SUFIJOS) if (ciudades.has(slug + s)) return slug + s
  for (const r of REGIONES) for (const s of ['-espana', '-espagne']) if (ciudades.has(`${slug}-${r}${s}`)) return `${slug}-${r}${s}`
  // «alacant-alicante» → «alicante»; «orpesa-oropesa-del-mar» ya casa entero.
  for (const parte of slug.split('-').filter(w => w.length >= 5)) {
    for (const s of SUFIJOS) if (ciudades.has(parte + s)) return parte + s
  }
  return null
}

const candidatos = []
for (const m of municipios.values()) {
  if (m.playas < 4) continue          // sin página de municipio, sin subpágina
  const sb = candidato(m.slug)
  if (sb) candidatos.push({ ...m, samboat: sb })
}
console.log(`  ${candidatos.length} municipios con posible página`)
if (dry) { console.log(candidatos.map(c => `${c.slug} → ${c.samboat}`).join('\n')); process.exit(0) }

// --------------------------------------------------------------- las cifras
const limpio = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ')
  .replace(/&amp;/g, '&').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ')

const salida = []
const descartados = []

for (const [i, c] of candidatos.entries()) {
  const url = `https://www.samboat.es/alquiler-barco/${c.samboat}`
  let html
  try { html = await texto(url) } catch (e) { descartados.push(`${c.nombre}: ${e.message}`); continue }
  const t = limpio(html)

  // El país sale del <title>: «Alquiler de barcos Torrevieja, España con o sin
  // licencia». Si no dice España, es otra ciudad con el mismo nombre.
  const titulo = (html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? ''
  if (!/,\s*Espa(ñ|n)a/i.test(titulo)) { descartados.push(`${c.nombre}: ${titulo.slice(0, 60)} (no es España)`); continue }

  const num = (re) => { const m = t.match(re); return m ? parseInt(m[1].replace(/[.\s]/g, ''), 10) : null }
  const barcos    = num(/([0-9][0-9.\s]*) barcos/)
  const precioMin = num(/Precio m[ií]nimo:\s*([0-9][0-9.\s]*)\s*€/)
  const conPatron = num(/Patr[oó]n:\s*([0-9][0-9.\s]*) barcos con patr[oó]n/)
  const licencia  = /Licencia\s*:\s*Licencia obligatoria/i.test(t) ? 'obligatoria'
                  : /Licencia\s*:\s*con o sin licencia/i.test(t) ? 'opcional' : null
  const tipos = (t.match(/Tipo de barcos:\s*([^]{0,160}?)\s*Patr[oó]n:/) ?? [])[1]
    ?.split(',').map(x => x.trim()).filter(Boolean) ?? []

  if (!barcos) { descartados.push(`${c.nombre}: sin número de barcos`); continue }

  salida.push({
    municipio: c.slug, nombre: c.nombre, provincia: c.provincia, playas: c.playas,
    samboat: c.samboat, url, barcos, precioMin, conPatron, licencia, tipos,
  })
  process.stdout.write(`\r  ${i + 1}/${candidatos.length}  ${c.nombre.padEnd(28).slice(0, 28)}`)
  await dormir(500)
}

salida.sort((a, b) => b.barcos - a.barcos)
const destino = join(RAIZ, 'src/data/samboat-municipios.json')
writeFileSync(destino, JSON.stringify({ actualizado: new Date().toISOString().slice(0, 10), municipios: salida }, null, 1) + '\n')

console.log(`\n\n${salida.length} municipios guardados en src/data/samboat-municipios.json`)
console.log(`  con licencia obligatoria: ${salida.filter(s => s.licencia === 'obligatoria').length}`)
console.log(`  menos de 20 barcos:       ${salida.filter(s => s.barcos < 20).length}`)
if (descartados.length) console.log(`\nDescartados (${descartados.length}):\n  ${descartados.join('\n  ')}`)
