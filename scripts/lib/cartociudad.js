// cartociudad.js
// Reverse geocoder usando el servicio público CartoCiudad (IGN España).
// Sin API key, rate-limited internamente, con caché por coordenadas.
//
// Endpoint:
//   https://www.cartociudad.es/geocoder/api/geocoder/reverseGeocode?lon=X&lat=Y
//
// Respuesta típica (campos que nos interesan):
//   {
//     "type": "...",
//     "address": "...",
//     "muniCode": "11012",     // INE municipio (5 dígitos)
//     "municipality": "Cádiz",
//     "province": "Cádiz",
//     "countryCode": "011",    // INE provincia (los 2 primeros de muniCode)
//     ...
//   }
//
// Uso:
//   const { reverseGeocode, stats } = require('./cartociudad')
//   const data = await reverseGeocode(36.52, -6.28)
//   if (data) console.log(data.municipio, data.provincia)

const https = require('https')

const ENDPOINT = 'https://www.cartociudad.es/geocoder/api/geocoder/reverseGeocode'
const USER_AGENT = 'playas-espana.com/1.0 (+https://playas-espana.com)'

// Parámetros de rate limit y reintentos.
const MIN_INTERVAL_MS = 50       // 20 req/s max
const REQUEST_TIMEOUT_MS = 5000  // 5s por request
const MAX_RETRIES = 1            // 1 reintento en 5xx/timeout

// Caché por coordenadas redondeadas (~11 m → 0.0001°).
const cache = new Map()
function cacheKey(lat, lng) {
  return `${Math.round(lat * 10000)},${Math.round(lng * 10000)}`
}

// Estado compartido para rate limit + stats.
let _lastCall = 0
const _stats = {
  calls: 0, cacheHits: 0, success: 0, empty: 0, failed: 0, rateLimited: 0,
  consecutiveFailures: 0,
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
    }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        return httpGet(r.headers.location).then(resolve).catch(reject)
      }
      let body = ''
      r.on('data', c => body += c)
      r.on('end', () => resolve({ status: r.statusCode, body }))
    })
    req.on('error', reject)
    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy()
      reject(new Error('timeout'))
    })
  })
}

/**
 * Convierte la respuesta de CartoCiudad al shape que usamos internamente.
 * Devuelve `null` si faltan datos esenciales (municipio o provincia).
 */
function normalize(raw) {
  if (!raw || typeof raw !== 'object') return null

  const municipio = (raw.municipality ?? raw.muni ?? raw.municipio ?? '').trim()
  const provincia = (raw.province ?? raw.provincia ?? raw.prov ?? '').trim()

  if (!municipio || !provincia) return null

  // INE municipio: 5 dígitos. A veces viene como `muniCode` o `munCode`.
  const ineMuni = String(raw.muniCode ?? raw.munCode ?? raw.ineMunicipio ?? '').trim() || null

  return {
    municipio,
    provincia,
    ine_municipio: ineMuni,
    // Nota: CartoCiudad a veces no trae comunidad. El caller puede
    // derivarla con su propio mapeo provincia → comunidad.
    comunidad: (raw.autonomousCommunity ?? raw.comunidad ?? '').trim() || null,
  }
}

/**
 * Reverse geocode lat/lng → { municipio, provincia, ine_municipio, comunidad }.
 * Respeta rate limit y caché. Devuelve null en cualquier error o miss.
 */
async function reverseGeocode(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  if (!isFinite(lat) || !isFinite(lng)) return null

  const key = cacheKey(lat, lng)
  if (cache.has(key)) {
    _stats.cacheHits++
    return cache.get(key)
  }

  // Rate limit: asegurar MIN_INTERVAL_MS entre llamadas consecutivas.
  const now = Date.now()
  const wait = _lastCall + MIN_INTERVAL_MS - now
  if (wait > 0) await sleep(wait)
  _lastCall = Date.now()

  const url = `${ENDPOINT}?lon=${lng}&lat=${lat}`
  let lastError = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      _stats.calls++
      const { status, body } = await httpGet(url)

      if (status === 429) {
        _stats.rateLimited++
        // Backoff exponencial en 429: 2s, 4s, 8s
        await sleep(2000 * Math.pow(2, attempt))
        continue
      }
      if (status >= 500 && status < 600) {
        lastError = new Error(`HTTP ${status}`)
        await sleep(500)
        continue
      }
      if (status !== 200) {
        lastError = new Error(`HTTP ${status}`)
        break
      }

      let data
      try {
        data = JSON.parse(body)
      } catch {
        lastError = new Error('invalid JSON')
        break
      }

      // La API a veces devuelve un array, a veces un objeto, a veces null.
      const raw = Array.isArray(data) ? data[0] : data
      const parsed = normalize(raw)

      if (!parsed) {
        _stats.empty++
        cache.set(key, null)
        _stats.consecutiveFailures = 0
        return null
      }

      _stats.success++
      _stats.consecutiveFailures = 0
      cache.set(key, parsed)
      return parsed
    } catch (err) {
      lastError = err
      if (err.message === 'timeout') await sleep(500)
    }
  }

  _stats.failed++
  _stats.consecutiveFailures++
  cache.set(key, null)
  return null
}

function stats() {
  return { ..._stats, cacheSize: cache.size }
}

function resetStats() {
  _stats.calls = 0
  _stats.cacheHits = 0
  _stats.success = 0
  _stats.empty = 0
  _stats.failed = 0
  _stats.rateLimited = 0
  _stats.consecutiveFailures = 0
}

module.exports = {
  reverseGeocode,
  stats,
  resetStats,
  // Exportado para los tests
  _normalize: normalize,
  _cache: cache,
}
