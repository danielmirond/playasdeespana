#!/usr/bin/env node
// scripts/build-ranking-2026.mjs — Ranking "Mejores playas de España 2026".
//
// La jugada de digital-PR de BeachAtlas (Golden Beach Award: 600+ menciones)
// pero DEFENDIBLE: 100 puntos repartidos en 4 ejes con datos objetivos que
// ya recogemos, metodología pública, cero votos de influencers. Se computa
// OFFLINE una vez al año → sidecar estable y citable por prensa (un ranking
// que baila cada hora no es noticiable).
//
// Metodología (100 pts):
//   ENTORNO (0-30):     espacio protegido +14 · aislada +8 (semiurbana +4)
//                       · vegetación +4 · ocupación baja +4 (media +2)
//   SERVICIOS (0-35):   socorrismo +12 · accesible PMR +6 · duchas +4 ·
//                       parking +4 · aseos +3 · zona infantil +2 ·
//                       limpieza +2 · autobús +2
//   DISTINTIVOS (0-25): Bandera Azul 2026 +18 · calidad EEA excelente +7 ·
//                       Bandera Negra (Ecologistas en Acción) −25
//   EXPERIENCIA (0-10): chiringuito ≤1 km +4 · webcam ≤2 km +2 ·
//                       spot surf/buceo +2 · hotel cerca (OSM) +2
//
// Uso: node scripts/build-ranking-2026.mjs
// Salida: src/data/ranking-2026.json

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/ranking-2026.json')

const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
  .filter(p => p?.slug && p.nombre && p.lat && p.lng)
const calidad = JSON.parse(readFileSync(resolve(ROOT, 'public/data/calidad-agua.json'), 'utf8'))
const chiringuitos = JSON.parse(readFileSync(resolve(ROOT, 'src/data/chiringuitos.json'), 'utf8'))
const webcams = JSON.parse(readFileSync(resolve(ROOT, 'src/data/webcams-espana.json'), 'utf8'))
const osm = JSON.parse(readFileSync(resolve(ROOT, 'public/data/osm-pois.json'), 'utf8'))

// Banderas negras: el archivo es .ts → extraemos slugs por regex.
const bnSrc = readFileSync(resolve(ROOT, 'src/data/banderas-negras-2026.ts'), 'utf8')
const negras = new Set([...bnSrc.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]))

const hav = (a, b, c, d) => {
  const R = 6371000, r = x => x * Math.PI / 180
  const dl = r(c - a), dn = r(d - b)
  const x = Math.sin(dl / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dn / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

// Pools para el eje EXPERIENCIA
const poolChiri = []
for (const prov of Object.values(chiringuitos))
  for (const c of prov.estudios)
    if (Number.isFinite(c.lat) && Number.isFinite(c.lng)) poolChiri.push([c.lat, c.lng])
const poolWebcam = webcams.map(w => [w.lat, w.lon])
const cercaDe = (pool, lat, lng, radioM) =>
  pool.some(([la, lo]) => Math.abs(la - lat) < 0.03 && Math.abs(lo - lng) < 0.04 && hav(lat, lng, la, lo) <= radioM)

function puntuar(p) {
  // ENTORNO (0-30)
  let entorno = 0
  if (p.espacio_protegido === true) entorno += 14
  const gu = String(p.grado_urbano ?? '').toLowerCase()
  if (gu.includes('aislada') || gu.includes('natural')) entorno += 8
  else if (gu.includes('semiurbana')) entorno += 4
  if (p.vegetacion === true) entorno += 4
  const go = String(p.grado_ocupacion ?? '').toLowerCase()
  if (go.startsWith('bajo')) entorno += 4
  else if (go.startsWith('medio')) entorno += 2

  // SERVICIOS (0-35)
  let servicios = 0
  if (p.socorrismo) servicios += 12
  if (p.accesible) servicios += 6
  if (p.duchas) servicios += 4
  if (p.parking) servicios += 4
  if (p.aseos) servicios += 3
  if (p.zona_infantil) servicios += 2
  if (p.limpieza) servicios += 2
  if (p.autobus) servicios += 2

  // DISTINTIVOS (−25 a 25)
  let distintivos = 0
  if (p.bandera) distintivos += 18
  const cal = calidad[p.slug]
  if (cal?.nivel === 'Excelente') distintivos += 7
  if (negras.has(p.slug)) distintivos -= 25

  // EXPERIENCIA (0-10)
  let experiencia = 0
  if (cercaDe(poolChiri, p.lat, p.lng, 1000)) experiencia += 4
  if (cercaDe(poolWebcam, p.lat, p.lng, 2000)) experiencia += 2
  const act = p.actividades ?? {}
  if (act.surf || act.buceo || act.snorkel || act.windsurf || (p.spots_surf?.length)) experiencia += 2
  const zona = osm.zonas[`${p.lat.toFixed(4)}:${p.lng.toFixed(4)}`]
  if (zona?.h?.length) experiencia += 2

  return { entorno, servicios, distintivos, experiencia, total: entorno + servicios + distintivos + experiencia }
}

function razones(p, ejes) {
  const r = []
  if (p.bandera) r.push('Bandera Azul 2026')
  if (p.espacio_protegido === true) r.push('espacio natural protegido')
  if (calidad[p.slug]?.nivel === 'Excelente') r.push('calidad del agua excelente (EEA)')
  if (p.socorrismo) r.push('socorrismo')
  if (p.accesible) r.push('accesible PMR')
  if (ejes.experiencia >= 6) r.push('chiringuitos y oferta a pie de playa')
  return r.slice(0, 4)
}

// 148 fichas traen comunidad "España" (bug de normalización del sync
// MITECO) — la derivamos de la provincia, que sí es fiable.
const COM_POR_PROV = {
  'Castellón': 'Comunitat Valenciana', 'Valencia': 'Comunitat Valenciana',
  'Alicante': 'Comunitat Valenciana',
}
const puntuadas = playas
  .map(p => {
    const ejes = puntuar(p)
    return {
      slug: p.slug, nombre: p.nombre, municipio: p.municipio,
      provincia: p.provincia,
      comunidad: p.comunidad === 'España' ? (COM_POR_PROV[p.provincia] ?? p.comunidad) : p.comunidad,
      score: ejes.total, ejes, razones: razones(p, ejes),
    }
  })
  // Orden determinista: score → Bandera Azul → socorrismo → alfabético
  .sort((a, b) => b.score - a.score
    || (b.razones.includes('Bandera Azul 2026') ? 1 : 0) - (a.razones.includes('Bandera Azul 2026') ? 1 : 0)
    || a.slug.localeCompare(b.slug))

// Límites de representatividad: máx. 3 por municipio y 8 por provincia.
// Sin ellos, las provincias con inventario MITECO más completo (Galicia
// rellena todos los campos; Cádiz apenas) coparían la lista por pura
// cobertura de datos — el primer borrador salía con 34 gallegas. El cap
// es estándar en rankings territoriales y mantiene la narrativa nacional.
const porMunicipio = {}
const porProvincia = {}
const top100 = []
for (const p of puntuadas) {
  const km = `${p.municipio}|${p.provincia}`
  if ((porMunicipio[km] ?? 0) >= 3) continue
  if ((porProvincia[p.provincia] ?? 0) >= 8) continue
  porMunicipio[km] = (porMunicipio[km] ?? 0) + 1
  porProvincia[p.provincia] = (porProvincia[p.provincia] ?? 0) + 1
  top100.push({ ...p, pos: top100.length + 1 })
  if (top100.length === 100) break
}

// Top 5 por provincia (del ranking completo, sin límite municipal)
const provincias = {}
for (const p of puntuadas) {
  if (!p.provincia) continue
  ;(provincias[p.provincia] ??= [])
  if (provincias[p.provincia].length < 5) provincias[p.provincia].push({
    slug: p.slug, nombre: p.nombre, municipio: p.municipio, score: p.score,
  })
}

writeFileSync(OUT, JSON.stringify({
  temporada: 2026,
  generado: '2026-07-26',
  pesos: {
    entorno: 30, servicios: 35, distintivos: 25, experiencia: 10,
    nota: 'Bandera Negra de Ecologistas en Acción resta 25 puntos',
  },
  top100,
  provincias,
}, null, 1) + '\n')

console.log(`playas evaluadas: ${puntuadas.length}`)
console.log(`TOP 10:`)
for (const p of top100.slice(0, 10))
  console.log(` ${String(p.pos).padStart(3)}. ${p.nombre} (${p.municipio}, ${p.provincia}) · ${p.score} pts [${p.ejes.entorno}/${p.ejes.servicios}/${p.ejes.distintivos}/${p.ejes.experiencia}]`)
console.log(`provincias con top: ${Object.keys(provincias).length}`)
