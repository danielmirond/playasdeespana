// scripts/fix-desconocidas.js
// Rellena provincia y comunidad para playas con provincia "Desconocida"
const fs   = require('fs')
const path = require('path')

const KEY  = process.env.GOOGLE_PLACES_KEY || 'AIzaSyCZIlwwJKY6q0mpXLE0UYZ0nSsByi7uWpk'
const FILE = path.join(__dirname, '../public/data/playas.json')
const BATCH = 50
const DELAY = 200

const PROVINCIA_COMUNIDAD = {
  'València/Valencia': 'C. Valenciana', 'Castelló/Castellón': 'C. Valenciana', 'Alacant/Alicante': 'C. Valenciana',
  'Valencia': 'C. Valenciana', 'Castellón': 'C. Valenciana', 'Alicante': 'C. Valenciana',
  'Gipuzkoa/Guipúzcoa': 'País Vasco', 'Bizkaia/Vizcaya': 'País Vasco', 'Araba/Álava': 'País Vasco',
  'Guipúzcoa': 'País Vasco', 'Vizcaya': 'País Vasco', 'Álava': 'País Vasco',
  'Santa Cruz de Tenerife': 'Canarias', 'Las Palmas': 'Canarias',
  'Illes Balears': 'Baleares', 'Islas Baleares': 'Baleares',
  'Barcelona': 'Cataluña', 'Girona': 'Cataluña', 'Tarragona': 'Cataluña', 'Lleida': 'Cataluña',
  'Cádiz': 'Andalucía', 'Huelva': 'Andalucía', 'Málaga': 'Andalucía', 'Granada': 'Andalucía',
  'Almería': 'Andalucía', 'Sevilla': 'Andalucía', 'Córdoba': 'Andalucía', 'Jaén': 'Andalucía',
  'Murcia': 'Murcia', 'Región de Murcia': 'Murcia',
  'A Coruña': 'Galicia', 'Lugo': 'Galicia', 'Pontevedra': 'Galicia', 'Ourense': 'Galicia',
  'Asturias': 'Asturias', 'Cantabria': 'Cantabria', 'Navarra': 'Navarra',
  'Huesca': 'Aragón', 'Zaragoza': 'Aragón', 'Teruel': 'Aragón',
  'Badajoz': 'Extremadura', 'Cáceres': 'Extremadura',
  'Burgos': 'Castilla y León', 'León': 'Castilla y León', 'Salamanca': 'Castilla y León',
  'Valladolid': 'Castilla y León', 'Zamora': 'Castilla y León', 'Soria': 'Castilla y León',
  'Segovia': 'Castilla y León', 'Ávila': 'Castilla y León', 'Palencia': 'Castilla y León',
  'Toledo': 'Castilla-La Mancha', 'Cuenca': 'Castilla-La Mancha', 'Albacete': 'Castilla-La Mancha',
  'Ciudad Real': 'Castilla-La Mancha', 'Guadalajara': 'Castilla-La Mancha',
  'Madrid': 'Madrid', 'La Rioja': 'La Rioja', 'Ceuta': 'Ceuta', 'Melilla': 'Melilla',
}

async function reverseGeocode(lat, lng) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=es&key=${KEY}`
  const res  = await fetch(url)
  const data = await res.json()
  if (data.status !== 'OK' || !data.results.length) return { provincia: '', comunidad: '' }

  let provincia = '', comunidad = ''
  for (const result of data.results) {
    for (const comp of result.address_components) {
      if (comp.types.includes('administrative_area_level_2') && !provincia) {
        provincia = comp.long_name
      }
      if (comp.types.includes('administrative_area_level_1') && !comunidad) {
        comunidad = comp.long_name
      }
    }
    if (provincia) break
  }

  // Normalizar comunidad
  const comunidadNorm = PROVINCIA_COMUNIDAD[provincia] || normalizarComunidad(comunidad)
  return { provincia, comunidad: comunidadNorm }
}

function normalizarComunidad(nombre) {
  const map = {
    'Cataluña': 'Cataluña', 'Catalonia': 'Cataluña',
    'Andalucía': 'Andalucía', 'Andalusia': 'Andalucía',
    'Comunidad Valenciana': 'C. Valenciana', 'Valencian Community': 'C. Valenciana',
    'País Vasco': 'País Vasco', 'Basque Country': 'País Vasco',
    'Galicia': 'Galicia', 'Asturias': 'Asturias', 'Cantabria': 'Cantabria',
    'Murcia': 'Murcia', 'Región de Murcia': 'Murcia',
    'Islas Baleares': 'Baleares', 'Balearic Islands': 'Baleares',
    'Islas Canarias': 'Canarias', 'Canary Islands': 'Canarias', 'Canarias': 'Canarias',
    'Navarra': 'Navarra', 'Aragón': 'Aragón', 'Aragon': 'Aragón',
    'Extremadura': 'Extremadura', 'Madrid': 'Madrid', 'La Rioja': 'La Rioja',
    'Castilla y León': 'Castilla y León', 'Castile and León': 'Castilla y León',
    'Castilla-La Mancha': 'Castilla-La Mancha', 'Ceuta': 'Ceuta', 'Melilla': 'Melilla',
  }
  return map[nombre] || nombre
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const playas  = JSON.parse(fs.readFileSync(FILE, 'utf8'))
  const pending = playas.filter(p => p.provincia === 'Desconocida' || p.comunidad === 'Sin comunidad')
  console.log(`Pendientes: ${pending.length}`)

  let done = 0, errors = 0

  for (let i = 0; i < pending.length; i += BATCH) {
    const batch = pending.slice(i, i + BATCH)
    await Promise.all(batch.map(async p => {
      try {
        const { provincia, comunidad } = await reverseGeocode(p.lat, p.lng)
        if (provincia) p.provincia = provincia
        if (comunidad) p.comunidad = comunidad
        done++
      } catch { errors++ }
    }))
    const pct = Math.round((i + batch.length) / pending.length * 100)
    process.stdout.write(`\r${i + batch.length}/${pending.length} (${pct}%) done:${done} err:${errors}`)
    if (i + BATCH < pending.length) await sleep(DELAY)
  }

  const map     = new Map(pending.map(p => [p.slug, { provincia: p.provincia, comunidad: p.comunidad }]))
  const updated = playas.map(p => map.has(p.slug) ? { ...p, ...map.get(p.slug) } : p)
  fs.writeFileSync(FILE, JSON.stringify(updated, null, 2))

  const restantes = updated.filter(p => p.comunidad === 'Sin comunidad').length
  console.log(`\n✓ Procesadas: ${done} | Errores: ${errors} | Sin comunidad restantes: ${restantes}`)
}

main().catch(console.error)
