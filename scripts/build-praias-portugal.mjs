#!/usr/bin/env node
// scripts/build-praias-portugal.mjs — el inventario oficial portugués.
//
// POR QUÉ PORTUGAL. El motor del sitio no es español: Open-Meteo es mundial
// y la calidad del agua sale de la directiva europea. Lo único español era
// el inventario del Ministerio, y Portugal tiene el suyo —APA/SNIRH, 755
// praias con 33 campos— publicado en dados.gov.pt con licencia abierta.
//
// Y está MEJOR relleno que el nuestro: limpieza en el 97 % de las fichas,
// aseos en el 88 %, aparcamiento en el 81 %. Trae además tres cosas que el
// MITECO no da: silla anfibia (216 praias), las fechas exactas de temporada
// de baño —que en España hubo que deducir— y la URL de la ficha oficial en
// las 755, que es la fuente enlazable que pide cualquier auditoría.
//
// Se lee el shapefile a pelo, sin dependencias: el DBF es de formato fijo y
// la geometría son puntos. Añadir una librería para esto sería traer 2 MB
// de node_modules para leer 97 KB.
//
//   curl -sL -o /tmp/praias.zip "https://sniambgeoviewer.apambiente.pt/\
// GeoDocs/shpzips/snirh_praias_infopraia_vwm.zip" && unzip -o /tmp/praias.zip -d /tmp/praias
//   node scripts/build-praias-portugal.mjs /tmp/praias
//
// Salida: public/data/praias-portugal.json
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = process.argv[2]
if (!DIR) { console.error('Uso: node scripts/build-praias-portugal.mjs <dir con el shapefile>'); process.exit(1) }
const BASE = `${DIR}/snirh_praias_infopraia_vwm`
// Nombres de uso, de OSM. El inventario da «Rocha» y la gente busca «Praia
// da Rocha»: el artículo (da/de/do/das) no se puede deducir sin inventarlo,
// y esta semana hemos quitado demasiadas cosas inventadas como para añadir
// una. OSM sí trae el nombre tal como se usa, y se cruza por coordenada.
const OSM = process.argv[3] ?? '/tmp/pt-beach.json'
const OUT = resolve(ROOT, 'public/data/praias-portugal.json')

// ——— DBF ————————————————————————————————————————————————
function leeDbf(ruta) {
  const b = readFileSync(ruta)
  const nreg = b.readUInt32LE(4), hlen = b.readUInt16LE(8), rlen = b.readUInt16LE(10)
  const campos = []
  for (let o = 32; b[o] !== 0x0d; o += 32) {
    campos.push({ nombre: b.subarray(o, o + 11).toString('latin1').replace(/\0.*$/, ''), largo: b[o + 16] })
  }
  const filas = []
  for (let i = 0; i < nreg; i++) {
    const inicio = hlen + i * rlen
    if (b[inicio] === 0x2a) continue          // borrado
    let off = inicio + 1
    const f = {}
    for (const c of campos) {
      f[c.nombre] = b.subarray(off, off + c.largo).toString('utf8').trim()
      off += c.largo
    }
    filas.push(f)
  }
  return filas
}

// ——— SHP (solo puntos) ——————————————————————————————————
function leePuntos(ruta) {
  const b = readFileSync(ruta)
  const pts = []
  let o = 100
  while (o < b.length) {
    const largo = b.readInt32BE(o + 4) * 2
    const tipo = b.readInt32LE(o + 8)
    pts.push(tipo === 1 ? { lng: b.readDoubleLE(o + 12), lat: b.readDoubleLE(o + 20) } : null)
    o += 8 + largo
  }
  return pts
}

const si = v => v === '1'
const fecha = v => (/^\d{8}$/.test(v) ? `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6)}` : null)

// El inventario incluye embalses y ríos. Se marcan, no se tiran: una praia
// fluvial del Alentejo es una página legítima, pero no es costa y no puede
// mezclarse en los listados de litoral.
const FLUVIAL = /açude|albufeira|barragem|rio |praia fluvial|lagoa/i

const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const filas = leeDbf(`${BASE}.dbf`)
const puntos = leePuntos(`${BASE}.shp`)

let nombresOsm = []
try {
  nombresOsm = (JSON.parse(readFileSync(OSM, 'utf8')).elements ?? [])
    .map(e => ({ n: e.tags?.name, la: e.lat ?? e.center?.lat, lo: e.lon ?? e.center?.lon }))
    .filter(x => x.n && x.la)
} catch { console.warn('(sin nombres de OSM: se usan los del inventario)') }

const hav = (la1, lo1, la2, lo2) => {
  const R = 6371000, r = d => d * Math.PI / 180
  const dLa = r(la2 - la1), dLo = r(lo2 - lo1)
  const x = Math.sin(dLa / 2) ** 2 + Math.cos(r(la1)) * Math.cos(r(la2)) * Math.sin(dLo / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}
const sinTilde = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
/** El nombre de OSM solo se acepta si contiene al oficial: así «Rocha» pasa
 *  a «Praia da Rocha», pero la playa de al lado con otro nombre no cuela. */
function nombreDeUso(oficial, lat, lng) {
  const o = sinTilde(oficial)
  let mejor = null, dm = 400
  for (const c of nombresOsm) {
    if (Math.abs(c.la - lat) > 0.01 || Math.abs(c.lo - lng) > 0.01) continue
    if (!sinTilde(c.n).includes(o)) continue
    const d = hav(lat, lng, c.la, c.lo)
    if (d < dm) { dm = d; mejor = c.n }
  }
  return mejor
}

/** PORTIMÃO → Portimão; VILA NOVA DE GAIA → Vila Nova de Gaia. */
const MINUSCULAS = new Set(['de', 'do', 'da', 'dos', 'das', 'e'])
const capitaliza = s => s.toLowerCase().split(/\s+/)
  .map((w, i) => (i > 0 && MINUSCULAS.has(w)) ? w : w.charAt(0).toUpperCase() + w.slice(1))
  .join(' ')

const vistos = new Map()
const praias = []
for (let i = 0; i < filas.length; i++) {
  const r = filas[i], p = puntos[i]
  if (!p) continue
  const deUso = nombreDeUso(r.nome_praia, p.lat, p.lng)
  const nombre = deUso ?? r.nome_praia
  let slug = slugify(nombre)
  // Hay nombres repetidos en concelhos distintos: el slug lleva el concelho.
  if (vistos.has(slug)) slug = `${slug}-${slugify(r.concelho)}`
  let n = 2
  while (vistos.has(slug)) slug = `${slugify(nombre)}-${slugify(r.concelho)}-${n++}`
  vistos.set(slug, true)

  praias.push({
    slug,
    nombre,
    // El del inventario, cuando OSM aporta otro: es el que casa con la
    // ficha oficial y con el código de agua balnear.
    nombreOficial: deUso && deUso !== r.nome_praia ? r.nome_praia : undefined,
    municipio: capitaliza(r.concelho),
    region: r.arh,
    lat: +p.lat.toFixed(6),
    lng: +p.lng.toFixed(6),
    fluvial: FLUVIAL.test(r.nome_agua_) || undefined,
    // Servicios, con la misma semántica que en España: true/false salen del
    // inventario, y aquí SÍ vienen rellenos, así que no hay «no consta».
    socorrismo: si(r.posto_soco),
    vigilancia: si(r.vigilancia),
    duchas: si(r.duche),
    aseos: si(r.sanitarios),
    parking: si(r.estacionam),
    limpieza: si(r.limpeza_pr),
    bandera: si(r.bandeira_a),
    accesible: si(r.acessivel),
    // Lo que el MITECO no tiene.
    sillaAnfibia: si(r.cadeira_an),
    apoyoBalneario: si(r.apoio_baln),
    panelInformativo: si(r.painel_inf),
    olasFuertes: si(r.ondas_espe),
    riesgoDesprendimiento: si(r.risco_derr),
    obras: si(r.obras_em_c) || undefined,
    temporadaInicio: fecha(r.data_inici),
    temporadaFin: fecha(r.data_fim_e),
    calidadAgua: r.qualidade_ || null,
    fichaOficial: r.url_infopr || null,
    webcam: r.url_webcam?.startsWith('http') ? r.url_webcam : null,
    codigoAgua: r.codigo_agu || null,
  })
}

writeFileSync(OUT, JSON.stringify(praias))
const costeras = praias.filter(p => !p.fluvial)
const conc = new Set(costeras.map(p => p.municipio))
console.log(`praias: ${praias.length} · costeras: ${costeras.length} · fluviales: ${praias.length - costeras.length}`)
console.log(`concelhos costeros: ${conc.size}`)
const pc = k => `${praias.filter(p => p[k]).length} (${Math.round(praias.filter(p => p[k]).length / praias.length * 100)}%)`
console.log(`socorrismo ${pc('socorrismo')} · duchas ${pc('duchas')} · aseos ${pc('aseos')} · parking ${pc('parking')}`)
console.log(`con nombre de uso de OSM: ${praias.filter(p => p.nombreOficial).length}`)
console.log(`bandera ${pc('bandera')} · accesible ${pc('accesible')} · silla anfibia ${pc('sillaAnfibia')} · webcam ${pc('webcam')}`)
