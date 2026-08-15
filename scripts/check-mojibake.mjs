#!/usr/bin/env node
// scripts/check-mojibake.mjs — que un byte roto no cree una provincia.
//
// Un solo registro del dataset traía `provincia: 'A Coru��a'`:
// el carácter de reemplazo que aparece cuando se lee UTF-8 como si fuera
// otra codificación. Es un fallo silencioso y caro:
//
//   toSlug('A Coruña')      → 'a-coruna'
//   toSlug('A Coru�a') → 'a-corua'   ← los � se caen al filtrar
//
// Con eso nació una provincia fantasma, /provincia/a-corua, con una sola
// playa dentro, su hueco en el sitemap y esa playa ausente de la página
// buena de A Coruña. Una auditoría externa lo vio en el sitemap; el
// carácter roto no se ve leyendo la web.
//
// El dataset se regenera con scripts/sync-playas, así que reparar el
// JSON a mano no basta: el próximo sync podría volver a traerlo. Esto
// corre en prebuild y rompe la build si reaparece, igual que
// check-color-concat.mjs vigila las concatenaciones de color.

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CAMPOS = ['nombre', 'municipio', 'provincia', 'comunidad']

const datos = JSON.parse(await readFile(resolve(ROOT, 'public/data/playas.json'), 'utf8'))

const rotos = []
for (const p of datos) {
  for (const campo of CAMPOS) {
    const v = p?.[campo]
    if (typeof v === 'string' && v.includes('�')) {
      rotos.push(`${p.slug ?? '(sin slug)'} · ${campo} = ${JSON.stringify(v)}`)
    }
  }
}

if (rotos.length > 0) {
  console.error('\n✖ Texto con codificación rota en public/data/playas.json\n')
  for (const r of rotos) console.error(`   ${r}`)
  console.error(`\n  ${rotos.length} campo(s) con el carácter de reemplazo (U+FFFD).`)
  console.error('  Un nombre roto genera un slug distinto y con él una página duplicada.')
  console.error('  Repara el origen en scripts/sync-playas, no solo el JSON.\n')
  process.exit(1)
}

console.log(`✓ sin mojibake en ${datos.length} registros`)
