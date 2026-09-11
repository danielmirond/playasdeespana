#!/usr/bin/env node
// scripts/geo-pais-frontera.mjs — País real de las fichas de zona fronteriza.
//
// `extract-extranjeras.mjs` decide por provincia y por reglas de coordenadas,
// y las reglas fallan justo donde la frontera es un río: Monte Gordo, Altura
// y Manta Rota (Algarve, entre −7,6 y el Guadiana) salían como Huelva;
// Moledo, Vila Praia de Âncora y Vilar de Mouros (sur del Miño) como
// Pontevedra; Hendaye como Gipuzkoa. Mover un umbral a ojo se equivoca en las
// desembocaduras, que es donde están las playas.
//
// Aquí se pregunta el país a OpenStreetMap (Nominatim, geocodificación
// inversa) SOLO para las fichas de las cuatro zonas de frontera, y se guarda
// el resultado en el repo. El generador lee esta caché; no hay llamadas en
// producción. Política de uso de Nominatim: 1 petición por segundo y
// User-Agent identificable, y se reutiliza lo ya consultado.
//
// Uso: node scripts/geo-pais-frontera.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/pais-frontera.json')

const ZONAS = [
  (la, lo) => la < 37.6 && lo > -7.70 && lo < -7.25,   // Guadiana
  (la, lo) => la > 41.65 && la < 42.20 && lo < -8.45,  // Miño
  (la, lo) => la > 43.30 && lo > -1.85 && lo < -1.60,  // Bidasoa
  (la, lo) => la > 42.38 && lo > 3.0,                  // Pirineo mediterráneo
]

const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
const cache = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
const pend = playas.filter(p => p?.slug && Number.isFinite(p.lat) && Number.isFinite(p.lng)
  && ZONAS.some(z => z(p.lat, p.lng)) && !(p.slug in cache))

console.log(`fichas en zona de frontera sin consultar: ${pend.length}`)
const espera = ms => new Promise(r => setTimeout(r, ms))
let n = 0
for (const p of pend) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=10&lat=${p.lat}&lon=${p.lng}`
    const res = await fetch(url, { headers: { 'User-Agent': 'playas-espana.com (+https://playas-espana.com) verificacion-frontera', 'Accept-Language': 'es' } })
    const j = res.ok ? await res.json() : null
    cache[p.slug] = j?.address?.country_code ?? null
  } catch { cache[p.slug] = null }
  if (++n % 25 === 0) console.log(`  ${n}/${pend.length}`)
  await espera(1100)
}
writeFileSync(OUT, JSON.stringify(Object.fromEntries(Object.entries(cache).sort()), null, 1) + '\n')
const c = Object.values(cache).reduce((a, v) => (a[v ?? 'sin dato'] = (a[v ?? 'sin dato'] ?? 0) + 1, a), {})
console.log('países:', c)
