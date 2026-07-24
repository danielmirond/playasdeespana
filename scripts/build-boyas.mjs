#!/usr/bin/env node
// scripts/build-boyas.mjs — Sidecar de boyas de Puertos del Estado (Portus).
//
// API descubierta (jul-2026, no documentada oficialmente):
//   GET  /portussvr/api/estaciones/rt/WAVE?locale=es       → 121 estaciones
//   POST /portussvr/api/parametros/{id}?locale=es ["WAVE"] → parámetros
//   POST /portussvr/api/RTData/station/{id}?locale=es [13,17,34,20,38]
//        → series horarias; valor real = valor / factor
// IDs de parámetro GLOBALES (verificado en redcos/redext/redcam):
//   13 hm0 (altura signif.) · 17 hmax · 34 tp (periodo pico) ·
//   20 dmd (dirección) · 38 ts (temperatura agua)
//
// Este script solo materializa la LISTA de boyas (id, nombre, coords, red)
// en src/data/boyas.json. Los datos en vivo los pide runtime (src/lib/
// boyas.ts) con cache KV 30 min.
//
// Uso: node scripts/build-boyas.mjs

import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/boyas.json')

const res = await fetch('https://portus.puertos.es/portussvr/api/estaciones/rt/WAVE?locale=es')
const estaciones = await res.json()

// Candidatas: fuera las no disponibles y los puntos virtuales de
// propagación de modelo (no son boyas físicas). El flag `boya` solo marca
// las propias de Puertos del Estado; las de terceros (SOCIB, CETMAR…)
// también sirven si emiten datos.
const candidatas = estaciones.filter(e =>
  e.disponible !== false && !/propagaci|adcp/i.test(e.nombre))

// Prueba de vida: nos quedamos solo las que devuelven hm0 en las últimas
// 6 horas. Así el runtime nunca apunta a una boya muerta/en mantenimiento.
const AHORA = Date.now()
const boyas = []
for (const e of candidatas) {
  try {
    const r = await fetch(
      `https://portus.puertos.es/portussvr/api/RTData/station/${e.id}?locale=es`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '[13,38]' })
    if (!r.ok) continue
    const rows = await r.json()
    const ult = rows?.[0]
    if (!ult?.datos?.length) continue
    const edadH = (AHORA - new Date(ult.fecha.replace(' ', 'T') + 'Z').getTime()) / 3.6e6
    if (edadH > 6) continue
    const tieneHm0 = ult.datos.some(d => d.id === 13 && d.valor != null)
    if (!tieneHm0) continue
    boyas.push({
      id: e.id,
      n: e.nombre.replace(/^Boya (?:de |d')?|^Boya Costera /i, ''),
      la: +e.latitud.toFixed(4),
      lo: +e.longitud.toFixed(4),
      red: e.red?.tipoRed ?? '',
      t: ult.datos.some(d => d.id === 38 && d.valor != null),  // ¿mide temperatura?
    })
    process.stdout.write('.')
  } catch { /* siguiente */ }
}
console.log()

writeFileSync(OUT, JSON.stringify(boyas, null, 1) + '\n')
console.log(`boyas vivas: ${boyas.length}/${candidatas.length} candidatas → ${OUT}`)
for (const b of boyas.slice(0, 8)) console.log(' ', b.id, b.n, `(${b.red}${b.t ? ', temp' : ''})`)
