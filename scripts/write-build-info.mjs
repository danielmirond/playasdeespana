#!/usr/bin/env node
// scripts/write-build-info.mjs — genera src/lib/build-info.ts con la fecha
// REAL del build. Se ejecuta en prebuild (Vercel incluido).
//
// Por qué existe: en Vercel el clone es shallow (git log por-archivo falla)
// y los mtime del checkout están fijados a la época fake 2018-10-20 → el
// fallback por stat devolvía 2018 y Google fechaba TODO el sitio en 2018
// (snippet "20 oct 2018 —" en la home, lastmod 2018 en sitemaps).
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const iso = new Date().toISOString()
writeFileSync(resolve(ROOT, 'src/lib/build-info.ts'),
`// GENERADO por scripts/write-build-info.mjs en cada build. No editar.
export const BUILD_ISO = '${iso}'
`)
console.log('build-info:', iso)
