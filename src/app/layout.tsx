import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import Script from 'next/script'
import CookieBanner from '@/components/ui/CookieBanner'
import NavigationProgress from '@/components/ui/NavigationProgress'
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
  description: 'Temperatura del agua, oleaje, calidad y servicios de las 5.611 playas españolas. Datos Open-Meteo y EEA actualizados cada hora.',
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

// Critical CSS inline — renderiza antes del paint inicial
const CRITICAL_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#f0e6d0;--bg2:#e8dcc4;--ink:#2a1a08;--muted:#5a3d12;--accent:#6b400a;--accent2:#e8a030;--line:rgba(90,60,18,.32);--line-strong:#8a6a38;--card-bg:rgba(255,255,255,.5);--metric-bg:rgba(255,255,255,.55);--ring:#c4904a;--calma:#22c55e;--buena:#3b82f6;--aviso:#f59e0b;--peligro:#ef4444;--surf:#0ea5e9;--viento:#eab308;--font-serif:var(--font-playfair,Georgia,serif);--font-sans:var(--font-dm-sans,system-ui,sans-serif);--r-sm:8px;--r-md:14px;--r-lg:20px;--r-xl:28px}
html{font-size:16px;scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:var(--font-sans);-webkit-font-smoothing:antialiased;overflow-x:hidden;min-height:100vh;text-rendering:optimizeLegibility}
a{text-decoration:none;color:inherit}
button{cursor:pointer;font-family:inherit;border:none;background:none}
button:disabled{cursor:not-allowed;opacity:.55;filter:grayscale(.35)}
img{max-width:100%;height:auto;display:block}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px;border-radius:4px;box-shadow:0 0 0 5px rgba(107,64,10,.18)}
a:hover,a:focus-visible{text-decoration:underline;text-decoration-thickness:1.5px;text-underline-offset:3px}
header a:hover,nav a:hover{text-decoration:none}
p{line-height:1.65}
h1,h2,h3,h4,h5,h6{scroll-margin-top:80px;line-height:1.25}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}}
@media (prefers-contrast: more){:root{--muted:#3d2808;--accent:#4a2c05;--line:rgba(60,38,10,.55);--line-strong:#3d2808}a,button{text-decoration:underline}}
@media (forced-colors: active){:root{--accent:LinkText;--muted:CanvasText;--line:CanvasText;--line-strong:CanvasText}a{color:LinkText}:focus-visible{outline:3px solid Highlight;box-shadow:none}}
@media print{header,nav,footer,aside,[class*="AdSlot"],[class*="cookieBanner"],[class*="banner"],script{display:none !important}body{background:#fff !important;color:#000 !important}a{color:#000 !important;text-decoration:underline !important}a[href^="http"]::after{content:" (" attr(href) ")";font-size:.85em;color:#555}}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable}`}>
      <head>
        {/* Critical CSS inline — paint inmediato sin esperar CSS externo */}
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />

        {/* Preconnect/DNS prefetch — elimina RTT para APIs externas */}
        <link rel="preconnect" href="https://api.open-meteo.com" />
        <link rel="preconnect" href="https://marine-api.open-meteo.com" />
        <link rel="preconnect" href="https://upload.wikimedia.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://commons.wikimedia.org" />
        <link rel="dns-prefetch" href="https://overpass-api.de" />
        <link rel="dns-prefetch" href="https://www.ign.es" />

        {process.env.NEXT_PUBLIC_ADSENSE_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_ID}`}
            crossOrigin="anonymous"
          />
        )}

        {/* Speculation Rules — prefetch/prerender para navegación instant */}
        <script
          type="speculationrules"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            prefetch: [{
              where: {
                and: [
                  { href_matches: "/*" },
                  { not: { href_matches: "/api/*" } },
                  { not: { href_matches: "/mapa" } },
                  { not: { selector_matches: "[target=_blank]" } },
                ],
              },
              eagerness: "moderate",
            }],
            prerender: [{
              where: {
                or: [
                  { href_matches: "/playas/*" },
                  { href_matches: "/en/beaches/*" },
                  { href_matches: "/comunidad/*" },
                  { href_matches: "/en/communities/*" },
                ],
              },
              eagerness: "moderate",
            }],
          })}}
        />
      </head>
      <body>
        <NavigationProgress />
        {children}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LFHYJE8S16"
          strategy="lazyOnload"
        />
        <Script id="ga4" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LFHYJE8S16');

            // Custom events for product analytics
            document.addEventListener('click', function(e) {
              var el = e.target.closest ? e.target.closest('a,button') : null;
              if (!el) return;
              var href = el.getAttribute('href') || '';

              // Beach click from home/search
              if (href.match(/\\/playas\\//)) {
                gtag('event', 'beach_click', { beach_slug: href.split('/playas/')[1] });
              }
              // Hotel affiliate
              if (href.includes('booking.com') || href.includes('expedia')) {
                gtag('event', 'hotel_click', { provider: href.includes('booking') ? 'booking' : 'expedia' });
              }
              // Activity affiliate
              if (href.includes('civitatis') || href.includes('getyourguide')) {
                gtag('event', 'activity_click', { provider: href.includes('civitatis') ? 'civitatis' : 'gyg' });
              }
              // Restaurant affiliate
              if (href.includes('thefork') || href.includes('eltenedor')) {
                gtag('event', 'restaurant_click');
              }
              // Parking affiliate
              if (href.includes('parclick')) {
                gtag('event', 'parking_click');
              }
              // Route to Google Maps
              if (href.includes('google.com/maps/dir')) {
                gtag('event', 'route_open');
              }
              // Filter click
              if (el.getAttribute('aria-pressed') !== null) {
                gtag('event', 'filter_click', { filter: el.textContent });
              }
            });
          `}
        </Script>
        <CookieBanner />
      </body>
    </html>
  )
}