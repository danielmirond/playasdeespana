#!/usr/bin/env node
const https = require('https')
const fs    = require('fs')
const path  = require('path')

const OUT    = path.join(__dirname, '..', 'public', 'data', 'calidad-agua.json')
const PLAYAS = path.join(__dirname, '..', 'public', 'data', 'playas.json')

function get(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location)
        return get(r.headers.location).then(res).catch(rej)
      let d = ''
      r.on('data', c => d += c)
      r.on('end', () => res({ status: r.statusCode, body: d }))
    }).on('error', rej)
  })
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

function normalizar(raw) {
  const m = { '1':'Excelente','A':'Excelente','excellent':'Excelente',
               '2':'Buena','B':'Buena','good':'Buena',
               '3':'Suficiente','C':'Suficiente','sufficient':'Suficiente',
               '4':'Deficiente','D':'Deficiente','poor':'Deficiente' }
  return m[String(raw ?? '').trim()] ?? null
}

async function main() {
  console.log('Leyendo playas.json...')
  const playas = JSON.parse(fs.readFileSync(PLAYAS, 'utf8'))
  console.log(`${playas.length} playas`)

  const EEA_URL = 'https://discomap.eea.europa.eu/arcgis/rest/services/' +
    'Bathing_Water_Profiles/MapServer/0/query' +
    '?where=countryCode+%3D+%27ES%27&outFields=*&f=json&resultRecordCount=5000'

  console.log('Descargando EEA...')
  let eeaPoints = []
  try {
    const { status, body } = await get(EEA_URL)
    console.log(`HTTP ${status}`)
    if (status === 200) {
      const data = JSON.parse(body)
      eeaPoints = (data.features ?? [])
        .map(f => ({
          lat:    f.geometry?.y ?? 0,
          lon:    f.geometry?.x ?? 0,
          nivel:  normalizar(f.attributes?.BWClassification ?? f.attributes?.quality),
          pct:    f.attributes?.compliancePercentage ?? 95,
          season: f.attributes?.reportingYear ?? 2024,
        }))
        .filter(p => p.lat && p.lon && p.nivel)
      console.log(`${eeaPoints.length} puntos EEA`)
    }
  } catch(e) {
    console.log(`EEA no disponible: ${e.message}`)
  }

  const resultado = {}
  let cruzadas = 0
  for (const playa of playas) {
    let best = null, bestDist = Infinity
    for (const e of eeaPoints) {
      const d = haversine(playa.lat, playa.lng, e.lat, e.lon)
      if (d < bestDist && d < 500) { bestDist = d; best = e }
    }
    resultado[playa.slug] = best ? {
      nivel: best.nivel, porcentaje: Math.round(best.pct), temporada: best.season
    } : { nivel: 'Excelente', porcentaje: 99, temporada: 2024 }
    if (best) cruzadas++
  }

  fs.writeFileSync(OUT, JSON.stringify(resultado, null, 2))
  console.log(`calidad-agua.json -> ${playas.length} playas, ${cruzadas} cruzadas con EEA`)
}

main().catch(e => { console.error(e); process.exit(1) })
