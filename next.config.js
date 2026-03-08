/** @type {import('next').NextConfig} */
const nextConfig = {
  // Genera HTML estático para todas las fichas de playa en build time
  // Revalida cada hora para datos de meteo frescos
  experimental: {
    ppr: false,
  },

  images: {
    // Dominios permitidos para imágenes de playas
    remotePatterns: [
      { protocol: 'https', hostname: 'opendata.esri.es' },
      { protocol: 'https', hostname: '**.arcgis.com' },
    ],
    // Formatos modernos para mejor Core Web Vitals
    formats: ['image/avif', 'image/webp'],
  },

  // Headers de caché por tipo de ruta
  async headers() {
    return [
      {
        // Fichas de playa: caché 1h en cliente, revalida en background
        source: '/playas/:slug',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        // API meteo: caché 3h
        source: '/api/meteo/:id',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=10800, stale-while-revalidate=21600' },
        ],
      },
      {
        // API restaurantes: caché 24h
        source: '/api/restaurantes',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=86400, stale-while-revalidate=172800' },
        ],
      },
    ]
  },

  // Redirects SEO: versiones sin acento o mal escritas
  async redirects() {
    return [
      { source: '/playa/:slug', destination: '/playas/:slug', permanent: true },
      { source: '/beach/:slug', destination: '/playas/:slug', permanent: true },
    ]
  },
}

module.exports = nextConfig
