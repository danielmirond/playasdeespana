// src/components/GygActivities.tsx
// Bloque "Cosas que hacer cerca": widget de actividades de GetYourGuide
// parametrizado por ciudad/zona. El script (widget.getyourguide.com) ya se
// carga en ConsentScripts; aquí solo renderizamos el <div data-gyg-widget>
// que la librería hidrata. Server component (sin coste de JS propio).
//
// `query` debe ir en formato "Ciudad, País" (ej. "Cádiz, Spain").
// `cmp` etiqueta el origen para la atribución en GetYourGuide Analytics.

const PARTNER_ID = 'BMIKRAB'

export default function GygActivities({
  query,
  cmp = 'site',
  items = 4,
  locale = 'es',
  title,
  id,
}: {
  query?: string | null
  cmp?: string
  items?: number
  locale?: 'es' | 'en'
  title?: string
  id?: string
}) {
  if (!query) return null
  const heading = title ?? (locale === 'en' ? 'Things to do nearby' : 'Cosas que hacer cerca')
  return (
    <section id={id} className="cv-auto" style={{ maxWidth: 1000, margin: '2.5rem auto 0', padding: '0 1.5rem', scrollMarginTop: '64px' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.3rem,3vw,1.7rem)', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem', letterSpacing: '-.01em' }}>
        {heading} <span aria-hidden="true">🎟️</span>
      </h2>
      <div
        data-gyg-widget="auto"
        data-gyg-partner-id={PARTNER_ID}
        data-gyg-q={query}
        data-gyg-locale-code={locale === 'en' ? 'en-GB' : 'es-ES'}
        data-gyg-number-of-items={String(items)}
        data-gyg-cmp={cmp}
      />
      <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.5rem' }}>
        {locale === 'en'
          ? 'Activities via GetYourGuide. We may earn a commission at no extra cost to you.'
          : 'Actividades vía GetYourGuide. Podemos recibir una comisión sin coste adicional para ti.'}
      </p>
    </section>
  )
}
