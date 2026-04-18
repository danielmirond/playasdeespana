import type { NextConfig } from 'next'
import fs from 'node:fs'
import path from 'node:path'

// Redirects dinámicos generados por scripts/sync-playas-miteco.js:
// slugs OSM viejos → slugs MITECO canónicos (solo playas con Bandera Azul).
// Se cargan una vez al build; si el archivo no existe el array queda vacío.
function loadSlugRedirects(): Array<{ source: string; destination: string; permanent: boolean }> {
  try {
    const file = path.join(process.cwd(), 'public', 'data', 'slug-redirects.json')
    if (!fs.existsSync(file)) return []
    const data: Record<string, string> = JSON.parse(fs.readFileSync(file, 'utf8'))
    const out: Array<{ source: string; destination: string; permanent: boolean }> = []
    for (const [oldSlug, newSlug] of Object.entries(data)) {
      out.push({ source: `/playas/${oldSlug}`, destination: `/playas/${newSlug}`, permanent: true })
      out.push({ source: `/en/beaches/${oldSlug}`, destination: `/en/beaches/${newSlug}`, permanent: true })
    }
    return out
  } catch (e) {
    console.warn('[next.config] Could not load slug-redirects.json:', (e as Error).message)
    return []
  }
}

const nextConfig: NextConfig = {
  // Tree-shake agresivo de librerías grandes
  experimental: {
    optimizePackageImports: ['@phosphor-icons/react'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.wikimedia.org' },
      { protocol: 'https', hostname: '**.staticflickr.com' },
      { protocol: 'https', hostname: 'webratings.eu' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        // Fichas de playa: CDN 1h, browser 5min, stale 24h
        source: '/playas/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/en/beaches/:slug*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400' },
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

export default nextConfig
