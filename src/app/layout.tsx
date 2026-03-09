import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'),
  title: {
    default: 'Playas de España — Estado del mar en tiempo real',
    template: '%s · Playas de España',
  },
  description: 'Temperatura del agua, oleaje, calidad y servicios de las 5.611 playas españolas. Datos AEMET y EEA actualizados cada hora.',
  keywords: ['playas españa', 'estado del mar', 'temperatura agua', 'oleaje', 'calidad agua playa', 'banderas azules'],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Playas de España',
    images: [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  alternates: { canonical: 'https://playas-espana.com' },
  verification: { google: 'vu3fltICpdNm3MPHVSDcB9YJE5gvNnxg4Nm-vUDk50E' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LFHYJE8S16"
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LFHYJE8S16');
          `}
        </Script>
      </body>
    </html>
  )
}