#!/usr/bin/env node
// scripts/build-banderas-sb-map.mjs — Mapeo offline de las playas de SafeBeach
// → slug nuestro, por coordenadas.
//
// SafeBeach es la plataforma privada que usan los servicios de socorrismo de
// unos 44 municipios de la Comunitat Valenciana, Illes Balears y Murcia. No
// hay API: cada municipio tiene una página en info.safebeach.es con el JSON
// embebido en el HTML como `window.SB_MARKERS`. No existe endpoint global ni
// sitemap, así que la lista de municipios se mantiene aquí.
//
// Aquí SÍ hay coordenadas, pero la distancia SOLA no basta y esto costó un
// error real: en Guardamar las playas son tramos contiguos de un mismo
// arenal, y la ficha más cercana no es la que corresponde. SafeBeach sitúa
// «Montcaió» a 401 m de nuestra ficha de Montcaió (fuera de umbral) y «La
// Roqueta» a 168 m de esa MISMA ficha. Por pura cercanía, la bandera de La
// Roqueta se publicaba en Montcaió y La Roqueta se quedaba sin ninguna.
//
// Así que el criterio es: primero el NOMBRE, y la distancia como control de
// cordura. Suena contrario a la regla del proyecto —"coordenadas, jamás
// nombres"— pero no lo es: aquí el nombre se usa DENTRO de un municipio ya
// acotado y con la distancia validando el resultado. Lo que la regla prohíbe
// es casar por nombre contra las 4.400 fichas del país, donde 550 nombres se
// repiten. Dentro de Calvià no hay dos «Santa Ponça».
//
// Y el emparejamiento es UNO A UNO: una ficha nuestra no puede recibir dos
// playas de SafeBeach.
//
// El mapa se guarda como slug → { m: municipio, l: localizador } para que el
// runtime solo pida la página del municipio de esa playa, no las 44.
//
// Uso: node scripts/build-banderas-sb-map.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/banderas-sb-map.json')
const MAX_DIST_M = 350

// Municipios dados de alta, verificados uno a uno (200 con array no vacío).
// Un slug inexistente devuelve 404 y uno dado de alta sin playas cargadas
// devuelve 200 con array vacío, así que se distinguen.
const MUNICIPIOS = [
  // Comunitat Valenciana
  'guardamar-del-segura', 'valencia', 'xeraco', 'denia', 'torrevieja', 'calpe',
  'sueca', 'sagunto', 'teulada', 'benissa', 'peniscola', 'almenara', 'puçol',
  // Illes Balears
  'calvia', 'manacor', 'palma-de-mallorca', 'capdepera', 'pollensa', 'santanyi',
  'campos', 'ses-salines', 'muro', 'felanitx', 'alcudia', 'arta', 'son-servera',
  'andratx', 'llucmajor', 'soller', 'escorca',
  'santa-eulalia-del-rio', 'sant-josep-de-sa-talaia', 'sant-antoni-de-portmany',
  'formentera', 'sant-joan-de-labritja', 'ibiza',
  'ciutadella', 'es-mercadal', 'alaior', 'ferreries', 'mao', 'sant-lluis',
  'es-migjorn-gran',
  // Múrcia
  'san-pedro-del-pinatar',
  // Asturias (dados de alta, pocas playas)
  'castropol', 'coana',
]

// Normaliza para comparar: sin acentos, sin artículos, sin «platja/playa».
const norm = s => (s || '').toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/\b(platja|playa|plage|de|del|la|el|los|las|els|les|d|s)\b/g, ' ')
  .replace(/[^a-z0-9]+/g, ' ').trim()

// 0 = nombres iguales · 1 = uno contiene al otro · 2 = distintos
const parecido = (a, b) => {
  const x = norm(a), y = norm(b)
  if (!x || !y) return 2
  if (x === y) return 0
  if (x.includes(y) || y.includes(x)) return 1
  return 2
}

const hav = (lat1, lon1, lat2, lon2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

async function marcadores(muni) {
  const res = await fetch(`https://info.safebeach.es/${muni}`, {
    headers: { 'User-Agent': 'playas-espana.com (+https://playas-espana.com) mapeo offline' },
  })
  if (!res.ok) return { muni, http: res.status, playas: [] }
  const html = await res.text()
  const m = /SB_MARKERS\s*=\s*(\[[\s\S]*?\])\s*;/.exec(html)
  if (!m) return { muni, http: res.status, playas: [] }
  try { return { muni, http: res.status, playas: JSON.parse(m[1]) } }
  catch { return { muni, http: res.status, playas: [] } }
}

async function main() {
  const excluidas = new Set([
    ...JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf8')),
    ...Object.keys(JSON.parse(readFileSync(resolve(ROOT, 'src/data/duplicados.json'), 'utf8'))),
  ])
  const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
    .filter(p => p?.slug && p.lat && p.lng && !excluidas.has(p.slug))

  const map = {}
  const audit = []
  let totalSB = 0, sinFicha = 0
  for (const muni of MUNICIPIOS) {
    const { http, playas: ps } = await marcadores(muni)
    let casadas = 0
    for (const sb of ps) {
      const la = parseFloat(sb.lat), lo = parseFloat(sb.lng)
      if (!Number.isFinite(la) || !Number.isFinite(lo)) continue
      totalSB++
      // Candidatas: cualquiera a menos de 3 km, que en un municipio costero
      // acota a su tramo de costa. Se ordena por parecido de nombre y, a
      // igualdad, por distancia.
      const cands = playas
        .map(p => ({ p, d: hav(la, lo, p.lat, p.lng), n: parecido(sb.nombre, p.nombre) }))
        .filter(c => c.d <= 3000)
        .sort((a, b) => a.n - b.n || a.d - b.d)
      // Umbral según la confianza del nombre: si coincide, se admite lejos
      // (son tramos largos y cada catálogo pone el centroide donde quiere);
      // si no coincide, hay que estar encima.
      const ok = cands.find(c => c.d <= (c.n === 0 ? 2000 : c.n === 1 ? 1200 : MAX_DIST_M))
      if (!ok) { sinFicha++; continue }
      const prev = audit.find(a => a.slug === ok.p.slug)
      // Uno a uno: si ya estaba tomada, gana quien tenga mejor nombre y,
      // a igualdad, quien esté más cerca.
      if (prev && (prev.n < ok.n || (prev.n === ok.n && prev.d <= ok.d))) { sinFicha++; continue }
      if (prev) { delete map[prev.slug]; audit.splice(audit.indexOf(prev), 1) }
      map[ok.p.slug] = { m: muni, l: String(sb.localizador) }
      audit.push({ slug: ok.p.slug, d: Math.round(ok.d), n: ok.n, suya: sb.nombre, nuestra: ok.p.nombre, muni })
      casadas++
    }
    console.log(`  ${muni.padEnd(26)} http=${http} playas=${String(ps.length).padStart(2)} casadas=${casadas}`)
    await new Promise(r => setTimeout(r, 300))   // cortesía: no martillear
  }

  writeFileSync(OUT, JSON.stringify(map, null, 1) + '\n')
  console.log(`\nSafeBeach: ${totalSB} playas · casadas ${Object.keys(map).length} · sin ficha nuestra ${sinFicha}`)
  const porNombre = audit.filter(a => a.n === 0).length
  const parcial = audit.filter(a => a.n === 1).length
  const soloDist = audit.filter(a => a.n === 2).length
  console.log(`  nombre exacto ${porNombre} · nombre parcial ${parcial} · solo distancia ${soloDist}`)
  // Las que se casaron SOLO por distancia son las que pueden estar mal:
  // es el caso de los tramos contiguos. Se listan todas para revisar.
  const dudosas = audit.filter(a => a.n === 2).sort((a, b) => b.d - a.d)
  console.log(`\nlas ${Math.min(15, dudosas.length)} casadas solo por cercanía (nombres distintos — revisar):`)
  for (const a of dudosas.slice(0, 15)) {
    console.log(` ${String(a.d).padStart(4)}m · ${a.suya.slice(0, 26).padEnd(28)} → ${a.nuestra.slice(0, 24).padEnd(26)} [${a.muni}]`)
  }
}

main()
