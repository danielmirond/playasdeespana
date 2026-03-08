// scripts/fill-municipios.js
// Rellena municipio vacío usando Google Geocoding API
// Uso: node scripts/fill-municipios.js

const fs    = require('fs')
const path  = require('path')

const KEY   = process.env.GOOGLE_PLACES_KEY || 'AIzaSyCZIlwwJKY6q0mpXLE0UYZ0nSsByi7uWpk'
const FILE  = path.join(__dirname, '../public/data/playas.json')
const BATCH = 50   // paralelas por tanda
const DELAY = 200  // ms entre tandas

async function reverseGeocode(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=es&result_type=locality|administrative_area_level_3&key=${KEY}`
  const res  = await fetch(url)
  const data = await res.json()
  if (data.status !== 'OK' || !data.results.length) return ''

  // Busca locality primero, luego administrative_area_level_3, luego level_2
  for (const type of ['locality', 'administrative_area_level_3', 'administrative_area_level_2']) {
    const r = data.results.find(r => r.types.includes(type))
    if (r) {
      const comp = r.address_components.find(c =>
        c.types.includes('locality') ||
        c.types.includes('administrative_area_level_3') ||
        c.types.includes('administrative_area_level_2')
      )
      if (comp) return comp.long_name
    }
  }
  // Fallback: primer resultado, componente más específico
  const comps = data.results[0].address_components
  const local = comps.find(c => c.types.includes('locality'))
  const muni  = comps.find(c => c.types.includes('administrative_area_level_3'))
  return (local || muni)?.long_name ?? ''
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const playas = JSON.parse(fs.readFileSync(FILE, 'utf8'))
  const pending = playas.filter(p => !p.municipio)
  console.log(`Total playas: ${playas.length} | Sin municipio: ${pending.length}`)

  let done = 0, errors = 0

  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH)
    await Promise.all(batch.map(async p => {
      try {
        const mun = await reverseGeocode(p.lat, p.lng)
        p.municipio = mun
        done++
      } catch (e) {
        errors++
      }
    }))

    const pct = Math.round((i + batch.length) / pending.length * 100)
    process.stdout.write(`\r${i + batch.length}/${pending.length} (${pct}%) · errores: ${errors}`)
    if (i + BATCH < pending.length) await sleep(DELAY)
  }

  // Actualizar playas originales
  const map = new Map(pending.map(p => [p.slug, p.municipio]))
  const updated = playas.map(p => map.has(p.slug) ? { ...p, municipio: map.get(p.slug) } : p)

  fs.writeFileSync(FILE, JSON.stringify(updated, null, 2))
  console.log(`\n✓ Guardado. Rellenados: ${done} | Errores: ${errors}`)

  // Stats finales
  const sinMun = updated.filter(p => !p.municipio).length
  console.log(`Sin municipio restantes: ${sinMun}`)
}

main().catch(console.error)
