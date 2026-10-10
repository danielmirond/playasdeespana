// src/app/(en)/layout.tsx — root layout del inglés.
//
// Hasta ahora /en heredaba el layout castellano entero: lang="es", el pie
// en castellano con su aviso de afiliación, el WebSite schema diciendo
// inLanguage es-ES y un buscador apuntando a /buscar. Todo eso se arregla
// aquí y en RootShell.
//
// OJO CON EL CANONICAL. El layout castellano declara
// `alternates: { canonical: 'https://playas-espana.com' }`. Si se copiara
// aquí, cualquier página inglesa que no declare el suyo se
// autocanonicalizaría a la portada en español. Por eso NO está.
import type { Metadata, Viewport } from 'next'
import RootShell from '@/components/layout/RootShell'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: 'Beaches of Spain — Real-time sea conditions',
    template: '%s · Beaches of Spain',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    alternateLocale: ['es_ES'],
    siteName: 'Beaches of Spain',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@playasespana',
    creator: '@playasespana',
  },
  robots: {
    index: true, follow: true,
    'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1,
    googleBot: {
      index: true, follow: true,
      'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1,
    },
  },
  alternates: {
    languages: { es: BASE, en: `${BASE}/en`, 'x-default': BASE },
  },
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'Beaches', statusBarStyle: 'default' },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#1f6f8b',
  viewportFit: 'cover',
}

export default function LayoutEn({ children }: { children: React.ReactNode }) {
  return <RootShell locale="en">{children}</RootShell>
}
