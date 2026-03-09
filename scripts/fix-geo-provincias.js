// scripts/fix-geo-provincias.js
// Reasigna provincia y comunidad a cada playa según sus coordenadas lat/lng
// usando bounding boxes oficiales de las provincias españolas

const fs   = require('fs')
const path = require('path')

const FILE = path.join(__dirname, '../public/data/playas.json')
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'))

// Bounding boxes: [latMin, latMax, lngMin, lngMax, provincia, comunidad]
// Ordenadas de más específica a más general para evitar solapamientos
const BBOX = [
  // CANARIAS
  [27.6, 29.5, -18.2, -13.3, 'Las Palmas',              'Canarias'],
  [27.6, 28.8, -14.1, -13.3, 'Las Palmas',              'Canarias'],
  [28.0, 29.5, -18.2, -17.7, 'Las Palmas',              'Canarias'],
  [27.6, 28.2, -14.1, -13.7, 'Las Palmas',              'Canarias'],
  [28.4, 29.5, -14.1, -13.3, 'Las Palmas',              'Canarias'],
  [27.9, 28.6, -17.4, -16.8, 'Santa Cruz de Tenerife',  'Canarias'],
  [28.0, 28.6, -16.9, -16.1, 'Santa Cruz de Tenerife',  'Canarias'],
  [28.1, 28.7, -16.2, -15.4, 'Santa Cruz de Tenerife',  'Canarias'],
  [28.6, 29.5, -18.2, -17.8, 'Santa Cruz de Tenerife',  'Canarias'],
  [27.6, 28.1, -17.4, -17.1, 'Santa Cruz de Tenerife',  'Canarias'],
  [28.0, 28.4, -17.1, -16.9, 'Santa Cruz de Tenerife',  'Canarias'],

  // CEUTA Y MELILLA
  [35.8, 35.95, -5.4, -5.2,  'Ceuta',   'Ceuta'],
  [35.2, 35.35, -3.1, -2.9,  'Melilla', 'Melilla'],

  // BALEARES
  [38.6, 40.1, 1.1, 4.4,     'Islas Baleares', 'Baleares'],

  // GALICIA
  [41.8, 43.8, -9.3, -6.7,   'Pontevedra', 'Galicia'],
  [42.5, 44.0, -8.0, -6.7,   'A Coruña',   'Galicia'],
  [42.5, 44.0, -8.0, -6.7,   'Lugo',       'Galicia'],
  [41.8, 42.8, -8.0, -6.7,   'Ourense',    'Galicia'],

  // ASTURIAS
  [43.0, 43.7, -7.1, -4.5,   'Asturias', 'Asturias'],

  // CANTABRIA
  [43.0, 43.55, -4.6, -3.1,  'Cantabria', 'Cantabria'],

  // PAÍS VASCO
  [42.8, 43.5, -3.1, -1.7,   'Gipuzkoa', 'País Vasco'],
  [42.8, 43.5, -3.5, -2.4,   'Bizkaia',  'País Vasco'],
  [42.4, 43.2, -3.3, -2.0,   'Álava',    'País Vasco'],

  // NAVARRA
  [41.9, 43.3, -2.5, -0.7,   'Navarra', 'Navarra'],

  // LA RIOJA
  [41.9, 42.6, -3.1, -1.7,   'La Rioja', 'La Rioja'],

  // ARAGÓN
  [40.0, 42.9, -1.8,  0.8,   'Zaragoza', 'Aragón'],
  [41.8, 43.1, -0.8,  0.8,   'Huesca',   'Aragón'],
  [40.0, 41.3, -1.8,  0.0,   'Teruel',   'Aragón'],

  // CATALUÑA
  [40.5, 42.9,  0.2,  3.4,   'Tarragona', 'Cataluña'],
  [41.0, 42.9,  1.3,  3.4,   'Barcelona', 'Cataluña'],
  [41.5, 42.9,  2.4,  3.4,   'Girona',    'Cataluña'],
  [40.5, 42.9,  0.0,  1.7,   'Lleida',    'Cataluña'],

  // C. VALENCIANA
  [37.8, 40.8, -1.5,  0.5,   'Valencia',   'Comunitat Valenciana'],
  [39.3, 40.8, -0.5,  0.5,   'Castellón',  'Comunitat Valenciana'],
  [37.8, 39.2, -1.2,  0.2,   'Alicante',   'Comunitat Valenciana'],

  // MURCIA
  [37.3, 38.8, -2.3, -0.6,   'Murcia', 'Murcia'],

  // ANDALUCÍA
  [36.0, 38.7, -7.5, -1.6,   'Huelva',   'Andalucía'],
  [36.0, 38.4, -6.4, -4.5,   'Sevilla',  'Andalucía'],
  [36.0, 38.7, -5.5, -3.0,   'Córdoba',  'Andalucía'],
  [36.0, 38.7, -4.5, -2.0,   'Málaga',   'Andalucía'],
  [36.0, 38.7, -3.5, -1.6,   'Granada',  'Andalucía'],
  [36.5, 38.7, -2.5, -1.6,   'Almería',  'Andalucía'],
  [35.8, 37.5, -7.5, -4.5,   'Cádiz',    'Andalucía'],
  [36.5, 38.7, -4.5, -2.5,   'Jaén',     'Andalucía'],

  // EXTREMADURA
  [38.0, 40.5, -7.6, -4.7,   'Badajoz',  'Extremadura'],
  [39.0, 40.5, -6.9, -4.7,   'Cáceres',  'Extremadura'],

  // CASTILLA-LA MANCHA
  [38.0, 41.0, -5.5, -0.9,   'Toledo',      'Castilla-La Mancha'],
  [38.0, 40.5, -4.0, -1.0,   'Ciudad Real', 'Castilla-La Mancha'],
  [38.5, 41.0, -3.5, -1.0,   'Cuenca',      'Castilla-La Mancha'],
  [38.0, 41.0, -5.0, -2.0,   'Albacete',    'Castilla-La Mancha'],
  [40.0, 41.5, -3.5, -1.5,   'Guadalajara', 'Castilla-La Mancha'],

  // CASTILLA Y LEÓN
  [40.5, 43.0, -7.1, -2.0,   'León',       'Castilla y León'],
  [40.5, 43.0, -7.1, -4.5,   'Zamora',     'Castilla y León'],
  [40.5, 43.0, -7.1, -4.5,   'Salamanca',  'Castilla y León'],
  [40.5, 43.0, -5.5, -2.5,   'Valladolid', 'Castilla y León'],
  [40.5, 43.0, -5.5, -2.5,   'Palencia',   'Castilla y León'],
  [41.5, 43.0, -4.5, -2.5,   'Burgos',     'Castilla y León'],
  [40.5, 42.5, -3.5, -1.5,   'Soria',      'Castilla y León'],
  [40.5, 41.5, -5.0, -3.5,   'Ávila',      'Castilla y León'],
  [40.5, 41.5, -4.5, -3.5,   'Segovia',    'Castilla y León'],

  // MADRID
  [39.8, 41.2, -4.6, -3.0,   'Madrid', 'Madrid'],
]

// Función para detectar provincia por coordenadas
function detectarProvincia(lat, lng) {
  // Orden de prioridad: primero las más específicas/pequeñas
  for (const [latMin, latMax, lngMin, lngMax, provincia, comunidad] of BBOX) {
    if (lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax) {
      return { provincia, comunidad }
    }
  }
  return null
}

// Provincias españolas válidas (para detectar las que ya son correctas)
const COMUNIDADES_ES = new Set([
  'Andalucía', 'Aragón', 'Asturias', 'Baleares', 'Canarias', 'Cantabria',
  'Castilla y León', 'Castilla-La Mancha', 'Cataluña', 'Ceuta',
  'Comunitat Valenciana', 'C. Valenciana', 'Extremadura', 'Galicia',
  'La Rioja', 'Madrid', 'Melilla', 'Murcia', 'Navarra', 'País Vasco',
])

let corregidas = 0
let sinDetectar = 0
let extranjeras = 0

const resultado = data.map(p => {
  const esEspanola = COMUNIDADES_ES.has(p.comunidad)

  // Si ya es española y la provincia parece correcta, solo normalizamos variantes
  const NORM_PROV = {
    'Santa Cruz De Tenerife': 'Santa Cruz de Tenerife',
    'Illes Balears':          'Islas Baleares',
    'Alacant/Alicante':       'Alicante',
    'Castelló/Castellón':     'Castellón',
    'València/Valencia':      'Valencia',
    'Gipuzkoa/Guipúzcoa':     'Gipuzkoa',
    'Bizkaia/Vizcaya':        'Bizkaia',
  }
  const NORM_COM = {
    'C. Valenciana': 'Comunitat Valenciana',
  }

  if (NORM_PROV[p.provincia]) {
    p.provincia = NORM_PROV[p.provincia]
    corregidas++
  }
  if (NORM_COM[p.comunidad]) {
    p.comunidad = NORM_COM[p.comunidad]
  }

  // Si NO es española, intentar detectar por coordenadas
  if (!COMUNIDADES_ES.has(p.comunidad)) {
    const detected = detectarProvincia(p.lat, p.lng)
    if (detected) {
      p.provincia = detected.provincia
      p.comunidad = detected.comunidad
      corregidas++
    } else {
      sinDetectar++
    }
  }

  return p
})

// Filtrar las que siguen siendo extranjeras (no detectadas como España)
const final = resultado.filter(p => {
  if (!COMUNIDADES_ES.has(p.comunidad)) {
    extranjeras++
    return false
  }
  return true
})

console.log('Playas originales:   ', data.length)
console.log('Corregidas/norm.:    ', corregidas)
console.log('Sin detectar:        ', sinDetectar)
console.log('Eliminadas extranjer:', extranjeras)
console.log('Playas resultantes:  ', final.length)

// Resumen por comunidad
const porCom = {}
final.forEach(p => {
  if (!porCom[p.comunidad]) porCom[p.comunidad] = 0
  porCom[p.comunidad]++
})
console.log('\nPor comunidad:')
Object.entries(porCom).sort((a,b) => b[1]-a[1]).forEach(([c,n]) => console.log(' ', n, c))

fs.writeFileSync(FILE, JSON.stringify(final, null, 2))
console.log('\n✅ playas.json actualizado')
