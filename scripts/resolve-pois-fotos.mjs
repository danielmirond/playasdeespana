#!/usr/bin/env node
// scripts/resolve-pois-fotos.mjs — la foto de los sitios que salen en el
// carrusel de /que-hacer, desde Wikipedia y Commons.
//
// PARA QUÉ. El carrusel llevaba cinco degradados con el nombre encima. Las
// dos playas ya tienen foto en su sidecar; los tres sitios (monumento,
// museo, mirador) no tenían nada. Cuando el POI trae etiqueta `wikipedia`
// en OpenStreetMap —638 de 5.685—, el artículo tiene imagen principal y
// Commons dice con qué licencia.
//
// SOLO LOS DEL CARRUSEL. Se resuelven los tres primeros de cada categoría
// que sale ahí, no los 5.685: son unas 100 fotos, dos llamadas por foto, y
// las demás no se pintan en ningún sitio. Corre después de la cosecha de
// POIs y escribe en el mismo sidecar (clave `f` en cada POI).
//
// LICENCIA O NADA. Solo se guardan imágenes con licencia libre (CC BY,
// CC BY-SA, CC0, dominio público, GFDL) y con autor, que se pinta al lado
// de la foto igual que en la ficha de playa. Una imagen sin autor o con
// licencia rara se descarta: mejor degradado que foto sin crédito.
//
//   node scripts/resolve-pois-fotos.mjs            # resuelve las que faltan
//   node scripts/resolve-pois-fotos.mjs --refrescar
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FILE = resolve(ROOT, 'public/data/municipio-pois.json')
const UA = 'playas-espana.com/1.0 fotos-pois (contact: hola@playas-espana.com)'
const refrescar = process.argv.includes('--refrescar')

const LIBRES = /^(cc[- ]by(-sa)?(-[0-9.]+)?|cc0|public domain|pd|gfdl)/i
const dormir = ms => new Promise(r => setTimeout(r, ms))

async function json(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

// «es:Torre del Moro (Torrevieja)» → { lang: 'es', title: 'Torre del Moro (Torrevieja)' }
function parsearWp(wp) {
  const m = /^([a-z-]{2,10}):(.+)$/.exec(wp.trim())
  return m ? { lang: m[1], title: m[2] } : { lang: 'es', title: wp.trim() }
}

async function fotoDe(wp) {
  const { lang, title } = parsearWp(wp)
  const q = await json(`https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=name|thumbnail&pithumbsize=960&redirects=1&titles=${encodeURIComponent(title)}`)
  const page = Object.values(q.query?.pages ?? {})[0]
  if (!page?.pageimage || !page.thumbnail?.source) return null
  await dormir(250)
  const info = await json(`https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=extmetadata&iiextmetadatafilter=LicenseShortName|Artist|Credit&titles=${encodeURIComponent('File:' + page.pageimage)}`)
  const meta = Object.values(info.query?.pages ?? {})[0]?.imageinfo?.[0]?.extmetadata
  if (!meta) return null
  const lic = meta.LicenseShortName?.value ?? ''
  const autor = (meta.Artist?.value ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
  if (!LIBRES.test(lic) || !autor) return null
  return { u: page.thumbnail.source, a: autor.slice(0, 80), l: lic, w: page.thumbnail.width, h: page.thumbnail.height }
}

const data = JSON.parse(readFileSync(FILE, 'utf8'))
let hechas = 0, sin = 0, ya = 0
for (const slug of Object.keys(data)) {
  const p = data[slug].pois
  for (const poi of [p.monumento[0], p.museo[0], p.mirador[0]]) {
    if (!poi?.wp) continue
    if (poi.f && !refrescar) { ya++; continue }
    if (poi.f === null && !refrescar) { sin++; continue }   // ya se miró y no había
    try {
      const f = await fotoDe(poi.wp)
      poi.f = f
      if (f) hechas++; else sin++
      process.stdout.write(`\r  ${slug.padEnd(28).slice(0, 28)} ${f ? '✔' : '·'} ${poi.n.slice(0, 40).padEnd(40)}`)
    } catch (e) {
      console.error(`\n✗  ${slug} / ${poi.n}: ${e.message}`)
    }
    await dormir(350)
  }
}
writeFileSync(FILE, JSON.stringify(data, null, 0))
console.log(`\n\nFotos nuevas: ${hechas} · sin foto libre: ${sin} · ya resueltas: ${ya}`)
