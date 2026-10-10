import { TOTAL_PUBLICADAS_TXT } from '@/lib/playas'
import type { MetadataRoute } from 'next'

// PWA manifest → Next sirve /manifest.webmanifest y enlaza <link rel="manifest">.
// Hace la web instalable ("Añadir a la pantalla de inicio" / prompt de Chrome).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Playas de España, ¿A qué playa voy hoy?',
    short_name: 'Playas',
    description:
      `Estado del mar de las ${TOTAL_PUBLICADAS_TXT} playas que publicamos: temperatura del agua, oleaje, viento, medusas y calidad del agua. Oleaje y viento cada hora; inventario y calidad del agua, de fuente oficial.`,
    id: '/',
    start_url: '/?utm_source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#1f6f8b',
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
