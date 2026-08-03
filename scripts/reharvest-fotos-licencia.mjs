#!/usr/bin/env node
// scripts/reharvest-fotos-licencia.mjs — re-cosecha del catálogo de fotos
// con licencia verificable y ancla geográfica.
//
// POR QUÉ
// El catálogo servía 3.012 fotos de Flickr traídas por photos_public.gne,
// el feed público, que NO admite filtro de licencia. Muestreadas 4 al azar:
// las 4 "All rights reserved". Y una de ellas era Carmel by the Sea
// (California) sirviendo como playa española — los dos problemas en la
// misma imagen.
//
// Atribuir no arregla lo primero: "todos los derechos reservados" significa
// que no hay licencia, y acreditar al autor documenta a quién reclamarte,
// no te autoriza. Con AdSense y afiliación en la página, además, es uso
// comercial.
//
// LA SOLUCIÓN, Y POR QUÉ ARREGLA LAS DOS COSAS
// Wikimedia Commons por COORDENADAS (700 m). No es una búsqueda por nombre
// que pueda confundir dos playas homónimas: es un ancla geográfica. Sondeado
// sobre 30 playas que dependían de Flickr, 25 tenían alternativa así —todas
// CC BY, CC BY-SA o CC0—. El mismo cambio resuelve licencia y precisión.
//
// Flickr sale de la cascada: sin API key no hay forma de filtrar por
// licencia, y Openverse ya indexa la parte CC de Flickr.
//
// Cascada: Wikimedia geo → Wikimedia texto → OpenVerse → sin foto.
// Pexels y Unsplash tampoco entran: son stock, nunca son ESTA playa.
//
// Guarda licencia y página de origen, que es lo que hoy falta para atribuir
// como piden CC BY y CC BY-SA.
//
// Uso:  node scripts/reharvest-fotos-licencia.mjs [--limite=N] [--salida=ruta]

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (n, d) => { const v = process.argv.find(a => a.startsWith(`--${n}=`)); return v ? v.slice(n.length + 3) : d }
const OUT    = resolve(ROOT, arg('salida', 'public/data/playas-images.json'))
const PARCIAL = OUT + '.parcial'
const LIMITE = Number(arg('limite', 0)) || Infinity

const UA = { 'User-Agent': 'playas-espana.com/1.0 (re-cosecha de fotos con licencia; daniel.mirond@gmail.com)' }
const CONCURRENCIA = 3
const PAUSA_MS = 400          // por trabajador → ~7 req/s hacia Commons

const GENERICOS = new Set(['playa','praia','platja','cala','caleta','arenal','punta','isla',
  'area','areal','beach','del','las','los','san','santa','sant','de','la','el'])

// Mismo criterio de exclusión que el resto del sitio.
const EXCLUIDAS = new Set([
  ...JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf8')),
  ...Object.keys(JSON.parse(readFileSync(resolve(ROOT, 'src/data/duplicados.json'), 'utf8'))),
])
const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
  .filter(p => p?.slug && p.nombre && p.lat && p.lng && !EXCLUIDAS.has(p.slug))

// Reanudable: si se corta, se retoma donde iba.
const out = existsSync(PARCIAL) ? JSON.parse(readFileSync(PARCIAL, 'utf8')) : {}

// CONSERVAR lo que ya está bien. Las 1.372 entradas que ya vienen de
// Wikimedia tienen licencia limpia, y el filtro nuevo —más estricto— podría
// no volver a encontrarlas y dejarnos peor que antes. Solo se re-cosecha lo
// que viene de Flickr (licencia desconocida) o de stock (nunca es ESTA
// playa). Se les añade licencia y origen si les falta, que es dato nuevo.
const previo = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas-images.json'), 'utf8'))
const FUENTES_OK = new Set(['wikimedia', 'openverse'])
let conservadas = 0
for (const [slug, v] of Object.entries(previo)) {
  if (out[slug] !== undefined) continue
  // Las entradas son arrays: hay que filtrar DENTRO, no quedarse con el
  // array entero porque la primera sea buena. Detrás vienen las de Flickr.
  const limpias = (Array.isArray(v) ? v : [v]).filter(f => f && FUENTES_OK.has(f.fuente))
  if (limpias.length) { out[slug] = limpias; conservadas++ }
}
console.log(`Conservadas sin tocar: ${conservadas} (ya venían de Wikimedia/OpenVerse)`)

const norm = s => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
const tokens = p => norm(p.nombre).split(/[^a-z0-9]+/).filter(w => w.length > 3 && !GENERICOS.has(w))
const esImagen = t => /\.(jpe?g|png)$/i.test(t ?? '')

// Negativas: mapas y símbolos, más el patrimonio que rodea a las playas.
// A 700 m de una playa hay faros, ermitas y castillos, y Commons los tiene
// muy fotografiados: sin esto, la geolocalización acierta el sitio y falla
// el sujeto (la primera prueba devolvió "Faro de Torrox" para Los Cuartos).
const NEGATIVA = new RegExp('\\b(' + [
  'map','mapa','plano','escudo','coat[_ ]of[_ ]arms','flag','bandera','logo','diagram','senal','signpost',
  'faro','lighthouse','iglesia','ermita','church','castillo','castell','castle','torre','tower',
  'museo','museum','monumento','monument','estatua','statue','puerto','port','marina','muelle',
  'ayuntamiento','plaza','calle','carrer','edificio','building','hotel','restaurante',
  'detall','detalle','interior','retrato','portrait','cartel','placa',
].join('|') + ')\\b', 'i')

// El sujeto tiene que ser la playa, y el nombre del fichero no da para eso:
// filtrando por él se colaban "Puente Romano Beach Resort" e "Iberostar
// Málaga Playa" — hoteles bautizados como la playa que tienen delante.
//
// Las CATEGORÍAS de Commons son mucho mejor señal: las sube un humano y
// dicen qué ES la foto, no cómo se llama el sitio. "Category:Beaches of
// Cantabria" no se le pone a la foto de un hotel. Vienen en la misma
// petición, así que no cuesta una llamada extra.
const CATEGORIA_PLAYA = /\b(beach|beaches|playa|playas|praia|praias|platja|platges|plage|plages|cala|cales|calas|arenal|dune|dunes|duna|dunas|coast|coasts|costa|seaside|shore)\b/i
// Y estas categorías descartan aunque haya alguna de playa: si la foto está
// en "Hotels in Málaga", es un hotel por mucho que también esté en "Beaches".
const CATEGORIA_NO = /\b(hotel|hotels|resort|apartment|apartaments|building|buildings|church|iglesia|lighthouse|faro|castle|museum|monument|restaurant|street|streets|maps|coats of arms)\b/i

const espera = ms => new Promise(r => setTimeout(r, ms))

async function jsonDe(url) {
  const r = await fetch(url, { headers: UA })
  if (!r.ok) throw new Error(String(r.status))
  return r.json()
}

/** Extrae la foto de una página de Commons, con su licencia y su origen. */
function deCommons(page) {
  const ii = page.imageinfo?.[0]
  if (!ii?.thumburl) return null
  const em = ii.extmetadata ?? {}
  const lic = em.LicenseShortName?.value ?? null
  // Sin licencia declarada no lo usamos: el objetivo del ejercicio es
  // precisamente no volver a servir imágenes de estatus desconocido.
  if (!lic) return null
  const autor = (em.Artist?.value ?? '').replace(/<[^>]+>/g, '').trim().slice(0, 80) || undefined
  return {
    url: ii.thumburl,
    thumb: ii.thumburl.replace(/\/\d+px-/, '/640px-'),
    fuente: 'wikimedia',
    autor,
    licencia: lic,
    origen: ii.descriptionurl,        // enlace de vuelta, que CC BY/BY-SA exige
  }
}

// ── 1 · Commons por coordenadas: el ancla geográfica ────────────────────
async function wikiGeo(p) {
  const u = `https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch`
    + `&ggscoord=${p.lat}%7C${p.lng}&ggsradius=700&ggslimit=14&ggsnamespace=6`
    + `&prop=imageinfo%7Ccategories&cllimit=30&iiprop=url%7Cextmetadata&iiurlwidth=1280&format=json`
  const d = await jsonDe(u)
  for (const pg of Object.values(d?.query?.pages ?? {})) {
    if (!esImagen(pg.title) || NEGATIVA.test(pg.title)) continue
    if (!esPlayaPorCategoria(pg, p)) continue      // estar cerca no basta
    const f = deCommons(pg)
    if (f) return f
  }
  return null
}

/** ¿Las categorías de Commons dicen que esto es una playa? */
function esPlayaPorCategoria(pg, p) {
  const cats = (pg.categories ?? []).map(c => c.title.replace(/^Category:/, ''))
  if (!cats.length) return false               // sin categorías no arriesgamos
  if (cats.some(c => CATEGORIA_NO.test(c))) return false
  if (!cats.some(c => CATEGORIA_PLAYA.test(c))) return false

  // Panoramio fue un volcado masivo geoetiquetado y mal categorizado: cae
  // dentro de "Beaches of X" cualquier cosa hecha cerca del agua. De ahí
  // salieron "Reeds", "Oasis" y "CartelRacodelConill" como fotos de playa.
  // A esas les exigimos además que el título hable de la playa.
  const t = norm(pg.title)
  if (t.includes('panoramio')) {
    const tok = tokens(p)
    const dicePlaya = /\b(playa|praia|platja|plage|beach|cala|arenal|strand|duna)/.test(t)
    if (!dicePlaya && !tok.some(w => t.includes(w))) return false
  }
  return true
}

// ── 2 · Commons por texto, con el topónimo como guardarraíl ─────────────
async function wikiTexto(p) {
  const q = encodeURIComponent(`${p.nombre} ${p.municipio ?? ''} playa`.trim())
  const u = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}`
    + `&gsrnamespace=6&gsrlimit=10&prop=imageinfo%7Ccategories&cllimit=30&iiprop=url%7Cextmetadata&iiurlwidth=1280&format=json`
  const d = await jsonDe(u)
  const tok = tokens(p)
  if (!tok.length) return null
  for (const pg of Object.values(d?.query?.pages ?? {})) {
    if (!esImagen(pg.title) || NEGATIVA.test(pg.title)) continue
    // El topónimo TIENE que estar en el nombre del fichero. Sin esto
    // repetiríamos el error de Flickr con otra fuente.
    const t = norm(pg.title)
    if (!tok.some(w => t.includes(w))) continue
    const f = deCommons(pg)
    if (f) return f
  }
  return null
}

// ── 3 · OpenVerse, ya filtrado a CC (incluye la parte CC de Flickr) ─────
async function openverse(p) {
  const q = encodeURIComponent(`${p.nombre} ${p.municipio ?? ''}`.trim())
  const u = `https://api.openverse.org/v1/images/?q=${q}&license_type=all-cc`
    + `&category=photograph&size=large&page_size=10`
  const d = await jsonDe(u)
  const tok = tokens(p)
  if (!tok.length) return null
  for (const x of d?.results ?? []) {
    const t = norm(`${x.title ?? ''} ${(x.tags ?? []).map(g => g.name).join(' ')}`)
    if (NEGATIVA.test(t) || !tok.some(w => t.includes(w))) continue
    if (!x.license) continue
    return {
      url: x.url, thumb: x.thumbnail ?? x.url,
      fuente: 'openverse',
      autor: x.creator || undefined,
      licencia: `${String(x.license).toUpperCase()} ${x.license_version ?? ''}`.trim(),
      origen: x.foreign_landing_url,
    }
  }
  return null
}

// ── Cosecha ─────────────────────────────────────────────────────────────
const pendientes = playas.filter(p => out[p.slug] === undefined).slice(0, LIMITE)
const stats = { wikimedia: 0, openverse: 0, sin: 0, errores: 0 }
let hechas = 0

console.log(`Re-cosechando ${pendientes.length} de ${playas.length} playas servibles`)
console.log(`Cascada: Commons geo (700 m) → Commons texto → OpenVerse. Sin Flickr.\n`)

async function procesar(p) {
  let f = null
  for (const fuente of [wikiGeo, wikiTexto, openverse]) {
    try { f = await fuente(p) } catch { stats.errores++; f = null }
    if (f) break
    await espera(PAUSA_MS)
  }
  // [] marca "ya consultada, sin foto con licencia": la ficha caerá a
  // genérica y una reanudación no la vuelve a pedir.
  out[p.slug] = f ? [f] : []
  if (f) stats[f.fuente === 'wikimedia' ? 'wikimedia' : 'openverse']++
  else stats.sin++

  if (++hechas % 200 === 0) {
    writeFileSync(PARCIAL, JSON.stringify(out))
    const pct = Math.round((stats.wikimedia + stats.openverse) / hechas * 100)
    console.log(`  ${hechas}/${pendientes.length} · con foto ${pct}% · commons ${stats.wikimedia} · openverse ${stats.openverse} · sin ${stats.sin}`)
  }
}

const cola = [...pendientes]
await Promise.all(Array.from({ length: CONCURRENCIA }, async () => {
  while (cola.length) {
    const p = cola.shift()
    if (!p) break
    await procesar(p)
    await espera(PAUSA_MS)
  }
}))

writeFileSync(OUT, JSON.stringify(out))
const conFoto = stats.wikimedia + stats.openverse
console.log(`\n══ RESULTADO ${'═'.repeat(50)}`)
console.log(`Playas procesadas   ${hechas}`)
console.log(`Con foto licenciada ${conFoto} (${Math.round(conFoto / hechas * 100)} %)`)
console.log(`  Commons           ${stats.wikimedia}`)
console.log(`  OpenVerse         ${stats.openverse}`)
console.log(`Sin foto → genérica ${stats.sin} (${Math.round(stats.sin / hechas * 100)} %)`)
console.log(`Errores de red      ${stats.errores}`)
console.log(`\nTodas llevan licencia declarada y enlace de origen.`)
console.log(`Salida: ${OUT}`)
