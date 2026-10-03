#!/usr/bin/env node
// scripts/aplicar-resumenes-revisados.mjs — mete en el sidecar los resúmenes
// que han escrito los revisores, y solo los que pasan el filtro de aquí.
//
// POR QUÉ EXISTE. El reescritor con modelo local publicó 1.018 resúmenes y
// una revisión a fondo tuvo que retirar 313: textos impecables que decían
// cosas falsas. Lo que entra ahora pasa dos puertas. La primera es el
// escritor, al que se le permite negarse cuando la fuente no sirve. La
// segunda es esta: las mismas comprobaciones duras que el auditor, sobre
// cada texto nuevo, antes de que llegue a la web.
//
// NO ES CONFIANZA, ES ADUANA. Que el texto venga de un revisor cuidadoso no
// le da pase. Si trae una cifra que no está en la fuente, se queda fuera
// igual que si lo hubiera escrito la máquina de antes.
//
//   node scripts/aplicar-resumenes-revisados.mjs <carpeta>          # informe
//   node scripts/aplicar-resumenes-revisados.mjs <carpeta> --aplicar
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FILE = resolve(ROOT, 'public/data/municipio-pois.json')
const carpeta = process.argv[2]
const aplicar = process.argv.includes('--aplicar')
if (!carpeta) { console.error('Falta la carpeta con los ficheros escrito-N.json'); process.exit(1) }

const norm = s => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const plano = s => norm(s).replace(/[^a-z0-9ñ]+/g, ' ').trim()

// ——— Las mismas puertas que el auditor ————————————————————————
const FOLLETO = /\b(lugar ideal|no te pierdas|sin duda|joya|rinc[óo]n|enclave|emblem[áa]tic|imprescindible|espectacular|vale la pena|invita a|aguas cristalinas|arena fina|vistas panor[áa]micas|se trata de|cabe destacar)\b/i
// Ojo con \b y los acentos: en JavaScript «é» no es carácter de palabra, así
// que /\bés\b/ casaba dentro de «después» y marcaba como catalán medio
// corpus. Van lookarounds con la clase de letras escrita a mano.
const L = '[a-zA-ZáéíóúàèòïüñçÁÉÍÓÚÀÈÒÏÜÑÇ]'
const NO_CASTELLANO = new RegExp(
  `(?<!${L})(és|amb|aquest|aquesta|dels|seva|seu|només|també|fins|guaita|edifici|igrexa|esglesia|situat|situada|segle|muntanya|poble|dende|unha|outro|onde|tamén|moi)(?!${L})`, 'i')
// «Platja», «Praia», «Cap» y «Parc» se quedan fuera de la lista: casi siempre
// forman parte de un topónimo, que va tal cual por indicación expresa.
const EPOCAS = [
  [/celt|celtib/i, /celt/i], [/roman[oa]s?\b/i, /rom[aà]n|roman/i],
  [/medieval/i, /medieval|edad media|edat mitjana|idade media|middle age/i],
  [/[áa]rabe|musulm|andalus/i, /[áa]rab|musulm|andalus|moor|islam/i],
  [/g[óo]tic/i, /g[òóo]tic|gothic/i], [/rom[áa]nic/i, /rom[àáa]nic|romanesque/i],
  [/barroc/i, /barroc|baroque/i], [/modernis/i, /modernis/i],
  [/neocl[áa]sic/i, /neocl[àáa]s|neoclass/i], [/renacent/i, /renaix|renacent|renaissance/i],
  [/visigod/i, /visigod|visigot|visigoth/i], [/nazar[íi]/i, /nazar[íi]|nasr/i],
  [/prehist|neol[íi]t|megal[íi]t|talai[óo]t/i, /prehist|neol[íi]t|megal[íi]t|talai[òóo]t/i],
  [/ib[ée]ric/i, /ib[èéе]ric|iber/i], [/fenici/i, /fenici|phoenic/i],
]
// Lo que NO cuenta como nombre propio inventado: artículos, genéricos y, sobre
// todo, el vocabulario institucional, que la fuente trae en otro idioma y el
// texto traduce. «Bien de Interés Cultural» venía de «bé cultural d'interès».
const COMUNES = new Set(('el la los las un una de del en y o a al su sus se es por para con sin sobre entre desde hasta durante tras esta este estos estas ese esa fue son era eran hay tiene ' +
  'siglo edad media norte sur este oeste mar playa museo iglesia castillo torre parque faro mirador casa plaza puerto monte rio isla punta cala ' +
  'santa santo san sant nuestra senora virgen cristo jesucristo dios europa africa espana peninsula iberica mediterraneo atlantico cantabrico ' +
  'bien bienes interes cultural nacional monumento historico artistico patrimonio humanidad estado gobierno ayuntamiento diputacion ministerio ' +
  'unesco guerra civil republica reconquista corona reino condado concejo parroquia ' +
  'ii iii iv vi vii viii ix xi xii xiii xiv xv xvi xvii xviii xix xx xxi').split(' '))

/** Latinismos y grafías cruzadas entre idiomas: Bética/Baetica, Filipo/Philipo. */
const latiniza = s => s.replace(/ae/g, 'e').replace(/ph/g, 'f').replace(/th/g, 't').replace(/ll/g, 'l').replace(/ç/g, 'c')

function porQueNoEntra(r, fuente, nombre) {
  if (typeof r !== 'string' || !r.trim()) return 'vacío'
  if (r.length < 40 || r.length > 320) return `longitud ${r.length}`
  if ((r.match(/[.!?](\s|$)/g) ?? []).length > 3) return 'más de tres frases'
  if (/[«»"""]|\n|\/no\b|\/noindex|^\s*[-*]/.test(r)) return 'caracteres o marcadores raros'
  if (FOLLETO.test(r)) return 'lenguaje de folleto'
  if (NO_CASTELLANO.test(r)) return 'mezcla de idiomas'
  if (norm(r).startsWith(norm(nombre).slice(0, 12))) return 'empieza por el nombre del sitio'
  // «su término municipal» o «el municipio» en genérico están bien; lo que no
  // vale es decir el nombre, que ya está en el titular de la página.
  if (/\b(municipio|t[ée]rmino municipal|provincia) de [A-ZÁÉÍÓÚÑ]/.test(r)) return 'nombra el municipio'

  const f = fuente, fp = plano(fuente)
  // 5.000 y 5000 son la misma cifra; la fuente puede escribirla de otra forma.
  const fSoloCifras = f.replace(/[.,\s](?=\d{3}\b)/g, '')
  for (const c of r.match(/\d[\d.,]*\d|\d/g) ?? []) {
    const limpia = c.replace(/[.,](?=\d{3}\b)/g, '')
    if (!f.includes(c) && !fSoloCifras.includes(limpia)) return `cifra ${c} que no está en la fuente`
  }
  for (const [sal, ent] of EPOCAS) if (sal.test(r) && !ent.test(f)) return `época (${sal.source.slice(0, 12)}) que no está en la fuente`
  for (const m of r.matchAll(/\bsiglo\s+([IVXLCDM]+)/gi))
    if (!new RegExp(`(siglo|segle|s[ée]culo|century|s\\.?)\\s*${m[1].toLowerCase()}\\b`, 'i').test(norm(f)))
      return `siglo ${m[1]} que no está en la fuente`
  // nombres propios: los que abren frase no cuentan
  for (const m of r.replace(/(^|[.!?]\s+)(\S+)/g, '$1').matchAll(/\b([A-ZÁÉÍÓÚÑÜ][\wáéíóúñü'’-]{2,})/g)) {
    const p = plano(m[1])
    if (!p || COMUNES.has(p)) continue
    const raiz = p.slice(0, Math.max(4, p.length - 2))
    if (!fp.includes(raiz) && !latiniza(fp).includes(latiniza(raiz))) return `nombre propio «${m[1]}» que no está en la fuente`
  }
  // frase repetida
  const fr = r.split(/(?<=[.!?])\s+/).map(plano).filter(x => x.length > 8)
  for (let i = 0; i < fr.length; i++) for (let j = i + 1; j < fr.length; j++)
    if (fr[i] === fr[j] || (fr[i].length > 14 && fr[j].includes(fr[i]))) return 'repite la misma frase'
  return null
}

// ——— Recoger lo escrito ——————————————————————————————————————
const escritos = new Map()
for (const f of readdirSync(carpeta).filter(x => /^escrito-\d+\.json$/.test(x))) {
  for (const e of JSON.parse(readFileSync(join(carpeta, f), 'utf8'))) {
    if (!e?.id) continue
    if (escritos.has(e.id) && escritos.get(e.id).resumen && !e.resumen) continue
    escritos.set(e.id, e)
  }
}
console.log(`Ficheros leídos: ${readdirSync(carpeta).filter(x => /^escrito-\d+\.json$/.test(x)).length}`)
console.log(`Entradas con veredicto del escritor: ${escritos.size}`)

const data = JSON.parse(readFileSync(FILE, 'utf8'))
let entran = 0, seNiega = 0, rechazados = 0, noEstaba = 0
const porQue = {}
const muestra = []

for (const [slug, m] of Object.entries(data))
  for (const p of [...Object.values(m.pois).flat(), ...(m.alrededores ?? [])]) {
    const e = escritos.get(`${slug}|${p.n}`)
    if (!e) continue
    if (p.r) { noEstaba++; continue }           // alguien lo rellenó entretanto: no se pisa
    if (!e.resumen) { seNiega++; continue }     // el escritor dijo que no
    const pega = porQueNoEntra(e.resumen, p.e?.t ?? '', p.n)
    if (pega) {
      rechazados++
      porQue[pega.replace(/«[^»]*»/, '«…»').replace(/\d+/g, 'N')] = (porQue[pega.replace(/«[^»]*»/, '«…»').replace(/\d+/g, 'N')] ?? 0) + 1
      if (muestra.length < 8) muestra.push(`[${slug}] ${p.n}\n    ${pega}\n    «${e.resumen}»`)
      continue
    }
    if (aplicar) p.r = e.resumen
    entran++
  }

console.log(`\n  entran:              ${entran}`)
console.log(`  el escritor se negó: ${seNiega}`)
console.log(`  los para la aduana:  ${rechazados}`)
if (noEstaba) console.log(`  ya tenían resumen:   ${noEstaba}`)
if (rechazados) {
  console.log('\nPor qué los para la aduana:')
  for (const [k, n] of Object.entries(porQue).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${k}`)
  console.log('\nMuestra:\n  ' + muestra.join('\n  '))
}

if (aplicar) {
  writeFileSync(FILE, JSON.stringify(data))
  console.log(`\n${entran} resúmenes publicados.`)
} else {
  console.log('\n(informe: no se ha escrito nada. Añade --aplicar)')
}
