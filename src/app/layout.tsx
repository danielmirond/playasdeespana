import type { Metadata, Viewport } from 'next'
import { Playfair_Display, DM_Sans, JetBrains_Mono, Literata, Schibsted_Grotesk } from 'next/font/google'
import { LITORAL_CSS_MIN, TIPO_LITORAL_CSS } from '@/styles/litoral'
import { getFlags, flagsAttr, tieneFlag } from '@/lib/flags'
import InstallPrompt from '@/components/pwa/InstallPrompt'
import CookieBanner from '@/components/ui/CookieBanner'
import ConsentScripts from '@/components/ui/ConsentScripts'
import GAPageViews from '@/components/ui/GAPageViews'
import { Suspense } from 'react'
import NavigationProgress from '@/components/ui/NavigationProgress'
import MobileNav from '@/components/ui/MobileNav'
import Footer from '@/components/ui/Footer'
import { AUTOR_PLAYAS_ESPANA } from '@/lib/autoria'
import './globals.css'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

// Organization JSON-LD global. Se emite una sola vez por página y todos los
// schemas de la app referencian su @id (Beach.publisher, Article.author...).
// Le permite a Google fusionar las menciones a una única entidad del
// Knowledge Graph (Content Warehouse: authorEntities, trustedSource).
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  ...AUTOR_PLAYAS_ESPANA,
}

// WebSite + SearchAction: activa el cuadro de búsqueda de Google bajo el
// dominio en SERP (sitelinks searchbox). Aumenta visibilidad de marca
// y CTR. El @id estable enlaza el WebSite con la Organization vía
// publisher. Content Warehouse: brand entity, sitelinks signals.
const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type':    'WebSite',
  '@id':      `${BASE_URL}/#website`,
  url:        BASE_URL,
  name:       'Playas de España',
  alternateName: ['playas-espana.com', 'Playas España'],
  description:
    'Estado del mar y guía de más de 4.400 playas españolas. Datos oficiales de MITECO, EEA y AEMET actualizados cada hora.',
  inLanguage: 'es-ES',
  publisher:  { '@id': AUTOR_PLAYAS_ESPANA['@id'] },
  potentialAction: {
    '@type':       'SearchAction',
    target: {
      '@type':       'EntryPoint',
      urlTemplate:   `${BASE_URL}/buscar?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['400', '500'],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  // Antes era '--font-mono', que chocaba con el token --font-mono de la hoja
  // y producía `--font-mono: var(--font-mono, …)` — autorreferencia inválida
  // que caía al nombre de familia literal. Ahora la fuente y el token tienen
  // nombres distintos y ambas hojas la referencian igual.
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400'],
})

// ——— Sistema Litoral ———————————————————————————————————————
// Literata es VARIABLE (200–900) con itálica real y cifras tabulares: se
// sirve el archivo variable, no instancias estáticas, porque el sistema usa
// 400 de cuerpo, 500 de display y 700 de énfasis. Sin rango variable harían
// falta tres ficheros y la negrita sintética que el handoff prohíbe.
const literata = Literata({
  subsets: ['latin'],
  variable: '--font-literata',
  display: 'swap',
  style: ['normal', 'italic'],
  axes: ['opsz'],
})
const schibsted = Schibsted_Grotesk({
  subsets: ['latin'],
  variable: '--font-schibsted',
  display: 'swap',
})
// JetBrains lo comparten las dos hojas vía --font-jetbrains.

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'),
  title: {
    default: 'Playas de España. Estado del mar en tiempo real',
    template: '%s · Playas de España',
  },
  description: 'Temperatura del agua, oleaje, calidad y servicios de las más de 4.400 playas españolas. Datos Open-Meteo y EEA actualizados cada hora.',
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
  themeColor: '#0369a1',
  // PWA / iOS instalado: expone env(safe-area-inset-*) para que las barras
  // fijas (p.ej. la barra inferior de la ficha) respeten notch y home indicator.
  viewportFit: 'cover',
}

// Critical CSS inline. renderiza antes del paint inicial
// Design system v2 · tokens alineados con Figma export abril 2026
const CRITICAL_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
/* Arena · superficies */
--arena-50:#faf4e6;--arena-100:#f5ecd5;--arena-200:#f0e6d0;--arena-300:#e5d6b4;--arena-400:#d4c090;--arena-500:#b8a06a;
/* Tinta · texto */
--tinta-900:#1a0f04;--tinta-800:#2a1a08;--tinta-700:#3d2a14;--tinta-600:#524030;--tinta-500:#6a5840;--tinta-400:#a89880;
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
/* Cuatro tokens que solo existían como fallback dentro de los componentes.
   Declararlos aquí es lo que permite quitarles el hex: sin esto, al
   limpiarlo la propiedad quedaría inválida y el navegador la ignoraría. */
--card-bg2:#f5ede0;--accent-soft:#fdecd6;--on-accent:#fff;--on-media:#ffd66e;--sello-accent:var(--terra-800);--sello-ink:var(--tinta-800);
/* Compat */
--calma:var(--sea-calma);--buena:var(--sea-buena);--aviso:var(--sea-aviso);--peligro:var(--sea-peligro);--surf:var(--sea-surf);--viento:var(--sea-viento);
/* Fonts */
--font-serif:var(--font-playfair,'Playfair Display',Georgia,serif);--font-sans:var(--font-dm-sans,'DM Sans',system-ui,sans-serif);--font-mono:var(--font-jetbrains,'JetBrains Mono',ui-monospace,monospace);
/* Radii. editorial discreto */
--r-xs:2px;--r-sm:4px;--r-md:6px;--r-lg:10px;--r-xl:16px;--r-pill:999px;--r-sello:3px;
/* Certeza del dato (propuesta de diseño 2026, §5.4). Cuatro grados de
   confianza y una ausencia. El color solo matiza: el peso lo lleva el
   TRAZO del subrayado, para que se lea en monocromo y sobre fotografía. */
--cert-medido:#2d5266;--cert-oficial:#3d6b1f;--cert-reportado:#8a5f0a;--cert-estimado:#7a6850;--cert-sindato:#7a6b55;
--cert-rule-medido:2px solid var(--cert-medido);--cert-rule-oficial:1.5px solid var(--cert-oficial);
--cert-rule-reportado:1.5px dotted var(--cert-reportado);--cert-rule-estimado:1px dashed var(--cert-estimado);
--cert-bg-medido:rgba(45,82,102,.08);--cert-bg-oficial:rgba(61,107,31,.08);
--cert-bg-reportado:rgba(196,138,30,.10);--cert-bg-estimado:rgba(122,104,80,.07);
/* Cifra destacada: score y mediciones son voz de medio → serif */
/* Escala de texto. Existía solo en Litoral, así que los componentes
   escribían el tamaño a mano y cambiar uno cambiaba los dos sistemas.
   Con los mismos nombres en las dos hojas, var(--fs-sm) significa «el
   pequeño de este sistema» y cada uno trae el suyo. (Sin comillas
   invertidas en este comentario: está dentro de un template literal y
   lo cerrarían.)
   Los números coinciden porque ya coincidían: Arena tiene el cuerpo en
   15px y usa 11, 17 y 26 por la casa. No es una escala nueva, es la que
   había sin nombrar. */
--fs-xs:11px;--fs-sm:13px;--fs-base:15px;--fs-md:17px;--fs-lg:20px;
--fs-xl:26px;--fs-2xl:34px;--fs-3xl:46px;
--fs-score:68px;--fs-score-sm:34px;--fs-medicion:26px;
/* Objetivos táctiles */
--touch-min:44px;--touch-comfy:48px;
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
@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:.01ms !important;animation-iteration-count:1 !important;transition-duration:.01ms !important;scroll-behavior:auto !important}@view-transition{navigation:none}}
@media (prefers-contrast: more){:root{--muted:var(--tinta-700);--accent:var(--terra-900);--line:rgba(26,15,4,.45);--line-strong:var(--tinta-800)}a,button{text-decoration:underline}}
@media (forced-colors: active){:root{--accent:LinkText;--muted:CanvasText;--line:CanvasText;--line-strong:CanvasText}a{color:LinkText}:focus-visible{outline:3px solid Highlight;box-shadow:none}}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // La decisión de flag se toma AQUÍ, en servidor, y se pinta en <html>.
  // Nunca un swap en cliente: produce FOUC y parte de la sesión se mediría
  // con un sistema y parte con el otro.
  const flags = flagsAttr()
  const litoral = tieneFlag('ds_litoral_tokens')
  // Las fuentes las manda ds_litoral_type, NO ds_litoral_tokens. El manual
  // pide que el cambio tipográfico pueda medirse solo —Literata sobre el
  // sistema Arena— y con las dos cosas en el mismo flag ese A/B no existe.
  // Las cuatro combinaciones son legítimas y cada una carga lo suyo: servir
  // las cuatro familias para usar dos es peso muerto en un sitio 90% móvil.
  const tipoLitoral = tieneFlag('ds_litoral_type')
  const fuentes = tipoLitoral
    ? `${literata.variable} ${schibsted.variable} ${jetbrainsMono.variable}`
    : `${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`

  return (
    <html lang="es" className={fuentes} {...(flags ? { 'data-flags': flags } : {})}>
      <head>
        {/* Verificación de sitio Impact.com (afiliación). Usa atributo `value`
            (no `content`), por eso va como tag literal y no vía Metadata API. */}
        <meta name="impact-site-verification" {...{ value: 'a656d2a6-4ace-403d-84f9-172e9b6c8da0' }} />

        {/* Critical CSS inline: paint inmediato sin esperar CSS externo.
            Una hoja U OTRA, nunca las dos — Litoral sustituye a Arena, no se
            apila sobre ella. Solo existe un juego de tokens a la vez. */}
        <style dangerouslySetInnerHTML={{ __html: litoral ? LITORAL_CSS_MIN : CRITICAL_CSS }} />
        {/* C2 va detrás de la hoja base, sea cual sea: así Literata puede
            medirse sola sobre Arena. Gana por especificidad — un atributo
            en <html> pesa más que :root. */}
        {tipoLitoral && <style dangerouslySetInnerHTML={{ __html: TIPO_LITORAL_CSS }} />}

        {/* Preload del logo · está en el LCP del nav, eliminar el round-trip */}

        {/* Preconnect/DNS prefetch. Elimina RTT para APIs externas críticas
            que se llaman casi siempre desde el render server-side de la
            ficha y home. Preconnect = 3-way TCP+TLS pre-abierto;
            dns-prefetch = solo resolución DNS (más barato pero menos efectivo). */}
        <link rel="preconnect" href="https://api.open-meteo.com" />
        <link rel="preconnect" href="https://marine-api.open-meteo.com" />
        <link rel="preconnect" href="https://upload.wikimedia.org" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://live.staticflickr.com" />
        <link rel="dns-prefetch" href="https://commons.wikimedia.org" />
        <link rel="dns-prefetch" href="https://overpass-api.de" />
        <link rel="dns-prefetch" href="https://overpass.kumi.systems" />
        <link rel="dns-prefetch" href="https://www.ign.es" />
        <link rel="dns-prefetch" href="https://api.openverse.org" />
        <link rel="dns-prefetch" href="https://api.pexels.com" />
        <link rel="dns-prefetch" href="https://api.sunrise-sunset.org" />
        <link rel="dns-prefetch" href="https://www.flickr.com" />

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
      {/* suppressHydrationWarning en el <body>, y solo aquí.
          public/pildora.js se carga con `defer`, o sea que corre ANTES
          de que React hidrate, y escribe dos atributos en el body:
          data-pildora (si la píldora se ve) y data-ctx (si toca
          "cómo llegar" o "cómo está"). React llega después, encuentra
          atributos que él no puso y aborta la hidratación.
          Es el mismo patrón que los scripts de tema que escriben
          data-theme antes de pintar, y la salida documentada de React
          es esta. Solo silencia el <body>: cualquier mismatch dentro
          del árbol se sigue viendo.
          Ojo, no es cosmético: al abortar, React repinta el árbol
          entero y se lleva por delante lo que el script había hecho
          —así se quedó la píldora congelada en «01 / 18 Webcam»—. */}
      <body suppressHydrationWarning>
        {/* Organization + WebSite globales referenciables por @id */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }}
        />
        <NavigationProgress />
        <MobileNav />
        {children}
        <Footer />
        {/* GA4 con Consent Mode v2 + AdSense y GetYourGuide tras permiso */}
        <ConsentScripts />
        {/* La vista de página en cada navegación de cliente. El App
            Router no recarga, así que sin esto solo se contaba la
            primera página de cada visita. Va en Suspense porque
            useSearchParams obliga: sin él, toda la página pasaría a
            renderizado dinámico y perderíamos el ISR. */}
        <Suspense fallback={null}>
          <GAPageViews />
        </Suspense>
        <CookieBanner />
        <InstallPrompt />
      </body>
    </html>
  )
}