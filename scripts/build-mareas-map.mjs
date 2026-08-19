#!/usr/bin/env node
// scripts/build-mareas-map.mjs — Mapeo offline municipio → ubicación de
// Portus (Puertos del Estado) para la predicción de mareas.
//
// Fuente: GET https://portus.puertos.es/portussvr/api/ubicaciones/?locale=es
// 916 ubicaciones con coordenadas: 48 puertos, 241 localidades y 627 playas.
// Sin clave. Es la misma API no documentada de la que salen las boyas.
//
// Se elige UNA ubicación por municipio —la más cercana al centroide de sus
// fichas— porque la marea no cambia de forma apreciable dentro de un
// término municipal, y una página por municipio es la unidad que busca la
// gente («mareas cádiz», no «mareas playa de la victoria»).
//
// Prioridad al emparejar, a igualdad de cercanía: Puerto > Localidad >
// Playa. El puerto tiene mareógrafo real detrás; la playa es punto de
// modelo. Pero la distancia manda: un puerto a 15 km no gana a una playa
// a 1 km, y por eso el umbral es estricto.
//
// Sale también la ZONA de marea de cada municipio, que decide el copy de
// la página: en el Mediterráneo la marea son ~25 cm y la página tiene que
// decirlo antes que nada.
//
// Uso: node scripts/build-mareas-map.mjs

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/mareas-map.json')
const MAX_DIST_M = 12000   // el modelo es regional: 12 km de costa cambian poco la marea

const hav = (lat1, lon1, lat2, lon2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1)
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}
const toSlug = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

function zonaMarea(lat, lng) {
  if (lat < 29.5) return 'canarias'
  if (lat >= 43.0) return 'cantabrico'
  if (lng <= -8.0 && lat >= 41.6) return 'atlantico'
  if (lng <= -5.9 && lat < 37.4) return 'atlantico'
  return 'mediterraneo'
}

async function main() {
  const res = await fetch('https://portus.puertos.es/portussvr/api/ubicaciones/?locale=es', {
    headers: { 'User-Agent': 'playas-espana.com (+https://playas-espana.com) mapeo offline' },
  })
  if (!res.ok) { console.error(`✗ ubicaciones devolvió HTTP ${res.status}`); process.exit(1) }
  const ubis = (await res.json())
    .map(u => ({ id: u.id, nombre: u.nombre, tipo: u.tipoUbicacion, lat: +u.latitud, lng: +u.longitud }))
    .filter(u => Number.isFinite(u.lat) && Number.isFinite(u.lng))
  console.log(`Portus: ${ubis.length} ubicaciones`)

  const excluidas = new Set([
    ...JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf8')),
    ...Object.keys(JSON.parse(readFileSync(resolve(ROOT, 'src/data/duplicados.json'), 'utf8'))),
  ])
  const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
    .filter(p => p?.slug && p.lat && p.lng && p.municipio && !excluidas.has(p.slug))

  // centroide por municipio
  const munis = new Map()
  for (const p of playas) {
    const k = toSlug(p.municipio)
    const m = munis.get(k) ?? { slug: k, nombre: p.municipio, provincia: p.provincia, lat: 0, lng: 0, n: 0 }
    m.lat += p.lat; m.lng += p.lng; m.n++
    munis.set(k, m)
  }
  for (const m of munis.values()) { m.lat /= m.n; m.lng /= m.n }
  console.log(`catálogo: ${munis.size} municipios costeros`)

  const PESO = { Puerto: 0, Localidad: 1, Playa: 2 }
  const map = {}
  const audit = []
  let sinUbi = 0
  for (const m of munis.values()) {
    const cands = ubis
      .map(u => ({ u, d: hav(m.lat, m.lng, u.lat, u.lng) }))
      .filter(c => c.d <= MAX_DIST_M)
      // primero cercanía; a menos de 2 km de diferencia, gana el tipo
      .sort((a, b) => (Math.abs(a.d - b.d) < 2000 ? PESO[a.u.tipo] - PESO[b.u.tipo] : a.d - b.d))
    if (!cands.length) { sinUbi++; continue }
    const c = cands[0]
    map[m.slug] = {
      id: c.u.id, nombre: c.u.nombre, tipo: c.u.tipo,
      d: Math.round(c.d), zona: zonaMarea(m.lat, m.lng),
      municipio: m.nombre, provincia: m.provincia,
    }
    audit.push({ slug: m.slug, ...map[m.slug] })
  }

  writeFileSync(OUT, JSON.stringify(map, null, 1) + '\n')
  const porZona = {}
  for (const v of Object.values(map)) porZona[v.zona] = (porZona[v.zona] ?? 0) + 1
  console.log(`\nmapeados: ${Object.keys(map).length} · sin ubicación a <${MAX_DIST_M / 1000} km: ${sinUbi}`)
  console.log('por zona:', porZona)
  const porTipo = {}
  for (const v of Object.values(map)) porTipo[v.tipo] = (porTipo[v.tipo] ?? 0) + 1
  console.log('por tipo de ubicación:', porTipo)

  console.log('\nlos 10 más lejanos (revisar a ojo):')
  for (const a of audit.sort((a, b) => b.d - a.d).slice(0, 10)) {
    console.log(` ${String(a.d).padStart(5)} m · ${a.municipio.slice(0, 24).padEnd(26)} → ${a.nombre.slice(0, 26).padEnd(28)} [${a.tipo}]`)
  }
  console.log('\ncontrol: los más buscados')
  for (const s of ['gijon', 'vigo', 'a-coruna', 'ferrol', 'santander', 'donostia-san-sebastian', 'cadiz', 'chiclana-de-la-frontera', 'isla-cristina', 'ribadeo']) {
    const v = map[s]
    console.log(`  ${s.padEnd(26)} ${v ? `→ ${v.nombre} [${v.tipo}] ${v.d} m` : 'SIN MAPEAR'}`)
  }
}
main()
