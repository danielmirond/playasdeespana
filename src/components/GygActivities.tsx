// src/components/GygActivities.tsx
// Bloque "Cosas que hacer cerca": widget de actividades de GetYourGuide
// parametrizado por ciudad/zona. El script (widget.getyourguide.com) ya se
// carga en ConsentScripts; aquí solo renderizamos el <div data-gyg-widget>
// que la librería hidrata. Server component (sin coste de JS propio).
//
// `query` debe ir en formato "Ciudad, País" (ej. "Cádiz, Spain").
// `cmp` etiqueta el origen para la atribución en GetYourGuide Analytics.

import GygSlot from './GygSlot'

const PARTNER_ID = 'BMIKRAB'

export default function GygActivities({
  query,
  cmp = 'site',
  items = 3,
  locale = 'es',
  title,
  id,
  municipioSlug,
  variante,
}: {
  query?: string | null
  cmp?: string
  items?: number
  locale?: 'es' | 'en'
  title?: string
  id?: string
  /** Para el enlace de repuesto cuando no hay widget */
  municipioSlug?: string | null
  /** Qué promoción ocupa el hueco si no hay widget */
  variante?: 'cuaderno' | 'piel' | 'actividades'
}) {
  if (!query) return null
  const heading = title ?? (locale === 'en' ? 'Things to do nearby' : 'Cosas que hacer cerca')
  return (
    <section id={id} className="cv-auto" style={{ maxWidth: 1000, margin: '2.5rem auto 0', padding: '0 1.5rem', scrollMarginTop: '64px' }}>
      {/* Tratamiento deliberadamente MENOR que el de las secciones de
          contenido (ago-2026). Antes compartía rango visual con «Seguridad»
          o «Cómo llegar» —serif de hasta 1,7rem en peso 700— y llevaba un
          🎟️ que anunciaba «aquí se venden entradas» antes de que nadie
          leyera el titular. Un bloque patrocinado que se disfraza de sección
          editorial es peor negocio a la larga que uno que se presenta como
          lo que es: esto no es un dato de la playa, es una oferta. */}
      <GygSlot locale={locale} municipioSlug={municipioSlug} variante={variante} cmp={cmp}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 600, color: 'var(--ink-soft, var(--muted))', margin: '0 0 .85rem', letterSpacing: '-.005em' }}>
        {heading}
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
      </GygSlot>
    </section>
  )
}
