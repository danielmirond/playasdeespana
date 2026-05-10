// src/components/seo/UpdatedBadge.tsx
// Muestra "Actualizado hace X" + emite JSON-LD WebPage con dateModified real.
// Sirve para alimentar lastSignificantUpdate / semanticDateInfo de Google
// con una fecha verificable (commit/data-sync), no `new Date()`.

import { relativeTime } from '@/lib/dateModified'

interface Props {
  iso:        string
  /** URL canónica de la página, para el WebPage schema */
  url:        string
  /** Para el WebPage schema (también puedes omitir y poner solo la badge) */
  name?:      string
  /** Si false, solo emite JSON-LD sin renderizar la badge visible */
  visible?:   boolean
  className?: string
  locale?:    'es' | 'en'
}

export default function UpdatedBadge({
  iso,
  url,
  name,
  visible = true,
  className,
  locale = 'es',
}: Props) {
  const schema: Record<string, unknown> = {
    '@context':    'https://schema.org',
    '@type':       'WebPage',
    url,
    dateModified:  iso,
  }
  if (name) schema.name = name

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {visible && (
        <span
          className={className}
          style={{
            fontSize:   '.72rem',
            color:      'var(--muted, #5a3d12)',
            fontFamily: 'var(--font-mono, monospace)',
            letterSpacing: '.05em',
          }}
        >
          <time dateTime={iso}>{relativeTime(iso, locale)}</time>
        </span>
      )}
    </>
  )
}
