import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'webratings.eu' },
      { protocol: 'https', hostname: 'commons.wikimedia.org' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 's-maxage=10800, stale-while-revalidate=86400' },
        ],
      },
    ]
  },
  async redirects() {
    return [
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
