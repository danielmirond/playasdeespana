#!/usr/bin/env node
// scripts/resolve-pois-extractos.mjs — el resumen de Wikipedia de cada sitio.
//
// PARA QUÉ. Los sitios de /que-hacer eran nombre y tipo, nada más. Cuando el
// POI trae etiqueta `wikipedia` en OSM (638 de 5.685), el artículo tiene una
// entradilla que dice qué es y desde cuándo. Se guarda aquí en crudo (clave
// `e`, dos frases, sin HTML) y otro paso la reescribe con voz propia (clave
// `r`, ver rewrite-pois-resumen.mjs). Lo crudo no se publica: es CC BY-SA y
// copiarlo tal cual obliga a reproducir la licencia entera; reescrito con
// datos propios y con «Fuente: Wikipedia» al pie es lo honesto y lo legal.
//
//   node scripts/resolve-pois-extractos.mjs            # los que faltan
//   node scripts/resolve-pois-extractos.mjs --refrescar
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data/municipio-pois.json')
const UA = 'playas-espana.com/1.0 extractos-pois (contact: hola@playas-espana.com)'
const refrescar = process.argv.includes('--refrescar')
const dormir = ms => new Promise(r => setTimeout(r, ms))

function parsearWp(wp) {
  const m = /^([a-z-]{2,10}):(.+)$/.exec(wp.trim())
  return m ? { lang: m[1], title: m[2] } : { lang: 'es', title: wp.trim() }
}

// Si el artículo está en catalán, gallego u otro idioma, Wikipedia suele
// tener el equivalente en castellano enlazado (langlinks). Se prefiere ese:
// el modelo local copia el idioma del extracto, y un extracto en castellano
// es la forma más barata de que el resumen salga en castellano.
async function enCastellano(lang, title) {
  if (lang === 'es') return { lang, title }
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=langlinks&lllang=es&redirects=1&titles=${encodeURIComponent(title)}`
  const res = await fetch(url, { headers: { 'user-agent': UA } })
  if (!res.ok) return { lang, title }
  const page = Object.values((await res.json()).query?.pages ?? {})[0]
  const es = page?.langlinks?.[0]?.['*']
  return es ? { lang: 'es', title: es } : { lang, title }
}

async function extracto(wp) {
  const { lang, title } = await enCastellano(...Object.values(parsearWp(wp)))
  const url = `https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&exintro=1&explaintext=1&exsentences=3&redirects=1&titles=${encodeURIComponent(title)}`
  const res = await fetch(url, { headers: { 'user-agent': UA } })
  if (!res.ok) throw new Error(`${res.status}`)
  const page = Object.values((await res.json()).query?.pages ?? {})[0]
  const t = (page?.extract ?? '').replace(/\s+/g, ' ').trim()
  // Desambiguaciones y esbozos de una línea no sirven de nada.
  if (!t || t.length < 60 || /puede referirse a|desambiguaci/i.test(t)) return null
  return { t: t.slice(0, 600), l: lang, p: page.title }
}

const data = JSON.parse(readFileSync(FILE, 'utf8'))
let ok = 0, nada = 0, ya = 0, err = 0
for (const slug of Object.keys(data)) {
  for (const cat of Object.values(data[slug].pois)) {
    for (const poi of cat) {
      if (!poi.wp) continue
      // Sin --refrescar solo se vuelve a mirar lo que no tiene resumen y cuyo
      // extracto no está en castellano: es donde el langlink puede ayudar.
      const candidatoEs = poi.r === null && poi.e && poi.e.l !== 'es'
      if (poi.e !== undefined && !refrescar && !candidatoEs) { ya++; continue }
      if (candidatoEs) { const antes = poi.e.l; const nuevo = await extracto(poi.wp).catch(() => null); if (nuevo && nuevo.l === 'es') { poi.e = nuevo; poi.r = undefined; ok++ } else { ya++ } await dormir(200); continue }
      try {
        poi.e = await extracto(poi.wp)
        poi.e ? ok++ : nada++
      } catch { err++ }
      await dormir(200)
    }
  }
  process.stdout.write(`\r  ${slug.padEnd(28).slice(0, 28)} ok ${ok} · sin ${nada} · err ${err}`)
}
writeFileSync(FILE, JSON.stringify(data, null, 0))
console.log(`\n\nExtractos: ${ok} nuevos · ${nada} sin texto útil · ${ya} ya estaban · ${err} errores`)
