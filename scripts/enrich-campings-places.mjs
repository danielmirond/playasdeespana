#!/usr/bin/env node
// scripts/enrich-campings-places.mjs — completa el sidecar de campings
// con Google Places: valoración y reseñas para los que ya tenemos, y
// las zonas de acampada que OSM no mapea.
//
// POR QUÉ Y CON QUÉ CUIDADO. OSM cubre bien los cámpings de negocio
// (1.319 a ≤15 km de playa, 46 provincias) pero se deja las zonas de
// acampada públicas, sobre todo en Canarias: Las Palmas salía con 9.
// Lo que OSM nunca va a dar es la valoración, que es lo que convierte
// una lista en algo que se consulta.
//
// LA PRUEBA QUE JUSTIFICA LOS FILTROS. Nueve llamadas sobre Baleares,
// Las Palmas y Huelva devolvieron 115 sitios, de los que solo 17
// casaban con los nuestros. Los «nuevos» incluían:
//   - Yosemite, Voyageurs y McArthur-Burney Falls (Estados Unidos),
//     porque searchText con locationBias NO acota: si no encuentra
//     cerca, trae lo que sea del mundo;
//   - hoteles y resorts con primaryType 'hotel' que no son cámpings;
//   - cinco cámpings del Algarve, porque un radio de 25 km desde una
//     playa de Huelva cruza la frontera y Places no entiende de ellas.
// Meter eso en el sidecar sería repetir a lo grande el error de las
// playas argelinas archivadas como provincia de Almería.
//
// De ahí los tres filtros, en este orden:
//   1. primaryType === 'campground' — fuera hoteles y resorts.
//   2. Dentro de la bbox de la provincia que se está cosechando, con
//      margen de 0,25°: fuera Portugal, Francia y otros continentes.
//   3. A 15 km o menos de una playa del catálogo, el mismo criterio
//      que usa build-campings.mjs, para no listar cámpings de interior.
//
// Coste: 3 puntos por provincia costera = ~81 llamadas one-off, SKU
// Pro, dentro de las 5.000 gratuitas al mes. Cero euros.
//
// Uso:  export $(grep GOOGLE_PLACES_API_KEY .env.local | xargs)
//       node scripts/enrich-campings-places.mjs            # todas
//       node scripts/enrich-campings-places.mjs las-palmas # una
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const KEY = process.env.GOOGLE_PLACES_API_KEY
if (!KEY) { console.error('Falta GOOGLE_PLACES_API_KEY'); process.exit(1) }

// Los flags no son nombres de provincia: sin esto, `--dry-run` a secas
// se tomaba como el slug a cosechar y no casaba con ninguna, así que el
// script no hacía ni una llamada y decía que todo iba bien.
const SOLO = process.argv.slice(2).find(a => !a.startsWith('--')) ?? null
const RADIUS_M = 25000       // sesgo de búsqueda, no límite
const MARGEN_BBOX = 0.25     // grados de holgura sobre la provincia
const RADIO_PLAYA_M = 15000  // mismo criterio que build-campings.mjs
const PUNTOS = 3

const COSTERAS = new Set(['Andalucía','Cataluña','Comunitat Valenciana','Galicia','Canarias',
  'Islas Baleares','Murcia','Asturias','Cantabria','País Vasco','Ceuta','Melilla'])

const sl = s => s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()
  .replace(/\b(camping|campsite|resort|club|parque|zona de acampada)\b/g,'').replace(/[^a-z0-9]/g,'')
/**
 * Parecido entre dos nombres, de 0 a 1, por tokens compartidos.
 *
 * El cruce por coordenadas solo no basta: en un camping grande la ficha
 * de Google puede estar a 400 m de donde OSM pone el polígono, y dos
 * cámpings vecinos pueden estar a 300 m uno de otro. Con la distancia
 * sola, lo primero se descarta y lo segundo se fusiona mal.
 *
 * Se comparan tokens y no la cadena entera porque «Camping Las Dunas» y
 * «Càmping Las Dunas Resort» son el mismo sitio escrito de tres maneras.
 * Las palabras genéricas —camping, resort, club…— ya se quitan en norm(),
 * así que lo que queda es el nombre propio, que es lo que distingue.
 */
function parecido(a, b) {
  const ta = new Set(norm(a).match(/[a-z0-9]{3,}/g) ?? [])
  const tb = new Set(norm(b).match(/[a-z0-9]{3,}/g) ?? [])
  if (!ta.size || !tb.size) return 0
  let comunes = 0
  for (const t of ta) if (tb.has(t)) comunes++
  return comunes / Math.min(ta.size, tb.size)
}

const hav = (a,b,c,d) => { const R=6371000, r=x=>x*Math.PI/180
  const dLa=r(c-a), dLo=r(d-b)
  const x=Math.sin(dLa/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dLo/2)**2
  return 2*R*Math.asin(Math.sqrt(x)) }

const playas = JSON.parse(readFileSync(resolve(ROOT,'public/data/playas.json'),'utf8'))
  .filter(p => p?.slug && p.lat && p.lng)
const sidecar = JSON.parse(readFileSync(resolve(ROOT,'public/data/campings.json'),'utf8'))

// Playas por provincia, y bbox de cada una
const porProv = new Map()
for (const p of playas) {
  if (!COSTERAS.has(p.comunidad)) continue
  const k = sl(p.provincia)
  if (!porProv.has(k)) porProv.set(k, { nombre: p.provincia, playas: [] })
  porProv.get(k).playas.push(p)
}
const bbox = ps => ({
  minLat: Math.min(...ps.map(p=>p.lat)) - MARGEN_BBOX, maxLat: Math.max(...ps.map(p=>p.lat)) + MARGEN_BBOX,
  minLng: Math.min(...ps.map(p=>p.lng)) - MARGEN_BBOX, maxLng: Math.max(...ps.map(p=>p.lng)) + MARGEN_BBOX,
})

async function buscar(lat, lng) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Referer': 'https://www.playas-espana.com/',
      'X-Goog-Api-Key': KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.location,places.primaryType',
    },
    body: JSON.stringify({
      textQuery: 'camping',
      maxResultCount: 20,
      locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: RADIUS_M } },
    }),
  })
  if (!res.ok) { console.warn(`    HTTP ${res.status}`); return [] }
  return (await res.json()).places ?? []
}

const DRY = process.argv.includes('--dry-run')
const informe = []
let llamadas = 0, enriquecidos = 0, anadidos = 0, ambiguos = 0
const descartes = { tipo: 0, fuera: 0, lejos: 0 }

for (const [provSlug, { nombre, playas: ps }] of [...porProv].sort()) {
  if (SOLO && provSlug !== SOLO) continue
  const bb = bbox(ps)
  const idx = sidecar.provincias[provSlug] ?? []
  const mios = idx.map(i => sidecar.pool[i])

  const paso = Math.max(1, Math.floor(ps.length / PUNTOS))
  const puntos = Array.from({ length: PUNTOS }, (_, i) => ps[Math.min(i * paso, ps.length - 1)])
  const vistos = new Map()
  for (const pt of puntos) {
    for (const g of await buscar(pt.lat, pt.lng)) vistos.set(g.id, g)
    llamadas++
    await new Promise(r => setTimeout(r, 300))
  }

  let nuevosProv = 0, enrProv = 0
  for (const g of vistos.values()) {
    // FILTRO 1 · solo cámpings, fuera hoteles y resorts
    if (g.primaryType !== 'campground') { descartes.tipo++; continue }
    const la = g.location?.latitude, lo = g.location?.longitude
    if (typeof la !== 'number' || typeof lo !== 'number') { descartes.tipo++; continue }
    // FILTRO 2 · dentro de la provincia que se cosecha
    if (la < bb.minLat || la > bb.maxLat || lo < bb.minLng || lo > bb.maxLng) { descartes.fuera++; continue }

    // ¿Ya lo tenemos? Por cercanía, o por nombre a distancia corta.
    // CRUCE NOMBRE A NOMBRE, no solo por coordenada.
    //
    // Se toma el candidato más cercano dentro de 3 km y se decide con
    // las dos señales juntas:
    //   - a menos de 250 m y con algún parecido de nombre → el mismo;
    //   - hasta 3 km, si los nombres se parecen al menos un 60 % → el
    //     mismo (la ficha de Google suele caer en la recepción, no en
    //     el centroide del recinto);
    //   - a menos de 150 m aunque el nombre no diga nada → el mismo,
    //     porque dos cámpings distintos no comparten esa distancia.
    // Cualquier otra cosa se trata como sitio nuevo, que es el error
    // barato: un duplicado se ve; una fusión equivocada mezcla dos
    // cámpings en una ficha y no se nota.
    const gName = g.displayName?.text ?? ''
    const gn = norm(gName)
    let hit = null, hitD = Infinity, hitSim = 0
    for (const m of mios) {
      const d = hav(la, lo, m.la, m.lo)
      if (d > 3000) continue
      const sim = parecido(gName, m.nombre)
      const mismo = (d < 150) || (d < 250 && sim >= 0.34) || sim >= 0.6
      if (mismo && d < hitD) { hit = m; hitD = d; hitSim = sim }
    }
    // DESEMPATE. La regla de «a menos de 150 m es el mismo» falla donde
    // hay dos cámpings pared con pared (Tamarit, El Saler): la ficha de
    // Google casa con el vecino y la valoración acaba en la ficha
    // equivocada sin que se note. Si el nombre no dice nada (sim < 0,34)
    // y hay más de un candidato nuestro en 250 m, no se decide: se deja
    // la ficha sin valoración, que es el error que no miente.
    if (hit && hitSim < 0.34) {
      const vecinos = mios.filter(m => hav(la, lo, m.la, m.lo) < 250).length
      if (vecinos > 1) {
        informe.push({ prov: nombre, tipo: 'ambiguo', places: gName, osm: hit.nombre, d: Math.round(hitD), sim: hitSim.toFixed(2), rating: g.rating })
        ambiguos++
        continue
      }
    }
    if (hit) {
      informe.push({ prov: nombre, tipo: 'casa', places: gName, osm: hit.nombre, d: Math.round(hitD), sim: hitSim.toFixed(2), rating: g.rating })
      if (g.rating) { hit.rating = g.rating; hit.reseñas = g.userRatingCount ?? 0; enriquecidos++; enrProv++ }
      continue
    }

    // FILTRO 3 · a 15 km o menos de una playa del catálogo
    let mejor = null, mejorD = Infinity
    for (const p of ps) {
      const d = hav(la, lo, p.lat, p.lng)
      if (d < mejorD) { mejorD = d; mejor = p }
    }
    if (!mejor || mejorD > RADIO_PLAYA_M) { descartes.lejos++; continue }

    const nuevo = {
      id: `places-${g.id}`,
      nombre: (g.displayName?.text ?? '').slice(0, 80),
      tipo: 'Camping',
      categoria: 3,
      distancia_m: Math.round(mejorD),
      servicios: [],            // Places no los da; se quedan vacíos antes que inventarlos
      tiendas: true,
      autocaravanas: false,
      bungalows: false,         // dato de OSM: no se puede suponer
      la: +la.toFixed(5),
      lo: +lo.toFixed(5),
      playa: { slug: mejor.slug, nombre: mejor.nombre, municipio: mejor.municipio, distancia_m: Math.round(mejorD) },
      fuente: 'places',
    }
    if (g.rating) { nuevo.rating = g.rating; nuevo.reseñas = g.userRatingCount ?? 0 }
    informe.push({ prov: nombre, tipo: 'nuevo', places: gName, osm: '—', d: Math.round(mejorD), sim: '—', rating: g.rating })
    if (!DRY) {
      const i = sidecar.pool.push(nuevo) - 1
      ;(sidecar.provincias[provSlug] ??= []).push(i)
    }
    anadidos++; nuevosProv++
  }
  console.log(`  ${nombre.padEnd(24)} ${String(mios.length).padStart(4)} en sidecar · +${nuevosProv} nuevos · ${enrProv} con valoración`)
}

// EL EMPAREJAMIENTO, NOMBRE A NOMBRE. Se imprime siempre, y con
// --dry-run no se escribe nada: así se revisa antes de tocar el
// sidecar, que es lo que pide un cruce entre dos fuentes.
console.log('\n── EMPAREJAMIENTO NOMBRE A NOMBRE ──')
console.log(`${'PROVINCIA'.padEnd(16)} ${'PLACES'.padEnd(36)} ${'OSM'.padEnd(36)} ${'dist'.padStart(6)} ${'sim'.padStart(5)}`)
for (const r of informe) {
  const marca = r.tipo === 'casa' ? '=' : '+'
  console.log(`${marca} ${r.prov.slice(0,14).padEnd(14)} ${r.places.slice(0,36).padEnd(36)} ${String(r.osm).slice(0,36).padEnd(36)} ${String(r.d).padStart(5)}m ${String(r.sim).padStart(5)}`)
}

if (!DRY) {
  for (const lista of Object.values(sidecar.provincias)) {
    lista.sort((a, b) => sidecar.pool[a].distancia_m - sidecar.pool[b].distancia_m)
  }
  sidecar.actualizado = new Date().toISOString().slice(0, 10)
  writeFileSync(resolve(ROOT,'public/data/campings.json'), JSON.stringify(sidecar))
} else {
  console.log('\n(--dry-run: no se ha escrito nada)')
}

console.log(`\nllamadas Places: ${llamadas}`)
console.log(`campings enriquecidos con valoración: ${enriquecidos}`)
console.log(`campings añadidos: ${anadidos}`)
console.log(`emparejamientos ambiguos no fusionados: ${ambiguos}`)
console.log(`descartados → no es campground: ${descartes.tipo} · fuera de la provincia: ${descartes.fuera} · a más de ${RADIO_PLAYA_M/1000} km de playa: ${descartes.lejos}`)
console.log(`pool final: ${sidecar.pool.length}`)
