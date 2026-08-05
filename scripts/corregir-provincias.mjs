#!/usr/bin/env node
// Corrige el campo `provincia` de public/data/playas.json.
//
// Por defecto solo INFORMA. Con --escribir aplica los cambios.
//
// ── Por qué hace falta ────────────────────────────────────────────────
// Playa de Bolonia (Tarifa, lon -5.77) decía Málaga. Málaga empieza en
// -5.4. No era un caso suelto: 75 fichas indexadas tenían la provincia
// contradicha por su entorno, y la cifra se queda corta porque un cúmulo
// entero mal etiquetado no se detecta comparando con los vecinos —
// Bolonia no salía, porque su vecina Baños de Baelo miente igual.
//
// ── De dónde sale la verdad ───────────────────────────────────────────
// El dataset mezcla orígenes. 3.821 de las 4.480 indexadas pasaron por
// una fuente oficial (miteco, ine, cartociudad, datos.gob.es); 659 son
// OSM a secas. De los 75 errores, 71 son OSM puro. Así que el jurado son
// los registros validados y el acusado siempre es OSM puro: eso rompe el
// problema del cúmulo, porque las vecinas mentirosas quedan fuera del
// voto por no estar validadas.
//
// ── Tres reglas, de más a menos segura ────────────────────────────────
// A · Grafía. «Islas Baleares» y «Baleares» son la misma provincia con
//     dos nombres, y cada una tiene su hub vivo y en el sitemap. Gana la
//     grafía mayoritaria. Aquí no hay nada que deducir.
// B · Autocontradicción. El propio `municipio` del registro aparece en
//     registros validados con OTRA provincia, de forma unánime. El
//     dataset se desmiente solo: no hace falta geografía.
// C · Vecindario validado UNÁNIME. Las 14 playas validadas más cercanas
//     dicen todas la misma provincia, y no es la del registro.
//
//     Empezó pidiendo mayoría (10 de 12) y proponía disparates: mover
//     Praia do Castelo de A Coruña a Pontevedra, cuando Barbanza es
//     comarca coruñesa. En una ría el vecino más cercano cruza la raya a
//     cada paso, así que la mayoría no significa nada. La unanimidad sí:
//     donde hay frontera, el vecindario sale mezclado y la regla calla
//     sola. No hace falta saber dónde están las rayas.
//
//     También llevaba tope de 25 km, y ese tope se comía justo el caso
//     que originó todo esto: las 14 vecinas validadas de Bolonia son
//     Cádiz sin excepción, pero la duodécima cae a 29,5 km porque ese
//     tramo de costa está poco poblado de playas oficiales. El tope se
//     va: la unanimidad ya es el freno.
//
// Lo que NO se toca: registros validados, y cualquier caso donde las
// reglas discrepen. Las playas de interior (embalses) y las de la raya
// provincial son justo donde la regla C se equivoca, y por eso pide
// unanimidad casi total y un radio corto.

import { readFileSync, writeFileSync } from 'node:fs'

const RUTA = 'public/data/playas.json'
const ESCRIBIR = process.argv.includes('--escribir')
const VALIDADO = (p) => (p.source || '') !== 'osm'

// Territorio que no es España. Dos detectores, porque hay dos casos.
//
// Lejanía: la costa española está densamente cubierta de registros
// validados, así que ninguna playa española real queda lejos de uno. La
// más remota que hay —El Hierro, Anaga— está a 8 km. Las argelinas del
// catálogo, a 188. El umbral de 40 km no roza nada legítimo.
//
// Y una lista corta para lo que la lejanía no puede ver: Gibraltar está a
// 1 km de la costa gaditana y Eddalya a 9 de Ceuta, así que el vecindario
// los declara españoles con toda la convicción del mundo.
const LEJOS_KM = 40
const EXTRANJERO = /^(gibraltar|eddalya|fnideq|m'?diq|t[aá]nger)$/i

const bruto = JSON.parse(readFileSync(RUTA, 'utf8'))
const playas = Array.isArray(bruto) ? bruto : bruto.playas
const coord = (p) => [p.lat, p.lng ?? p.lon]
const km = (aLa, aLo, bLa, bLo) => {
  const dx = (bLo - aLo) * 111 * Math.cos((aLa * Math.PI) / 180)
  const dy = (bLa - aLa) * 111
  return Math.hypot(dx, dy)
}

// ── A · grafía ────────────────────────────────────────────────────────
const cuenta = new Map()
for (const p of playas) if (p.provincia) cuenta.set(p.provincia, (cuenta.get(p.provincia) || 0) + 1)
const SINONIMOS = [['Islas Baleares', 'Baleares']]
const canon = new Map()
for (const grupo of SINONIMOS) {
  const gana = grupo.slice().sort((a, b) => (cuenta.get(b) || 0) - (cuenta.get(a) || 0))[0]
  for (const g of grupo) if (g !== gana) canon.set(g, gana)
}

// ── B · municipio → provincia, según registros validados ──────────────
const porMunicipio = new Map()
for (const p of playas) {
  if (!VALIDADO(p) || !p.municipio || !p.provincia) continue
  const k = p.municipio.trim().toLowerCase()
  if (!porMunicipio.has(k)) porMunicipio.set(k, new Set())
  porMunicipio.get(k).add(canon.get(p.provincia) || p.provincia)
}

// ── C · vecindario validado ───────────────────────────────────────────
const jurado = playas
  .filter((p) => VALIDADO(p) && p.provincia && p.lat && (p.lng ?? p.lon))
  .map((p) => ({ la: p.lat, lo: p.lng ?? p.lon, prov: canon.get(p.provincia) || p.provincia }))
const rejilla = new Map()
for (const j of jurado) {
  const k = `${Math.round(j.la * 2)},${Math.round(j.lo * 2)}`
  if (!rejilla.has(k)) rejilla.set(k, [])
  rejilla.get(k).push(j)
}
function kmAlValidadoMasCercano(la, lo) {
  let mejor = Infinity
  for (let a = -6; a <= 6; a++)
    for (let b = -6; b <= 6; b++)
      for (const j of rejilla.get(`${Math.round(la * 2) + a},${Math.round(lo * 2) + b}`) || [])
        mejor = Math.min(mejor, km(la, lo, j.la, j.lo))
  return mejor
}

function vecindario(la, lo) {
  const cerca = []
  for (let a = -2; a <= 2; a++)
    for (let b = -2; b <= 2; b++)
      cerca.push(...(rejilla.get(`${Math.round(la * 2) + a},${Math.round(lo * 2) + b}`) || []))
  const orden = cerca
    .map((j) => ({ d: km(la, lo, j.la, j.lo), prov: j.prov }))
    .sort((x, y) => x.d - y.d)
    .slice(0, 14)
  if (orden.length < 14) return null
  const unica = new Set(orden.map((o) => o.prov))
  return unica.size === 1 ? [...unica][0] : null
}

// ── aplicar ───────────────────────────────────────────────────────────
const cambios = { A: [], B: [], C: [] }
const fuera = []
for (const p of playas) {
  const original = p.provincia
  if (!original) continue

  const porGrafia = canon.get(original)
  if (porGrafia) {
    cambios.A.push([p.slug, original, porGrafia])
    p.provincia = porGrafia
    continue
  }
  if (VALIDADO(p)) continue      // los validados no se tocan más allá de la grafía
  const [la0, lo0] = coord(p)
  const lejos = la0 && lo0 ? kmAlValidadoMasCercano(la0, lo0) : 0
  if (EXTRANJERO.test((p.municipio || '').trim()) || lejos > LEJOS_KM) {
    fuera.push([p.slug, p.municipio, p.provincia, lejos])
    continue
  }

  const [la, lo] = coord(p)
  const muni = (p.municipio || '').trim().toLowerCase()
  const porMuni = porMunicipio.get(muni)
  const sugMuni = porMuni && porMuni.size === 1 ? [...porMuni][0] : null
  const sugVec = la && lo ? vecindario(la, lo) : null

  // B y C deben coincidir cuando ambas opinan. Discrepancia → no se toca.
  if (sugMuni && sugVec && sugMuni !== sugVec) continue

  const sug = sugMuni || sugVec
  if (!sug || sug === p.provincia) continue

  cambios[sugMuni ? 'B' : 'C'].push([p.slug, p.provincia, sug, p.municipio])
  p.provincia = sug
}

const total = cambios.A.length + cambios.B.length + cambios.C.length
console.log(`A · grafía unificada        ${String(cambios.A.length).padStart(5)}`)
console.log(`B · municipio lo desmiente  ${String(cambios.B.length).padStart(5)}`)
console.log(`C · vecindario unánime      ${String(cambios.C.length).padStart(5)}`)
console.log(`                            ${'─'.repeat(5)}\n  se aplican                ${String(total).padStart(5)}\n`)
for (const regla of ['B', 'C']) {
  if (!cambios[regla].length) continue
  console.log(`── regla ${regla} ──`)
  for (const [slug, de, a, muni] of cambios[regla].slice(0, 40))
    console.log(`  ${slug.padEnd(36)} ${String(muni ?? '').slice(0, 20).padEnd(21)} ${de} → ${a}`)
  if (cambios[regla].length > 40) console.log(`  … y ${cambios[regla].length - 40} más`)
  console.log()
}

if (fuera.length) {
  console.log('── NO son España: sobran del catálogo, no es un error de provincia ──')
  for (const [slug, muni, prov, lejos] of fuera.slice(0, 25))
    console.log(`  ${slug.padEnd(32)} ${String(muni).slice(0, 20).padEnd(21)} figura como ${String(prov).padEnd(10)} ${Number.isFinite(lejos) ? `(${Math.round(lejos)} km de costa española)` : ''}`)
  if (fuera.length > 25) console.log(`  … y ${fuera.length - 25} más`)
  console.log()
}

if (ESCRIBIR) {
  // El fichero viene indentado a 2. Escribirlo minificado convertiría un
  // cambio de 100 líneas en un diff de 290.000.
  writeFileSync(RUTA, JSON.stringify(bruto, null, 2) + '\n')
  console.log(`Escrito ${RUTA}.`)
} else {
  console.log('Solo informe. Añade --escribir para aplicarlo.')
}
