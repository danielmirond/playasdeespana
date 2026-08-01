#!/usr/bin/env node
// scripts/build-similares.mjs — "Playas parecidas a esta".
//
// POR QUÉ NO HAY EMBEDDINGS AQUÍ
// La tentación era vectorizar la descripción con un modelo. Medido sobre el
// catálogo, no compensa:
//   · `descripcion` cubre el 99% pero son 122 caracteres de media, con
//     plantilla del MITECO. Un embedding de eso captura "playa gallega",
//     que es justo lo que la distancia ya da (y eso es la otra pestaña).
//   · La señal real vive en campos TIPADOS que ya tenemos: grado_urbano,
//     fachada_litoral, ocupación, espacio protegido, medidas, actividades.
//     Embeberlos en prosa para volver a extraerlos es un rodeo que pierde
//     precisión.
//   · `composicion` es "Arena" en las 4.491 → varianza cero, no entra.
// Y lo que decide: con campos tipados podemos DECIR por qué se parecen
// ("aislada · acantilado · surf"). Un coseno no se explica, y una
// recomendación opaca al lado de datos con trazo de certeza es incoherente.
//
// MÉTODO: similitud de Gower (mezcla booleanos, categóricas y numéricas),
// 4 ejes ponderados sobre el subconjunto de campos que ambas playas tienen.
//   CARÁCTER (40):   grado_urbano · fachada_litoral · ocupación ·
//                    espacio protegido · vegetación · paseo marítimo
//   ACTIVIDADES (25): surf, windsurf, kite, snorkel, buceo, kayak, paddle
//   SERVICIOS (20):  socorrismo, duchas, accesible, parking, aseos,
//                    zona infantil, perros, nudista, autobús
//   ESCALA (15):     longitud y anchura (distancia relativa, no absoluta)
//
// GEOGRAFÍA: no puntúa, pero SÍ acota. La primera versión comparaba contra
// las 3.437 y a La Concha (Cantabria) le proponía Troya (Tenerife) con un 89:
// correcto por parecido, inútil para quien lee. "Parecidas" solo sirve si
// son alcanzables, así que el pool es la comunidad, y solo se ensancha a la
// misma cuenca marina cuando no hay bastantes. Nunca a toda España.
// Dentro del pool sí penalizamos el mismo municipio, para no repetir lo que
// ya dice la pestaña "Cercanas".
//
// REGLA DEL DATO AUSENTE: los campos del MITECO cubren el 77%. Las playas
// que solo vienen de OSM no tienen con qué compararse y saldrían todas
// "parecidas" entre sí por igual — una recomendación falsa. Esas quedan
// FUERA del sidecar y la pestaña no se pinta. Mejor ausente que inventada.
//
// Uso:    node scripts/build-similares.mjs
// Salida: src/data/playas-similares.json

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'src/data/playas-similares.json')

const VECINOS = 8          // cuántas parecidas guardamos por playa
const MIN_SCORE = 0.55     // por debajo de esto no es un parecido, es relleno
const MIN_CAMPOS = 4       // mínimo de campos de CARÁCTER para ser comparable

const EXCLUIDAS = new Set([
  ...JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf8')),
  ...Object.keys(JSON.parse(readFileSync(resolve(ROOT, 'src/data/duplicados.json'), 'utf8'))),
])

const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
  .filter(p => p?.slug && p.nombre && !EXCLUIDAS.has(p.slug))

// ── Normalización ────────────────────────────────────────────────────────
// Los datos vienen sucios: "SemiUrbana" junto a "Semiurbana", "alto" junto a
// "Alto", y compuestos tipo "Medio / Bajo". Sin esto, dos playas idénticas
// puntúan como distintas por una mayúscula.
const norm = v => {
  if (typeof v !== 'string') return null
  const s = v.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
  if (!s) return null
  // "Medio / Bajo" → nos quedamos con el primer término, que es el dominante
  return s.split('/')[0].trim()
}

const URBANO = { aislada: 0, 'playa natural': 0, semiurbana: 0.5, urbana: 1 }
const OCUPA  = { bajo: 0, medio: 0.5, alto: 1 }

// Cuencas marinas: el ensanche solo vale si el mar es el mismo. Una playa
// cántabra no se "parece" a una canaria por mucho que coincidan los campos.
const CUENCA = {
  'Galicia': 'norte', 'Asturias': 'norte', 'Cantabria': 'norte', 'País Vasco': 'norte',
  'Cataluña': 'mediterraneo', 'Comunitat Valenciana': 'mediterraneo',
  'Murcia': 'mediterraneo', 'Andalucía': 'mediterraneo',
  'Ceuta': 'mediterraneo', 'Melilla': 'mediterraneo',
  'Islas Baleares': 'baleares',
  'Canarias': 'canarias',
}

const CARACTER = ['grado_urbano', 'fachada_litoral', 'grado_ocupacion',
                  'espacio_protegido', 'vegetacion', 'paseo_maritimo']
const ACTIVIDADES = ['surf', 'windsurf', 'kite', 'snorkel', 'buceo', 'kayak', 'paddle']
const SERVICIOS = ['socorrismo', 'duchas', 'accesible', 'parking', 'aseos',
                   'zona_infantil', 'perros', 'nudista', 'autobus']

// Etiqueta legible por rasgo, para poder explicar el match en la ficha.
const ETIQUETA = {
  grado_urbano:      v => ({ aislada: 'aislada', semiurbana: 'semiurbana', urbana: 'urbana' })[v],
  fachada_litoral:   v => ({ montana: 'de montaña', acantilado: 'con acantilado', dunas: 'con dunas',
                             humedal: 'junto a humedal', urbana: null, semiurbana: null })[v],
  grado_ocupacion:   v => ({ bajo: 'poco concurrida', alto: 'concurrida' })[v],
  espacio_protegido: v => (v ? 'espacio protegido' : null),
  vegetacion:        v => (v ? 'con vegetación' : null),
  paseo_maritimo:    v => (v ? 'con paseo' : null),
}
const ETIQUETA_ACT = {
  surf: 'surf', windsurf: 'windsurf', kite: 'kite', snorkel: 'snorkel',
  buceo: 'buceo', kayak: 'kayak', paddle: 'paddle',
}

/** Extrae el perfil comparable de una playa. null si no hay con qué comparar. */
function perfil(p) {
  const c = {}
  for (const k of CARACTER) {
    const v = p[k]
    if (v === undefined || v === null || v === '') continue
    if (typeof v === 'boolean') { c[k] = v ? 1 : 0; continue }
    const n = norm(v)
    if (!n) continue
    if (k === 'grado_urbano')    { if (URBANO[n] !== undefined) c[k] = URBANO[n]; continue }
    if (k === 'grado_ocupacion') { if (OCUPA[n]  !== undefined) c[k] = OCUPA[n];  continue }
    c[k] = n                     // fachada_litoral queda como categórica
  }
  // Sin suficientes campos de carácter no es comparable (playas solo-OSM).
  if (Object.keys(c).length < MIN_CAMPOS) return null

  const act = {}
  for (const k of ACTIVIDADES) act[k] = p.actividades?.[k] ? 1 : 0

  const srv = {}
  for (const k of SERVICIOS) srv[k] = p[k] ? 1 : 0

  return {
    slug: p.slug, nombre: p.nombre, municipio: p.municipio,
    provincia: p.provincia, comunidad: p.comunidad,
    caracter: c, act, srv,
    cuenca: CUENCA[p.comunidad] ?? null,
    // `longitud` está en metros (mediana 160), pero 406 playas traen valores
    // ≤5 que son kilómetros o basura: La Concha dice 1 y su descripción dice
    // "un kilómetro". Comparar 1 con 350 daría "escalas distintas" cuando en
    // realidad son iguales, así que esos valores se tratan como ausentes.
    longitud: Number.isFinite(p.longitud) && p.longitud > 5 ? p.longitud : null,
    anchura:  Number.isFinite(p.anchura)  && p.anchura  > 0 ? p.anchura  : null,
  }
}

// ── Similitud ────────────────────────────────────────────────────────────
/** Gower por eje: solo cuentan los campos que AMBAS tienen. */
function simCaracter(a, b) {
  let suma = 0, n = 0
  const comunes = []
  for (const k of CARACTER) {
    const va = a.caracter[k], vb = b.caracter[k]
    if (va === undefined || vb === undefined) continue
    n++
    if (typeof va === 'number' && typeof vb === 'number') {
      const s = 1 - Math.abs(va - vb)
      suma += s
      if (s === 1) comunes.push(ETIQUETA[k]?.(k === 'grado_urbano'
        ? Object.keys(URBANO).find(x => URBANO[x] === va)
        : k === 'grado_ocupacion'
          ? Object.keys(OCUPA).find(x => OCUPA[x] === va)
          : !!va))
    } else if (va === vb) {
      suma += 1
      comunes.push(ETIQUETA[k]?.(va))
    }
  }
  return { s: n ? suma / n : null, n, comunes: comunes.filter(Boolean) }
}

/** Jaccard sobre conjuntos booleanos: dos playas sin NINGUNA marca no se
 *  "parecen" por lo que les falta, así que ausencia total → neutro. */
function simSet(a, b, claves, etiquetas) {
  let inter = 0, union = 0
  const comunes = []
  for (const k of claves) {
    const va = a[k], vb = b[k]
    if (va && vb) { inter++; union++; if (etiquetas?.[k]) comunes.push(etiquetas[k]) }
    else if (va || vb) union++
  }
  return { s: union === 0 ? null : inter / union, comunes }
}

function simEscala(a, b) {
  const pares = [[a.longitud, b.longitud], [a.anchura, b.anchura]]
  let suma = 0, n = 0
  for (const [x, y] of pares) {
    if (x == null || y == null) continue
    n++
    // Relativa: 300 m vs 400 m se parecen mucho más que 30 m vs 130 m.
    suma += Math.min(x, y) / Math.max(x, y)
  }
  return n ? suma / n : null
}

const PESOS = { caracter: 40, act: 25, srv: 20, escala: 15 }

function comparar(a, b) {
  const car = simCaracter(a, b)
  const act = simSet(a.act, b.act, ACTIVIDADES, ETIQUETA_ACT)
  const srv = simSet(a.srv, b.srv, SERVICIOS)
  const esc = simEscala(a, b)

  // Repondera sobre los ejes que existen para este par concreto.
  let num = 0, den = 0
  const add = (s, w) => { if (s !== null) { num += s * w; den += w } }
  add(car.s, PESOS.caracter); add(act.s, PESOS.act)
  add(srv.s, PESOS.srv);      add(esc,   PESOS.escala)
  if (!den) return null

  let score = num / den

  // La geografía no puntúa (es la otra pestaña), pero repetir las vecinas
  // del mismo municipio haría redundantes las dos pestañas.
  if (a.municipio && a.municipio === b.municipio) score *= 0.75

  // Motivos: primero el carácter, que es lo que el usuario reconoce.
  const motivos = [...car.comunes, ...act.comunes].slice(0, 3)
  return { score, motivos }
}

// ── Cómputo ──────────────────────────────────────────────────────────────
const perfiles = playas.map(perfil).filter(Boolean)
console.log(`comparables: ${perfiles.length} de ${playas.length} servibles ` +
            `(${playas.length - perfiles.length} sin campos suficientes → sin pestaña)`)

// Índices de pool: comunidad primero, cuenca como ensanche.
const porComunidad = new Map()
const porCuenca = new Map()
for (const p of perfiles) {
  if (p.comunidad) (porComunidad.get(p.comunidad) ?? porComunidad.set(p.comunidad, []).get(p.comunidad)).push(p)
  if (p.cuenca)    (porCuenca.get(p.cuenca)       ?? porCuenca.set(p.cuenca, []).get(p.cuenca)).push(p)
}

const salida = {}
const leyenda = []                 // motivos únicos; el sidecar guarda índices
const idxMotivo = new Map()
let conVecinos = 0, ensanchadas = 0

const evaluar = (a, pool) => {
  const out = []
  for (const b of pool) {
    if (b.slug === a.slug) continue
    const r = comparar(a, b)
    if (!r || r.score < MIN_SCORE) continue
    out.push({ slug: b.slug, s: r.score, motivos: r.motivos, municipio: b.municipio })
  }
  return out
}

for (let i = 0; i < perfiles.length; i++) {
  const a = perfiles[i]

  let cands = evaluar(a, porComunidad.get(a.comunidad) ?? [])
  // Solo si la comunidad no da bastante, se abre a la misma cuenca marina.
  if (cands.length < VECINOS && a.cuenca) {
    cands = evaluar(a, porCuenca.get(a.cuenca) ?? [])
    ensanchadas++
  }
  if (!cands.length) continue
  cands.sort((x, y) => y.s - x.s)

  // Diversidad: máximo 2 por municipio, para que no salgan 8 de la misma
  // playa partida en tramos.
  const vistos = {}
  const top = []
  for (const c of cands) {
    const m = c.municipio ?? '?'
    if ((vistos[m] ??= 0) >= 2) continue
    vistos[m]++
    top.push(c)
    if (top.length >= VECINOS) break
  }

  // Formato compacto: tuplas en vez de objetos, y motivos como índices a una
  // leyenda. Con objetos y strings repetidos el sidecar pesaba 2,2 MB para
  // 27.000 entradas; las claves y los motivos eran más de la mitad.
  salida[a.slug] = top.map(c => [
    c.slug,
    Math.round(c.s * 100),
    c.motivos.map(m => (idxMotivo.get(m) ?? (leyenda.push(m), idxMotivo.set(m, leyenda.length - 1), leyenda.length - 1))),
  ])
  conVecinos++
  if (conVecinos % 500 === 0) console.log(`  ${conVecinos}…`)
}

writeFileSync(OUT, JSON.stringify({
  generado: new Date().toISOString().slice(0, 10),
  metodo: 'Gower ponderado sobre campos tipados; sin embeddings (ver cabecera del script)',
  pesos: PESOS,
  minScore: MIN_SCORE,
  formato: 'playas[slug] = [[slugParecida, score0-100, [índices a motivos]], …]',
  motivos: leyenda,
  playas: salida,
}) + '\n')

console.log(`\ncon parecidas: ${conVecinos}`)
console.log(`ensanchadas a cuenca: ${ensanchadas} (su comunidad no daba ${VECINOS})`)
console.log(`sin parecidas: ${perfiles.length - conVecinos} (comparables pero sin nadie por encima de ${MIN_SCORE})`)

// Muestra para revisar a ojo que las recomendaciones tienen sentido.
const byslug = Object.fromEntries(perfiles.map(p => [p.slug, p]))
for (const s of ['playa-de-la-concha', 'playa-de-bolonia', 'playa-de-las-catedrales']) {
  if (!salida[s]) continue
  const a = byslug[s]
  console.log(`\n${a.nombre} (${a.municipio}, ${a.provincia}):`)
  for (const [slug, score, por] of salida[s].slice(0, 5)) {
    const b = byslug[slug]
    console.log(`  ${String(score).padStart(3)}  ${b.nombre} (${b.municipio}, ${b.provincia}) — ${por.map(i => leyenda[i]).join(' · ') || 'sin motivo destacado'}`)
  }
}
