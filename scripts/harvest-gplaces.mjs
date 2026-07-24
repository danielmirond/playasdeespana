#!/usr/bin/env node
// scripts/harvest-gplaces.mjs — COSECHA de emergencia de la caché pagada de
// Google Places (jul-2026, cargo de 231 €). Recorre todas las playas y pide
// a /api/admin/gplaces-dump (solo-lectura kvPeek) lo que haya en la caché KV
// de producción. Lo consolida en src/data/gplaces-sidecar.json, que pasa a
// ser fuente PERMANENTE prioritaria: los datos ya pagados no caducan con el
// TTL de 30 días ni dependen de volver a llamar a Google.
//
// Cero coste: el endpoint no computa nada. Cero riesgo: la key ya no está
// en Vercel.
//
// Uso:  CRON_SECRET=xxx node scripts/harvest-gplaces.mjs [--base=https://playas-espana.com]

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/gplaces-sidecar.json')
const BASE = process.argv.find(a => a.startsWith('--base='))?.slice(7) ?? 'https://playas-espana.com'
const SECRET = process.env.CRON_SECRET ?? ''
const CONCURRENCY = 16

const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
  .filter(p => p?.slug && p.lat && p.lng)

// Reanudable: conserva lo ya cosechado en ejecuciones anteriores.
const out = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}

let done = 0, hits = 0, errores = 0

async function harvest(p) {
  const la = p.lat.toFixed(4), lo = p.lng.toFixed(4)
  const kBase = `${la}:${lo}`
  if (out[`restaurant:${kBase}`] !== undefined) { done++; return } // ya cosechada
  try {
    const res = await fetch(`${BASE}/api/admin/gplaces-dump?lat=${p.lat}&lng=${p.lng}`, {
      headers: SECRET ? { Authorization: `Bearer ${SECRET}` } : {},
    })
    if (!res.ok) { errores++; done++; return }
    const d = await res.json()
    // Guardamos también los null (marca "no había caché") para reanudar sin repetir.
    out[`restaurant:${kBase}`] = d.restaurantes ?? null
    out[`lodging:${kBase}`] = d.hoteles ?? null
    out[`buceo:${kBase}`] = d.buceo ?? null
    out[`escuelas:${kBase}`] = d.escuelas ?? null
    if (d.restaurantes || d.hoteles || d.buceo || d.escuelas) hits++
  } catch { errores++ }
  done++
  if (done % 250 === 0) {
    writeFileSync(OUT, JSON.stringify(out))
    console.log(`${done}/${playas.length} · zonas con datos: ${hits} · errores: ${errores}`)
  }
}

async function main() {
  console.log(`Cosechando ${playas.length} playas desde ${BASE} (concurrencia ${CONCURRENCY})…`)
  const queue = [...playas]
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const p = queue.shift()
      if (p) await harvest(p)
    }
  })
  await Promise.all(workers)
  // Compactar: fuera los null antes del guardado final (el sidecar de
  // runtime solo necesita las zonas con datos; los null eran para reanudar).
  const compact = {}
  let entradas = 0
  for (const [k, v] of Object.entries(out)) {
    if (Array.isArray(v) && v.length) { compact[k] = v; entradas++ }
  }
  writeFileSync(OUT, JSON.stringify(compact, null, 1) + '\n')
  console.log(`\nFIN: ${done} playas · ${entradas} entradas con datos · errores ${errores}`)
  console.log(`Sidecar: ${OUT}`)
}

main()
