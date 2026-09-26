#!/usr/bin/env node
// scripts/resolve-pois-fotos.mjs — la foto de cada sitio de /que-hacer.
//
// PARA QUÉ. Los sitios sin foto salen con un pictograma sobre tinta. Con
// Wikipedia solo teníamos 224 fotos de 5.685 sitios (el 4 %): la imagen
// principal del artículo, y solo 638 sitios tienen artículo. Aquí se
// busca en cuatro sitios, del más fiable al menos:
//
//   1. Wikipedia: imagen principal del artículo (si el POI trae `wikipedia`).
//   2. Commons por coordenadas: archivos geolocalizados a menos de 150 m del
//      sitio cuyo nombre de archivo lleve una palabra distintiva del nombre.
//   3. Commons por texto: «"nombre" "municipio"» en el espacio de archivos.
//   4. Flickr. Con FLICKR_API_KEY, la API oficial filtrando licencias CC.
//      Sin clave, el feed público por etiquetas (el mismo que usan las fotos
//      de playa): no dice la licencia, así que se guarda como «Flickr» con
//      el autor al lado, igual que en las fichas de playa.
//
// LICENCIA O NADA. Solo se guardan imágenes con licencia libre (CC BY,
// CC BY-SA, CC0, dominio público, GFDL) y con autor, que se pinta al lado.
//
// QUÉ SE RESUELVE. Todos los sitios de municipios publicables (≥5 sitios),
// menos memoriales, y los alrededores. Se salta lo ya resuelto (f) y lo ya
// mirado sin éxito (f === null) salvo --refrescar. Con --solo-wp se queda
// en la fuente 1 (comportamiento antiguo).
//
//   node scripts/resolve-pois-fotos.mjs
//   node scripts/resolve-pois-fotos.mjs --refrescar
//   node scripts/resolve-pois-fotos.mjs --municipio tarifa
//   node scripts/resolve-pois-fotos.mjs --reintentar-nulos   # p. ej. tras añadir una fuente
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FILE = resolve(ROOT, 'public/data/municipio-pois.json')
const UA = 'playas-espana.com/1.0 fotos-pois (contact: hola@playas-espana.com)'
const args = process.argv.slice(2)
const refrescar = args.includes('--refrescar')
const soloWp = args.includes('--solo-wp')
const reintentarNulos = args.includes('--reintentar-nulos')   // solo los que se miraron y no tenían
const soloMunicipio = args[args.indexOf('--municipio') + 1] && args.includes('--municipio') ? args[args.indexOf('--municipio') + 1] : null
const MINIMO_POIS = 5

// FLICKR_API_KEY desde .env.local (no se imprime nunca).
const envFile = resolve(ROOT, '.env.local')
const env = existsSync(envFile) ? Object.fromEntries(readFileSync(envFile, 'utf8').split('\n').filter(l => /^[A-Z_]+=/.test(l)).map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/^"|"$/g, '')] })) : {}
const FLICKR_KEY = process.env.FLICKR_API_KEY ?? env.FLICKR_API_KEY ?? ''

const LIBRES = /^(cc[- ]by(-sa)?(-[0-9.]+)?|cc0|public domain|pd|gfdl)/i
const VETADAS = new Set(Object.keys(JSON.parse(readFileSync(resolve(ROOT, 'src/data/fotos-vetadas.json'), 'utf8'))))
const dormir = ms => new Promise(r => setTimeout(r, ms))

async function json(url, opts = {}) {
  for (let i = 0; i < 3; i++) {
    const res = await fetch(url, { headers: { 'user-agent': UA }, signal: AbortSignal.timeout(20000), ...opts })
    if (res.status === 429 || res.status >= 500) { await dormir(1500 * (i + 1)); continue }
    if (!res.ok) throw new Error(`${res.status} ${url.slice(0, 80)}`)
    return res.json()
  }
  throw new Error(`reintentos agotados ${url.slice(0, 80)}`)
}

// ——— nombres y filtros ————————————————————————————————————————
const normalizar = s => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const separables = s => (s ?? '').replace(/[_\-.\/+()]+/g, ' ')
const GENERICAS = new Set(['museo','museu','museum','iglesia','igrexa','esglesia','church','ermita','capilla','castillo','castell','castle','torre','tower','faro','lighthouse','mirador','miradoiro','parque','park','jardin','jardines','jardi','plaza','placa','praza','monumento','monument','casa','palacio','palau','pazo','centro','center','santa','santo','san','sant','nuestra','senora','virgen','maria','antigua','antiguo','nueva','nuevo','municipal','historico','historica','ruinas','restos','puerta','puente','pont','ponte','fuente','font','fonte','molino','moli','muino','playa','platja','praia','cala','punta','isla','illa','vila','villa','ciudad','ciutat','cidade'])
const NEGATIVAS = /\b(map|mapa|plano|logo|flag|bandera|escudo|coat|diagram|diagrama|placa|sign|icon|chart|grafico|interior|selfie|retrato|portrait|wedding|boda|streetview|mapillary|panoramio|drone|aerial|collage|scan|escaneo|document|documento|dibujo|drawing|grabado|engraving|postal|postcard|sello|stamp|cartel|poster|texto|text|firma)\b/i
const esNegativa = s => NEGATIVAS.test(separables(normalizar(s)))

/** Palabras distintivas del nombre: ≥4 letras y no genéricas. */
function distintivas(nombre) {
  return normalizar(nombre).split(/[^a-z0-9]+/).filter(w => w.length >= 4 && !GENERICAS.has(w))
}
const casaNombre = (archivo, tokens) => {
  const fn = normalizar(separables(decodeURIComponent(archivo).replace(/^file:/i, '').replace(/\.(jpe?g|png|webp)$/i, '')))
  return tokens.some(t => fn.includes(t))
}

// ——— cada fuente devuelve { u, a, l, w, h, s } o null ——————————
function deImageinfo(page) {
  const ii = page?.imageinfo?.[0]
  if (!ii?.thumburl) return null
  if (!/\.(jpe?g|png|webp)(\?|$)/i.test(ii.thumburl)) return null
  if (esNegativa(page.title)) return null
  if (VETADAS.has(page.title.replace(/^File:/, '')) || VETADAS.has(ii.url)) return null
  const w = ii.thumbwidth ?? ii.width ?? 0, h = ii.thumbheight ?? ii.height ?? 0
  if ((ii.width ?? 0) < 600) return null
  if (w && h && (w / h < 0.6 || w / h > 3)) return null
  const meta = ii.extmetadata ?? {}
  const lic = meta.LicenseShortName?.value ?? ''
  const autor = (meta.Artist?.value ?? '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
  if (!LIBRES.test(lic) || !autor) return null
  return { u: ii.thumburl.replace(/\?utm_source=.*$/, ''), a: autor.slice(0, 80), l: lic, w, h, s: 'commons' }
}
const IIPROPS = 'prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=960&iiextmetadatafilter=LicenseShortName|Artist'

function parsearWp(wp) {
  const m = /^([a-z-]{2,10}):(.+)$/.exec(wp.trim())
  return m ? { lang: m[1], title: m[2] } : { lang: 'es', title: wp.trim() }
}

// 1. Imagen principal del artículo.
async function deWikipedia(poi) {
  if (!poi.wp) return null
  const { lang, title } = parsearWp(poi.wp)
  const q = await json(`https://${lang}.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&piprop=name&redirects=1&titles=${encodeURIComponent(title)}`)
  const page = Object.values(q.query?.pages ?? {})[0]
  if (!page?.pageimage) return null
  await dormir(200)
  const info = await json(`https://commons.wikimedia.org/w/api.php?action=query&format=json&${IIPROPS}&titles=${encodeURIComponent('File:' + page.pageimage)}`)
  const f = deImageinfo(Object.values(info.query?.pages ?? {})[0])
  return f ? { ...f, s: 'wikipedia' } : null
}

// 2. Commons por coordenadas: archivos a menos de 150 m con el nombre en el archivo.
async function deCommonsGeo(poi, tokens) {
  if (!tokens.length) return null
  const q = await json(`https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=geosearch&ggscoord=${poi.la}|${poi.lo}&ggsradius=150&ggsnamespace=6&ggslimit=40&${IIPROPS}`)
  const pages = Object.values(q.query?.pages ?? {}).filter(p => casaNombre(p.title, tokens))
  return pages.map(deImageinfo).filter(Boolean).sort((a, b) => b.w * b.h - a.w * a.h)[0] ?? null
}

// 3. Commons por texto: "nombre" "municipio".
async function deCommonsTexto(poi, tokens, municipio) {
  if (!tokens.length) return null
  const busq = `"${poi.n.replace(/"/g, '').split(';')[0]}" "${municipio.replace(/"/g, '')}" filetype:bitmap`
  const q = await json(`https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=15&gsrsearch=${encodeURIComponent(busq)}&${IIPROPS}`)
  const pages = Object.values(q.query?.pages ?? {}).filter(p => casaNombre(p.title, tokens))
  return pages.map(deImageinfo).filter(Boolean).sort((a, b) => b.w * b.h - a.w * a.h)[0] ?? null
}

// 4. Flickr API: solo CC (1-6 = CC, 9 = CC0, 10 = PD mark), con autor.
const FLICKR_LIC = { 1: 'CC BY-NC-SA 2.0', 2: 'CC BY-NC 2.0', 3: 'CC BY-NC-ND 2.0', 4: 'CC BY 2.0', 5: 'CC BY-SA 2.0', 6: 'CC BY-ND 2.0', 9: 'CC0', 10: 'Public Domain' }
async function deFlickr(poi, tokens, municipio) {
  if (!tokens.length) return null
  if (!FLICKR_KEY) return deFlickrFeed(poi, tokens, municipio)
  const params = new URLSearchParams({
    method: 'flickr.photos.search', api_key: FLICKR_KEY, format: 'json', nojsoncallback: '1',
    text: `${poi.n.split(';')[0]} ${municipio}`, lat: String(poi.la), lon: String(poi.lo), radius: '1', radius_units: 'km',
    license: '4,5,9,10', content_type: '1', media: 'photos', sort: 'relevance', per_page: '15',
    extras: 'owner_name,license,url_c,url_b,o_dims,tags',
  })
  const q = await json(`https://api.flickr.com/services/rest/?${params}`)
  const fotos = (q.photos?.photo ?? []).filter(p => {
    const txt = `${p.title} ${p.tags}`
    return !esNegativa(txt) && tokens.some(t => normalizar(txt).includes(t)) && (p.url_c || p.url_b) && p.ownername
  })
  const p = fotos[0]
  if (!p) return null
  const u = p.url_c ?? p.url_b
  if (VETADAS.has(u)) return null
  const w = Number(p.width_c ?? p.width_b ?? 0), h = Number(p.height_c ?? p.height_b ?? 0)
  if (w && h && (w / h < 0.6 || w / h > 3)) return null
  return { u, a: String(p.ownername).slice(0, 80), l: FLICKR_LIC[p.license] ?? 'CC', w, h, s: 'flickr' }
}

// 4b. Feed público por etiquetas, sin clave. Medido en Tarifa con una
//     regla laxa (una palabra del nombre + municipio): «Parque Teresa» daba
//     un retrato y «Plaza de toros» un campo. Por eso aquí se exige que el
//     título o las etiquetas lleven TODAS las palabras distintivas del
//     nombre (mínimo dos) y el municipio. Un nombre de una sola palabra
//     («Catapulta», «Escaleras») no se busca: es lotería.
async function deFlickrFeed(poi, tokens, municipio) {
  if (tokens.length < 2) return null
  const muni = normalizar(municipio).replace(/[^a-z0-9]/g, '')
  const tags = [...tokens.slice(0, 3), muni].join(',')
  const q = await json(`https://www.flickr.com/services/feeds/photos_public.gne?${new URLSearchParams({ format: 'json', nojsoncallback: '1', tags, tagmode: 'all' })}`)
  const item = (q.items ?? []).find(it => {
    const txt = normalizar(`${it.title ?? ''} ${it.tags ?? ''}`)
    const m = it.media?.m ?? ''
    return !esNegativa(txt) && tokens.every(t => txt.includes(t)) && txt.includes(muni) && /_m\.(jpe?g|png)$/i.test(m) && !VETADAS.has(m.replace(/_m\./, '_c.'))
  })
  if (!item) return null
  const autor = (item.author ?? '').replace(/^.*\("(.+)"\)$/, '$1').trim()
  if (!autor) return null
  return { u: item.media.m.replace(/_m\.(jpe?g|png)$/i, '_c.$1'), a: autor.slice(0, 80), l: 'Flickr', w: 800, h: 600, s: 'flickr' }
}

async function fotoDe(poi, municipio) {
  const tokens = distintivas(poi.n.split(';')[0])
  const pasos = soloWp ? [deWikipedia] : [deWikipedia, deCommonsGeo, deCommonsTexto, deFlickr]
  for (const paso of pasos) {
    try {
      const f = await paso(poi, tokens, municipio)
      if (f) return f
    } catch (e) { process.stderr.write(`\n✗  ${municipio} / ${poi.n}: ${e.message}`) }
    await dormir(250)
  }
  return null
}

// ——— bucle ———————————————————————————————————————————————————
const data = JSON.parse(readFileSync(FILE, 'utf8'))
const cuenta = { wikipedia: 0, commons: 0, flickr: 0 }
let sin = 0, ya = 0, n = 0
const slugs = Object.keys(data).filter(s => data[s].total >= MINIMO_POIS && (!soloMunicipio || s === soloMunicipio))
const guardar = () => writeFileSync(FILE, JSON.stringify(data, null, 0))

for (const slug of slugs) {
  const m = data[slug]
  const lista = [...Object.values(m.pois).flat().filter(p => p.t !== 'Memorial'), ...(m.alrededores ?? [])]
  for (const poi of lista) {
    if (poi.f && !refrescar) { ya++; continue }
    if (poi.f === null && !refrescar && !reintentarNulos) { sin++; continue }
    const f = await fotoDe(poi, m.nombre)
    poi.f = f
    if (f) cuenta[f.s === 'flickr' ? 'flickr' : f.s === 'wikipedia' ? 'wikipedia' : 'commons']++; else sin++
    process.stdout.write(`\r  ${slug.padEnd(24).slice(0, 24)} ${f ? '✔ ' + f.s.padEnd(9) : '·          '} ${poi.n.slice(0, 44).padEnd(44)}`)
    if (++n % 50 === 0) guardar()
    await dormir(300)
  }
}
guardar()
console.log(`\n\nNuevas: Wikipedia ${cuenta.wikipedia} · Commons ${cuenta.commons} · Flickr ${cuenta.flickr}${FLICKR_KEY ? '' : ' (feed público, sin clave)'} · sin foto libre: ${sin} · ya resueltas: ${ya}`)
