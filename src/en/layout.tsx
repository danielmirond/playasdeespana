// src/app/en/layout.tsx
import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'),
  title: {
    default: 'Beaches in Spain — Real-time sea conditions',
    template: '%s · Beaches in Spain',
  },
  description: 'Water temperature, wave height, water quality and facilities for 5,611 Spanish beaches. AEMET and EEA data updated every hour.',
  keywords: ['beaches spain', 'spanish beaches', 'sea conditions spain', 'water temperature spain', 'blue flag beaches spain'],
  openGraph: {
    type:     'website',
    locale:   'en_GB',
    siteName: 'Beaches in Spain',
    images:   [{ url: '/og-default.png', width: 1200, height: 630 }],
  },
  twitter:  { card: 'summary_large_image' },
  robots:   { index: true, follow: true },
  alternates: {
    canonical: 'https://playas-espana.com/en',
    languages: {
      'es': 'https://playas-espana.com',
      'en': 'https://playas-espana.com/en',
    },
  },
}

export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-LFHYJE8S16"
        strategy="afterInteractive"
      />
      <Script id="ga4-en" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-LFHYJE8S16');
        `}
      </Script>
    </>
  )
}
