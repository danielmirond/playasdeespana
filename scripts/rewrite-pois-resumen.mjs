#!/usr/bin/env node
// scripts/rewrite-pois-resumen.mjs — el resumen de cada sitio, con voz propia.
//
// PARA QUÉ. Cada sitio de /que-hacer tiene, si su artículo existe, el
// extracto crudo de Wikipedia (clave `e`, ver resolve-pois-extractos.mjs).
// No se publica tal cual: es CC BY-SA y suena a enciclopedia. Aquí se
// reescribe en dos frases con la voz del sitio —«rigor de datos contado como
// un local con buena pluma»— y se guarda en `r`.
//
// CONTRA UN MODELO LOCAL (Ollama, qwen3). Sin API de pago y sin mandar nada
// fuera: 632 sitios en una tarde en el portátil. El coste es cero y el
// precio es que hay que vigilar la salida, así que el prompt es estrecho y
// la validación estricta: se descarta lo que se pase de largo, meta cifras
// que no estaban en el extracto o se salga del formato. Con `r` vacío la
// página no pinta resumen, y eso es mejor que uno malo.
//
// LO QUE NO PUEDE HACER EL MODELO: añadir datos. Solo reordena y recorta lo
// que dice el extracto. Cualquier número del resumen tiene que estar en el
// extracto, y se comprueba.
//
//   node scripts/rewrite-pois-resumen.mjs --prueba 5      # cinco al azar, sin guardar
//   node scripts/rewrite-pois-resumen.mjs                  # los que faltan
//   node scripts/rewrite-pois-resumen.mjs --refrescar
//   OLLAMA_MODEL=qwen3:4b node scripts/rewrite-pois-resumen.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const FILE = resolve(dirname(fileURLToPath(import.meta.url)), '../public/data/municipio-pois.json')
const OLLAMA = process.env.OLLAMA_URL ?? 'http://localhost:11434'
const MODEL = process.env.OLLAMA_MODEL ?? 'qwen3:14b'
const args = process.argv.slice(2)
const refrescar = args.includes('--refrescar')
const prueba = args.includes('--prueba') ? parseInt(args[args.indexOf('--prueba') + 1] || '5', 10) : 0
const revalidar = args.includes('--revalidar')      // sin modelo: anula lo guardado que ya no pasa el filtro
const reintentarNulos = args.includes('--reintentar-nulos')

const SISTEMA = `Reescribes fichas de sitios turísticos de la costa española para una web de playas.
Voz: la de alguien de la zona que sabe de qué habla y no vende nada. Frases cortas, concretas, sin adjetivos de folleto (impresionante, maravilloso, imprescindible, único, encantador, espectacular). Sin «descubre», «disfruta», «no te pierdas». Sin segunda persona.
Reglas duras:
- Dos frases como máximo, 45 palabras como máximo en total.
- Solo hechos que estén en el texto de entrada. Nada de datos nuevos, ni fechas, ni cifras, ni nombres que no aparezcan.
- Si el texto no dice de qué época, estilo o cultura es el sitio, no lo digas tú. Antes que rellenar, acorta: una sola frase vale.
- El texto de entrada puede venir en catalán, gallego o inglés; la salida va siempre en castellano.
- No empieces repitiendo el nombre del sitio: el nombre ya está en el título. Empieza por lo que es o por lo que tiene.
- No menciones el municipio ni la provincia ni «España»: ya se sabe dónde estamos.
- Responde solo con el texto, sin comillas, sin listas, sin explicación.`

const dormir = ms => new Promise(r => setTimeout(r, ms))

async function reescribir(nombre, tipo, extracto) {
  const res = await fetch(`${OLLAMA}/api/chat`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODEL, stream: false, think: false,
      options: { temperature: 0.2, num_predict: 160 },
      messages: [
        { role: 'system', content: SISTEMA },
        { role: 'user', content: `Sitio: ${nombre} (${tipo}).\nTexto de entrada:\n${extracto}` },
      ],
    }),
  })
  if (!res.ok) throw new Error(`ollama ${res.status}`)
  const j = await res.json()
  // qwen3 a veces cuela «/no_think» y un «</think>» suelto, y detrás repite
  // el texto entero: se quitan las marcas y se corta en la repetición.
  let t = (j.message?.content ?? '').replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\/no_think|<\/?think>/g, ' ').replace(/\s+/g, ' ').trim()
  const mitad = t.slice(0, Math.floor(t.length / 2)).trim()
  if (mitad.length > 30 && t.slice(mitad.length).trim().startsWith(mitad.slice(0, 30))) t = mitad
  return t
}

const FOLLETO = /\b(impresionante|maravillos[oa]|imprescindible|únic[oa]|encantador|espectacular|descubre|disfruta|no te pierdas|te sorprenderá)\b/i

/** Válido si es corto, no inventa cifras y no suena a folleto. */
// Marcas de catalán y gallego que en castellano no aparecen: si salen, el
// modelo ha copiado el idioma del extracto en vez de traducir.
const NO_CASTELLANO = new RegExp('\\b(' + [
  // catalán
  "des d'", 'fou', 'enmig', 'amb', 'també', 'està', 'aquest', 'aquesta', 'situat', 'situada al', 'construït', 'edificacions', 'segle', 'església', 'ajuntament', 'és un', 'és una', 'del qual', 'els', 'les quals', 'molt', 'vora', 'poble',
  // gallego
  'xunto', 'ata', 'dende', 'castrexo', 'concello', 'doad[ao]s?', 'reloxos?', 'igrexa', 'praza', 'castelo', 'século', 'nun', 'nunha', 'cunha', 'coa', 'polo', 'pola', 'é un', 'é unha', 'forman a', 'unha', 'muíño', 'xardín', 'edificio do', 'do século', 'da vila', 'na vila', 'no concello',
].join('|') + ")\\b|\\bl'[a-zà-ú]|\\bd'[a-zà-ú]|\\bs'[a-z]", 'i')

function valido(r, extracto, nombre, municipio) {
  if (!r || r.length < 40 || r.length > 320) return 'largo'
  if ((r.match(/[.!?](\s|$)/g) ?? []).length > 2) return 'frases'
  if (r.split(/\s+/).length > 48) return 'palabras'
  if (FOLLETO.test(r)) return 'folleto'
  if (/[«"“]|^-|\n/.test(r)) return 'formato'
  if (r.toLowerCase().startsWith(nombre.toLowerCase().slice(0, 12))) return 'empieza-nombre'
  if (NO_CASTELLANO.test(r)) return 'idioma'
  // «en el municipio de X», «situado en Santa Cruz»: relleno que la regla prohíbe.
  if (/municipio de|t[ée]rmino municipal|provincia de|\bEspa[ñn]a\b/i.test(r)) return 'relleno-lugar'
  if (municipio && r.toLowerCase().includes(municipio.toLowerCase().split(/[\/(]/)[0].trim())) return 'nombra-municipio'
  const cifras = r.match(/\d[\d.,]*\d|\d/g) ?? []
  for (const c of cifras) if (!extracto.includes(c)) return `cifra ${c}`
  // Épocas, culturas y estilos: lo más fácil de inventar y lo más grave. Si
  // el resumen los nombra, el extracto —en castellano, catalán, gallego o
  // inglés— tiene que contener la raíz.
  const SENSIBLES = [
    [/celt|celtib/i, /celt/i], [/roman[oa]s?\b|romana/i, /rom[aà]n|roman/i], [/medieval/i, /medieval|edad media|edat mitjana|idade media|middle ages/i],
    [/[áa]rabe|musulm|andalus|moro\b|mor[ao]s\b/i, /[áa]rab|musulm|andalus|moor|mor[ao]s?\b|islam/i], [/g[óo]tic/i, /g[òóo]tic/i], [/rom[áa]nic/i, /rom[àáa]nic|romanesque/i],
    [/barroc/i, /barroc|baroque/i], [/modernist/i, /modernis/i], [/neocl[áa]sic/i, /neocl[àáa]s|neoclass/i], [/fenici/i, /fenici|phoenic/i],
    [/prehist|neol[íi]t|megal[íi]t|talai[óo]t/i, /prehist|neol[íi]t|megal[íi]t|talai[òóo]t/i], [/siglo\s+[XIVLDM]+/i, /siglo|segle|século|century|s\.\s?[XIVLDM]/i],
  ]
  for (const [enSalida, enEntrada] of SENSIBLES) if (enSalida.test(r) && !enEntrada.test(extracto)) return `inventa ${enSalida.source.slice(0, 12)}`
  return null
}

const data = JSON.parse(readFileSync(FILE, 'utf8'))
const todos = []
for (const slug of Object.keys(data))
  for (const cat of Object.values(data[slug].pois))
    for (const poi of cat) if (poi.e?.t) todos.push({ slug, poi })

if (revalidar) {
  let anulados = 0
  for (const { slug, poi } of todos) {
    if (!poi.r) continue
    const motivo = valido(poi.r, poi.e.t, poi.n, data[slug].nombre)
    if (motivo) { console.log(`  ✗ ${slug} / ${poi.n}: ${motivo}\n      ${poi.r.slice(0, 120)}`); poi.r = undefined; anulados++ }
  }
  writeFileSync(FILE, JSON.stringify(data, null, 0))
  console.log(`\nRevalidado: ${anulados} anulados (quedan sin resumen hasta la próxima pasada).`)
  process.exit(0)
}
const lote = prueba ? todos.sort(() => Math.random() - 0.5).slice(0, prueba) : todos
let ok = 0, ko = 0, ya = 0
const motivos = {}
for (const [i, { slug, poi }] of lote.entries()) {
  if (poi.r !== undefined && !refrescar && !prueba && !(reintentarNulos && poi.r === null)) { ya++; continue }
  let r = null, motivo = null
  for (let intento = 0; intento < 3 && !r; intento++) {
    let cand
    try { cand = await reescribir(poi.n, poi.t, poi.e.t) }
    catch (e) { motivo = `ollama: ${e.message}`; await dormir(3000); continue }
    motivo = valido(cand, poi.e.t, poi.n, data[slug].nombre)
    if (!motivo) r = cand
  }
  if (prueba) {
    console.log(`\n[${slug}] ${poi.n} (${poi.t})\n  ENTRADA: ${poi.e.t.slice(0, 200)}…\n  SALIDA:  ${r ?? `(descartado: ${motivo})`}`)
    continue
  }
  if (r) { poi.r = r; ok++ } else { poi.r = null; ko++; motivos[motivo] = (motivos[motivo] ?? 0) + 1 }
  process.stdout.write(`\r  ${i + 1}/${lote.length}  ok ${ok} · descartados ${ko}`)
  if (i % 25 === 24) writeFileSync(FILE, JSON.stringify(data, null, 0))   // por si se corta
  await dormir(50)
}
if (!prueba) {
  writeFileSync(FILE, JSON.stringify(data, null, 0))
  console.log(`\n\nResúmenes: ${ok} nuevos · ${ko} descartados · ${ya} ya estaban`)
  if (ko) console.log('  motivos:', JSON.stringify(motivos))
}
