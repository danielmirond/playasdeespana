#!/usr/bin/env node
// scripts/completar-licencias.mjs — rellena licencia y origen en las fotos
// de Wikimedia que ya estaban en el catálogo.
//
// POR QUÉ HACE FALTA
// La re-cosecha conservó 1.743 entradas que ya venían de Commons, para no
// perder fotos buenas con el filtro nuevo, más estricto. Pero la cosecha
// antigua no guardaba `licencia` ni `origen`, así que quedaron sin
// documentar: casi seguro CC o dominio público —están en Commons— pero sin
// forma de probarlo ni de enlazar de vuelta como piden CC BY y CC BY-SA.
//
// Media verdad es peor que ninguna aquí: el objetivo del ejercicio era
// poder demostrar la licencia de cada imagen que servimos.
//
// La API de Commons acepta 50 títulos por petición, así que esto son ~35
// llamadas, no 1.743. El nombre del fichero se saca de la propia URL.
//
// Uso: node scripts/completar-licencias.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/data/playas-images.json')
const UA = { 'User-Agent': 'playas-espana.com/1.0 (completar licencias; daniel.mirond@gmail.com)' }

const d = JSON.parse(readFileSync(OUT, 'utf8'))

/** De la URL de upload.wikimedia.org al nombre de fichero de Commons. */
function ficheroDeUrl(url) {
  try {
    const p = decodeURIComponent(new URL(url).pathname)
    // .../commons/thumb/b/b2/NOMBRE.jpg/1920px-NOMBRE.jpg  → NOMBRE.jpg
    // .../commons/b/b2/NOMBRE.jpg                          → NOMBRE.jpg
    const m = p.match(/\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/]+)/)
    return m ? m[1] : null
  } catch { return null }
}

// Qué falta completar
const pendientes = []
for (const [slug, arr] of Object.entries(d)) {
  if (!Array.isArray(arr)) continue
  arr.forEach((f, i) => {
    if (!f || f.licencia || f.fuente !== 'wikimedia') return
    const fich = ficheroDeUrl(f.url)
    if (fich) pendientes.push({ slug, i, fichero: fich })
  })
}

console.log(`Sin licencia: ${pendientes.length} entradas de Wikimedia`)
if (!pendientes.length) { console.log('Nada que hacer.'); process.exit(0) }

const unicos = [...new Set(pendientes.map(p => p.fichero))]
console.log(`Ficheros distintos: ${unicos.length} → ${Math.ceil(unicos.length / 50)} peticiones\n`)

const meta = new Map()
const espera = ms => new Promise(r => setTimeout(r, ms))

for (let i = 0; i < unicos.length; i += 50) {
  const lote = unicos.slice(i, i + 50)
  const titles = lote.map(f => 'File:' + f).join('|')
  const u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json'
    + '&prop=imageinfo&iiprop=extmetadata%7Curl&titles=' + encodeURIComponent(titles)
  try {
    const r = await fetch(u, { headers: UA })
    const j = await r.json()
    for (const pg of Object.values(j?.query?.pages ?? {})) {
      const ii = pg.imageinfo?.[0]
      if (!ii) continue
      const em = ii.extmetadata ?? {}
      meta.set(pg.title.replace(/^File:/, '').replace(/ /g, '_'), {
        licencia: em.LicenseShortName?.value ?? null,
        origen: ii.descriptionurl ?? null,
        autor: (em.Artist?.value ?? '').replace(/<[^>]+>/g, '').trim().slice(0, 80) || undefined,
      })
    }
  } catch (e) {
    console.log(`  lote ${i / 50 + 1}: error`)
  }
  if ((i / 50 + 1) % 10 === 0) console.log(`  ${Math.min(i + 50, unicos.length)}/${unicos.length}`)
  await espera(300)
}

let ok = 0, sinDato = 0
for (const p of pendientes) {
  const m = meta.get(p.fichero) ?? meta.get(p.fichero.replace(/ /g, '_'))
  const f = d[p.slug][p.i]
  if (m?.licencia) {
    f.licencia = m.licencia
    if (m.origen) f.origen = m.origen
    if (m.autor && !f.autor) f.autor = m.autor
    ok++
  } else {
    sinDato++
  }
}

// Las que sigan sin licencia se RETIRAN. Sirven de Commons, así que casi
// seguro son libres, pero "casi seguro" es exactamente lo que veníamos a
// eliminar. Sin prueba, a genérica.
let retiradas = 0
for (const [slug, arr] of Object.entries(d)) {
  if (!Array.isArray(arr)) continue
  const limpio = arr.filter(f => f && f.licencia)
  if (limpio.length !== arr.length) retiradas += arr.length - limpio.length
  d[slug] = limpio
}

writeFileSync(OUT, JSON.stringify(d))
console.log(`\nCompletadas   ${ok}`)
console.log(`Sin dato      ${sinDato}`)
console.log(`Retiradas     ${retiradas} (sin licencia demostrable)`)
