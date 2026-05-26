const fs = require('node:fs')
const path = require('node:path')

// Redirects dinámicos generados por scripts/sync-playas-miteco.js:
// slugs OSM viejos → slugs MITECO canónicos (solo playas con Bandera Azul).
// Se cargan una vez al build; si el archivo no existe el array queda vacío.
function loadSlugRedirects() {
  try {
    const file = path.join(process.cwd(), 'public', 'data', 'slug-redirects.json')
    if (!fs.existsSync(file)) return []
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    const out = []
    for (const [oldSlug, newSlug] of Object.entries(data)) {
      out.push({ source: `/playas/${oldSlug}`, destination: `/playas/${newSlug}`, permanent: true })
      out.push({ source: `/en/beaches/${oldSlug}`, destination: `/en/beaches/${newSlug}`, permanent: true })
    }
    return out
  } catch (e) {
    console.warn('[next.config] Could not load slug-redirects.json:', e.message)
    return []
  }
}

const nextConfig = {
  // Tree-shake agresivo de librerías grandes
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: '**.wikimedia.org' },
      { protocol: 'https', hostname: '**.staticflickr.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'images.openverse.org' },
      { protocol: 'https', hostname: 'webratings.eu' },
    ],
    formats: ['image/avif', 'image/webp'],
    qualities: [70, 75],
  },
  async headers() {
    return [
      {
        // Fichas de playa: browser 10min (era 5min), CDN 1h, stale 7d.
        // El SWR de 7d (era 24h) hace que cualquier visita a una ficha
        // dormida sirva el HTML cacheado instantáneo y revalide en
        // background — TTFB ms en lugar de invocar la lambda.
        source: '/playas/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=600, s-maxage=3600, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/en/beaches/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=600, s-maxage=3600, stale-while-revalidate=604800' },
        ],
      },
      {
        // Comunidad/provincia/municipio: CDN 6h, browser 10min, stale 24h
        source: '/comunidad/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=600, s-maxage=21600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/provincia/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=600, s-maxage=21600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/municipio/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=600, s-maxage=21600, stale-while-revalidate=86400' },
        ],
      },
      {
        // Páginas estáticas: CDN 24h, browser 1h, stale 7d
        source: '/banderas-azules',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/comunidades',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        // API routes: cada una tiene su propio Cache-Control (no pisar)
        source: '/api/meteo/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=21600' },
        ],
      },
      {
        source: '/api/(restaurantes|hoteles|parkings|campings)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=172800' },
        ],
      },
      {
        // Assets estáticos: 1 año (inmutables)
        source: '/data/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      // Páginas /playas/[slug]/que-llevar antiguas (una por playa, thin
      // content) → ficha principal de la playa. Las nuevas guías están
      // en /que-llevar/[tipo] y se enlazan desde la ficha.
      { source: '/playas/:slug/que-llevar', destination: '/playas/:slug', permanent: true },
      { source: '/en/beaches/:slug/que-llevar', destination: '/en/beaches/:slug', permanent: true },

      // Slugs OSM → MITECO canónicos para Bandera Azul (dinámicos, generados
      // por scripts/sync-playas-miteco.js).
      ...loadSlugRedirects(),

      // Provincias con acentos eliminados → slug correcto
      { source: '/provincia/mlaga',     destination: '/provincia/malaga',     permanent: true },
      { source: '/provincia/crdoba',    destination: '/provincia/cordoba',    permanent: true },
      { source: '/provincia/almera',    destination: '/provincia/almeria',    permanent: true },
      { source: '/provincia/castelln',  destination: '/provincia/castellon',  permanent: true },
      { source: '/provincia/cceres',    destination: '/provincia/caceres',    permanent: true },
      { source: '/provincia/len',       destination: '/provincia/leon',       permanent: true },
      { source: '/provincia/vila',      destination: '/provincia/avila',      permanent: true },
      { source: '/provincia/a-corua',   destination: '/provincia/a-coruna',   permanent: true },
      { source: '/provincia/jan',       destination: '/provincia/jaen',       permanent: true },
      { source: '/provincia/cdiz',      destination: '/provincia/cadiz',      permanent: true },
      { source: '/provincia/lava',      destination: '/provincia/alava',      permanent: true },

      // Comunidades con acentos eliminados → slug correcto
      { source: '/comunidad/andaluca',          destination: '/comunidad/andalucia',          permanent: true },
      { source: '/comunidad/catalua',           destination: '/comunidad/cataluna',           permanent: true },
      { source: '/comunidad/castilla-y-len',    destination: '/comunidad/castilla-y-leon',    permanent: true },
      { source: '/comunidad/aragn',             destination: '/comunidad/aragon',             permanent: true },
      { source: '/comunidad/pas-vasco',         destination: '/comunidad/pais-vasco',         permanent: true },

      // Versión EN
      { source: '/en/provinces/mlaga',     destination: '/en/provinces/malaga',     permanent: true },
      { source: '/en/provinces/crdoba',    destination: '/en/provinces/cordoba',    permanent: true },
      { source: '/en/provinces/almera',    destination: '/en/provinces/almeria',    permanent: true },
      { source: '/en/provinces/castelln',  destination: '/en/provinces/castellon',  permanent: true },
      { source: '/en/provinces/cceres',    destination: '/en/provinces/caceres',    permanent: true },
      { source: '/en/provinces/len',       destination: '/en/provinces/leon',       permanent: true },
      { source: '/en/provinces/vila',      destination: '/en/provinces/avila',      permanent: true },
      { source: '/en/provinces/a-corua',   destination: '/en/provinces/a-coruna',   permanent: true },
      { source: '/en/communities/andaluca',       destination: '/en/communities/andalucia',       permanent: true },
      { source: '/en/communities/catalua',        destination: '/en/communities/cataluna',        permanent: true },
      { source: '/en/communities/castilla-y-len', destination: '/en/communities/castilla-y-leon', permanent: true },
    ]
  },
}

module.exports = nextConfig
