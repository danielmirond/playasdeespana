#!/usr/bin/env node
// Falla si vuelve a aparecer `color + 'AA'` — alfa hexadecimal pegado al
// final de un color.
//
// Existe porque el fallo no se ve. Con un hex el patrón funciona, así que
// nadie lo revisa; en cuanto el color pasa a ser var(--x), produce
// `var(--x)55`, que es CSS inválido y el navegador descarta en silencio.
// El borde no da error: desaparece. Se coló dos veces en la misma rama —
// la segunda ya con los tokens puestos, dejando sin borde las filas de
// estado de provincia, municipio y comunidad, en español y en inglés.
//
// La alternativa correcta es lib/tinte, que mezcla con color-mix y por
// tanto acepta hex, var() o currentColor indistintamente.

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

function recorrer(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...recorrer(p))
    else if (/\.tsx?$/.test(e.name)) out.push(p)
  }
  return out
}

const PATRONES = [
  // expr + 'AA'
  /[A-Za-z_$][\w.$?[\]]*\s*\+\s*['"][0-9a-fA-F]{2}['"]/g,
  // `${expr}AA` dentro de un template
  /\$\{[^{}]+\}[0-9a-fA-F]{2}(?![0-9a-fA-F])/g,
]

const archivos = recorrer('src').filter(f => !f.endsWith('lib/tinte.ts'))

let fallos = 0
for (const f of archivos) {
  const texto = readFileSync(f, 'utf8')
  texto.split('\n').forEach((linea, i) => {
    for (const p of PATRONES) {
      p.lastIndex = 0
      const m = p.exec(linea)
      // solo interesa si la línea habla de color; `${n}12 km/h` no es esto
      if (m && /color|background|border|shadow|fill|stroke|solid|dashed|\.dot\b|\.bg\b/i.test(linea)) {
        console.error(`${f}:${i + 1}  ${m[0].trim()}`)
        console.error(`   → usa tinte() de lib/tinte en vez de pegar el alfa\n`)
        fallos++
      }
    }
  })
}

if (fallos) {
  console.error(`${fallos} color${fallos > 1 ? 'es' : ''} con alfa pegado. Ver lib/tinte.`)
  process.exit(1)
}
console.log('Sin alfa hexadecimal pegado a colores.')
