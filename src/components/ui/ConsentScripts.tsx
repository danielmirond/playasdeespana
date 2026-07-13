'use client'
// ConsentScripts. carga GA4 y AdSense SOLO si el usuario ha consentido.
// Escucha el evento 'cookie-consent-change' disparado por CookieBanner.
// Si no hay consentimiento, NO se carga nada (cumple LSSI-CE art. 22.2).
import { useEffect, useState } from 'react'
import Script from 'next/script'
import { readConsent } from './CookieBanner'

const GA_ID = 'G-LFHYJE8S16'
const ADSENSE_ID = process.env.NEXT_PUBLIC_ADSENSE_ID ?? ''

export default function ConsentScripts() {
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  useEffect(() => {
    function check() {
      const c = readConsent()
      setAnalytics(c?.analiticas ?? false)
      setMarketing(c?.marketing ?? false)
    }
    check()
    window.addEventListener('cookie-consent-change', check)
    return () => window.removeEventListener('cookie-consent-change', check)
  }, [])

  return (
    <>
      {/* GA4. solo si consentimiento analíticas */}
      {analytics && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="lazyOnload"
          />
          <Script id="ga4" strategy="lazyOnload">
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
        </>
      )}

      {/* AdSense. solo si consentimiento marketing */}
      {marketing && ADSENSE_ID && (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_ID}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      )}

      {/* GetYourGuide Partner Analytics (afiliación) — cargado en TODO el site
          (decisión de negocio). Necesario para atribuir conversiones de tours.
          Nota: revisar que la política de cookies lo declare. */}
      <Script
        id="gyg-analytics"
        src="https://widget.getyourguide.com/dist/pa.umd.production.min.js"
        data-gyg-partner-id="BMIKRAB"
        strategy="lazyOnload"
      />
    </>
  )
}
