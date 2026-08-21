'use client'
// ConsentScripts — GA4 con Consent Mode v2, y el resto solo con permiso.
//
// ANTES: GA4 no se cargaba hasta que el usuario aceptaba. Cumplía la
// LSSI, pero el efecto medido en producción era que sin consentimiento
// no existían ni `gtag` ni `dataLayer` ni una sola petición a Google.
// Todo el que ignoraba el banner era invisible: no es que se midiera
// mal, es que no se medía. En España eso es habitualmente entre un 20 %
// y un 50 % del tráfico, y ese hueco no aparecía por ningún lado.
//
// AHORA: Consent Mode v2. La etiqueta se carga siempre pero arranca con
// TODO denegado, que es lo que Google llama modo avanzado:
//
//   - con `analytics_storage: 'denied'` GA no escribe ni lee cookies y
//     manda pings sin identificador. No se almacena nada en el
//     dispositivo, que es lo que regula el art. 22.2 de la LSSI.
//   - cuando el usuario acepta, `consent update` desbloquea las cookies
//     y a partir de ahí la medición es la de siempre.
//   - con esos pings, Google modela el comportamiento del tramo que no
//     consiente en vez de dejarlo en cero.
//
// El compromiso, dicho claro: la etiqueta de Google se carga también
// para quien no ha consentido. No guarda nada en su navegador, pero su
// IP llega a Google. Es la interpretación que asume el modo avanzado y
// la que usa la mayoría del sector en España; si se prefiere la lectura
// estricta, se vuelve al esquema anterior quitando el bloque de
// `consent default` y volviendo a envolver los <Script> en `analytics`.
//
// El orden importa: `consent default` tiene que ejecutarse ANTES de que
// cargue gtag.js, o el primer ping sale sin restricciones. De ahí el
// beforeInteractive del primer Script.
import { useEffect, useState } from 'react'
import Script from 'next/script'
import { readConsent } from './CookieBanner'

const GA_ID = 'G-LFHYJE8S16'
import { ADSENSE_ID } from '@/lib/adsense'

export default function ConsentScripts() {
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    function check() {
      const c = readConsent()
      const a = c?.analiticas ?? false
      const m = c?.marketing ?? false
      setAnalytics(a)
      setMarketing(m)

      // Comunicar el estado a la etiqueta, que ya está cargada. Esto es
      // lo que convierte los pings sin cookies en medición completa, y
      // también lo que hace que revocar el consentimiento surta efecto
      // sin recargar.
      const gtag = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag
      if (typeof gtag === 'function') {
        gtag('consent', 'update', {
          analytics_storage:  a ? 'granted' : 'denied',
          ad_storage:         m ? 'granted' : 'denied',
          ad_user_data:       m ? 'granted' : 'denied',
          ad_personalization: m ? 'granted' : 'denied',
        })
      }
    }
    check()
    window.addEventListener('cookie-consent-change', check)
    return () => window.removeEventListener('cookie-consent-change', check)
  }, [])

  return (
    <>
      {/* 1. Los valores por defecto, ANTES que gtag.js. Sin esto, el
             primer ping saldría con permisos que nadie ha dado. */}
      <Script id="consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage:  'denied',
            ad_storage:         'denied',
            ad_user_data:       'denied',
            ad_personalization: 'denied',
            functionality_storage: 'granted',
            security_storage:      'granted',
            wait_for_update: 500
          });
        `}
      </Script>

      {/* 2. GA4 para todo el mundo, restringido por lo de arriba. */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');

          document.addEventListener('click', function(e) {
            var el = e.target.closest ? e.target.closest('a,button') : null;
            if (!el) return;
            var href = el.getAttribute('href') || '';
            if (href.match(/\\/playas\\//)) gtag('event', 'beach_click', { beach_slug: href.split('/playas/')[1] });
            if (href.includes('booking.com') || href.includes('expedia')) gtag('event', 'hotel_click', { provider: href.includes('booking') ? 'booking' : 'expedia' });
            if (href.includes('civitatis') || href.includes('getyourguide')) gtag('event', 'activity_click', { provider: href.includes('civitatis') ? 'civitatis' : 'gyg' });
            if (href.includes('thefork') || href.includes('eltenedor')) gtag('event', 'restaurant_click');
            // Awin (SamBoat barcos + Camperdays autocaravanas): el clickref
            // codifica la superficie (p.ej. playasdeespana_camper_madrid),
            // asi que un solo evento permite medir conversion por pagina.
            if (href.includes('awin1.com')) {
              var ref = (href.match(/clickref=([^&]*)/) || [])[1] || '';
              var prog = href.includes('camperdays') ? 'camperdays' : (href.includes('samboat') ? 'samboat' : 'awin');
              gtag('event', 'affiliate_clickout', { program: prog, clickref: ref, page: location.pathname });
            }
            if (href.includes('amazon.') && href.includes('tag=')) {
              gtag('event', 'affiliate_clickout', { program: 'amazon', page: location.pathname });
            }
            if (href.includes('parclick')) gtag('event', 'parking_click');
            if (href.includes('google.com/maps/dir')) gtag('event', 'route_open');
            if (el.getAttribute('aria-pressed') !== null) gtag('event', 'filter_click', { filter: el.textContent });
            var intent = el.getAttribute('data-intent');
            if (intent) gtag('event', 'intent_click', { intent: intent });
          });
        `}
      </Script>

      {/* AdSense. solo si consentimiento marketing */}
      {marketing && ADSENSE_ID && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      )}

      {/* GetYourGuide Partner Analytics — AHORA detrás del consentimiento.
          Cargaba en todas las páginas con o sin permiso, y era el único
          script de terceros que se saltaba el banner: la analítica propia
          lo respetaba y la ajena no. El comentario que había aquí ya lo
          avisaba («revisar que la política de cookies lo declare»).

          CUIDADO, ESTO PUEDE COSTAR DINERO: es el script que atribuye las
          conversiones de tours a este sitio. Quien no acepte marketing
          deja de atribuirse, así que la comisión de GetYourGuide puede
          bajar. Va detrás del consentimiento porque es lo correcto, no
          porque sea gratis; si el impacto no compensa, la decisión es de
          negocio y se revierte quitando la condición. */}
      {marketing && (
        <Script
          id="gyg-analytics"
          src="https://widget.getyourguide.com/dist/pa.umd.production.min.js"
          data-gyg-partner-id="BMIKRAB"
          strategy="lazyOnload"
        />
      )}
    </>
  )
}
