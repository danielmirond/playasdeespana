#!/usr/bin/env node
// scripts/enrich-magazine-images.mjs
//
// Resuelve UNA foto real para cada pieza del Magazine usando EXACTAMENTE la
// misma cascada que las fichas de playa (src/lib/fotos.ts), de más preciso a
// más genérico:
//   1. Wikimedia Commons geosearch (700m)         — sin key
//   2. Wikipedia ES lead-image (foto canónica)    — sin key
//   3. OpenVerse (agregador CC)                    — sin key
//   4. Flickr (feed público por tags)             — sin key
//   5. Wikimedia Commons text search              — sin key
//   6. Pexels (PEXELS_API_KEY)                     — opcional
//   7. Unsplash (UNSPLASH_ACCESS_KEY)             — opcional
//
// Guarda el resultado en src/lib/magazine-images.json (slug → {url, thumb,
// source, author}) para que el build de Next NO haga red.
//
// Cada artículo se asocia a una playa real de public/data/playas.json (por el
// nombre extraído del título) para obtener coordenadas y poder usar geosearch
// + lead-image, igual que las fichas. Si no hay match, la cascada corre por
// nombre sin coords (salta geosearch).
//
// Uso:
//   node scripts/enrich-magazine-images.mjs              # solo faltantes
//   node scripts/enrich-magazine-images.mjs --force      # re-resuelve todo
//   node scripts/enrich-magazine-images.mjs <slug> [<slug>…]   # solo esos slugs
//   node scripts/enrich-magazine-images.mjs --dry-run <slug>   # resuelve, compara con lo guardado, no escribe
// Las keys (opcionales) se leen de process.env (carga .env.local antes).

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const MAGAZINE_TS = resolve(ROOT, 'src/lib/magazine.ts')
const IMAGES_JSON = resolve(ROOT, 'src/lib/magazine-images.json')
const PLAYAS_JSON = resolve(ROOT, 'public/data/playas.json')

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''
const PEXELS_KEY = process.env.PEXELS_API_KEY ?? ''

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
// --dry-run: resuelve y enseña qué escribiría, pero no toca el JSON. Para
// comprobar que un cambio del script no empeora artículos ya ilustrados.
const DRY_RUN = args.includes('--dry-run')
const ONLY_SLUGS = args.filter(a => !a.startsWith('--'))

// ── utilidades ───────────────────────────────────────────────
const normalizar = (s) => (s ?? '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

// Wikimedia exige un User-Agent que diga quién llama y limita el ritmo con
// dureza. Sin esas dos cosas responde «You are making too many requests» o
// 429, y lo peor es que eso NO parece un error: la fuente devuelve vacío, la
// cascada pasa a la siguiente y el artículo acaba con una foto peor sin que
// nadie se entere. Pasó en esta misma auditoría dos veces.
const UA = 'playas-espana.com/1.0 (enriquecedor de heroes del magazine; https://playas-espana.com)'

/* Un error de la API NO es «no hay fotos».
 *
 * Commons devuelve 429 cuando se le pide deprisa y, cuando su buscador va
 * cargado, un 200 con {"error":{"code":"cirrussearch-too-busy-error"}}. Las
 * dos cosas llegaban aquí como una lista vacía, la cascada pasaba a la
 * fuente siguiente y el artículo se quedaba con una foto de Flickr de 1.024
 * px teniendo una de 3.000 en Commons. Sin error en ningún log: la foto
 * aparecía, solo que era la mala.
 *
 * Por eso los errores se reintentan y, si al final no hay manera, se avisa
 * en vez de devolver vacío. */
const ERRORES_REINTENTABLES = /too-busy|ratelimit|readonly|maxlag|internal_api_error/i

async function jsonWiki(url, intentos = 3) {
  for (let i = 0; i < intentos; i++) {
    try {
      const r = await fetchT(url)
      if (!r.ok) { await dormir(1500 * (i + 1)); continue }
      const j = await r.json()
      if (j?.error) {
        if (!ERRORES_REINTENTABLES.test(j.error.code ?? '')) return null
        await dormir(2500 * (i + 1))
        continue
      }
      return j
    } catch { await dormir(1500 * (i + 1)) }
  }
  console.warn(`    (Commons no responde para ${new URL(url).searchParams.get('ggscoord') ?? new URL(url).searchParams.get('gsrsearch') ?? '?'})`)
  return null
}
const dormir = ms => new Promise(r => setTimeout(r, ms))
let ultimaWikimedia = 0

async function fetchT(url, opts, timeoutMs = 8000) {
  const esWikimedia = /wikimedia\.org|wikipedia\.org/.test(url)
  if (esWikimedia) {
    const espera = 1100 - (Date.now() - ultimaWikimedia)
    if (espera > 0) await dormir(espera)
    ultimaWikimedia = Date.now()
  }
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), timeoutMs)
  try {
    const r = await fetch(url, { ...opts, signal: c.signal, headers: { 'User-Agent': UA, ...(opts?.headers ?? {}) } })
    if (esWikimedia && (r.status === 429 || r.status === 403)) {
      clearTimeout(t)
      await dormir(5000)
      ultimaWikimedia = Date.now()
      return await fetch(url, { ...opts, headers: { 'User-Agent': UA, ...(opts?.headers ?? {}) } })
    }
    return r
  } finally { clearTimeout(t) }
}

const NEGATIVAS = new RegExp('\\b(' +
  'map|mapa|plan(o|os)?|logo|flag|bandera|diagram|diagrama|coat|escudo|sign|placa|coordinate|rotulo|icon|chart|grafic|' +
  'iglesia|church|ermita|capilla|basilica|catedral|cathedral|convento|monasterio|monastery|abadia|abbey|santuario|' +
  'monumento|monument|estatua|statue|busto|bust|escultura|sculpture|museo|museum|ayuntamiento|edificio|building|fachada|facade|' +
  'castillo|castle|fortaleza|fortress|alcazaba|alcazar|tower|cementerio|cemetery|tumba|tomb|necropolis|' +
  'street(view)?|streetview|mapillary|panoramio|driving|coche|car|vehiculo|vehicle|camion|truck|bus|train|aerial|drone|' +
  'interior(_de)?|tanque|tank|militar|military|ejercito|army|guerra|war|soldado|soldier|arma|weapon|cuartel|barracks|maniobra|training_exercise|' +
  'motocross|motorbike|motorcycle|motocicleta|moto_|enduro|carrera|race|racing|carreras|competicion|maraton|marathon|futbol|football|baloncesto|basketball|tenis|tennis|golf|' +
  'concierto|concert|festival|fiesta|party|disco|nightclub|fabrica|factory|industrial|silo|chimenea|chimney|grua|crane|' +
  'retrato|portrait|selfie|autorretrato|self_portrait|posing|posando|modelo|model|models|modelos|modeling|fashion|moda|' +
  'family|familia|wedding|boda|novio|novia|bride|groom|niño|niños|nina|ninas|kid|kids|child|children|baby|bebe|toddler|' +
  'gente|people|crowd|multitud|grupo|group|equipo|team|bañista|bañistas|bather|bathers|swimmer|swimmers|' +
  'sunbather|tomando_el_sol|tumbado|tumbada|broncear|tanning|beachgoer|beachgoers|turista|tourist|visitante|visitor|' +
  'amigos|friends|pareja|couple|abrazo|hug|kissing|besando|bikini|swimsuit|topless|nudista|nudist|naked|nude|desnudo|desnuda|' +
  'parking_lot|garaje|garage|hotel(?!_playa)|restaurante(?!_playa)' +
  ')\\b', 'i')

const POSITIVAS = new RegExp('\\b(' +
  'beach|playa(?!_de_aparcamiento)|platja|praia|costa|coast|shore|orilla|ribera|litoral|seaside|seafront|' +
  'mar|sea|ocean|oceano|bahia|bay|ensenada|cala|caleta|arena|sand|sandy|duna|dune|guijarro|pebble|rocosa|' +
  'acantilado|cliff|escarpado|rompiente|cantera|paseo_maritimo|chiringuito|sombrilla|umbrella|hamaca|paseo|' +
  'surf|surfing|kitesurf|windsurf|snorkel|paddle|kayak|atardecer|sunset|amanecer|sunrise|horizonte|horizon|' +
  'panoramica|panorama|vista|view' +
  ')\\b', 'i')

const PALABRAS_GENERICAS = new Set(['playa','playas','platja','platges','praia','praias','cala','caleta','calas','beach','beaches','plage','plages','punta','puntas','acces','access','area','pequena','grande','principal','islas','isla','illa','illes','illas','mar','sea','costa','east','oeste','norte','sur'])

function extraerFotosDePages(pages) {
  return pages.map((p) => {
    const ii = p.imageinfo?.[0]
    if (!ii?.thumburl) return null
    const titulo = (p.title ?? '').toLowerCase()
    if (NEGATIVAS.test(titulo)) return null
    // Wikimedia empezó a colgar parámetros UTM de la URL del fichero
    // (…/Foo.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo),
    // así que coger lo que hay tras el último punto devolvía
    // «org&utm_campaign=imageinfo…» y NINGUNA foto de Commons pasaba este
    // filtro. Silenciosamente: la cascada seguía a la fuente siguiente y
    // el magazine entero acabó ilustrado con Flickr a 1.024 px.
    const ext = ii.url?.split('?')[0]?.split('.').pop()?.toLowerCase()
    if (!['jpg','jpeg','png','webp'].includes(ext ?? '')) return null
    try {
      const u = new URL(ii.thumburl)
      if (!u.hostname?.includes('wikimedia.org')) return null
      if (!/\.(jpg|jpeg|png|webp)(\?|$)/i.test(ii.thumburl)) return null
    } catch { return null }
    const w = ii.width ?? 0, h = ii.height ?? 0
    if (w > 0 && h > 0) { if (w < 500) return null; const r = w / h; if (r < 0.7 || r > 3) return null }
    const score = POSITIVAS.test(titulo) ? 1 : 0
    return {
      score, url: ii.thumburl, thumb: ii.thumburl, source: 'Wikimedia Commons',
      // La API ya dice el tamaño: medirlo bajando bytes fallaba en los JPEG
      // progresivos y tiraba fotos válidas a la basura.
      ancho: ii.thumbwidth ?? ii.width, alto: ii.thumbheight ?? ii.height,
      author: ii.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').slice(0, 60) || undefined,
      // Título de Commons con espacios ("File:Playa de La Concha en Donostia.jpg").
      // Lo guardamos para que los filtros de wikimediaGeo lo usen en vez de la
      // URL: en la URL las palabras van unidas por `_`, que es carácter de
      // palabra, y `\bplaya\b` no casa nunca con "Playa_de_La_Concha". main()
      // copia campos explícitos al JSON, así que esto no se persiste.
      titulo: p.title ?? '',
    }
  }).filter(Boolean).sort((a, b) => b.score - a.score).map(({ score, ...r }) => r)
}

/** Texto legible del fichero: título de Commons si lo hay, si no el nombre
 *  del fichero sacado de la URL, con `_` y `-` convertidos en espacios. */
function textoFichero(f) {
  if (f.titulo) return f.titulo.replace(/^file:/i, '').replace(/[_-]+/g, ' ').toLowerCase()
  try { return decodeURIComponent((f.url.split('?')[0] ?? '').split('/').pop() ?? '').replace(/[_-]+/g, ' ').toLowerCase() } catch { return '' }
}

/** Tokens discriminantes de un nombre: el nombre entero normalizado y cada
 *  palabra de ≥4 letras. `alias` añade nombres alternativos (los del heroQuery:
 *  «la concha», «donostia» para una playa que el dataset llama «Kontxa hondartza»). */
function tokensDe(nombre, alias = []) {
  const out = new Set()
  for (const n of [nombre, ...alias]) {
    if (!n) continue
    const entero = normalizar(n); if (entero.length >= 4) out.add(entero)
    for (const t of n.toLowerCase().split(/[\s-]+/).map(normalizar)) if (t.length >= 4) out.add(t)
  }
  return [...out]
}

// 1 · Wikimedia geosearch
async function wikimediaGeo(lat, lon, nombre, alias = []) {
  if (lat == null || lon == null) return []
  try {
    const params = new URLSearchParams({ action:'query', generator:'geosearch', ggsnamespace:'6', ggscoord:`${lat}|${lon}`, ggsradius:'700', ggslimit:'30', prop:'imageinfo|pageprops', iiprop:'url|extmetadata|size', iiurlwidth:'1200', format:'json', origin:'*' })
    const data = await jsonWiki(`https://commons.wikimedia.org/w/api.php?${params}`)
    if (!data) return []
    const pages = Object.values(data.query?.pages ?? {})
    if (process.env.DEBUG_CASCADA) console.error(`    [wikimediaGeo] ${pages.length} fichero(s) en 700 m`)
    // POSITIVAS y los tokens del nombre se aplican sobre el título con
    // espacios, no sobre la URL. Medido con La Concha (13-oct-2026): el
    // geosearch devolvía 30 ficheros, 6 con "playa"/"beach"/"bahia" en el
    // título, y el filtro por URL los tiraba todos porque `_` es carácter de
    // palabra y `\bplaya\b` no casa con "Playa_de_La_Concha". El artículo
    // acabó en Flickr con una panorámica de 1021×194.
    const validas = extraerFotosDePages(pages)
    if (process.env.DEBUG_CASCADA) console.error(`    [wikimediaGeo] ${validas.length} pasan NEGATIVAS/tamaño/ratio: ${validas.slice(0, 8).map(f => `«${textoFichero(f)}»`).join(', ')}${validas.length > 8 ? ', …' : ''}`)
    let beachish = validas.filter(f => POSITIVAS.test(textoFichero(f)))
    if (nombre && beachish.length > 1) {
      const tokens = tokensDe(nombre, alias)
      const conNombre = beachish.filter(f => { const fn = normalizar(textoFichero(f)); return tokens.some(t => fn.includes(t)) })
      if (conNombre.length > 0) beachish = conNombre
    }
    return beachish.slice(0, 6)
  } catch (e) { if (process.env.DEBUG_CASCADA) console.error(`    [wikimediaGeo] error: ${e.message}`); return [] }
}

// 2 · Wikipedia ES lead-image
async function wikipediaLead(nombre, municipio, lat, lon, alias = []) {
  // Los discriminantes salen del nombre del dataset Y de los alias del
  // heroQuery. Sin los alias, «Kontxa hondartza» exigía "kontxa" en el título
  // del artículo de es.wikipedia, que es «Playa de la Concha (San Sebastián)»,
  // y el paso 2 se caía para toda playa con nombre en euskera/catalán/gallego
  // cuyo artículo está titulado en castellano.
  const palabraDiscriminante = (t) => t.length >= 4 && !PALABRAS_GENERICAS.has(t)
  const tokensNombre = nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(palabraDiscriminante)
  const tokensAlias = alias.flatMap(a => a.toLowerCase().split(/[\s-]+/).map(normalizar)).filter(palabraDiscriminante)
  const tokensDiscriminantes = [...new Set([...tokensNombre, ...tokensAlias])]
  if (tokensDiscriminantes.length === 0) return []
  const MARCADORES = /^(playa|playas|beach|beaches|praia|praias|platja|platges|cala|caleta|calita|bahia|ensenada|hondartza|cap|cabo)$/i
  const NEG_TIT = /^(mairie|ayuntamiento|udaletxe|concello|prefectura|prefecture|hoteldeville|townhall|consistorio|alcaldia)$/i
  const palabras = (t) => (t ?? '').toLowerCase().split(/[\s\-_().,;:'"·•/]+/).map(normalizar).filter(Boolean)
  // Las búsquedas por alias van detrás: solo se llega a ellas si el nombre
  // del dataset no da ningún candidato.
  const aliasBuscables = alias.filter(a => normalizar(a) !== normalizar(nombre) && normalizar(a) !== normalizar(municipio))
  const queries = [`Playa de ${nombre}`, nombre, `${nombre} ${municipio}`, ...aliasBuscables.map(a => `Playa de ${a} ${municipio}`)]
  for (const q of queries) {
    try {
      const params = new URLSearchParams({ action:'query', generator:'search', gsrsearch:q, gsrlimit:'8', prop:'pageimages|pageprops|coordinates', piprop:'original|thumbnail', pithumbsize:'1200', colimit:'5', format:'json', origin:'*' })
      const data = await jsonWiki(`https://es.wikipedia.org/w/api.php?${params}`)
      if (!data) continue
      const pages = Object.values(data?.query?.pages ?? {})
      const cand = pages
        .filter(p => !p?.pageprops?.disambiguation)
        .filter(p => typeof p?.original?.source === 'string')
        .filter(p => /\.(jpe?g|png|webp)(\?|$)/i.test(p.original.source))
        .filter(p => { const fn = decodeURIComponent((p.original.source.split('?')[0] ?? '').split('/').pop() ?? '').toLowerCase(); if (NEGATIVAS.test(fn)) return false; const fw = palabras(fn.replace(/\.(jpe?g|png|webp).*/i, '')); return !fw.some(w => NEG_TIT.test(w)) })
        .filter(p => !palabras(p.title ?? '').some(w => NEG_TIT.test(w)))
        .filter(p => tokensDiscriminantes.some(t => palabras(p.title ?? '').includes(t)))
        .filter(p => { const tw = palabras(p.title ?? ''); if (tw.some(w => MARCADORES.test(w))) return true; const flat = tw.join(''); if (tokensDiscriminantes.some(t => t === flat)) return true; if (flat === normalizar(nombre)) return true; return false })
        .filter(p => {
          if (lat == null || lon == null) return true
          const co = p.coordinates; if (!co || co.length === 0) return true
          const c = co[0]; if (typeof c.lat !== 'number' || typeof c.lon !== 'number') return true
          const toRad = d => d * Math.PI / 180, R = 6371
          const dLat = toRad(c.lat - lat), dLon = toRad(c.lon - lon)
          const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat))*Math.cos(toRad(c.lat))*Math.sin(dLon/2)**2
          return 2*R*Math.asin(Math.sqrt(a)) <= 50
        })
      if (cand.length === 0) continue
      const scored = cand.map(p => {
        const tn = normalizar(p.title ?? ''); let s = 0
        if (tn === normalizar(`playa de ${nombre}`)) s += 100
        if (tn === normalizar(nombre)) s += 90
        if (/^playa de /i.test(p.title ?? '')) s += 30
        if (tokensDiscriminantes[0] && tn.includes(tokensDiscriminantes[0])) s += 20
        return { p, s }
      }).sort((a, b) => b.s - a.s)
      // Se pide pithumbsize=1200 y luego se guardaba `original`, que es el
      // fichero tal cual subió alguien: a veces 4.000 px y a veces 200x133.
      // Nueve heroes publicados venían de ahí y no llegaban al mínimo de
      // Discover. La miniatura de 1.200 es exactamente lo que hace falta;
      // cuando el original es más pequeño, Wikipedia no la amplía y la
      // puerta de tamaño la descarta, que es lo correcto.
      const fotos = scored.map(({ p }) => {
        const mini = p.thumbnail
        const orig = p.original
        const el = mini ?? orig
        return {
          url: el.source, thumb: el.source, source: 'Wikipedia', author: undefined,
          ancho: el.width, alto: el.height,
        }
      })
      if (fotos.length >= 1) return fotos.slice(0, 3)
    } catch { continue }
  }
  return []
}

// 3 · OpenVerse
async function openverse(nombre, municipio) {
  const tokens = [normalizar(nombre), ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4)].filter(Boolean)
  const queries = [`"${nombre}" "${municipio}"`, `"${nombre}" ${municipio} beach`, `${nombre} ${municipio} playa`]
  for (const q of queries) {
    try {
      const params = new URLSearchParams({ q, license_type:'all-cc', category:'photograph', size:'large', aspect_ratio:'wide', page_size:'8' })
      const res = await fetchT(`https://api.openverse.org/v1/images/?${params}`)
      if (!res.ok) continue
      const data = await res.json()
      const fotos = (data?.results ?? []).map(r => {
        const url = r.url; if (!url || typeof url !== 'string') return null
        const titulo = (r.title ?? '').toLowerCase()
        if (NEGATIVAS.test(titulo) || !POSITIVAS.test(titulo)) return null
        const tn = normalizar(titulo)
        if (!tokens.some(t => t.length >= 4 && tn.includes(t))) return null
        return { url, thumb: r.thumbnail ?? url, source: 'OpenVerse', author: r.creator?.slice(0, 60) || undefined }
      }).filter(Boolean)
      if (fotos.length >= 1) return fotos.slice(0, 6)
    } catch { continue }
  }
  return []
}

// 4 · Flickr
async function flickr(nombre, municipio) {
  const nT = normalizar(nombre), mT = normalizar(municipio)
  const tokens = [nT, ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4)].filter(Boolean)
  const queries = [`${nT},${mT},beach`, `${nT},beach`, `${nT},playa`].filter(t => !t.startsWith(',') && !t.endsWith(','))
  for (const tags of queries) {
    try {
      const params = new URLSearchParams({ format:'json', nojsoncallback:'1', tags, tagmode:'all' })
      const res = await fetchT(`https://www.flickr.com/services/feeds/photos_public.gne?${params}`)
      if (!res.ok) continue
      const data = await res.json()
      const fotos = (data?.items ?? []).map(item => {
        const titulo = (item.title ?? '').toLowerCase(), tagsStr = (item.tags ?? '').toLowerCase()
        if (NEGATIVAS.test(titulo) || NEGATIVAS.test(tagsStr)) return null
        if (!POSITIVAS.test(titulo) && !POSITIVAS.test(tagsStr)) return null
        const tn = normalizar(titulo), tg = normalizar(tagsStr)
        if (!tokens.some(t => t.length >= 4 && (tn.includes(t) || tg.includes(t)))) return null
        const m = item.media?.m ?? ''; if (!m || !/_m\.(jpg|jpeg|png)/i.test(m)) return null
        // El sufijo decide el ancho: _m 240, _c 800, _b 1024, _h 1600, _k 2048.
        // Se guardaba _c, o sea 800, y Discover pide 1.200 de ancho mínimo
        // para la tarjeta grande. Se pide el mayor que exista; cuál es lo
        // resuelve mayorFlickr con una cabecera, porque no todas las fotos
        // tienen los tamaños grandes publicados.
        return { url: m.replace(/_m\.(jpg|jpeg|png)/i, '_c.$1'), thumb: m, source: 'Flickr', author: item.author?.replace(/^.*\("(.+)"\)$/, '$1') || undefined }
      }).filter(Boolean)
      if (fotos.length >= 2) return fotos.slice(0, 6)
    } catch { continue }
  }
  return []
}

// 5 · Wikimedia text
async function wikimediaText(nombre, municipio) {
  const n = nombre.replace(/"/g, ''), m = municipio.replace(/"/g, '')
  const tokens = nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4 && !PALABRAS_GENERICAS.has(t))
  const queries = [`"${n}" "${m}"`, `"${n}" ${m} beach`, `"${n}" ${m} playa`, `"${n}" ${m}`]
  for (const q of queries) {
    try {
      const params = new URLSearchParams({ action:'query', generator:'search', gsrnamespace:'6', gsrsearch:`${q} filetype:bitmap`, gsrlimit:'10', prop:'imageinfo|pageprops', iiprop:'url|extmetadata|size', iiurlwidth:'1200', format:'json', origin:'*' })
      const data = await jsonWiki(`https://commons.wikimedia.org/w/api.php?${params}`)
      if (!data) continue
      const raw = extraerFotosDePages(Object.values(data.query?.pages ?? {}))
      const fotos = tokens.length > 0 ? raw.filter(f => { const fn = normalizar(decodeURIComponent((f.url.split('?')[0] ?? '').split('/').pop() ?? '').replace(/\.(jpe?g|png|webp).*/i, '')); return tokens.some(t => fn.includes(t)) }) : raw
      if (fotos.length >= 2) return fotos.slice(0, 6)
    } catch { continue }
  }
  return []
}

// 6 · Pexels
async function pexels(nombre, municipio) {
  if (!PEXELS_KEY) return []
  const tokens = [normalizar(nombre), ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4)].filter(Boolean)
  if (tokens.length === 0) return []
  const queries = [`${nombre} ${municipio} beach`, `${nombre} ${municipio} playa`, `${nombre} beach`]
  for (const q of queries) {
    try {
      const res = await fetchT(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=6&orientation=landscape&size=large`, { headers: { Authorization: PEXELS_KEY } })
      if (!res.ok) continue
      const data = await res.json()
      const fotos = (data?.photos ?? []).map(p => {
        const url = p.src?.large2x ?? p.src?.large ?? p.src?.original; if (!url) return null
        const tn = normalizar(`${p.alt ?? ''} ${p.url ?? ''}`)
        if (!tokens.some(t => t && tn.includes(t))) return null
        return { url, thumb: p.src?.medium ?? p.src?.small, source: 'Pexels', author: p.photographer || undefined }
      }).filter(Boolean)
      if (fotos.length >= 1) return fotos.slice(0, 6)
    } catch { continue }
  }
  return []
}

// 7 · Unsplash
async function unsplash(nombre, municipio) {
  if (!UNSPLASH_KEY) return []
  const tokens = [normalizar(nombre), ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4)].filter(Boolean)
  if (tokens.length === 0) return []
  const queries = [`${nombre} ${municipio} beach`, `${nombre} ${municipio} playa`, `${nombre} beach`]
  for (const q of queries) {
    try {
      const res = await fetchT(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=6&orientation=landscape&content_filter=high`, { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } })
      if (!res.ok) continue
      const data = await res.json()
      const fotos = (data.results ?? []).map(p => {
        const tn = normalizar(`${p.description ?? ''} ${p.alt_description ?? ''} ${(p.tags ?? []).map(t => t?.title ?? '').join(' ')}`)
        if (!tokens.some(t => t && tn.includes(t))) return null
        return { url: p.urls.regular, thumb: p.urls.small, source: 'Unsplash', author: p.user?.name || undefined }
      }).filter(Boolean)
      if (fotos.length >= 1) return fotos.slice(0, 6)
    } catch { continue }
  }
  return []
}

// Cascada con prioridad idéntica a fotos.ts (primera fuente no vacía gana).
//
// wikimediaText va TERCERA, como en fotos.ts. Estaba quinta, detrás de
// Flickr, y el comentario ya decía "idéntica a fotos.ts" cuando no lo era.
// El coste real: el artículo de Playa de Nogales (31-jul-2026) se ilustró
// con una foto de Flickr marcada "All rights reserved" existiendo en
// Commons "Playa de Nogales, La Palma, overview.jpg" en CC0, con el
// topónimo exacto en el nombre del fichero.
//
// Ojo con Flickr: photos_public.gne es el feed público y NO admite filtro
// de licencia, así que lo que devuelve puede ser "todos los derechos
// reservados". Por eso va detrás de todas las fuentes que sí garantizan
// licencia libre (Commons, OpenVerse), y por eso conviene revisar a mano
// lo que salga de ahí antes de publicarlo.
/* ── El tamaño decide si la tarjeta entra en Discover ──────────────
 *
 * Requisitos de Google para la imagen grande del feed: 1.200 px de ancho
 * como mínimo y más de 300.000 px en total. Medido el 13-oct-2026 sobre
 * los 84 heroes publicados: solo 48 cumplían. Los 24 de Flickr fallaban
 * todos —el feed público no publica nada por encima de 1.024— y siete de
 * ellos eran verticales, que en una tarjeta apaisada es peor que pequeño.
 *
 * Así que la cascada ya no se queda con la primera foto que encuentra: se
 * queda con la primera que SIRVE. Si ninguna sirve, devuelve la mejor que
 * haya y lo dice, porque una foto pequeña sigue siendo mejor que ninguna.
 */
const ANCHO_DISCOVER = 1200
const PIXELES_DISCOVER = 300000

function dimensionesJPEG(d) {
  let i = 2
  while (i < d.length - 9) {
    if (d[i] !== 0xFF) { i++; continue }
    const m = d[i + 1]
    if (m >= 0xC0 && m <= 0xCF && ![0xC4, 0xC8, 0xCC].includes(m)) {
      return { w: d.readUInt16BE(i + 7), h: d.readUInt16BE(i + 5) }
    }
    i += 2 + d.readUInt16BE(i + 2)
  }
  return null
}

/** Dimensiones sin descargar la foto entera. null si no se puede saber. */
async function medirFoto(url, intento = 0) {
  try {
    const r = await fetchT(url, { headers: { Range: 'bytes=0-131071' } })
    // Wikimedia responde 429 si se le pide deprisa, y un 429 no es una foto
    // pequeña: confundir las dos cosas fue lo que ensució la primera medida.
    if (r.status === 429 && intento < 3) {
      await new Promise(res => setTimeout(res, 1500 * (intento + 1)))
      return medirFoto(url, intento + 1)
    }
    if (!r.ok && r.status !== 206) return null
    const d = Buffer.from(await r.arrayBuffer())
    if (d.slice(0, 2).toString('hex') === 'ffd8') return dimensionesJPEG(d)
    if (d.slice(1, 4).toString() === 'PNG') return { w: d.readUInt32BE(16), h: d.readUInt32BE(20) }
    return null
  } catch { return null }
}

function sirveParaDiscover(dim) {
  if (!dim) return false
  if (dim.h > dim.w) return false                       // vertical: no encuadra
  return dim.w >= ANCHO_DISCOVER && dim.w * dim.h >= PIXELES_DISCOVER
}

async function resolverFoto(nombre, municipio, lat, lon, alias = []) {
  const fuentes = [
    () => wikimediaGeo(lat, lon, nombre, alias),
    () => wikipediaLead(nombre, municipio, lat, lon, alias),
    () => wikimediaText(nombre, municipio),
    () => openverse(nombre, municipio),
    () => flickr(nombre, municipio),
    () => pexels(nombre, municipio),
    () => unsplash(nombre, municipio),
  ]
  let reserva = null
  for (const f of fuentes) {
    let candidatas = []
    try { candidatas = (await f()) ?? [] } catch { continue }
    if (process.env.DEBUG_CASCADA) console.error(`    [${f.toString().match(/\w+\(/)?.[0].slice(0, -1)}] ${candidatas.length} candidata(s)${candidatas[0] ? ` · 1ª: ${candidatas[0].titulo || candidatas[0].url}` : ''}`)
    for (const c of candidatas.slice(0, 4)) {
      const url = await mayorFlickr(c.url)
      // Si la fuente ya declaró el tamaño, se cree: una medición fallida no
      // es una foto pequeña, y confundirlas mandaba a Flickr artículos que
      // tenían una foto de 1.200 esperando en Commons.
      const dim = (c.ancho && c.alto) ? { w: c.ancho, h: c.alto } : await medirFoto(url)
      if (sirveParaDiscover(dim)) return { ...c, url, ancho: dim.w, alto: dim.h }
      // Se guarda la mayor por si al final no hay ninguna que cumpla.
      // Reserva: la mayor apaisada. Una vertical solo si no hay nada más,
      // porque en una tarjeta 16:9 se recorta fatal.
      const area = (dim?.w ?? 0) * (dim?.h ?? 0)
      const esVertical = dim ? dim.h > dim.w : false
      const reservaVertical = reserva ? (reserva.alto ?? 0) > (reserva.ancho ?? 0) : true
      const mejora = !reserva
        || (reservaVertical && !esVertical)
        || (reservaVertical === esVertical && area > (reserva.ancho ?? 0) * (reserva.alto ?? 0))
      if (mejora) reserva = { ...c, url, ancho: dim?.w, alto: dim?.h }
    }
  }
  return reserva
}

// ── extracción de artículos y matching con playas.json ───────
function parseArticles(src) {
  const from = src.indexOf('export const ARTICLES')
  const region = from >= 0 ? src.slice(from) : src
  const re = /slug:\s*'([^']+)'[\s\S]*?title:\s*\n?\s*'([^']+)'[\s\S]*?heroQuery:\s*'([^']+)'/g
  const out = []; let m
  while ((m = re.exec(region)) !== null) out.push({ slug: m[1], title: m[2], heroQuery: m[3] })
  return out
}

// Tokens del heroQuery que NO son un lugar (descriptores de la foto).
const GENERIC_HERO = new Set(['beach','beaches','cove','coves','sea','ocean','mediterranean','atlantic','dune','dunes','sand','sandy','coast','coastline','cliff','cliffs','island','islands','spain','espana','volcanic','texture','boat','sailboat','restaurant','seafood','food','morning','calm','summer','winter','spring','autumn','sunset','sunrise','blue','flag','lifeguard','erosion','gredas','water','crystal','clear','snorkel','diving','aerial','panorama','view'])

/** Candidatos-lugar del heroQuery (guiones → espacios), sin descriptores.
 *  Sirven para casar con playas.json y, después, como alias del nombre en la
 *  cascada: el dataset dice «Kontxa hondartza» y Commons/Wikipedia dicen
 *  «La Concha». */
function lugaresDelHero(heroQuery) {
  const heroToks = heroQuery.split(',').map(s => s.trim().replace(/-/g, ' ')).filter(Boolean)
  return heroToks.filter(t => !GENERIC_HERO.has(normalizar(t)))
}

/** `exigirRegion` fuerza que la región case: la primera pasada la usa para
 *  no quedarse con una homónima de otra provincia. «Platja Gran» hay cuatro. */
function matchPlaya(playas, nombre, region, exigirRegion = false) {
  const nN = normalizar(nombre), rN = normalizar(region)
  if (nN.length < 3) return null
  const cands = playas.filter(p => normalizar(p.nombre).includes(nN))
  if (cands.length === 0) return null
  if (rN) {
    const conRegion = cands.filter(p => [p.municipio, p.provincia, p.comunidad].some(x => normalizar(x).includes(rN) || rN.includes(normalizar(x))))
    if (conRegion.length) return conRegion[0]
  }
  return exigirRegion ? null : cands[0]
}

// Resuelve {nombre, municipio, lat, lon} para un artículo.
// 1) Si el título empieza con una playa concreta ("Playa de X, Región: …"),
//    úsalo. 2) Si el título es una frase, itera los tokens-lugar del heroQuery
//    y usa el primero que case con una playa real (da coords → geo+lead).
function resolvePlace(title, heroQuery, playas) {
  const head = (title.split(':')[0] || '').trim()
  const parts = head.split(',').map(s => s.trim())
  const tituloNombre = (parts[0] || '')
    .replace(/^(playa de la |playa de las |playa de los |playa del |playa de |playa |cala de la |cala de las |cala del |cala de |cala |islas |isla )/i, '')
    .trim()
  const tituloRegion = parts[1] || ''
  const sentenceLike = tituloNombre.split(/\s+/).length > 4 || /[¿?]/.test(tituloNombre)

  const heroPlaces = lugaresDelHero(heroQuery)

  // Orden de intentos de "nombre": título (si no es frase) y luego heroQuery.
  //
  // La REGIÓN también sale del heroQuery, no solo del título. Medido con
  // Tossa: el título es «Platja Gran de Tossa: …», sin coma, así que la
  // región salía vacía y «Platja Gran» casaba con la primera playa de ese
  // nombre en toda España —una sin foto— teniendo la de Tossa una al lado.
  // El heroQuery ya traía 'tossa de mar': basta con usarlo.
  const intentos = []
  const regiones = [tituloRegion, ...heroPlaces].filter(Boolean)
  if (tituloNombre && !sentenceLike) {
    for (const r of regiones) intentos.push({ nombre: tituloNombre, region: r })
    intentos.push({ nombre: tituloNombre, region: tituloRegion })
  }
  for (const t of heroPlaces) {
    for (const r of regiones) if (normalizar(r) !== normalizar(t)) intentos.push({ nombre: t, region: r })
    intentos.push({ nombre: t, region: tituloRegion })
  }

  // Primer intento que case con una playa real (mejor: aporta coords).
  for (const it of intentos) {
    const playa = matchPlaya(playas, it.nombre, it.region, true)
    if (playa) return { nombre: playa.nombre, municipio: playa.municipio, lat: playa.lat, lon: playa.lng }
  }
  for (const it of intentos) {
    const playa = matchPlaya(playas, it.nombre, it.region)
    if (playa) return { nombre: playa.nombre, municipio: playa.municipio, lat: playa.lat, lon: playa.lng }
  }
  // Sin match en playas: cascada solo por nombre (sin coords).
  const first = intentos[0]
  if (first) return { nombre: first.nombre, municipio: first.region || '', lat: undefined, lon: undefined }
  return null
}

/** El mayor tamaño que Flickr tenga publicado para esa foto. */
async function mayorFlickr(url) {
  if (!/live\.staticflickr\.com/.test(url)) return url
  for (const suf of ['_k', '_h', '_b']) {
    const prueba = url.replace(/_[a-z0-9]+\.(jpg|jpeg|png)$/i, `${suf}.$1`)
    try {
      const r = await fetchT(prueba, { method: 'HEAD' })
      if (r.ok) return prueba
    } catch { /* siguiente */ }
  }
  return url
}

// ── main ─────────────────────────────────────────────────────
async function main() {
  const [srcTs, playasRaw] = await Promise.all([readFile(MAGAZINE_TS, 'utf8'), readFile(PLAYAS_JSON, 'utf8')])
  const playas = JSON.parse(playasRaw)
  const articles = parseArticles(srcTs)
  let map = {}
  try { map = JSON.parse(await readFile(IMAGES_JSON, 'utf8')) } catch {}

  const targets = articles.filter(a => ONLY_SLUGS.length ? ONLY_SLUGS.includes(a.slug) : (FORCE || !map[a.slug]?.url))
  if (targets.length === 0) { console.log('✓ Nada que resolver (usa --force).'); return }

  console.log(`${DRY_RUN ? '[dry-run] ' : ''}Resolviendo ${targets.length} foto(s) con la cascada de fichas de playa…`)
  for (const a of targets) {
    const place = resolvePlace(a.title, a.heroQuery, playas)
    if (!place) { console.warn(`  · ${a.slug}: sin lugar resoluble`); continue }
    const { nombre, municipio, lat, lon } = place
    // Alias: los lugares del heroQuery que no son ya el nombre del dataset.
    const alias = lugaresDelHero(a.heroQuery).filter(t => normalizar(t) !== normalizar(nombre))
    try {
      const antes = map[a.slug]
      const foto = await resolverFoto(nombre, municipio, lat, lon, alias)
      if (!foto) { console.warn(`  · ${a.slug}: sin foto (nombre="${nombre}", coords=${lat != null})`); continue }
      if (DRY_RUN && antes?.url) {
        const igual = antes.url === foto.url
        console.log(`  ${igual ? '=' : '≠'} ${a.slug}\n      antes: ${antes.source}${antes.ancho ? ` ${antes.ancho}x${antes.alto}` : ''} ${antes.url}\n      ahora: ${foto.source}${foto.ancho ? ` ${foto.ancho}x${foto.alto}` : ''} ${foto.url}`)
      }
      // Las dimensiones se guardan: así la próxima auditoría no tiene que
      // volver a bajar 84 fotos para saber cuáles no entran en Discover.
      const sirve = sirveParaDiscover({ w: foto.ancho, h: foto.alto })
      map[a.slug] = {
        url: foto.url, thumb: foto.thumb || foto.url, source: foto.source,
        ...(foto.author ? { author: foto.author } : {}),
        ...(foto.ancho ? { ancho: foto.ancho, alto: foto.alto } : {}),
      }
      const marca = sirve ? '✓' : '~'
      const tam = foto.ancho ? ` ${foto.ancho}x${foto.alto}${sirve ? '' : ' ¡corta para Discover!'}` : ''
      console.log(`  ${marca} ${a.slug} → ${foto.source}${foto.author ? ` (${foto.author})` : ''}${tam}`)
    } catch (e) { console.warn(`  ✗ ${a.slug}: ${e.message}`) }
  }

  if (DRY_RUN) { console.log('[dry-run] No se escribe magazine-images.json.'); return }
  const sorted = Object.fromEntries(Object.keys(map).sort().map(k => [k, map[k]]))
  await writeFile(IMAGES_JSON, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`✓ Guardado en src/lib/magazine-images.json (${Object.keys(sorted).length} fotos).`)
}

main().catch(e => { console.error(e); process.exit(1) })
