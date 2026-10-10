// src/components/layout/RootShell.tsx — el documento, en el idioma que toque.
//
// POR QUÉ EXISTE. Había un único root layout que fijaba <html lang="es"> y
// montaba <Footer /> sin idioma. Como ese layout envuelve también a /en, las
// 4.948 páginas en inglés servían el pie entero en castellano —incluido el
// aviso de afiliación, que es justo el texto que tiene que entender quien lo
// lee— y un lang equivocado. El HtmlLangSetter lo corregía con JavaScript
// después de hidratar, o sea nunca para quien lee el HTML.
//
// Ahora hay dos root layouts, uno por idioma, y los dos pintan ESTE shell.
// Todo lo que no depende del idioma vive aquí y solo aquí: si se duplicara,
// los dos árboles divergirían sin que nadie se entere.
//
// Lo que NO se puede tocar al mantenerlo:
//   · las fuentes se instancian en app/fonts.ts, nunca aquí ni en los layouts
//   · el suppressHydrationWarning del <body> y su comentario van literales
import type { ReactNode } from 'react'
import { LITORAL_CSS_MIN, TIPO_LITORAL_CSS } from '@/styles/litoral'
import { flagsAttr, tieneFlag } from '@/lib/flags'
import { clasesDeFuente } from '@/app/fonts'
import { websiteSchema, ORGANIZATION_SCHEMA, type Idioma } from '@/lib/schema/site'
import InstallPrompt from '@/components/pwa/InstallPrompt'
import CookieBanner from '@/components/ui/CookieBanner'
import ConsentScripts from '@/components/ui/ConsentScripts'
import GAPageViews from '@/components/ui/GAPageViews'
import { Suspense } from 'react'
import NavigationProgress from '@/components/ui/NavigationProgress'
import MobileNav from '@/components/ui/MobileNav'
import Footer from '@/components/ui/Footer'
import '@/app/globals.css'

const CRITICAL_CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
/* Arena · superficies. Piel «Blanco y mar» (sep-2026): blanco y gris azulado; los nombres se conservan para no tocar los componentes. */
--arena-50:#ffffff;--arena-100:#f8fbfc;--arena-200:#ffffff;--arena-300:#eef4f7;--arena-400:#d9eaf0;--arena-500:#a9cbd8;
/* Tinta · texto */
--tinta-900:#081a29;--tinta-800:#0f2a3d;--tinta-700:#1c3a4f;--tinta-600:#2f4d62;--tinta-500:#4d6675;--tinta-400:#8aa0ad;
/* Acentos · marca */
--terra-900:#0f4b60;--terra-800:#1f6f8b;--terra-700:#2b7f9c;--terra-600:#3d93b0;--ocre-500:#c2711a;--ocre-400:#5fb0c8;--ocre-300:#8fcbdc;
/* Mar. solo contexto marino */
--mar-700:#1f6f8b;--mar-500:#3d93b0;--mar-300:#8fcbdc;
/* Semánticos (puntuación) */
--excelente:#2e7d4f;--muybueno:#6a8f3a;--aceptable:#c2711a;--limitado:#b0522a;--noapto:#a63a2c;
/* Estados del mar */
--sea-calma:#4f9a8a;--sea-buena:#2e7d4f;--sea-aviso:#c2711a;--sea-surf:#1f6f8b;--sea-viento:#6b7a83;--sea-peligro:#a63a2c;
/* Aliases funcionales */
--bg:var(--arena-200);--surface:var(--arena-50);--surface-2:var(--arena-100);
--ink:var(--tinta-800);--ink-soft:var(--tinta-600);--muted:var(--tinta-500);
--accent:var(--terra-800);--accent2:var(--ocre-400);
--line:rgba(15,42,61,.14);--line-strong:rgba(15,42,61,.28);
--card-bg:var(--surface);--metric-bg:var(--surface);--ring:var(--terra-700);
/* Cuatro tokens que solo existían como fallback dentro de los componentes.
   Declararlos aquí es lo que permite quitarles el hex: sin esto, al
   limpiarlo la propiedad quedaría inválida y el navegador la ignoraría. */
--card-bg2:#f8fbfc;--accent-soft:#eef4f7;--on-accent:#fff;--on-media:#8fcbdc;--sello-accent:var(--terra-800);--sello-ink:var(--tinta-800);
/* Compat */
--calma:var(--sea-calma);--buena:var(--sea-buena);--aviso:var(--sea-aviso);--peligro:var(--sea-peligro);--surf:var(--sea-surf);--viento:var(--sea-viento);
/* Fonts */
--font-serif:var(--font-playfair,'Playfair Display',Georgia,serif);--font-sans:var(--font-dm-sans,'DM Sans',system-ui,sans-serif);--font-mono:var(--font-jetbrains,'JetBrains Mono',ui-monospace,monospace);
/* Radii. editorial discreto */
--r-xs:2px;--r-sm:4px;--r-md:6px;--r-lg:10px;--r-xl:16px;--r-pill:999px;--r-sello:3px;
/* Certeza del dato (propuesta de diseño 2026, §5.4). Cuatro grados de
   confianza y una ausencia. El color solo matiza: el peso lo lleva el
   TRAZO del subrayado, para que se lea en monocromo y sobre fotografía. */
--cert-medido:#1f6f8b;--cert-oficial:#2e7d4f;--cert-reportado:#9a5a12;--cert-estimado:#5a6f7c;--cert-sindato:#6b7a83;
--cert-rule-medido:2px solid var(--cert-medido);--cert-rule-oficial:1.5px solid var(--cert-oficial);
--cert-rule-reportado:1.5px dotted var(--cert-reportado);--cert-rule-estimado:1px dashed var(--cert-estimado);
--cert-bg-medido:rgba(31,111,139,.08);--cert-bg-oficial:rgba(46,125,79,.08);
--cert-bg-reportado:rgba(194,113,26,.10);--cert-bg-estimado:rgba(90,111,124,.07);
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
--shadow-sm:0 1px 0 rgba(15,42,61,.06),0 1px 2px rgba(15,42,61,.04);
--shadow-md:0 2px 4px rgba(15,42,61,.06),0 4px 12px rgba(15,42,61,.05);
--shadow-lg:0 8px 24px rgba(15,42,61,.10);
/* Motion */
--ease:cubic-bezier(.2,.6,.2,1);--dur-fast:120ms;--dur:200ms
}
/* Dark mode */
[data-theme="dark"]{--arena-200:#0b1a26;--arena-300:#12283a;--bg:#081521;--surface:#0f2130;--surface-2:#15303f;--ink:#e8f1f5;--ink-soft:#c3d6e0;--muted:#8aa0ad;--accent:#5fb0c8;--accent2:#8fcbdc;--line:rgba(232,241,245,.14);--line-strong:rgba(232,241,245,.28);--card-bg:var(--surface);--metric-bg:var(--surface);--shadow-sm:0 1px 0 rgba(0,0,0,.4);--shadow-md:0 4px 12px rgba(0,0,0,.45);--shadow-lg:0 12px 32px rgba(0,0,0,.55)}
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

export default function RootShell({ locale, children }: { locale: Idioma; children: React.ReactNode }) {
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
  const fuentes = clasesDeFuente(tipoLitoral)

  return (
    <html lang={locale} className={fuentes} {...(flags ? { 'data-flags': flags } : {})}>
      <head>
        {/* Verificación de sitio Impact.com (afiliación). Usa atributo `value`
            (no `content`), por eso va como tag literal y no vía Metadata API. */}
        <meta name="impact-site-verification" {...{ value: 'a656d2a6-4ace-403d-84f9-172e9b6c8da0' }} />

        {/* Critical CSS inline: paint inmediato sin esperar CSS externo.
            Una hoja U OTRA, nunca las dos: Litoral sustituye a Arena, no se
            apila sobre ella. Solo existe un juego de tokens a la vez. */}
        <style dangerouslySetInnerHTML={{ __html: litoral ? LITORAL_CSS_MIN : CRITICAL_CSS }} />
        {/* C2 va detrás de la hoja base, sea cual sea: así Literata puede
            medirse sola sobre Arena. Gana por especificidad: un atributo
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
, así se quedó la píldora congelada en «01 / 18 Webcam», . */}
      <body suppressHydrationWarning>
        {/* Organization + WebSite globales referenciables por @id */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema(locale)) }}
        />
        <NavigationProgress />
        <MobileNav />
        {children}
        <Footer locale={locale} />
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
