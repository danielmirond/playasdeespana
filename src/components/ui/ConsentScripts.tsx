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
                if (href.includes('parclick')) gtag('event', 'parking_click');
                if (href.includes('google.com/maps/dir')) gtag('event', 'route_open');
                if (el.getAttribute('aria-pressed') !== null) gtag('event', 'filter_click', { filter: el.textContent });
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
    </>
  )
}
