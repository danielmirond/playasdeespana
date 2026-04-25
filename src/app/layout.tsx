import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, JetBrains_Mono } from 'next/font/google'
import CookieBanner from '@/components/ui/CookieBanner'
import ConsentScripts from '@/components/ui/ConsentScripts'
import NavigationProgress from '@/components/ui/NavigationProgress'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '700', '900'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

// JetBrains Mono. para datos técnicos (coordenadas, metadata, timestamps)
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'),
  title: {
    default: 'Playas de España. Estado del mar en tiempo real',
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

// Critical CSS inline. renderiza antes del paint inicial
// Design system v2 · tokens alineados con Figma export abril 2026
const CRITICAL_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
/* Arena · superficies */
--arena-50:#faf4e6;--arena-100:#f5ecd5;--arena-200:#f0e6d0;--arena-300:#e5d6b4;--arena-400:#d4c090;--arena-500:#b8a06a;
/* Tinta · texto */
--tinta-900:#1a0f04;--tinta-800:#2a1a08;--tinta-700:#3d2a14;--tinta-600:#524030;--tinta-500:#7a6850;--tinta-400:#a89880;
/* Acentos · marca */
--terra-900:#4a2a04;--terra-800:#6b400a;--terra-700:#8a5418;--terra-600:#a8691e;--ocre-500:#d48a1a;--ocre-400:#e8a030;--ocre-300:#f0bc62;
/* Mar. solo contexto marino */
--mar-700:#2d5266;--mar-500:#4a7a90;--mar-300:#8aa8b8;
/* Semánticos (puntuación) */
--excelente:#3d6b1f;--muybueno:#7a8a30;--aceptable:#c48a1e;--limitado:#a04818;--noapto:#7a2818;
/* Estados del mar */
--sea-calma:#5a8a7a;--sea-buena:#3d6b1f;--sea-aviso:#c48a1e;--sea-surf:#2d5266;--sea-viento:#7a7a7a;--sea-peligro:#7a2818;
/* Aliases funcionales */
--bg:var(--arena-200);--surface:var(--arena-50);--surface-2:var(--arena-100);
--ink:var(--tinta-800);--ink-soft:var(--tinta-600);--muted:var(--tinta-500);
--accent:var(--terra-800);--accent2:var(--ocre-400);
--line:rgba(42,26,8,.14);--line-strong:rgba(42,26,8,.28);
--card-bg:var(--surface);--metric-bg:var(--surface);--ring:var(--terra-700);
/* Compat */
--calma:var(--sea-calma);--buena:var(--sea-buena);--aviso:var(--sea-aviso);--peligro:var(--sea-peligro);--surf:var(--sea-surf);--viento:var(--sea-viento);
/* Fonts */
--font-serif:var(--font-playfair,'Playfair Display',Georgia,serif);--font-sans:var(--font-dm-sans,'DM Sans',system-ui,sans-serif);--font-mono:var(--font-mono,'JetBrains Mono',ui-monospace,monospace);
/* Radii. editorial discreto */
--r-xs:2px;--r-sm:4px;--r-md:6px;--r-lg:10px;--r-xl:16px;--r-pill:999px;
/* Shadows. muy sutiles */
--shadow-sm:0 1px 0 rgba(42,26,8,.06),0 1px 2px rgba(42,26,8,.04);
--shadow-md:0 2px 4px rgba(42,26,8,.06),0 4px 12px rgba(42,26,8,.05);
--shadow-lg:0 8px 24px rgba(42,26,8,.10);
/* Motion */
--ease:cubic-bezier(.2,.6,.2,1);--dur-fast:120ms;--dur:200ms
}
/* Dark mode */
[data-theme="dark"]{--arena-200:#1a1208;--arena-300:#241a0e;--bg:#15100a;--surface:#1f160c;--surface-2:#281d12;--ink:#f0e6d0;--ink-soft:#d4c090;--muted:#a89880;--accent:#d48a1a;--accent2:#e8a030;--line:rgba(240,230,208,.14);--line-strong:rgba(240,230,208,.28);--card-bg:var(--surface);--metric-bg:var(--surface);--shadow-sm:0 1px 0 rgba(0,0,0,.4);--shadow-md:0 4px 12px rgba(0,0,0,.45);--shadow-lg:0 12px 32px rgba(0,0,0,.55)}
html{font-size:16px;scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:var(--font-sans);font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased;overflow-x:hidden;min-height:100vh;text-rendering:optimizeLegibility;font-feature-settings:"ss01","cv11"}
a{text-decoration:none;color:inherit}
button{cursor:pointer;font-family:inherit;border:none;background:none}
button:disabled{cursor:not-allowed;opacity:.55;filter:grayscale(.35)}
img,svg{max-width:100%;display:block}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
a:hover,a:focus-visible{text-decoration:underline;text-decoration-thickness:1.5px;text-underline-offset:3px}
header a:hover,nav a:hover{text-decoration:none}
p{line-height:1.65;text-wrap:pretty}
h1,h2,h3,h4,h5,h6{scroll-margin-top:80px;line-height:1.12;letter-spacing:-.01em;font-family:var(--font-serif);font-weight:700;color:var(--ink);text-wrap:balance}
::selection{background:var(--accent);color:var(--arena-200)}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
.eyebrow{font-family:var(--font-sans);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-weight:500}
.serif-italic{font-family:var(--font-serif);font-style:italic;font-weight:500}
.rule{height:1px;background:var(--line);width:100%}
/* Typography tokens */
.t-display{font-family:var(--font-serif);font-weight:700;font-size:clamp(44px,7vw,68px);line-height:1.02;letter-spacing:-.02em}
.t-h1{font-family:var(--font-serif);font-weight:700;font-size:clamp(32px,5vw,48px);line-height:1.05;letter-spacing:-.02em}
.t-h1 em{font-style:italic;font-weight:500;color:var(--terra-700)}
.t-h2{font-family:var(--font-serif);font-weight:700;font-size:clamp(24px,3.4vw,34px);line-height:1.15;letter-spacing:-.015em}
.t-verdict{font-family:var(--font-serif);font-weight:400;font-style:italic;font-size:26px;line-height:1}
.t-body-lg{font-family:var(--font-sans);font-weight:400;font-size:17px;line-height:1.55}
.t-body{font-family:var(--font-sans);font-weight:400;font-size:15px;line-height:1.55}
.t-caption{font-family:var(--font-sans);font-weight:400;font-size:13px;line-height:1.5;color:var(--muted)}
.t-eyebrow{font-family:var(--font-sans);font-weight:500;font-size:11px;line-height:1;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
.t-data{font-family:var(--font-mono);font-weight:400;font-size:13px;line-height:1.5;font-feature-settings:"tnum" 1;color:var(--muted)}
/* Verdict colors */
.v-excelente{color:var(--excelente)}
.v-muybueno{color:var(--muybueno)}
.v-aceptable{color:var(--aceptable)}
.v-limitado{color:var(--limitado)}
.v-noapto{color:var(--noapto)}
.v-mar{color:var(--mar)}
/* View Transitions API · Chrome 111+, Safari 18+, Firefox 137+, fallback gracioso */
@view-transition{navigation:auto}
::view-transition-group(root){animation-duration:.18s;animation-timing-function:cubic-bezier(.4,0,.2,1)}
::view-transition-old(root){animation:none;mix-blend-mode:normal;opacity:1}
::view-transition-new(root){animation:vtIn .18s cubic-bezier(.4,0,.2,1) both;mix-blend-mode:normal}
@keyframes vtIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
/* content-visibility · skip render off-screen sections, instant scroll */
.cv-auto{content-visibility:auto;contain-intrinsic-size:auto 600px}
/* Fade-in helper · evita flash en blocks hidratados */
.fade-in{animation:fadeIn .25s ease-out both}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
/* Cookie banner slide-up · transform = compositor-only, sin reflow */
@keyframes cbSlideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}@view-transition{navigation:none}}
@media (prefers-contrast: more){:root{--muted:var(--tinta-700);--accent:var(--terra-900);--line:rgba(26,15,4,.45);--line-strong:var(--tinta-800)}a,button{text-decoration:underline}}
@media (forced-colors: active){:root{--accent:LinkText;--muted:CanvasText;--line:CanvasText;--line-strong:CanvasText}a{color:LinkText}:focus-visible{outline:3px solid Highlight;box-shadow:none}}
@media print{header,nav,footer,aside,[class*="AdSlot"],[class*="cookieBanner"],[class*="banner"],script{display:none !important}body{background:#fff !important;color:#000 !important}a{color:#000 !important;text-decoration:underline !important}a[href^="http"]::after{content:" (" attr(href) ")";font-size:.85em;color:#555}}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Critical CSS inline. paint inmediato sin esperar CSS externo */}
        <style dangerouslySetInnerHTML={{ __html: CRITICAL_CSS }} />

        {/* Preload del logo · está en el LCP del nav, eliminar el round-trip */}
        <link rel="preload" as="image" href="/logo.svg" fetchPriority="high" />

        {/* Preconnect/DNS prefetch. elimina RTT para APIs externas */}
        <link rel="preconnect" href="https://api.open-meteo.com" />
        <link rel="preconnect" href="https://marine-api.open-meteo.com" />
        <link rel="preconnect" href="https://upload.wikimedia.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://commons.wikimedia.org" />
        <link rel="dns-prefetch" href="https://overpass-api.de" />
        <link rel="dns-prefetch" href="https://www.ign.es" />

        {/* AdSense se carga via ConsentScripts (requiere consentimiento marketing) */}

        {/* Speculation Rules. prefetch/prerender para navegación instant */}
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
                  { href_matches: "/provincia/*" },
                  { href_matches: "/playas-cerca-de-mi" },
                  { href_matches: "/banderas-azules" },
                  { href_matches: "/surf" },
                  { href_matches: "/top" },
                  { href_matches: "/top/*" },
                ],
              },
              eagerness: "moderate",
            }],
          })}}
        />
        {/* Service Worker registration. offline beach fichas */}
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator)navigator.serviceWorker.register('/sw.js')` }} />
      </head>
      <body>
        <NavigationProgress />
        {children}
        {/* GA4 + AdSense. cargados condicionalmente por consentimiento */}
        <ConsentScripts />
        <CookieBanner />
      </body>
    </html>
  )
}