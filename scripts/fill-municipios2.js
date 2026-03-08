// scripts/fill-municipios2.js
// Segundo pase — sin filtro result_type, acepta cualquier nivel administrativo
const fs   = require('fs')
const path = require('path')

const KEY  = process.env.GOOGLE_PLACES_KEY || 'AIzaSyCZIlwwJKY6q0mpXLE0UYZ0nSsByi7uWpk'
const FILE = path.join(__dirname, '../public/data/playas.json')
const BATCH = 50
const DELAY = 200

async function reverseGeocode2(lat, lng) {
  // Sin result_type — acepta cualquier resultado
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=es&key=${KEY}`
  const res  = await fetch(url)
  const data = await res.json()
  if (data.status !== 'OK' || !data.results.length) return ''

  const priority = [
    'locality',
    'administrative_area_level_3',
    'administrative_area_level_4',
    'sublocality',
    'administrative_area_level_2',
    'natural_feature',
    'neighborhood',
  ]

  for (const result of data.results) {
    for (const type of priority) {
      const comp = result.address_components.find(c => c.types.includes(type))
      if (comp) return comp.long_name
    }
  }
  return ''
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const playas  = JSON.parse(fs.readFileSync(FILE, 'utf8'))
  const pending = playas.filter(p => !p.municipio)
  console.log(`Sin municipio: ${pending.length}`)

  let done = 0, errors = 0

  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH)
    await Promise.all(batch.map(async p => {
      try {
        const mun = await reverseGeocode2(p.lat, p.lng)
        p.municipio = mun
        if (mun) done++
      } catch { errors++ }
    }))
    const pct = Math.round((i + batch.length) / pending.length * 100)
    process.stdout.write(`\r${i + batch.length}/${pending.length} (${pct}%) rellenados:${done} errores:${errors}`)
    if (i + BATCH < pending.length) await sleep(DELAY)
  }

  const map     = new Map(pending.map(p => [p.slug, p.municipio]))
  const updated = playas.map(p => map.has(p.slug) ? { ...p, municipio: map.get(p.slug) } : p)
  fs.writeFileSync(FILE, JSON.stringify(updated, null, 2))

  const restantes = updated.filter(p => !p.municipio).length
  console.log(`\n✓ Rellenados: ${done} | Errores: ${errors} | Restantes: ${restantes}`)
}

main().catch(console.error)
