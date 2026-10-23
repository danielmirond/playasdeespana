#!/usr/bin/env node
// scripts/build-nombres-especies.mjs — nombre común en español de cada
// especie, desde WoRMS (marinespecies.org), que es la misma espina
// taxonómica que usa OBIS.
//
// POR QUÉ NO SE ESCRIBEN A MANO. «Thalassoma pavo» no le dice nada a
// nadie, pero ponerle un nombre de memoria es inventar un dato con
// apariencia de oficial, que es justo lo que este proyecto lleva meses
// quitando. WoRMS lo publica o no lo publica; cuando no, la ficha enseña
// solo el nombre científico en cursiva y no pasa nada.
//
// Uso: node scripts/build-nombres-especies.mjs
// Salida: src/data/nombres-especies.json  { "Mullus surmuletus": "salmonete de roca" }

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/nombres-especies.json')
const API = 'https://www.marinespecies.org/rest'

const vida = JSON.parse(readFileSync(resolve(ROOT, 'public/data/vida-marina.json'), 'utf8'))
const especies = [...new Set(Object.values(vida).flatMap(m => m.especies.map(e => e.n)))].sort()
console.log(`especies a resolver: ${especies.length}`)

let previo = {}
try { previo = JSON.parse(readFileSync(OUT, 'utf8')) } catch {}

const out = { ...previo }
let con = 0, sin = 0, i = 0
for (const sp of especies) {
  i++
  if (sp in out) { out[sp] ? con++ : sin++; continue }
  try {
    const idR = await fetch(`${API}/AphiaIDByName/${encodeURIComponent(sp)}?marine_only=true`, { signal: AbortSignal.timeout(30000) })
    const id = (await idR.text()).trim()
    if (!id || id === '-999' || Number.isNaN(Number(id))) { out[sp] = null; sin++; continue }
    const vR = await fetch(`${API}/AphiaVernacularsByAphiaID/${id}`, { signal: AbortSignal.timeout(30000) })
    if (vR.status !== 200) { out[sp] = null; sin++; continue }
    const v = await vR.json()
    // Se queda el primero en español. WoRMS da varios ('mero', 'garopa',
    // 'chernia marrón'): el primero es el de uso más extendido.
    const es = (v ?? []).find(x => x.language_code === 'spa')?.vernacular ?? null
    out[sp] = es
    es ? con++ : sin++
  } catch { out[sp] = null; sin++ }
  if (i % 50 === 0) console.log(`  ${i}/${especies.length} · con nombre: ${con}`)
  await new Promise(r => setTimeout(r, 180))
}

const ord = Object.fromEntries(Object.keys(out).sort().map(k => [k, out[k]]))
writeFileSync(OUT, JSON.stringify(ord, null, 1) + '\n')
console.log(`\ncon nombre español: ${con} · sin él: ${sin} (${(100 * con / (con + sin)).toFixed(0)}% resuelto)`)
console.log(`→ ${OUT}`)
