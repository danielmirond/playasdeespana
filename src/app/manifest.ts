import type { MetadataRoute } from 'next'

// PWA manifest → Next sirve /manifest.webmanifest y enlaza <link rel="manifest">.
// Hace la web instalable ("Añadir a la pantalla de inicio" / prompt de Chrome).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Playas de España — ¿A qué playa voy hoy?',
    short_name: 'Playas',
    description:
      'Estado del mar en tiempo real de más de 5.000 playas de España: temperatura del agua, oleaje, viento, medusas y calidad del agua. Datos oficiales actualizados cada hora.',
    id: '/',
    start_url: '/?utm_source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f5ecd5',
    theme_color: '#0369a1',
    lang: 'es',
    categories: ['travel', 'weather', 'lifestyle', 'navigation'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Playas cerca de mí', short_name: 'Cerca de mí', url: '/playas-cerca-de-mi?utm_source=pwa' },
      { name: 'Mapa de playas', short_name: 'Mapa', url: '/mapa?utm_source=pwa' },
      { name: 'Banderas Azules', short_name: 'Bandera Azul', url: '/banderas-azules?utm_source=pwa' },
    ],
  }
}
