#!/usr/bin/env node
// scripts/build-duplicados.mjs
//
// Detecta fichas DUPLICADAS: la misma playa importada 2-4 veces en el dataset
// (slug, slug-2, slug-3…) a <0.8 km entre sí (misma playa, no homónimos que
// comparten nombre a decenas de km). Escribe src/data/duplicados.json con el
// mapa { slugDuplicado: slugCanónico }.
//
// La canónica de cada cluster es la ficha más completa (bandera/servicios/
// datos); a igualdad, menor sufijo y slug más corto. El middleware hace 301
// de las duplicadas → canónica; getPlayas las excluye de listados.
//
// Uso: node scripts/build-duplicados.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const UMBRAL_KM = 0.8

const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf-8')).filter(p => p?.slug)
const ex = new Set(JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf-8')))
const serv = playas.filter(p => !ex.has(p.slug) && p.lat && p.lng)

const hav = (a, b) => {
  const R = 6371, toRad = d => d * Math.PI / 180
  const dl = toRad(b.lat - a.lat), dn = toRad(b.lng - a.lng)
  const x = Math.sin(dl/2)**2 + Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dn/2)**2
  return 2 * R * Math.asin(Math.sqrt(x))
}
const base = s => s.replace(/-\d+$/, '')
const suffix = s => { const m = s.match(/-(\d+)$/); return m ? +m[1] : 1 }
const score = p => (p.bandera?3:0)+(p.socorrismo?1:0)+(p.parking?1:0)+(p.longitud?1:0)+(p.descripcion?1:0)

const byBase = new Map()
for (const p of serv) { const b = base(p.slug); (byBase.get(b) ?? byBase.set(b, []).get(b)).push(p) }

const mapping = {}
let clusters = 0
for (const [, lst] of byBase) {
  if (lst.length < 2) continue
  const parent = new Map(lst.map(p => [p.slug, p.slug]))
  const find = x => { while (parent.get(x) !== x) { parent.set(x, parent.get(parent.get(x))); x = parent.get(x) } return x }
  for (let i = 0; i < lst.length; i++)
    for (let j = i + 1; j < lst.length; j++)
      if (hav(lst[i], lst[j]) < UMBRAL_KM) parent.set(find(lst[i].slug), find(lst[j].slug))
  const groups = new Map()
  for (const p of lst) { const r = find(p.slug); (groups.get(r) ?? groups.set(r, []).get(r)).push(p) }
  for (const g of groups.values()) {
    if (g.length < 2) continue
    const canon = [...g].sort((a, b) => score(b)-score(a) || suffix(a.slug)-suffix(b.slug) || a.slug.length-b.slug.length)[0].slug
    for (const p of g) if (p.slug !== canon) mapping[p.slug] = canon
    clusters++
  }
}

writeFileSync(resolve(ROOT, 'src/data/duplicados.json'), JSON.stringify(mapping, null, 2) + '\n')
console.log(`Clusters: ${clusters} · slugs redirigidos: ${Object.keys(mapping).length}`)
