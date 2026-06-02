#!/usr/bin/env node
// scripts/validate-medusas.mjs
//
// Valida el modelo de riesgo de medusas (src/lib/seguridad.ts → estimarMedusas)
// contra avistamientos OBSERVADOS de meduseo.com, y acumula un log histórico
// para recalibrar con muestra grande a final de temporada.
//
// Fuente verdad-terreno: meduseo.com
//   - Índice de ciudades ES:  /es/pais/espana-2  (links /es/ciudad/{slug}-{id})
//   - Cada ciudad embebe en su HTML: beaches = [{id,name,lat,lon,load,...}]
//     load = intensidad observada (null = sin reporte, NO "sin medusas").
//   - API en vivo:  /es/api/map-data/location/{cityId} → { beachLoads:[{id,load}] }
//
// Modelo: réplica EXACTA de estimarMedusas (mantener en sync si cambia seguridad.ts).
// Meteo: Open-Meteo (gratis, sin key) — SST marina + viento en cada coordenada.
//
// Uso:
//   node scripts/validate-medusas.mjs            # corre validación, imprime tabla
//   node scripts/validate-medusas.mjs --append   # además añade fila al log JSONL
//
// El log (scripts/data/medusas-validation-log.jsonl) acumula 1 registro por
// playa observada y fecha. En agosto: analizar correlación load↔score y reajustar.

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOG = path.join(__dirname, 'data', 'medusas-validation-log.jsonl')
const APPEND = process.argv.includes('--append')
const UA = 'Mozilla/5.0 (compatible; playas-espana-validator/1.0)'

// ─── Réplica del modelo (sync con src/lib/seguridad.ts) ───────────────
const DIR = { N:0,NNE:22.5,NE:45,ENE:67.5,E:90,ESE:112.5,SE:135,SSE:157.5,S:180,SSW:202.5,SW:225,WSW:247.5,W:270,WNW:292.5,NW:315,NNW:337.5 }
function rumboAlMar(lat, lng) {
  if (lat < 29.5) return 200
  if (lat >= 43.0) return 0
  if (lng <= -8.0 && lat >= 41.6) return 270
  if (lng <= -5.9 && lat < 37.4) return 215
  if (lat < 37.4) return 180
  if (lng > 1.0 && lat >= 38.5 && lat <= 40.2) return 150
  return 115
}
const dif = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d }
const deg2dir = d => ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(d / 22.5) % 16]

function estimarMedusas(lat, lng, agua, viento, vd, mes) {
  const esCan = lat < 29.5
  const esMed = !esCan && ((lat < 37.4 && lng > -5.9) || (lng > -1) || (lng > 1 && lat > 38.5))
  const esVer = mes >= 6 && mes <= 9
  const sea = rumboAlMar(lat, lng)
  const dd = DIR[(vd || '').toUpperCase()] ?? null
  const cd = dd == null ? 0.3 : Math.max(0, Math.cos(dif(dd, sea) * Math.PI / 180))
  const onF = cd * Math.min(1, viento / 25)
  let s = 0
  if (agua >= 25) s += 4; else if (agua >= 23) s += 3; else if (agua >= 21) s += 2
  else if (agua >= 19) s += 1; else if (agua < 17) s -= 1
  const tpl = agua >= 20
  if (esMed) s += 1
  if (esVer && tpl) s += 1
  if (tpl) s += Math.round(2 * onF)
  return { nivel: s >= 6 ? 'alto' : s >= 4 ? 'medio' : 'bajo', score: s, onF: +onF.toFixed(2) }
}

// ─── Fuentes ───────────────────────────────────────────────────────────
async function spainCityIds() {
  const html = await fetch('https://meduseo.com/es/pais/espana-2', { headers: { 'User-Agent': UA } }).then(r => r.text())
  const slugs = [...new Set((html.match(/\/es\/ciudad\/[A-Za-z0-9%-]+-[0-9]+/g) || []))]
  return slugs.map(s => ({ slug: s.replace('/es/ciudad/', ''), id: s.match(/[0-9]+$/)[0] }))
}
async function observedBeaches(citySlug) {
  const html = await fetch(`https://meduseo.com/es/ciudad/${citySlug}`, { headers: { 'User-Agent': UA } }).then(r => r.text())
  const m = html.match(/beaches\s*=\s*(\[.*?\]);/s)
  if (!m) return []
  let arr; try { arr = JSON.parse(m[1]) } catch { return [] }
  return arr.filter(b => b.load != null).map(b => ({ id: b.id, name: b.name, lat: b.lat, lon: b.lon, load: b.load }))
}
async function meteo(lat, lng) {
  const wx = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=wind_speed_10m,wind_direction_10m&timezone=auto`
  const mar = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&current=sea_surface_temperature&timezone=auto`
  const [w, m] = await Promise.all([fetch(wx).then(r => r.json()), fetch(mar).then(r => r.json())])
  return { ws: w.current?.wind_speed_10m, wd: w.current?.wind_direction_10m, sst: m.current?.sea_surface_temperature }
}

const obsLabel = load => load >= 50 ? 'alto' : load >= 10 ? 'medio' : 'bajo'
const ORDER = { bajo: 0, medio: 1, alto: 2 }

async function main() {
  const stamp = new Date().toISOString().slice(0, 10)
  const month = Number(stamp.slice(5, 7))
  const cities = await spainCityIds()
  const rows = []
  for (const c of cities) {
    const beaches = await observedBeaches(c.slug)
    for (const b of beaches) {
      let mt; try { mt = await meteo(b.lat, b.lon) } catch { continue }
      const vd = mt.wd != null ? deg2dir(mt.wd) : null
      const r = estimarMedusas(b.lat, b.lon, mt.sst ?? 18, mt.ws ?? 0, vd, month)
      const obs = obsLabel(b.load)
      rows.push({
        date: stamp, city: c.slug.split('-')[0], beach: b.name, lat: b.lat, lon: b.lon,
        load: b.load, obs, sst: mt.sst, wind: mt.ws, windDir: vd,
        model: r.nivel, score: r.score, onF: r.onF,
        near: Math.abs(ORDER[r.nivel] - ORDER[obs]) <= 1,
        exact: r.nivel === obs,
      })
    }
  }

  // Tabla
  console.log(`Validación modelo medusas — ${stamp} (n=${rows.length} playas con reporte)`)
  console.log('PLAYA'.padEnd(30), 'load', 'obs'.padEnd(6), 'modelo'.padEnd(7), 'sst  viento')
  console.log('-'.repeat(78))
  for (const r of rows) {
    console.log(
      `${r.city}/${r.beach}`.slice(0, 29).padEnd(30),
      String(r.load).padStart(4),
      r.obs.padEnd(6), r.model.padEnd(7),
      `${r.sst}  ${Math.round(r.wind || 0)}${r.windDir || ''}`,
      r.exact ? '✓✓' : r.near ? '✓' : '✗'
    )
  }
  const near = rows.filter(r => r.near).length, exact = rows.filter(r => r.exact).length
  console.log('-'.repeat(78))
  console.log(`exacto: ${exact}/${rows.length} · ±1 nivel: ${near}/${rows.length}`)

  if (APPEND && rows.length) {
    fs.mkdirSync(path.dirname(LOG), { recursive: true })
    fs.appendFileSync(LOG, rows.map(r => JSON.stringify(r)).join('\n') + '\n')
    console.log(`\n+${rows.length} filas → ${path.relative(process.cwd(), LOG)}`)
  } else if (!APPEND) {
    console.log('\n(dry-run: usa --append para acumular en el log histórico)')
  }
}
main().catch(e => { console.error(e); process.exit(1) })
