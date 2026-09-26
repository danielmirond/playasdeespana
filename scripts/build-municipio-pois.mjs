#!/usr/bin/env node
// scripts/build-municipio-pois.mjs — Prototipo: POIs turísticos por municipio
//
// PARA QUÉ. Alimenta /municipio/[slug]/que-hacer con museos, teatros, cines,
// monumentos, miradores y parques dentro de 3 km del centroide del municipio.
// Los saca de Overpass API una sola vez (build time) y los cachea en
// public/data/municipio-pois.json, indexado por slug. En runtime la página
// solo lee el JSON: cero llamadas externas, cero riesgo de rate limit.
//
// CÓMO EJECUTARLO. `node scripts/build-municipio-pois.mjs`. Tarda ~2-3 min
// (25 municipios × 2-4 s de Overpass). Cae con gracia si un municipio falla
// (registra el error y sigue con el siguiente).
//
// LOS 25 QUE SE INCLUYEN. Mezcla curada: (a) los que tienen más playas del
// inventario MITECO (proxy de litoral con demanda), y (b) destinos turísticos
// consolidados donde la búsqueda «qué hacer en X» es fuerte según GSC. La
// lista se puede ampliar; el sidecar es lineal en tamaño (~2 KB por muni).
//
// TAGS DE OVERPASS. Vienen del catálogo estándar de OSM:
//   tourism = museum, gallery, attraction, viewpoint, zoo, aquarium
//   amenity = theatre, cinema, arts_centre, library
//   historic = castle, monument, fort, church, cathedral, ruins, tower
//   man_made = lighthouse, windmill, watermill, pier
//   leisure = park, garden

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/data/municipio-pois.json')

// Mirrors de Overpass. El primero suele funcionar; los otros son fallback
// para cuando el principal está saturado (típico en horario CET).
//
// `overpass.openstreetmap.ru` estaba en la lista y daba timeouts a 20 s
// (verificado contra 6/28 municipios en el run 35429127948: UND_ERR_
// CONNECT_TIMEOUT). Se retiró.
//
// `overpass.kumi.systems` funciona pero es intermitente: en el run
// 35429862841 falló 23/78 municipios con timeouts de fetch a 30 s. Se
// deja porque cuando responde es rápido, pero es solo respaldo. Añadimos
// `z.overpass-api.de` (mirror oficial secundario del proyecto Overpass)
// como tercer intento, para no depender del kumi.
const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://z.overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

const RADIO_M = 3000  // 3 km desde el centroide

// Municipios prioritarios: mezcla curada del top por número de playas del
// inventario MITECO + destinos turísticos consolidados con demanda «qué
// hacer en X» medida en GSC. {slug, nombre, lat, lng}. Los slugs son los
// reales del inventario.
const MUNICIPIOS = [
  // ── ANDALUCÍA ─────────────────────────────────────────────────────
  { slug: 'malaga', nombre: 'Málaga', lat: 36.7213, lng: -4.4213 },
  { slug: 'marbella', nombre: 'Marbella', lat: 36.5099, lng: -4.8862 },
  { slug: 'nerja', nombre: 'Nerja', lat: 36.7511, lng: -3.8828 },
  { slug: 'torremolinos', nombre: 'Torremolinos', lat: 36.6203, lng: -4.4996 },
  { slug: 'estepona', nombre: 'Estepona', lat: 36.4386, lng: -5.0935 },
  { slug: 'fuengirola', nombre: 'Fuengirola', lat: 36.5452, lng: -4.6145 },
  { slug: 'cadiz', nombre: 'Cádiz', lat: 36.5297, lng: -6.2926 },
  { slug: 'tarifa', nombre: 'Tarifa', lat: 36.0143, lng: -5.6044 },
  { slug: 'el-puerto-de-santa-maria', nombre: 'El Puerto de Santa María', lat: 36.5936, lng: -6.2337 },
  { slug: 'chiclana-de-la-frontera', nombre: 'Chiclana de la Frontera', lat: 36.4189, lng: -6.1466 },
  { slug: 'conil-de-la-frontera', nombre: 'Conil de la Frontera', lat: 36.2777, lng: -6.0879 },
  { slug: 'nijar', nombre: 'Níjar', lat: 36.9700, lng: -2.2065 },
  { slug: 'roquetas-de-mar', nombre: 'Roquetas de Mar', lat: 36.7473, lng: -2.6142 },
  { slug: 'almunecar', nombre: 'Almuñécar', lat: 36.7371, lng: -3.6924 },
  { slug: 'salobrena', nombre: 'Salobreña', lat: 36.7349, lng: -3.5949 },
  // ── LEVANTE ───────────────────────────────────────────────────────
  { slug: 'alacant-alicante', nombre: 'Alicante', lat: 38.3452, lng: -0.4810 },
  { slug: 'benidorm', nombre: 'Benidorm', lat: 38.5411, lng: -0.1225 },
  { slug: 'valencia', nombre: 'Valencia', lat: 39.4699, lng: -0.3763 },
  { slug: 'javea-xabia', nombre: 'Jávea', lat: 38.7898, lng: 0.1663 },
  { slug: 'denia', nombre: 'Dénia', lat: 38.8508, lng: 0.0822 },
  { slug: 'calp', nombre: 'Calp', lat: 38.6406, lng: 0.0557 },
  { slug: 'torrevieja', nombre: 'Torrevieja', lat: 37.9795, lng: -0.6736 },
  { slug: 'guardamar-del-segura', nombre: 'Guardamar del Segura', lat: 38.0767, lng: -0.6476 },
  { slug: 'cullera', nombre: 'Cullera', lat: 39.1727, lng: -0.2313 },
  { slug: 'peniscolapeniscola', nombre: 'Peñíscola', lat: 40.3318, lng: 0.3748 },
  { slug: 'vinaros', nombre: 'Vinaròs', lat: 40.4858, lng: 0.4885 },
  { slug: 'benicasimbenicassim', nombre: 'Benicàssim', lat: 40.0449, lng: 0.0674 },
  // ── MURCIA ────────────────────────────────────────────────────────
  { slug: 'cartagena', nombre: 'Cartagena', lat: 37.6138, lng: -0.8648 },
  { slug: 'aguilas', nombre: 'Águilas', lat: 37.4056, lng: -1.5836 },
  { slug: 'mazarron', nombre: 'Mazarrón', lat: 37.5554, lng: -1.3093 },
  { slug: 'san-javier', nombre: 'San Javier', lat: 37.7404, lng: -0.7504 },
  // ── CATALUÑA ──────────────────────────────────────────────────────
  { slug: 'barcelona', nombre: 'Barcelona', lat: 41.3704, lng: 2.1852 },
  { slug: 'sitges', nombre: 'Sitges', lat: 41.2373, lng: 1.8117 },
  { slug: 'cadaques', nombre: 'Cadaqués', lat: 42.2887, lng: 3.2778 },
  { slug: 'tossa-de-mar', nombre: 'Tossa de Mar', lat: 41.7204, lng: 2.9308 },
  { slug: 'salou', nombre: 'Salou', lat: 41.0762, lng: 1.1416 },
  { slug: 'roses', nombre: 'Roses', lat: 42.2516, lng: 3.2056 },
  { slug: 'lloret-de-mar', nombre: 'Lloret de Mar', lat: 41.6974, lng: 2.8547 },
  { slug: 'blanes', nombre: 'Blanes', lat: 41.6763, lng: 2.8033 },
  { slug: 'lametlla-de-mar', nombre: "L'Ametlla de Mar", lat: 40.8909, lng: 0.8111 },
  // ── BALEARES ──────────────────────────────────────────────────────
  { slug: 'palma', nombre: 'Palma', lat: 39.5696, lng: 2.6502 },
  { slug: 'calvia', nombre: 'Calvià', lat: 39.5160, lng: 2.5276 },
  { slug: 'alcudia', nombre: 'Alcúdia', lat: 39.8568, lng: 3.1495 },
  { slug: 'pollenca', nombre: 'Pollença', lat: 39.9215, lng: 3.1060 },
  { slug: 'andratx', nombre: 'Andratx', lat: 39.5522, lng: 2.3823 },
  { slug: 'sant-antoni-de-portmany', nombre: 'Sant Antoni de Portmany', lat: 38.9807, lng: 1.3040 },
  { slug: 'eivissa', nombre: 'Eivissa', lat: 38.9117, lng: 1.4462 },
  { slug: 'santa-eularia-des-riu', nombre: 'Santa Eulària des Riu', lat: 38.9970, lng: 1.5589 },
  { slug: 'ciutadella-de-menorca', nombre: 'Ciutadella de Menorca', lat: 39.9916, lng: 3.8585 },
  { slug: 'mao', nombre: 'Maó', lat: 39.9550, lng: 4.2482 },
  // ── CANARIAS ──────────────────────────────────────────────────────
  { slug: 'santa-cruz-de-tenerife', nombre: 'Santa Cruz de Tenerife', lat: 28.4636, lng: -16.2518 },
  { slug: 'adeje', nombre: 'Adeje', lat: 28.0983, lng: -16.7541 },
  { slug: 'arona', nombre: 'Arona', lat: 28.0376, lng: -16.7019 },
  { slug: 'puerto-de-la-cruz', nombre: 'Puerto de la Cruz', lat: 28.3015, lng: -15.8555 },
  { slug: 'mogan', nombre: 'Mogán', lat: 27.8134, lng: -15.7605 },
  { slug: 'san-bartolome-de-tirajana', nombre: 'San Bartolomé de Tirajana', lat: 27.7575, lng: -15.5944 },
  { slug: 'teguise', nombre: 'Teguise', lat: 29.1246, lng: -13.5278 },
  { slug: 'yaiza', nombre: 'Yaiza', lat: 28.8863, lng: -13.7936 },
  { slug: 'la-oliva', nombre: 'La Oliva', lat: 28.6935, lng: -13.9280 },
  // ── NORTE (Cantábrico / País Vasco) ───────────────────────────────
  { slug: 'san-sebastian-donostia', nombre: 'San Sebastián', lat: 43.3183, lng: -1.9812 },
  { slug: 'zarautz', nombre: 'Zarautz', lat: 43.2892, lng: -2.1598 },
  { slug: 'hondarribia', nombre: 'Hondarribia', lat: 43.3882, lng: -1.7927 },
  { slug: 'getxo', nombre: 'Getxo', lat: 43.3539, lng: -3.0144 },
  { slug: 'santander', nombre: 'Santander', lat: 43.4623, lng: -3.8099 },
  { slug: 'san-vicente-de-la-barquera', nombre: 'San Vicente de la Barquera', lat: 43.3919, lng: -4.3818 },
  { slug: 'comillas', nombre: 'Comillas', lat: 43.3880, lng: -4.3031 },
  { slug: 'gijon', nombre: 'Gijón', lat: 43.5453, lng: -5.6619 },
  { slug: 'llanes', nombre: 'Llanes', lat: 43.4277, lng: -4.7818 },
  { slug: 'ribadesella', nombre: 'Ribadesella', lat: 43.4652, lng: -5.0614 },
  { slug: 'cudillero', nombre: 'Cudillero', lat: 43.5751, lng: -6.2478 },
  // ── GALICIA ───────────────────────────────────────────────────────
  { slug: 'vigo', nombre: 'Vigo', lat: 42.2158, lng: -8.7896 },
  { slug: 'a-coruna', nombre: 'A Coruña', lat: 43.3623, lng: -8.4115 },
  { slug: 'ferrol', nombre: 'Ferrol', lat: 43.5299, lng: -8.2676 },
  { slug: 'sanxenxo', nombre: 'Sanxenxo', lat: 42.4017, lng: -8.8156 },
  { slug: 'baiona', nombre: 'Baiona', lat: 42.1195, lng: -8.8527 },
  { slug: 'o-grove', nombre: 'O Grove', lat: 42.4765, lng: -8.9002 },
  { slug: 'cangas', nombre: 'Cangas', lat: 42.2715, lng: -8.8206 },
  { slug: 'ribadeo', nombre: 'Ribadeo', lat: 43.5522, lng: -7.1081 },
]

// El resto sale del catálogo: todos los municipios con página (cuatro playas
// o más, sin las extranjeras), con el centro en el promedio de sus playas.
// Los 78 de arriba conservan su coordenada a mano, que en las ciudades apunta
// al casco y no a la costa —en Málaga el promedio de las playas cae a 4 km
// del centro—. Para un pueblo de costa el promedio y el casco son lo mismo.
const EXTRANJERAS = new Set(JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf-8')))
const aSlug = (x) => x.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
{
  const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf-8'))
    .filter(p => !EXTRANJERAS.has(p.slug) && p.lat && p.lng)
  const porMunicipio = new Map()
  for (const p of playas) {
    const slug = aSlug(p.municipio)
    const m = porMunicipio.get(slug) ?? { slug, nombre: p.municipio, lat: 0, lng: 0, n: 0 }
    m.lat += p.lat; m.lng += p.lng; m.n++
    porMunicipio.set(slug, m)
  }
  const yaEstan = new Set(MUNICIPIOS.map(m => m.slug))
  for (const m of porMunicipio.values()) {
    if (m.n < 4 || yaEstan.has(m.slug)) continue
    MUNICIPIOS.push({ slug: m.slug, nombre: m.nombre, lat: +(m.lat / m.n).toFixed(4), lng: +(m.lng / m.n).toFixed(4) })
  }
}

function queryFor(lat, lng) {
  // AroundQL simple. Nada de recursos exóticos: nodes+ways+relations con
  // tags conocidos. `out center 200;` limita cada categoría a 200 elementos.
  const around = `${RADIO_M},${lat},${lng}`
  return `
[out:json][timeout:25];
(
  nwr(around:${around})[tourism~"^(museum|gallery|attraction|viewpoint|zoo|aquarium)$"];
  nwr(around:${around})[amenity~"^(theatre|cinema|arts_centre|library)$"];
  nwr(around:${around})[historic~"^(castle|monument|fort|church|cathedral|ruins|tower|archaeological_site|memorial)$"];
  nwr(around:${around})[man_made~"^(lighthouse|windmill|watermill|pier)$"];
  nwr(around:${around})[leisure~"^(park|garden)$"];
);
out center tags 200;
`.trim()
}

// User-Agent identificable. Sin esto Overpass devuelve 429 o cierra la
// conexión — política contra abusos anónimos. El correo es el del proyecto
// para que puedan avisar antes de bloquear si algún patrón les molesta.
const UA = 'playas-espana.com/1.0 sidecar-pois (contact: hola@playas-espana.com)'

async function fetchOverpass(query) {
  let lastErr
  for (const url of MIRRORS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': UA,
          'Accept': 'application/json',
        },
        body: 'data=' + encodeURIComponent(query),
        // 45 s: la query lleva `[timeout:25]`, y el servidor añade
        // tiempo de red y proceso. En el run 35429862841 kumi.systems se
        // abortó a los 30 s exactos en 23/78 municipios — con 45 s le
        // damos margen para que la respuesta llegue antes del abort.
        signal: AbortSignal.timeout(45000),
      })
      if (!res.ok) {
        // Guardamos body corto para tener pista del rechazo (Overpass a
        // veces manda HTML con el motivo).
        const cuerpo = await res.text().catch(() => '')
        lastErr = new Error(`${url}: HTTP ${res.status}${cuerpo ? ` — ${cuerpo.slice(0, 140).replace(/\s+/g, ' ')}` : ''}`)
        continue
      }
      return await res.json()
    } catch (e) {
      // Los TypeError de fetch nativo esconden la causa real en `cause`.
      // Sin esto salía «fetch failed» a secas y no se sabía si era DNS,
      // TLS, timeout o reset. Ahora se ve.
      const causa = e?.cause?.code || e?.cause?.message || e?.message || String(e)
      lastErr = new Error(`${url}: ${causa}`)
    }
  }
  throw lastErr
}

// Clasificación en categorías legibles para la página.
function categoria(tags) {
  const t = tags.tourism, a = tags.amenity, h = tags.historic, mm = tags.man_made, l = tags.leisure
  if (t === 'museum') return { cat: 'museo', tipo: 'Museo' }
  if (t === 'gallery') return { cat: 'museo', tipo: 'Galería' }
  if (t === 'aquarium') return { cat: 'museo', tipo: 'Acuario' }
  if (t === 'zoo') return { cat: 'museo', tipo: 'Zoo' }
  if (t === 'attraction') return { cat: 'museo', tipo: 'Atracción' }
  if (t === 'viewpoint') return { cat: 'mirador', tipo: 'Mirador' }
  if (mm === 'lighthouse') return { cat: 'mirador', tipo: 'Faro' }
  if (mm === 'windmill') return { cat: 'monumento', tipo: 'Molino' }
  if (mm === 'watermill') return { cat: 'monumento', tipo: 'Molino de agua' }
  if (mm === 'pier') return { cat: 'monumento', tipo: 'Muelle' }
  if (a === 'theatre') return { cat: 'cultura', tipo: 'Teatro' }
  if (a === 'cinema') return { cat: 'cultura', tipo: 'Cine' }
  if (a === 'arts_centre') return { cat: 'cultura', tipo: 'Centro cultural' }
  if (a === 'library') return { cat: 'cultura', tipo: 'Biblioteca' }
  if (h === 'castle') return { cat: 'monumento', tipo: 'Castillo' }
  if (h === 'fort') return { cat: 'monumento', tipo: 'Fortificación' }
  if (h === 'monument') return { cat: 'monumento', tipo: 'Monumento' }
  if (h === 'memorial') return { cat: 'monumento', tipo: 'Memorial' }
  if (h === 'church') return { cat: 'monumento', tipo: 'Iglesia' }
  if (h === 'cathedral') return { cat: 'monumento', tipo: 'Catedral' }
  if (h === 'ruins') return { cat: 'monumento', tipo: 'Ruinas' }
  if (h === 'archaeological_site') return { cat: 'monumento', tipo: 'Yacimiento' }
  if (h === 'tower') return { cat: 'monumento', tipo: 'Torre' }
  if (l === 'park') return { cat: 'parque', tipo: 'Parque' }
  if (l === 'garden') return { cat: 'parque', tipo: 'Jardín' }
  return null
}

function centroide(el) {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lng: el.lon }
  if (el.center) return { lat: el.center.lat, lng: el.center.lon }
  return null
}

function nombre(tags) {
  return tags.name || tags['name:es'] || tags['name:en'] || tags.official_name || null
}

// Alrededores: lo que cualquier guía de «qué ver en X» cuenta y el radio de
// 3 km deja fuera (Baelo Claudia desde Tarifa, Cabo de Gata desde Níjar).
// Solo sitios con artículo en Wikipedia: es el filtro más barato de
// «merece la visita», y da resumen y foto por el mismo camino que el resto.
const RADIO_ALREDEDORES_M = 25000
function queryAlrededores(lat, lng) {
  return `
[out:json][timeout:25];
(
  nwr(around:${RADIO_ALREDEDORES_M},${lat},${lng})[wikipedia][historic~"^(castle|fort|ruins|archaeological_site|monument|tower)$"];
  nwr(around:${RADIO_ALREDEDORES_M},${lat},${lng})[wikipedia][tourism~"^(museum|attraction|viewpoint)$"];
  nwr(around:${RADIO_ALREDEDORES_M},${lat},${lng})[wikipedia][natural~"^(cape|peak|beach|dune|cave_entrance|bay)$"];
  nwr(around:${RADIO_ALREDEDORES_M},${lat},${lng})[wikipedia][boundary=protected_area];
  nwr(around:${RADIO_ALREDEDORES_M},${lat},${lng})[wikipedia][man_made=lighthouse];
);
out center tags 120;
`.trim()
}
const kmEntre = (a, b, c, d) => { const r = Math.PI / 180, x = (c - a) * r, y = (d - b) * r
  const h = Math.sin(x / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(y / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h)) }

async function alrededoresDe(m) {
  const data = await fetchOverpass(queryAlrededores(m.lat, m.lng))
  const out = [], seen = new Set()
  for (const el of data.elements ?? []) {
    const tags = el.tags ?? {}, n = nombre(tags), c = centroide(el)
    if (!n || !c) continue
    const km = kmEntre(m.lat, m.lng, c.lat, c.lng)
    if (km < RADIO_M / 1000 || seen.has(n.toLowerCase())) continue
    seen.add(n.toLowerCase())
    const t = tags.natural === 'cape' ? 'Cabo' : tags.natural === 'dune' ? 'Duna' : tags.natural === 'peak' ? 'Cumbre'
      : tags.natural === 'beach' ? 'Playa' : tags.natural === 'cave_entrance' ? 'Cueva' : tags.boundary ? 'Espacio natural'
      : tags.man_made === 'lighthouse' ? 'Faro' : (categoria(tags)?.tipo ?? 'Sitio')
    out.push({ n, t, la: +c.lat.toFixed(5), lo: +c.lng.toFixed(5), wp: tags.wikipedia, km: +km.toFixed(1), ...(tags.website ? { w: tags.website } : {}) })
  }
  return out.sort((a, b) => a.km - b.km).slice(0, 8)
}

async function procesarMunicipio(m) {
  const query = queryFor(m.lat, m.lng)
  const data = await fetchOverpass(query)
  const pois = { museo: [], monumento: [], cultura: [], mirador: [], parque: [] }
  const seen = new Set()

  for (const el of data.elements ?? []) {
    const tags = el.tags ?? {}
    const n = nombre(tags)
    if (!n) continue                              // sin nombre no sirve
    const c = centroide(el)
    if (!c) continue
    const cat = categoria(tags)
    if (!cat) continue
    const key = n.toLowerCase()
    if (seen.has(key)) continue                   // dedupe por nombre
    seen.add(key)
    pois[cat.cat].push({
      n, t: cat.tipo, la: +c.lat.toFixed(5), lo: +c.lng.toFixed(5),
      ...(tags.website ? { w: tags.website } : {}),
      ...(tags.wikipedia ? { wp: tags.wikipedia } : {}),
      ...(tags['wheelchair'] === 'yes' ? { pmr: 1 } : {}),
    })
  }
  // Cada categoría se limita para no engordar el JSON.
  const LIMITES = { museo: 12, monumento: 20, cultura: 10, mirador: 10, parque: 10 }
  for (const k of Object.keys(pois)) pois[k] = pois[k].slice(0, LIMITES[k])
  const total = Object.values(pois).reduce((a, arr) => a + arr.length, 0)
  await new Promise(r => setTimeout(r, 800))
  const alrededores = await alrededoresDe(m).catch(() => [])
  return { pois, total, alrededores }
}

async function main() {
  // Reanudar si ya hay JSON: evita rehacer los que ya funcionaron cuando el
  // script se corta a mitad por un mirror caído.
  const previo = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf-8')) : {}
  const out = { ...previo }
  let ok = 0, ko = 0

  // Sin `--refrescar`, lo ya cosechado se respeta: sirve para reanudar una
  // pasada cortada a medias. Con él se vuelve a pedir todo —es lo que hace
  // el cron mensual, que antes de esto solo añadía municipios nuevos y no
  // refrescaba ninguno—, pero si Overpass falla en uno se conserva lo que
  // había en vez de dejarlo sin datos.
  const refrescar = process.argv.includes('--refrescar')
  // --solo-alrededores: deja los POIs como están y solo pide la segunda
  // consulta a los municipios que aún no la tienen. Es lo que se corrió la
  // primera vez, para no rehacer 318 cosechas por un bloque nuevo.
  const soloAlrededores = process.argv.includes('--solo-alrededores')

  for (const m of MUNICIPIOS) {
    if (soloAlrededores) {
      if (!out[m.slug] || out[m.slug].alrededores) { ok++; continue }
      try {
        out[m.slug].alrededores = await alrededoresDe(m)
        console.log(`✔  ${m.slug}: ${out[m.slug].alrededores.length} alrededores`)
        writeFileSync(OUT, JSON.stringify(out, null, 0)); ok++
        await new Promise(r => setTimeout(r, 1500))
      } catch (e) { console.error(`✗  ${m.slug}: ${e.message ?? e}`); ko++ }
      continue
    }
    if (out[m.slug] && !refrescar) { console.log(`✔  ${m.slug} (cache)`); ok++; continue }
    try {
      const { pois, total, alrededores } = await procesarMunicipio(m)
      // Con --refrescar se conservan resúmenes y fotos ya resueltos de los
      // POIs que siguen existiendo: se casan por nombre.
      const previoPois = out[m.slug]?.pois ?? {}
      for (const k of Object.keys(pois)) for (const p of pois[k]) {
        const ant = (previoPois[k] ?? []).find(x => x.n === p.n)
        if (ant) { if (ant.f !== undefined) p.f = ant.f; if (ant.e !== undefined) p.e = ant.e; if (ant.r !== undefined) p.r = ant.r }
      }
      for (const p of alrededores) {
        const ant = (out[m.slug]?.alrededores ?? []).find(x => x.n === p.n)
        if (ant) { if (ant.f !== undefined) p.f = ant.f; if (ant.e !== undefined) p.e = ant.e; if (ant.r !== undefined) p.r = ant.r }
      }
      out[m.slug] = { nombre: m.nombre, lat: m.lat, lng: m.lng, pois, total, alrededores, generado: new Date().toISOString().slice(0, 10) }
      console.log(`✔  ${m.slug}: ${total} POIs (${pois.museo.length}m · ${pois.monumento.length}mn · ${pois.cultura.length}c · ${pois.mirador.length}mi · ${pois.parque.length}pk)`)
      writeFileSync(OUT, JSON.stringify(out, null, 0))
      ok++
      await new Promise(r => setTimeout(r, 1500))  // cortesía al mirror
    } catch (e) {
      console.error(`✗  ${m.slug}: ${e.message ?? e}`)
      ko++
    }
  }

  console.log(`\nHecho: ${ok} municipios, ${ko} fallidos. Salida: ${OUT}`)

  // Fallo catastrófico: ningún municipio se pudo generar. En un cron
  // esto suele significar que Overpass está caído o que la red del
  // runner tiene problemas. Salir con != 0 marca el workflow como
  // fallido y llegan las notificaciones. Fallos parciales no hacen
  // saltar la alarma — son la norma con mirrors públicos.
  if (ok === 0 && ko > 0) process.exit(1)
}

main().catch(e => { console.error(e); process.exit(1) })
