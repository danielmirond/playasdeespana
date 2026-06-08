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
//   node scripts/enrich-magazine-images.mjs <slug>       # solo ese slug
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
const ONLY_SLUG = args.find(a => !a.startsWith('--'))

// ── utilidades ───────────────────────────────────────────────
const normalizar = (s) => (s ?? '').toLowerCase().normalize('NFD')
  .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

async function fetchT(url, opts, timeoutMs = 8000) {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), timeoutMs)
  try { return await fetch(url, { ...opts, signal: c.signal }) }
  finally { clearTimeout(t) }
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
    const ext = ii.url?.split('.').pop()?.toLowerCase()
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
      author: ii.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').slice(0, 60) || undefined,
    }
  }).filter(Boolean).sort((a, b) => b.score - a.score).map(({ score, ...r }) => r)
}

// 1 · Wikimedia geosearch
async function wikimediaGeo(lat, lon, nombre) {
  if (lat == null || lon == null) return []
  try {
    const params = new URLSearchParams({ action:'query', generator:'geosearch', ggsnamespace:'6', ggscoord:`${lat}|${lon}`, ggsradius:'700', ggslimit:'30', prop:'imageinfo|pageprops', iiprop:'url|extmetadata|size', iiurlwidth:'1200', format:'json', origin:'*' })
    const res = await fetchT(`https://commons.wikimedia.org/w/api.php?${params}`)
    if (!res.ok) return []
    const data = await res.json()
    const pages = Object.values(data.query?.pages ?? {})
    let beachish = extraerFotosDePages(pages).filter(f => { try { return POSITIVAS.test(decodeURIComponent(f.url).toLowerCase()) } catch { return false } })
    if (nombre && beachish.length > 1) {
      const tokens = [normalizar(nombre), ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4)].filter(Boolean)
      const conNombre = beachish.filter(f => { try { const url = decodeURIComponent(f.url).toLowerCase(); return tokens.some(t => t.length >= 4 && url.includes(t)) } catch { return false } })
      if (conNombre.length > 0) beachish = conNombre
    }
    return beachish.slice(0, 6)
  } catch { return [] }
}

// 2 · Wikipedia ES lead-image
async function wikipediaLead(nombre, municipio, lat, lon) {
  const tokensDiscriminantes = nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4 && !PALABRAS_GENERICAS.has(t))
  if (tokensDiscriminantes.length === 0) return []
  const MARCADORES = /^(playa|playas|beach|beaches|praia|praias|platja|platges|cala|caleta|calita|bahia|ensenada|hondartza|cap|cabo)$/i
  const NEG_TIT = /^(mairie|ayuntamiento|udaletxe|concello|prefectura|prefecture|hoteldeville|townhall|consistorio|alcaldia)$/i
  const palabras = (t) => (t ?? '').toLowerCase().split(/[\s\-_().,;:'"·•/]+/).map(normalizar).filter(Boolean)
  const queries = [`Playa de ${nombre}`, nombre, `${nombre} ${municipio}`]
  for (const q of queries) {
    try {
      const params = new URLSearchParams({ action:'query', generator:'search', gsrsearch:q, gsrlimit:'8', prop:'pageimages|pageprops|coordinates', piprop:'original|thumbnail', pithumbsize:'1200', colimit:'5', format:'json', origin:'*' })
      const res = await fetchT(`https://es.wikipedia.org/w/api.php?${params}`)
      if (!res.ok) continue
      const data = await res.json()
      const pages = Object.values(data?.query?.pages ?? {})
      const cand = pages
        .filter(p => !p?.pageprops?.disambiguation)
        .filter(p => typeof p?.original?.source === 'string')
        .filter(p => /\.(jpe?g|png|webp)(\?|$)/i.test(p.original.source))
        .filter(p => { const fn = decodeURIComponent(p.original.source.split('/').pop() ?? '').toLowerCase(); if (NEGATIVAS.test(fn)) return false; const fw = palabras(fn.replace(/\.(jpe?g|png|webp).*/i, '')); return !fw.some(w => NEG_TIT.test(w)) })
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
      const fotos = scored.map(({ p }) => ({ url: p.original.source, thumb: p.thumbnail?.source ?? p.original.source, source: 'Wikipedia', author: undefined }))
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
      const res = await fetchT(`https://commons.wikimedia.org/w/api.php?${params}`)
      if (!res.ok) continue
      const data = await res.json()
      const raw = extraerFotosDePages(Object.values(data.query?.pages ?? {}))
      const fotos = tokens.length > 0 ? raw.filter(f => { const fn = normalizar(decodeURIComponent(f.url.split('/').pop() ?? '').replace(/\.(jpe?g|png|webp).*/i, '')); return tokens.some(t => fn.includes(t)) }) : raw
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
async function resolverFoto(nombre, municipio, lat, lon) {
  const fuentes = [
    () => wikimediaGeo(lat, lon, nombre),
    () => wikipediaLead(nombre, municipio, lat, lon),
    () => openverse(nombre, municipio),
    () => flickr(nombre, municipio),
    () => wikimediaText(nombre, municipio),
    () => pexels(nombre, municipio),
    () => unsplash(nombre, municipio),
  ]
  for (const f of fuentes) {
    try { const r = await f(); if (r && r.length > 0) return r[0] } catch {}
  }
  return null
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

function matchPlaya(playas, nombre, region) {
  const nN = normalizar(nombre), rN = normalizar(region)
  if (nN.length < 3) return null
  const cands = playas.filter(p => normalizar(p.nombre).includes(nN))
  if (cands.length === 0) return null
  if (rN) {
    const conRegion = cands.find(p => [p.municipio, p.provincia, p.comunidad].some(x => normalizar(x).includes(rN) || rN.includes(normalizar(x))))
    if (conRegion) return conRegion
  }
  return cands[0]
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

  // Candidatos del heroQuery (guiones → espacios), descartando descriptores.
  const heroToks = heroQuery.split(',').map(s => s.trim().replace(/-/g, ' ')).filter(Boolean)
  const heroPlaces = heroToks.filter(t => !GENERIC_HERO.has(normalizar(t)))

  // Orden de intentos de "nombre": título (si no es frase) y luego heroQuery.
  const intentos = []
  if (tituloNombre && !sentenceLike) intentos.push({ nombre: tituloNombre, region: tituloRegion })
  for (const t of heroPlaces) intentos.push({ nombre: t, region: tituloRegion })

  // Primer intento que case con una playa real (mejor: aporta coords).
  for (const it of intentos) {
    const playa = matchPlaya(playas, it.nombre, it.region)
    if (playa) return { nombre: playa.nombre, municipio: playa.municipio, lat: playa.lat, lon: playa.lng }
  }
  // Sin match en playas: cascada solo por nombre (sin coords).
  const first = intentos[0]
  if (first) return { nombre: first.nombre, municipio: first.region || '', lat: undefined, lon: undefined }
  return null
}

// ── main ─────────────────────────────────────────────────────
async function main() {
  const [srcTs, playasRaw] = await Promise.all([readFile(MAGAZINE_TS, 'utf8'), readFile(PLAYAS_JSON, 'utf8')])
  const playas = JSON.parse(playasRaw)
  const articles = parseArticles(srcTs)
  let map = {}
  try { map = JSON.parse(await readFile(IMAGES_JSON, 'utf8')) } catch {}

  const targets = articles.filter(a => ONLY_SLUG ? a.slug === ONLY_SLUG : (FORCE || !map[a.slug]?.url))
  if (targets.length === 0) { console.log('✓ Nada que resolver (usa --force).'); return }

  console.log(`Resolviendo ${targets.length} foto(s) con la cascada de fichas de playa…`)
  for (const a of targets) {
    const place = resolvePlace(a.title, a.heroQuery, playas)
    if (!place) { console.warn(`  · ${a.slug}: sin lugar resoluble`); continue }
    const { nombre, municipio, lat, lon } = place
    try {
      const foto = await resolverFoto(nombre, municipio, lat, lon)
      if (!foto) { console.warn(`  · ${a.slug}: sin foto (nombre="${nombre}", coords=${lat != null})`); continue }
      map[a.slug] = { url: foto.url, thumb: foto.thumb || foto.url, source: foto.source, ...(foto.author ? { author: foto.author } : {}) }
      console.log(`  ✓ ${a.slug} → ${foto.source}${foto.author ? ` (${foto.author})` : ''}${lat != null ? ` [geo:${nombre}]` : ` [name:${nombre}]`}`)
    } catch (e) { console.warn(`  ✗ ${a.slug}: ${e.message}`) }
  }

  const sorted = Object.fromEntries(Object.keys(map).sort().map(k => [k, map[k]]))
  await writeFile(IMAGES_JSON, JSON.stringify(sorted, null, 2) + '\n')
  console.log(`✓ Guardado en src/lib/magazine-images.json (${Object.keys(sorted).length} fotos).`)
}

main().catch(e => { console.error(e); process.exit(1) })
