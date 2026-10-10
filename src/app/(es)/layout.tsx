// src/app/(es)/layout.tsx — root layout del castellano.
//
// El grupo (es) no aparece en ninguna URL: /playas/x sigue siendo /playas/x.
// Existe para que el inglés pueda tener su propio <html lang> y su propio
// pie, cosa imposible mientras hubiera un solo layout raíz.
//
// Aquí solo va lo que cambia con el idioma. El documento entero está en
// RootShell y se comparte: lo que se duplique aquí divergirá.
import type { Metadata, Viewport } from 'next'
import RootShell from '@/components/layout/RootShell'
import { TOTAL_PUBLICADAS_TXT } from '@/lib/playas'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'),
  title: {
    default: 'Playas de España. Estado del mar en tiempo real',
    template: '%s · Playas de España',
  },
  description: `Temperatura del agua, oleaje, calidad y servicios de ${TOTAL_PUBLICADAS_TXT} playas españolas. El oleaje y el viento, cada hora.`,
  keywords: ['playas españa', 'estado del mar', 'temperatura agua', 'oleaje', 'calidad agua playa', 'banderas azules'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    alternateLocale: ['en_GB'],
    siteName: 'Playas de España',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@playasespana',
    creator: '@playasespana',
  },
  // Discover/SERP: max-image-preview:large es REQUISITO para que Google
  // muestre imagen grande (sin esto no hay miniatura grande en Discover).
  robots: {
    index: true, follow: true,
    'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1,
    googleBot: {
      index: true, follow: true,
      'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1,
    },
  },
  alternates: { canonical: 'https://playas-espana.com' },
  // PWA: instalable ("Añadir a la pantalla de inicio" / prompt de Chrome).
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Playas', statusBarStyle: 'default' },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },        // navegadores modernos (nítido)
      { url: '/favicon.ico', sizes: 'any' },              // fallback: la "P" en .ico (16/32/48)
    ],
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'vu3fltICpdNm3MPHVSDcB9YJE5gvNnxg4Nm-vUDk50E',
    // Bing, Yandex y Seznam: sustituye XXXXXX por el código de cada dashboard
    other: {
      'msvalidate.01': process.env.BING_VERIFY ?? '',
      'yandex-verification': process.env.YANDEX_VERIFY ?? '',
      'seznam-wmt': process.env.SEZNAM_VERIFY ?? '',
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#1f6f8b',
  // PWA / iOS instalado: expone env(safe-area-inset-*) para que las barras
  // fijas (p.ej. la barra inferior de la ficha) respeten notch y home indicator.
  viewportFit: 'cover',
}

export default function LayoutEs({ children }: { children: React.ReactNode }) {
  return <RootShell locale="es">{children}</RootShell>
}
