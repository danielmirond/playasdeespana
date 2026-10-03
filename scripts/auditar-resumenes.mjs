#!/usr/bin/env node
// scripts/auditar-resumenes.mjs — el revisor escéptico de los resúmenes.
//
// QUÉ NO ES. No es la revisión humana que exigen MC1 y MC5, ni la que pide
// Google en su guía de contenido generado. Un modelo revisando lo que
// escribió otro modelo comparte sus puntos ciegos. Lo que hace esto es
// reducir: retira todo lo que no se pueda defender frente a la fuente y
// deja una cola corta para que la lea una persona. Lo que sobreviva al
// auditor sigue SIN revisar por un humano mientras nadie lo firme.
//
// ANTE LA DUDA, FUERA. No marca «revisar luego»: pone el resumen a null y
// la ficha se queda sin texto, con su pictograma. Una ficha sin resumen no
// miente; una con un resumen dudoso sí. Recuperarlo cuesta una pasada del
// reescritor; recuperar la confianza, no.
//
// TRES CAPAS, DE MÁS FIABLE A MENOS
//
//   1. FIDELIDAD. Determinista y auditable. Cada cifra, cada nombre propio
//      y cada época del resumen tiene que estar en el extracto que se le
//      dio al modelo. Además comprueba algo que el validador original no
//      miraba: que el extracto hable DEL SITIO. Un artículo de Wikipedia
//      mal emparejado produce un resumen impecable sobre otra cosa.
//      Y mira la fuente antes que el texto: un artículo que es una lista
//      de topónimos, o que cabe en dos líneas, no da para dos frases. De
//      ahí salieron «Punto elevado con vistas al mar» y «Faro de Punta
//      Albir. Faro de Punta Albir.».
//   2. HUELLA DE IA. Muletillas de folleto, fórmulas de modelo y, sobre
//      todo, plantilla: si cuarenta resúmenes arrancan con las mismas tres
//      palabras, el corpus se lee como generado aunque cada pieza pase.
//   3. SEGUNDA OPINIÓN (--modelo). Un modelo local en papel de verificador,
//      al que solo se le deja MARCAR, nunca aprobar. Su «OK» no vale nada;
//      su «esto no está en la fuente» manda a la cola.
//
// DOS NIVELES. Lo que puede ser falso se retira. Lo que solo suena a
// máquina —plantilla, fórmula— se deja publicado y va a una lista aparte
// para reescribir: retirarlo no protege a nadie y vacía fichas correctas.
//
//   node scripts/auditar-resumenes.mjs                 # informe, no toca nada
//   node scripts/auditar-resumenes.mjs --retirar       # pone a null los dudosos
//   node scripts/auditar-resumenes.mjs --modelo        # añade la capa 3
//   node scripts/auditar-resumenes.mjs --cola cola.md  # escribe la cola humana
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FILE = resolve(ROOT, 'public/data/municipio-pois.json')
const args = process.argv.slice(2)
const retirar = args.includes('--retirar')
const conModelo = args.includes('--modelo')
const colaPath = args.includes('--cola') ? args[args.indexOf('--cola') + 1] : null
const MODELO = process.env.OLLAMA_MODEL ?? 'gemma3:12b'

const norm = s => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const sinPuntuacion = s => norm(s).replace(/[^a-z0-9ñ]+/g, ' ').trim()

// ——— Capa 1 · fidelidad a la fuente ———————————————————————————

/** Palabras que empiezan por mayúscula sin ser inicio de frase: nombres
 *  propios. Si el resumen trae uno que no está en la fuente, lo ha puesto
 *  el modelo. Se excluyen las que abren frase y las de uso común. */
const COMUNES = new Set(['el','la','los','las','un','una','de','del','en','y','o','a','al','su','sus','se','es','por','para','con','sin','sobre','entre','desde','hasta','durante','tras','esta','este','estos','estas','ese','esa','fue','son','era','eran','hay','tiene','siglo','edad','media','norte','sur','este','oeste','mar','playa','museo','iglesia','castillo','torre','parque','faro','mirador','casa','plaza','puerto','monte','rio','isla','punta','cala','santa','santo','san','nuestra','senora','virgen','cristo','jesucristo','dios','europa','africa','ii','iii','iv','vi','vii','viii','ix','xi','xii','xiii','xiv','xv','xvi','xvii','xviii','xix','xx','xxi'])

function propiosNuevos(resumen, fuente) {
  const f = sinPuntuacion(fuente)
  const out = []
  // quita la primera palabra de cada frase antes de buscar mayúsculas
  const cuerpo = resumen.replace(/(^|[.!?]\s+)(\S+)/g, '$1')
  for (const m of cuerpo.matchAll(/\b([A-ZÁÉÍÓÚÑÜ][\wáéíóúñü'’-]{2,})/g)) {
    const p = sinPuntuacion(m[1])
    if (!p || COMUNES.has(p)) continue
    if (!f.includes(p.slice(0, Math.max(4, p.length - 2)))) out.push(m[1])
  }
  return [...new Set(out)]
}

/** ¿El extracto habla de este sitio? Se exige que alguna palabra
 *  distintiva del nombre del POI aparezca en la fuente. Si no, el artículo
 *  está mal emparejado y el resumen describe otra cosa. */
const GENERICAS = new Set(['museo','museu','iglesia','igrexa','esglesia','ermita','capilla','castillo','castell','torre','faro','mirador','miradoiro','parque','jardin','plaza','placa','praza','monumento','casa','palacio','palau','pazo','centro','santa','santo','san','sant','nuestra','senora','virgen','maria','antigua','antiguo','nueva','nuevo','municipal','historico','ruinas','restos','puerta','puente','fuente','molino','playa','platja','praia','cala','punta','isla','vila','villa','ciudad','del','las','los','una','por'])
function hablaDelSitio(nombre, fuente) {
  const f = sinPuntuacion(fuente)
  const tokens = sinPuntuacion(nombre).split(' ').filter(w => w.length >= 4 && !GENERICAS.has(w))
  if (!tokens.length) return true          // nombre todo genérico: no se puede juzgar
  return tokens.some(t => f.includes(t.slice(0, Math.max(4, t.length - 1))))
}

const cifrasNuevas = (r, f) => (r.match(/\d[\d.,]*\d|\d/g) ?? []).filter(c => !f.includes(c))

// Épocas: la salida en castellano, la fuente en cualquiera de los idiomas
// en que viene Wikipedia. Mismas parejas que usa el reescritor.
const EPOCAS = [
  [/celt|celtib/i, /celt/i], [/roman[oa]s?\b/i, /rom[aà]n|roman/i],
  [/medieval/i, /medieval|edad media|edat mitjana|idade media|middle age/i],
  [/[áa]rabe|musulm|andalus|moro\b/i, /[áa]rab|musulm|andalus|moor|islam/i],
  [/g[óo]tic/i, /g[òóo]tic|gothic/i], [/rom[áa]nic/i, /rom[àáa]nic|romanesque/i],
  [/barroc/i, /barroc|baroque/i], [/modernis/i, /modernis/i],
  [/neocl[áa]sic/i, /neocl[àáa]s|neoclass/i], [/fenici/i, /fenici|phoenic/i],
  [/visigod/i, /visigod|visigot|visigoth/i], [/nazar[íi]/i, /nazar[íi]|nasr/i],
  [/prehist|neol[íi]t|megal[íi]t|talai[óo]t/i, /prehist|neol[íi]t|megal[íi]t|talai[òóo]t/i],
  [/ib[ée]ric/i, /ib[èéḕe]ric|iber/i],
]
function epocasNuevas(r, f) {
  const out = []
  for (const [sal, ent] of EPOCAS) if (sal.test(r) && !ent.test(f)) out.push(sal.source.slice(0, 14))
  for (const m of r.matchAll(/\bsiglo\s+([IVXLCDM]+)/gi)) {
    const rom = m[1].toLowerCase()
    if (!new RegExp(`(siglo|segle|s[ée]culo|century|s\\.?)\\s*${rom}\\b`, 'i').test(norm(f))) out.push(`siglo ${m[1]}`)
  }
  return [...new Set(out)]
}

/** Fuentes que no dan para un resumen. Una lista de topónimos no describe
 *  el sitio: lo nombra. Todo lo que el modelo escriba a partir de ella se
 *  lo ha inventado, por bien que suene. */
const FUENTE_LISTA = /^(llista de top[òo]nims|lista de top[óo]nimos|llista d'|lista de |anexo:|annex:)/i
const FUENTE_DESAMB = /(pot referir-se|puede referirse a|desambiguaci|may refer to)/i

/** Dos frases de resumen a partir de una línea de fuente obligan al modelo
 *  a estirar: o repite la misma frase o añade de su cosecha. */
const MINIMO_FUENTE = 120

/** El modelo se queda sin material y repite. */
function fraseRepetida(r) {
  const fr = r.split(/(?<=[.!?])\s+/).map(x => sinPuntuacion(x)).filter(x => x.length > 8)
  for (let i = 0; i < fr.length; i++) for (let j = i + 1; j < fr.length; j++) {
    if (fr[i] === fr[j]) return true
    const corta = fr[i].length < fr[j].length ? fr[i] : fr[j]
    const larga = fr[i].length < fr[j].length ? fr[j] : fr[i]
    if (corta.length > 14 && larga.includes(corta)) return true
  }
  return false
}

// ——— Capa 2 · huella de IA ————————————————————————————————————

/** Fórmulas que delatan a un modelo escribiendo «contenido». No son
 *  errores de hecho: son el acento. Un corpus lleno de ellas se lee como
 *  generado aunque cada pieza sea cierta. */
const FORMULAS = [
  /\bse trata de\b/i, /\bcabe (destacar|mencionar|señalar)\b/i, /\bes importante\b/i,
  /\bsin duda\b/i, /\bno te pierdas\b/i, /\bun lugar ideal\b/i, /\bofrece (una|la) (experiencia|oportunidad|posibilidad)\b/i,
  /\bpermite disfrutar\b/i, /\bes conocido por\b/i, /\bse caracteriza por\b/i,
  /\bentre otros\b/i, /\bademás de\b.*\balberga\b/i, /\bjoya\b/i, /\brincón\b/i,
  /\benclave\b/i, /\bemblemátic/i, /\bimprescindible\b/i, /\bespectacular\b/i,
  /\búnico en su (clase|tipo)\b/i, /\bvale la pena\b/i, /\binvita a\b/i,
  /\ben definitiva\b/i, /\ben resumen\b/i, /\bactualmente\b.*\bactualmente\b/i,
]
const formulas = r => FORMULAS.filter(f => f.test(r)).map(f => f.source.slice(0, 22))

// ——— Capa 3 · segunda opinión de un modelo ————————————————————

const PROMPT = `Eres un verificador de datos, escéptico y literal. Recibes una FUENTE y un RESUMEN que alguien escribió a partir de ella.

Tu única tarea: listar las afirmaciones del RESUMEN que NO se puedan leer en la FUENTE.

Reglas:
- La FUENTE puede estar en castellano, catalán, gallego, valenciano o inglés. Una afirmación traducida SÍ está respaldada.
- Una afirmación más vaga que la fuente está respaldada. Una más concreta, no.
- No juzgues el estilo. Solo si el dato está o no está.
- Si todo está respaldado, responde exactamente: OK
- Si no, una línea por afirmación no respaldada, sin numerar ni comentar.`

async function segundaOpinion(resumen, fuente) {
  const res = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODELO, stream: false, think: false,
      options: { temperature: 0, num_predict: 180 },
      messages: [
        { role: 'system', content: PROMPT },
        { role: 'user', content: `FUENTE:\n${fuente}\n\nRESUMEN:\n${resumen}` },
      ],
    }),
    signal: AbortSignal.timeout(90000),
  })
  if (!res.ok) throw new Error(`ollama ${res.status}`)
  const txt = ((await res.json()).message?.content ?? '')
    .replace(/<think>[\s\S]*?<\/think>/g, '').replace(/\/?no_think/g, '').trim()
  if (/^ok\b/i.test(txt) || !txt) return null
  return txt.split('\n').map(l => l.replace(/^[-*\d.\s]+/, '').trim()).filter(Boolean).slice(0, 3)
}

// ——— Recorrido ————————————————————————————————————————————————

const data = JSON.parse(readFileSync(FILE, 'utf8'))
const todos = []
for (const [slug, m] of Object.entries(data))
  for (const p of [...Object.values(m.pois).flat(), ...(m.alrededores ?? [])])
    if (p.r && p.e?.t) todos.push({ slug, municipio: m.nombre, p, alrededor: (m.alrededores ?? []).includes(p) })

// Plantilla: arranques repetidos en todo el corpus.
const arranque = new Map()
for (const { p } of todos) {
  const k = sinPuntuacion(p.r).split(' ').slice(0, 3).join(' ')
  arranque.set(k, (arranque.get(k) ?? 0) + 1)
}
const PLANTILLA = new Set([...arranque].filter(([, n]) => n >= 8).map(([k]) => k))

const dudas = []        // puede ser falso → se retira
const avisos = []       // suena a máquina → se reescribe, no se retira
const motivos = {}
const apunta = (m) => { motivos[m] = (motivos[m] ?? 0) + 1 }

for (const t of todos) {
  const { p } = t
  const f = p.e.t.trim()
  const grave = [], leve = []

  // Capa 1 · la fuente, antes que el texto
  if (FUENTE_LISTA.test(f))                grave.push('la fuente es una lista, no describe el sitio')
  else if (FUENTE_DESAMB.test(f))          grave.push('la fuente es una desambiguación')
  else if (f.length < MINIMO_FUENTE)       grave.push(`fuente demasiado corta (${f.length} caracteres): no da para dos frases`)
  if (fraseRepetida(p.r))                  grave.push('repite la misma frase: se quedó sin material')

  // Capa 1 · el texto contra la fuente
  const c = cifrasNuevas(p.r, f);          if (c.length) grave.push(`cifra sin fuente: ${c.join(', ')}`)
  const e = epocasNuevas(p.r, f);          if (e.length) grave.push(`época sin fuente: ${e.join(', ')}`)
  const n = propiosNuevos(p.r, f);         if (n.length) grave.push(`nombre propio sin fuente: ${n.join(', ')}`)

  // Capa 2 · estilo. No prueba que sea falso, así que no retira.
  if (!hablaDelSitio(p.n, f))              leve.push('el nombre del sitio no aparece en la fuente: comprobar que es el artículo correcto')
  const fo = formulas(p.r);                if (fo.length) leve.push(`fórmula de folleto: ${fo.join(', ')}`)
  if (PLANTILLA.has(sinPuntuacion(p.r).split(' ').slice(0, 3).join(' ')))
                                           leve.push('arranque de plantilla, repetido en el corpus')

  if (grave.length) { grave.forEach(r => apunta(r.replace(/ \(\d+ caracteres\)/, '').split(':')[0])); dudas.push({ ...t, razones: grave }) }
  else if (leve.length) { leve.forEach(r => apunta('(aviso) ' + r.split(':')[0])); avisos.push({ ...t, razones: leve }) }
}

if (conModelo) {
  const limpios = todos.filter(t => !dudas.some(d => d.p === t.p))
  process.stderr.write(`\nSegunda opinión con ${MODELO} sobre ${limpios.length} resúmenes…\n`)
  for (const [i, t] of limpios.entries()) {
    try {
      const pegas = await segundaOpinion(t.p.r, t.p.e.t)
      if (pegas) { dudas.push({ ...t, razones: [`el verificador no encuentra en la fuente: ${pegas.join(' / ')}`] }); apunta('verificador') }
    } catch { /* si el modelo falla, el resumen no se marca: la capa 1 manda */ }
    if (i % 25 === 24) process.stderr.write(`\r  ${i + 1}/${limpios.length} · dudas ${dudas.length}`)
  }
  process.stderr.write('\n')
}

// ——— Informe ——————————————————————————————————————————————————

console.log(`\nResúmenes auditados:   ${todos.length}`)
console.log(`Se retiran (dudosos):  ${dudas.length} (${(dudas.length / todos.length * 100).toFixed(1)}%)`)
console.log(`A reescribir (estilo): ${avisos.length}`)
console.log(`Sin pegas:             ${todos.length - dudas.length - avisos.length}  ← NO revisados por una persona\n`)
for (const [m, n] of Object.entries(motivos).sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${m}`)

console.log('\nMuestra de lo que se retira:')
for (const d of dudas.slice(0, 10)) console.log(`\n[${d.slug}] ${d.p.n}\n  ${d.razones.join('\n  ')}\n  «${d.p.r}»`)

if (colaPath) {
  const md = [`# Cola de revisión · ${dudas.length} resúmenes`, '',
    'Cada uno retirado de la web hasta que una persona lo apruebe. Fuente al lado para cotejar.', '']
  for (const d of dudas.concat(avisos)) md.push(
    `## ${d.p.n} · ${d.municipio}`, '',
    `**Motivo:** ${d.razones.join(' · ')}`, '',
    `**Resumen:** ${d.p.r}`, '',
    `**Fuente:** ${d.p.e.t}`, '', '---', '')
  writeFileSync(colaPath, md.join('\n'))
  console.log(`\nCola escrita en ${colaPath}`)
}

if (retirar) {
  for (const d of dudas) d.p.r = null
  writeFileSync(FILE, JSON.stringify(data))
  console.log(`\n${dudas.length} resúmenes retirados de la web (r = null).`)
  console.log('Los que quedan siguen sin revisar por una persona: eso no lo arregla este script.')
}
