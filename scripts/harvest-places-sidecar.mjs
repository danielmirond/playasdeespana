#!/usr/bin/env node
// scripts/harvest-places-sidecar.mjs — cosecha ÚNICA de Google Places para
// las playas mapeadas a AEMET, a sidecar permanente.
//
// POR QUÉ EXISTE
// Tras el cargo de 231 € de julio, la key salió de Vercel: en producción ya
// no hay llamadas nuevas a Places, y la caché KV de 30 días caducó vacía
// (harvest-gplaces.mjs del 24-jul volvió con {}). Sin esto, las fichas se
// quedan con OSM y sin valoraciones.
//
// La jugada es la misma que con yoga y chiringuitos: pagar UNA vez dentro
// del tramo gratuito, congelar el resultado en el repo y no volver a
// llamar nunca. Un sidecar no caduca; una caché sí.
//
// COSTE
// 541 playas con AEMET × 2 consultas (restaurantes + hoteles) = 1.082
// llamadas. El tramo gratuito Pro son 5.000/mes. Coste esperado: 0 €.
// El tope duro de --max-llamadas lo hace verificable en vez de confiado.
//
// SEGURIDAD
//   · Simulación por defecto: sin --ejecutar no se llama a Google.
//   · Tope duro de llamadas; al alcanzarlo para y guarda lo que lleve.
//   · Reanudable: no repite lo ya cosechado, así que reintentar no paga dos veces.
//   · Field mask de SKU Pro, idéntica a src/lib/google-places.ts. Añadir
//     website, teléfono, horarios o fotos salta a Enterprise y rompe el tramo.
//   · La key nunca se imprime.
//
// Uso:
//   export $(grep -E "^GOOGLE_PLACES_API_KEY=" .env.local | xargs)
//   node scripts/harvest-places-sidecar.mjs                 # simulación
//   node scripts/harvest-places-sidecar.mjs --ejecutar

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT  = resolve(ROOT, 'src/data/gplaces-sidecar.json')

const arg  = (n, d) => { const v = process.argv.find(a => a.startsWith(`--${n}=`)); return v ? v.slice(n.length + 3) : d }
const EJECUTAR = process.argv.includes('--ejecutar')
const MAX = Number(arg('max-llamadas', 1200))

const API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? ''

// Mismos parámetros que el runtime, para que el sidecar sea intercambiable
// con lo que la ficha pediría en vivo.
const CONSULTAS = [
  { clave: 'restaurant', tipos: ['restaurant', 'bar', 'cafe'], radio: 3000, max: 8 },
  { clave: 'lodging',    tipos: ['lodging'],                   radio: 5000, max: 6 },
]

const PRECIO = {
  PRICE_LEVEL_INEXPENSIVE: '€', PRICE_LEVEL_MODERATE: '€€',
  PRICE_LEVEL_EXPENSIVE: '€€€', PRICE_LEVEL_VERY_EXPENSIVE: '€€€€',
}
const TIPO = {
  bar: 'Bar', cafe: 'Cafetería', coffee_shop: 'Cafetería', restaurant: 'Restaurante',
  lodging: 'Hotel', hotel: 'Hotel', hostel: 'Hostal', guest_house: 'Casa de huéspedes',
}

// ── Universo: las servibles que tienen estación AEMET ───────────────────
const EXCLUIDAS = new Set([
  ...JSON.parse(readFileSync(resolve(ROOT, 'src/data/slugs-extranjeras.json'), 'utf8')),
  ...Object.keys(JSON.parse(readFileSync(resolve(ROOT, 'src/data/duplicados.json'), 'utf8'))),
])
const aemet = JSON.parse(readFileSync(resolve(ROOT, 'src/data/aemet-playas.json'), 'utf8'))
const playas = JSON.parse(readFileSync(resolve(ROOT, 'public/data/playas.json'), 'utf8'))
  .filter(p => p?.slug && p.lat && p.lng && !EXCLUIDAS.has(p.slug) && aemet[p.slug])

const out = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {}
const clave = (c, p) => `${c}:${p.lat.toFixed(4)}:${p.lng.toFixed(4)}`

// Pendientes de verdad: lo ya cosechado no se vuelve a pagar.
const pendientes = []
for (const p of playas) for (const c of CONSULTAS) {
  if (out[clave(c.clave, p)] === undefined) pendientes.push({ p, c })
}

console.log('')
console.log('══ COSECHA DE GOOGLE PLACES ' + '═'.repeat(42))
console.log(`Playas con AEMET   ${playas.length}`)
console.log(`Consultas/playa    ${CONSULTAS.length} (restaurantes 3 km · hoteles 5 km)`)
console.log(`Ya en el sidecar   ${Object.keys(out).length}`)
console.log(`Llamadas pendientes ${pendientes.length}`)
console.log(`Tope duro          ${MAX}`)
console.log(`Tramo gratuito Pro 5.000/mes · coste esperado 0 €`)
console.log('═'.repeat(70))

if (pendientes.length > MAX) {
  console.error(`\nLas pendientes (${pendientes.length}) superan el tope (${MAX}).`)
  console.error('Sube --max-llamadas a conciencia o parte la cosecha en dos meses.')
  process.exit(1)
}

if (!EJECUTAR) {
  console.log('\nSIMULACIÓN. No se ha llamado a Google.')
  console.log('Para cosechar de verdad:')
  console.log('  export $(grep -E "^GOOGLE_PLACES_API_KEY=" .env.local | xargs)')
  console.log('  node scripts/harvest-places-sidecar.mjs --ejecutar')
  process.exit(0)
}

if (!API_KEY) {
  console.error('\nFalta GOOGLE_PLACES_API_KEY en el entorno.')
  console.error('Vive SOLO en .env.local de este Mac: se retiró de Vercel tras el incidente.')
  process.exit(1)
}

// ── Cosecha ─────────────────────────────────────────────────────────────
let llamadas = 0, conDatos = 0, vacias = 0, errores = 0

async function pedir({ p, c }) {
  if (llamadas >= MAX) return false
  llamadas++
  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // La key está restringida por referrer al dominio; server-side no
        // hay referer, así que lo mandamos nosotros. Igual que el runtime.
        'Referer': 'https://www.playas-espana.com/',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.rating,places.userRatingCount,places.priceLevel,places.primaryType,places.location',
      },
      body: JSON.stringify({
        includedTypes: c.tipos,
        maxResultCount: c.max,
        rankPreference: 'POPULARITY',
        locationRestriction: { circle: { center: { latitude: p.lat, longitude: p.lng }, radius: c.radio } },
      }),
    })
    if (!res.ok) {
      errores++
      if (errores <= 3) console.error(`  error ${res.status} en ${p.slug}/${c.clave}`)
      // 4xx repetidos suelen ser key o cuota: no seguir quemando llamadas.
      if (res.status === 403 || res.status === 429) { console.error('  parando: Google rechaza las llamadas.'); return false }
      return true
    }
    const d = await res.json()
    const lista = Array.isArray(d.places) ? d.places : []
    // Guardamos también el array vacío: marca "ya consultado", y así una
    // reanudación no vuelve a pagar por una zona sin resultados.
    out[clave(c.clave, p)] = lista
      .filter(x => x.id && x.displayName?.text)
      .map(x => ({
        googleId: x.id,
        nombre: x.displayName.text,
        rating: typeof x.rating === 'number' ? Math.round(x.rating * 10) / 10 : 0,
        reseñas: x.userRatingCount ?? 0,
        precio: PRECIO[x.priceLevel] ?? '€€',
        tipo: TIPO[x.primaryType] ?? TIPO[c.tipos[0]] ?? 'Restaurante',
        lat: x.location?.latitude ?? p.lat,
        lon: x.location?.longitude ?? p.lng,
      }))
    if (out[clave(c.clave, p)].length) conDatos++; else vacias++
  } catch (e) {
    errores++
    if (errores <= 3) console.error(`  fallo de red en ${p.slug}/${c.clave}`)
  }
  return true
}

console.log(`\nCosechando ${pendientes.length} llamadas…`)
for (let i = 0; i < pendientes.length; i++) {
  const seguir = await pedir(pendientes[i])
  if (!seguir) break
  if ((i + 1) % 100 === 0) {
    writeFileSync(OUT, JSON.stringify(out))
    console.log(`  ${i + 1}/${pendientes.length} · con datos ${conDatos} · vacías ${vacias} · errores ${errores}`)
  }
}
writeFileSync(OUT, JSON.stringify(out))

console.log('')
console.log('══ RESULTADO ' + '═'.repeat(57))
console.log(`Llamadas hechas    ${llamadas} (tope ${MAX})`)
console.log(`Zonas con datos    ${conDatos}`)
console.log(`Zonas vacías       ${vacias}`)
console.log(`Errores            ${errores}`)
console.log(`Sidecar            ${Object.keys(out).length} claves → src/data/gplaces-sidecar.json`)
console.log('')
console.log('Estos datos ya están pagados y no caducan. Commitea el sidecar.')
