// scripts/fix-comunidades.js
const fs   = require('fs')
const path = require('path')
const FILE = path.join(__dirname, '../public/data/playas.json')

const PROVINCIA_COMUNIDAD = {
  // Valenciana
  'València/Valencia':       'C. Valenciana',
  'Castelló/Castellón':      'C. Valenciana',
  'Alacant/Alicante':        'C. Valenciana',
  'Valencia':                'C. Valenciana',
  'Castellón':               'C. Valenciana',
  'Alicante':                'C. Valenciana',
  // País Vasco
  'Gipuzkoa/Guipúzcoa':      'País Vasco',
  'Bizkaia/Vizcaya':         'País Vasco',
  'Araba/Álava':             'País Vasco',
  'Guipúzcoa':               'País Vasco',
  'Vizcaya':                 'País Vasco',
  // Canarias
  'Santa Cruz De Tenerife':  'Canarias',
  'Las Palmas':              'Canarias',
  // Baleares
  'Illes Balears':           'Baleares',
  // Cataluña
  'Barcelona':               'Cataluña',
  'Girona':                  'Cataluña',
  'Tarragona':               'Cataluña',
  'Lleida':                  'Cataluña',
  // Andalucía
  'Cádiz':                   'Andalucía',
  'Huelva':                  'Andalucía',
  'Málaga':                  'Andalucía',
  'Granada':                 'Andalucía',
  'Almería':                 'Andalucía',
  'Sevilla':                 'Andalucía',
  'Córdoba':                 'Andalucía',
  'Jaén':                    'Andalucía',
  // Murcia
  'Murcia':                  'Murcia',
  // Galicia
  'A Coruña':                'Galicia',
  'Lugo':                    'Galicia',
  'Pontevedra':              'Galicia',
  'Ourense':                 'Galicia',
  // Asturias
  'Asturias':                'Asturias',
  // Cantabria
  'Cantabria':               'Cantabria',
  // País Vasco extra
  'Álava':                   'País Vasco',
  // Navarra
  'Navarra':                 'Navarra',
  // Aragón
  'Huesca':                  'Aragón',
  'Zaragoza':                'Aragón',
  'Teruel':                  'Aragón',
  // Extremadura
  'Badajoz':                 'Extremadura',
  'Cáceres':                 'Extremadura',
  // Castilla y León
  'Burgos':                  'Castilla y León',
  'León':                    'Castilla y León',
  'Salamanca':               'Castilla y León',
  'Valladolid':              'Castilla y León',
  'Zamora':                  'Castilla y León',
  'Soria':                   'Castilla y León',
  'Segovia':                 'Castilla y León',
  'Ávila':                   'Castilla y León',
  'Palencia':                'Castilla y León',
  // Castilla-La Mancha
  'Toledo':                  'Castilla-La Mancha',
  'Cuenca':                  'Castilla-La Mancha',
  'Albacete':                'Castilla-La Mancha',
  'Ciudad Real':             'Castilla-La Mancha',
  'Guadalajara':             'Castilla-La Mancha',
  // Madrid
  'Madrid':                  'Madrid',
  // La Rioja
  'La Rioja':                'La Rioja',
  // Ceuta/Melilla
  'Ceuta':                   'Ceuta',
  'Melilla':                 'Melilla',
}

const playas  = JSON.parse(fs.readFileSync(FILE, 'utf8'))
let fixed = 0

const updated = playas.map(p => {
  if (p.comunidad === 'Sin comunidad' || p.comunidad === 'Desconocida') {
    const comunidad = PROVINCIA_COMUNIDAD[p.provincia]
    if (comunidad) {
      fixed++
      return { ...p, comunidad }
    }
  }
  return p
})

fs.writeFileSync(FILE, JSON.stringify(updated, null, 2))

const restantes = updated.filter(p => p.comunidad === 'Sin comunidad' || p.comunidad === 'Desconocida').length
console.log(`✓ Arregladas: ${fixed} | Restantes sin comunidad: ${restantes}`)
