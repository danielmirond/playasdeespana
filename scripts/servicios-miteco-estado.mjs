#!/usr/bin/env node
// scripts/servicios-miteco-estado.mjs — que un «No» signifique que no hay.
//
// TRES COSAS QUE ESTABAN MAL, Y LAS TRES SE PARECEN.
//
// 1. El normalizador del sync hace `si(v)`, que devuelve false para todo lo
//    que no sea «Sí». Un campo vacío, un nulo o un «Temporada estival» caían
//    todos en false. Medido contra el dataset oficial: ahí los campos son
//    'Sí' o 'No' de verdad, con tres o cuatro blancos, así que para las
//    playas cruzadas el No es un No. El problema es el resto.
//
// 2. 1.598 de nuestras 5.098 fichas no cruzan con MITECO, y a esas se les
//    quedaban los seis campos básicos en false por defecto: duchas y parking
//    en false en el 100 % de ellas, cero excepciones. Eso no es un dato, es
//    el valor inicial de una variable, y la ficha lo pintaba como «No hay
//    duchas». Ahora se marca de dónde vienen los servicios y, sin fuente, no
//    se afirma nada.
//
// 3. El socorrismo tiene un segundo campo en el origen, Auxilio_y1, que dice
//    «Temporada estival» en 409 playas. Lo aplastábamos a un «Sí» pelado, que
//    en octubre es falso. Se guarda aparte.
//
// Y de paso recupera las fichas que sí tienen registro oficial y se habían
// quedado fuera del cruce: mismo nombre normalizado a menos de 800 m. Son 75,
// y entre ellas Bolonia, que decía «No» a socorrismo, duchas y parking
// mientras el registro oficial dice «Sí» a los tres.
//
//   curl -sL -o /tmp/miteco.geojson "https://opendata.arcgis.com/api/v3/\
// datasets/84ddbc8cf4104a579d579f6441fcaa8a_0/downloads/data?format=geojson&spatialRefId=4326"
//   node scripts/servicios-miteco-estado.mjs /tmp/miteco.geojson [--aplicar]
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const IN = process.argv[2]
const APLICAR = process.argv.includes('--aplicar')
if (!IN) { console.error('Uso: node scripts/servicios-miteco-estado.mjs <miteco.geojson> [--aplicar]'); process.exit(1) }
const F = resolve(ROOT, 'public/data/playas.json')

const RADIO_M = 800
const norm = s => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/^(playa|platja|praia|cala|caleta|es |sa )\s*(de\s+|del\s+|dels\s+|d'\s*|la\s+|las\s+|los\s+|el\s+)?/, '')
  .replace(/[^a-z0-9]/g, '').trim()
const hav = (a, b, c, d) => {
  const R = 6371000, r = x => x * Math.PI / 180
  const dA = r(c - a), dO = r(d - b)
  const s = Math.sin(dA / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(dO / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}
const si = v => { const s = String(v ?? '').trim().toLowerCase(); return s === 'sí' || s === 'si' || s === 's' }

const mit = JSON.parse(readFileSync(IN, 'utf8')).features
const playas = JSON.parse(readFileSync(F, 'utf8'))

// Qué fichas traen datos del inventario. Los campos que solo existen tras el
// cruce son la huella: si no están, nunca hubo registro oficial detrás.
const cruzada = p => p.aseos !== undefined || p.lavapies !== undefined || p.grado_ocupacion !== undefined

let marcadas = 0, recuperadas = 0, estacionales = 0
for (const p of playas) if (cruzada(p)) { p.servicios_fuente = 'miteco'; marcadas++ }

// Recuperar las que tienen registro y se quedaron fuera del cruce.
const sueltas = playas.filter(p => !cruzada(p) && p.lat && p.lng)
for (const f of mit) {
  const g = f.geometry?.coordinates
  if (!g) continue
  const [lo, la] = g
  const n = norm(f.properties.Nombre)
  const cand = sueltas.find(p => Math.abs(p.lat - la) <= 0.02 && Math.abs(p.lng - lo) <= 0.02
    && norm(p.nombre) === n && hav(la, lo, p.lat, p.lng) <= RADIO_M)
  if (!cand || cand.servicios_fuente) continue
  const t = f.properties
  Object.assign(cand, {
    socorrismo: si(t['Auxilio_y_']), duchas: si(t.Duchas), aseos: si(t.Aseos),
    lavapies: si(t.Lavapies), papelera: si(t.Papelera), telefonos: si(t['Teléfonos']),
    limpieza: si(t['Servicio_l']), oficina_turismo: si(t['Oficina_tu']),
    zona_infantil: si(t['Zona_infan']), zona_deportiva: si(t['Zona_depor']),
    alquiler_sombrillas: si(t['Alquiler_s']), alquiler_hamacas: si(t['Alquiler_h']),
    alquiler_nautico: si(t['Alquiler_n']), club_nautico: si(t['Club_naút']),
    establecimientos: si(t['Establecim']), autobus: si(t['Autobús']),
    accesible: si(t['Acceso_dis']), parking: si(t['Aparcamien']),
    bandera: si(t['Bandera_az']),
    servicios_fuente: 'miteco',
  })
  recuperadas++
}

// El socorrismo que solo existe en verano, que es la mayoría del que existe.
const porCoord = new Map()
for (const f of mit) {
  const g = f.geometry?.coordinates
  if (g) porCoord.set(`${g[1].toFixed(3)}:${g[0].toFixed(3)}`, f.properties)
}
for (const p of playas) {
  if (p.servicios_fuente !== 'miteco' || !p.socorrismo || !p.lat) continue
  let t = porCoord.get(`${p.lat.toFixed(3)}:${p.lng.toFixed(3)}`)
  if (!t) {
    for (const f of mit) {
      const g = f.geometry?.coordinates
      if (!g) continue
      if (Math.abs(p.lat - g[1]) > 0.01 || Math.abs(p.lng - g[0]) > 0.01) continue
      if (norm(f.properties.Nombre) !== norm(p.nombre)) continue
      t = f.properties; break
    }
  }
  if (t && /temporada estival/i.test(String(t['Auxilio_y1'] ?? ''))) {
    p.socorrismo_temporada = true
    estacionales++
  }
}

console.log(`fichas con servicios del inventario oficial: ${marcadas}`)
console.log(`recuperadas del cruce fallido:               ${recuperadas}`)
console.log(`socorrismo solo en temporada estival:        ${estacionales}`)
console.log(`sin fuente, o sea sin afirmar nada:          ${playas.filter(p => p.servicios_fuente !== 'miteco').length}`)
if (APLICAR) { writeFileSync(F, JSON.stringify(playas)); console.log('\nescrito public/data/playas.json') }
else console.log('\n(nada escrito; repite con --aplicar)')
