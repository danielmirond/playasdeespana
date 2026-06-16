#!/usr/bin/env node
// scripts/enrich-playas-images.mjs
//
// Pre-resuelve OFFLINE las fotos de las fichas de playa usando la MISMA
// cascada que src/lib/fotos.ts, pero ejecutada una sola vez, con timeouts
// largos, User-Agent descriptivo (clave para no recibir rate limit de
// Wikimedia) y pausa entre playas. Guarda slug → FotoPlaya[] en
// src/lib/playas-images.json. En runtime, getFotos() sirve este sidecar al
// instante (sin red, sin KV) y solo cae a la cascada en vivo si la playa no
// está resuelta.
//
// Uso:
//   node scripts/enrich-playas-images.mjs --filter=bandera           # solo Bandera Azul
//   node scripts/enrich-playas-images.mjs --limit=300                # primeras 300 sin resolver
//   node scripts/enrich-playas-images.mjs --filter=bandera --limit=200
//   node scripts/enrich-playas-images.mjs <slug>                     # una playa
//   node scripts/enrich-playas-images.mjs --force ...                # re-resolver
// Reanudable: por defecto salta las playas ya presentes en el JSON.
// Keys opcionales (Pexels/Unsplash) desde process.env.

import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const OUT = resolve(ROOT, 'public/data/playas-images.json')
const PLAYAS = resolve(ROOT, 'public/data/playas.json')

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''
const PEXELS_KEY = process.env.PEXELS_API_KEY ?? ''
const UA = 'PlayasDeEspana/1.0 (+https://playas-espana.com; fotos cache offline)'

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
// Modo laxo: prioriza COBERTURA sobre precisión para rellenar las playas en
// fallback. Amplía el radio geo y acepta foto de playa cercana aunque no lleve
// el nombre; añade búsquedas por municipio en Flickr/OpenVerse/Wikimedia.
// Solo afecta a este backfill offline; el runtime (fotos.ts) sigue estricto.
// Reprocesa también las entradas vacías ([]) del sidecar.
const LAX = args.includes('--lax')
const FILTER = (args.find(a => a.startsWith('--filter=')) ?? '').split('=')[1] ?? ''
const LIMIT = Number((args.find(a => a.startsWith('--limit=')) ?? '').split('=')[1] ?? '0') || 0
const OFFSET = Number((args.find(a => a.startsWith('--offset=')) ?? '').split('=')[1] ?? '0') || 0
const ONLY_SLUG = args.find(a => !a.startsWith('--'))
const DELAY_MS = 350  // pausa entre playas para no saturar las APIs
// Concurrencia entre playas (cada una ya paraleliza sus 7 fuentes). Con 3
// workers el backoff ante 429 sigue protegiendo; no subir más sin vigilar.
const CONCURRENCY = Math.max(1, Math.min(4, Number((args.find(a => a.startsWith('--concurrency=')) ?? '').split('=')[1] ?? '1') || 1))

const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const normalizar = (s) => (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

// fetch con timeout largo, User-Agent y reintento con backoff ante 429/5xx.
async function fetchT(url, opts = {}, timeoutMs = 8000, tries = 3) {
  for (let i = 0; i < tries; i++) {
    const c = new AbortController()
    const t = setTimeout(() => c.abort(), timeoutMs)
    try {
      const res = await fetch(url, { ...opts, headers: { 'User-Agent': UA, ...(opts.headers ?? {}) }, signal: c.signal })
      clearTimeout(t)
      if (res.status === 429 || res.status >= 500) { await sleep(1500 * (i + 1)); continue }
      return res
    } catch (e) { clearTimeout(t); if (i === tries - 1) throw e; await sleep(800 * (i + 1)) }
  }
  throw new Error('max retries')
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
    try { const u = new URL(ii.thumburl); if (!u.hostname?.includes('wikimedia.org')) return null; if (!/\.(jpg|jpeg|png|webp)(\?|$)/i.test(ii.thumburl)) return null } catch { return null }
    const w = ii.width ?? 0, h = ii.height ?? 0
    if (w > 0 && h > 0) { if (w < 500) return null; const r = w / h; if (r < 0.7 || r > 3) return null }
    const score = POSITIVAS.test(titulo) ? 1 : 0
    return { score, url: ii.thumburl, thumb: ii.thumburl, fuente: 'wikimedia', autor: ii.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').slice(0, 60) || undefined }
  }).filter(Boolean).sort((a, b) => b.score - a.score).map(({ score, ...r }) => r)
}

async function wikimediaGeo(lat, lon, nombre) {
  if (lat == null || lon == null) return []
  try {
    // Radio 1000m (término medio) / 1500m (laxo). Se exige nombre en el archivo;
    // en modo laxo, si no hay match de nombre se aceptan las fotos de PLAYA
    // cercanas (POSITIVAS) — más cobertura a costa de algo de precisión.
    const radius = LAX ? '1500' : '1000'
    const params = new URLSearchParams({ action:'query', generator:'geosearch', ggsnamespace:'6', ggscoord:`${lat}|${lon}`, ggsradius:radius, ggslimit:'40', prop:'imageinfo|pageprops', iiprop:'url|extmetadata|size', iiurlwidth:'1200', format:'json', origin:'*' })
    const res = await fetchT(`https://commons.wikimedia.org/w/api.php?${params}`)
    if (!res.ok) return []
    const data = await res.json()
    const beachish = extraerFotosDePages(Object.values(data.query?.pages ?? {})).filter(f => { try { return POSITIVAS.test(decodeURIComponent(f.url).toLowerCase()) } catch { return false } })
    const tokens = [normalizar(nombre), ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4 && !PALABRAS_GENERICAS.has(t))].filter(Boolean)
    const conNombre = beachish.filter(f => { try { const url = normalizar(decodeURIComponent(f.url)); return tokens.some(t => t.length >= 4 && url.includes(t)) } catch { return false } })
    if (conNombre.length > 0) return conNombre.slice(0, 6)
    return LAX ? beachish.slice(0, 6) : []
  } catch { return [] }
}

async function wikipediaLead(nombre, municipio, lat, lon) {
  const tokensDisc = nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4 && !PALABRAS_GENERICAS.has(t))
  if (tokensDisc.length === 0) return []
  const MARC = /^(playa|playas|beach|beaches|praia|praias|platja|platges|cala|caleta|calita|bahia|ensenada|hondartza|cap|cabo)$/i
  const NEGT = /^(mairie|ayuntamiento|udaletxe|concello|prefectura|prefecture|hoteldeville|townhall|consistorio|alcaldia)$/i
  const palabras = (t) => (t ?? '').toLowerCase().split(/[\s\-_().,;:'"·•/]+/).map(normalizar).filter(Boolean)
  for (const q of [`Playa de ${nombre}`, nombre, `${nombre} ${municipio}`]) {
    try {
      const params = new URLSearchParams({ action:'query', generator:'search', gsrsearch:q, gsrlimit:'8', prop:'pageimages|pageprops|coordinates', piprop:'original|thumbnail', pithumbsize:'1200', colimit:'5', format:'json', origin:'*' })
      const res = await fetchT(`https://es.wikipedia.org/w/api.php?${params}`)
      if (!res.ok) continue
      const data = await res.json()
      const cand = Object.values(data?.query?.pages ?? {})
        .filter(p => !p?.pageprops?.disambiguation)
        .filter(p => typeof p?.original?.source === 'string')
        .filter(p => /\.(jpe?g|png|webp)(\?|$)/i.test(p.original.source))
        .filter(p => { const fn = decodeURIComponent(p.original.source.split('/').pop() ?? '').toLowerCase(); if (NEGATIVAS.test(fn)) return false; return !palabras(fn.replace(/\.(jpe?g|png|webp).*/i, '')).some(w => NEGT.test(w)) })
        .filter(p => !palabras(p.title ?? '').some(w => NEGT.test(w)))
        .filter(p => tokensDisc.some(t => palabras(p.title ?? '').includes(t)))
        .filter(p => { const tw = palabras(p.title ?? ''); if (tw.some(w => MARC.test(w))) return true; const flat = tw.join(''); if (tokensDisc.some(t => t === flat)) return true; return flat === normalizar(nombre) })
        .filter(p => { if (lat == null || lon == null) return true; const co = p.coordinates; if (!co?.length) return true; const c = co[0]; if (typeof c.lat !== 'number' || typeof c.lon !== 'number') return true; const toRad = d => d*Math.PI/180, R=6371; const dLat=toRad(c.lat-lat), dLon=toRad(c.lon-lon); const a=Math.sin(dLat/2)**2+Math.cos(toRad(lat))*Math.cos(toRad(c.lat))*Math.sin(dLon/2)**2; return 2*R*Math.asin(Math.sqrt(a))<=50 })
      if (cand.length === 0) continue
      const scored = cand.map(p => { const tn = normalizar(p.title ?? ''); let s = 0; if (tn===normalizar(`playa de ${nombre}`)) s+=100; if (tn===normalizar(nombre)) s+=90; if (/^playa de /i.test(p.title ?? '')) s+=30; if (tokensDisc[0] && tn.includes(tokensDisc[0])) s+=20; return { p, s } }).sort((a, b) => b.s - a.s)
      const fotos = scored.map(({ p }) => ({ url: p.original.source, thumb: p.thumbnail?.source ?? p.original.source, fuente: 'wikimedia', autor: undefined }))
      if (fotos.length >= 1) return fotos.slice(0, 3)
    } catch { continue }
  }
  return []
}

async function openverse(nombre, municipio) {
  const tokens = [normalizar(nombre), ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4)].filter(Boolean)
  for (const q of [`"${nombre}" "${municipio}"`, `"${nombre}" ${municipio} beach`, `${nombre} ${municipio} playa`]) {
    try {
      const params = new URLSearchParams({ q, license_type:'all-cc', category:'photograph', size:'large', aspect_ratio:'wide', page_size:'8' })
      const res = await fetchT(`https://api.openverse.org/v1/images/?${params}`)
      if (!res.ok) continue
      const data = await res.json()
      const fotos = (data?.results ?? []).map(r => { const url = r.url; if (!url || typeof url !== 'string') return null; const titulo = (r.title ?? '').toLowerCase(); if (NEGATIVAS.test(titulo) || !POSITIVAS.test(titulo)) return null; const tn = normalizar(titulo); if (!LAX && !tokens.some(t => t.length >= 4 && tn.includes(t))) return null; return { url, thumb: r.thumbnail ?? url, fuente: 'openverse', autor: r.creator?.slice(0, 60) || undefined } }).filter(Boolean)
      if (fotos.length >= 1) return fotos.slice(0, 6)
    } catch { continue }
  }
  return []
}

async function flickr(nombre, municipio) {
  const nT = normalizar(nombre), mT = normalizar(municipio)
  const tokens = [nT, ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4)].filter(Boolean)
  // Laxo: añade búsquedas por municipio (acepta foto compartida del municipio).
  const queries = [`${nT},${mT},beach`, `${nT},beach`, `${nT},playa`]
  if (LAX && mT) queries.push(`${mT},beach`, `${mT},playa`, `${mT},cala`)
  for (const tags of queries.filter(t => !t.startsWith(',') && !t.endsWith(','))) {
    try {
      const params = new URLSearchParams({ format:'json', nojsoncallback:'1', tags, tagmode:'all' })
      const res = await fetchT(`https://www.flickr.com/services/feeds/photos_public.gne?${params}`)
      if (!res.ok) continue
      const data = await res.json()
      const fotos = (data?.items ?? []).map(item => { const titulo = (item.title ?? '').toLowerCase(), tagsStr = (item.tags ?? '').toLowerCase(); if (NEGATIVAS.test(titulo) || NEGATIVAS.test(tagsStr)) return null; if (!POSITIVAS.test(titulo) && !POSITIVAS.test(tagsStr)) return null; const tn = normalizar(titulo), tg = normalizar(tagsStr); if (!LAX && !tokens.some(t => t.length >= 4 && (tn.includes(t) || tg.includes(t)))) return null; const m = item.media?.m ?? ''; if (!m || !/_m\.(jpg|jpeg|png)/i.test(m)) return null; return { url: m.replace(/_m\.(jpg|jpeg|png)/i, '_c.$1'), thumb: m, fuente: 'flickr', autor: item.author?.replace(/^.*\("(.+)"\)$/, '$1') || undefined } }).filter(Boolean)
      if (fotos.length >= 2) return fotos.slice(0, 6)
    } catch { continue }
  }
  return []
}

async function wikimediaText(nombre, municipio) {
  const n = nombre.replace(/"/g, ''), m = municipio.replace(/"/g, '')
  const tokens = nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4 && !PALABRAS_GENERICAS.has(t))
  const queries = [`"${n}" "${m}"`, `"${n}" ${m} beach`, `"${n}" ${m} playa`, `"${n}" ${m}`]
  if (LAX && m) queries.push(`"${m}" playa`, `"${m}" beach`)
  for (const q of queries) {
    try {
      const params = new URLSearchParams({ action:'query', generator:'search', gsrnamespace:'6', gsrsearch:`${q} filetype:bitmap`, gsrlimit:'10', prop:'imageinfo|pageprops', iiprop:'url|extmetadata|size', iiurlwidth:'1200', format:'json', origin:'*' })
      const res = await fetchT(`https://commons.wikimedia.org/w/api.php?${params}`)
      if (!res.ok) continue
      const data = await res.json()
      const raw = extraerFotosDePages(Object.values(data.query?.pages ?? {}))
      const fotos = (LAX || tokens.length === 0) ? raw : raw.filter(f => { const fn = normalizar(decodeURIComponent(f.url.split('/').pop() ?? '').replace(/\.(jpe?g|png|webp).*/i, '')); return tokens.some(t => fn.includes(t)) })
      if (fotos.length >= 2) return fotos.slice(0, 6)
    } catch { continue }
  }
  return []
}

async function pexels(nombre, municipio) {
  if (!PEXELS_KEY) return []
  const tokens = [normalizar(nombre), ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4)].filter(Boolean)
  if (tokens.length === 0 && !LAX) return []
  // Laxo: añade queries por municipio y NO exige el nombre (stock genérico de
  // la zona como último recurso). Solo aporta si nada mejor llenó el hueco.
  const queries = [`${nombre} ${municipio} beach`, `${nombre} ${municipio} playa`, `${nombre} beach`]
  if (LAX && municipio) queries.push(`${municipio} beach spain`, `${municipio} playa`)
  for (const q of queries) {
    try {
      const res = await fetchT(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=6&orientation=landscape&size=large`, { headers: { Authorization: PEXELS_KEY } })
      if (!res.ok) continue
      const data = await res.json()
      const fotos = (data?.photos ?? []).map(p => { const url = p.src?.large2x ?? p.src?.large ?? p.src?.original; if (!url) return null; const tn = normalizar(`${p.alt ?? ''} ${p.url ?? ''}`); if (!LAX && !tokens.some(t => t && tn.includes(t))) return null; return { url, thumb: p.src?.medium ?? p.src?.small, fuente: 'pexels', autor: p.photographer || undefined } }).filter(Boolean)
      if (fotos.length >= 1) return fotos.slice(0, 6)
    } catch { continue }
  }
  return []
}

async function unsplash(nombre, municipio) {
  if (!UNSPLASH_KEY) return []
  const tokens = [normalizar(nombre), ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4)].filter(Boolean)
  if (tokens.length === 0 && !LAX) return []
  const queries = [`${nombre} ${municipio} beach`, `${nombre} ${municipio} playa`, `${nombre} beach`]
  if (LAX && municipio) queries.push(`${municipio} beach spain`, `${municipio} playa`)
  for (const q of queries) {
    try {
      const res = await fetchT(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=6&orientation=landscape&content_filter=high`, { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } })
      if (!res.ok) continue
      const data = await res.json()
      const fotos = (data.results ?? []).map(p => { const tn = normalizar(`${p.description ?? ''} ${p.alt_description ?? ''} ${(p.tags ?? []).map(t => t?.title ?? '').join(' ')}`); if (!LAX && !tokens.some(t => t && tn.includes(t))) return null; return { url: p.urls.regular, thumb: p.urls.small, fuente: 'unsplash', autor: p.user?.name || undefined } }).filter(Boolean)
      if (fotos.length >= 1) return fotos.slice(0, 6)
    } catch { continue }
  }
  return []
}

// Combina como getFotosUncached: geo→lead→openverse→flickr→text→pexels→unsplash,
// sin duplicados por URL, hasta 6.
async function cascada(nombre, municipio, lat, lon) {
  const [geo, lead, ov, fl, txt, px, un] = await Promise.all([
    wikimediaGeo(lat, lon, nombre), wikipediaLead(nombre, municipio, lat, lon),
    openverse(nombre, municipio), flickr(nombre, municipio), wikimediaText(nombre, municipio),
    pexels(nombre, municipio), unsplash(nombre, municipio),
  ])
  const vistas = new Set(), out = []
  for (const grupo of [geo, lead, ov, fl, txt, px, un]) {
    for (const f of grupo) { if (vistas.has(f.url)) continue; vistas.add(f.url); out.push(f); if (out.length >= 6) return out }
  }
  return out
}

async function main() {
  const playas = JSON.parse(await readFile(PLAYAS, 'utf8'))
  let map = {}
  try { map = JSON.parse(await readFile(OUT, 'utf8')) } catch {}

  let lista = playas.filter(p => p.lat && p.lng && p.slug)
  if (ONLY_SLUG) lista = lista.filter(p => p.slug === ONLY_SLUG)
  if (FILTER === 'bandera') lista = lista.filter(p => p.bandera)
  // Resume normal: salta las ya intentadas (incluidas las vacías []).
  // Modo laxo: reprocesa las que están en fallback (sin entrada o vacías),
  // pero NO las que ya tienen foto real.
  if (!FORCE && !ONLY_SLUG) {
    lista = LAX
      ? lista.filter(p => !(map[p.slug]?.length > 0))
      : lista.filter(p => !map[p.slug])
  }
  if (OFFSET) lista = lista.slice(OFFSET)
  if (LIMIT) lista = lista.slice(0, LIMIT)

  if (lista.length === 0) { console.log('✓ Nada que resolver.'); return }
  console.log(`Resolviendo ${lista.length} playa(s)…`)

  let ok = 0, vacias = 0, n = 0
  let cursor = 0
  const worker = async () => {
    while (cursor < lista.length) {
      const p = lista[cursor++]
      const i = ++n
      try {
        const fotos = await cascada(p.nombre, p.municipio ?? '', p.lat, p.lng)
        if (fotos.length > 0) { map[p.slug] = fotos; ok++; if (i % 20 === 0 || i <= 5) console.log(`  ✓ [${i}/${lista.length}] ${p.slug} (${fotos.length}, ${fotos[0].fuente})`) }
        else {
          vacias++
          if (FORCE && map[p.slug]?.length) console.log(`  – ${p.slug}: purgada (ya no hay match)`)
          // Marcador negativo: [] = "intentada, sin foto". getFotos lo ignora
          // (exige length>0) y el resume no la reintenta. --force la reintenta.
          map[p.slug] = []
        }
      } catch (e) { vacias++; console.warn(`  ✗ ${p.slug}: ${e.message}`) }
      // Guardado incremental cada 25 por si se interrumpe.
      if (i % 25 === 0) { const sorted = Object.fromEntries(Object.keys(map).sort().map(k => [k, map[k]])); await writeFile(OUT, JSON.stringify(sorted) + '\n') }
      await sleep(DELAY_MS)
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  const sorted = Object.fromEntries(Object.keys(map).sort().map(k => [k, map[k]]))
  await writeFile(OUT, JSON.stringify(sorted) + '\n')
  const conFoto = Object.values(sorted).filter(v => v.length > 0).length
  console.log(`✓ ${ok} con foto, ${vacias} sin foto. JSON: ${conFoto} con foto / ${Object.keys(sorted).length} intentadas.`)
}

main().catch(e => { console.error(e); process.exit(1) })
