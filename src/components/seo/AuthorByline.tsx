// src/components/seo/AuthorByline.tsx
// Byline visible + Article schema con dateModified y author canónico.
// Para guías editoriales (medusas, calidad-agua, protectores-solares,
// seguros-viaje, metodología, qué llevar).
//
// Por qué importa:
//   - Article.author con @id estable alimenta authorEntities (Content
//     Warehouse leak).
//   - Visibilidad del byline en el hero refuerza E-E-A-T para el lector
//     y los crawlers que parsean el HTML.

import Link from 'next/link'
import { AUTOR_PLAYAS_ESPANA, BYLINE_LABEL, BYLINE_HREF } from '@/lib/autoria'
import { relativeTime } from '@/lib/dateModified'

interface Props {
  /** Título del artículo (irá en Article.headline) */
  headline:     string
  /** URL canónica completa */
  url:          string
  /** ISO 8601: dateModified real, no `new Date()` */
  dateModified: string
  /** Si difiere del modified, ISO de la primera publicación. Si no, igual. */
  datePublished?: string
  /** Imagen 1200×630 representativa del artículo */
  image?:       string
  /** Descripción corta (Article.description) */
  description?: string
  /** Sección temática del Article */
  articleSection?: string
  locale?:      'es' | 'en'
  /** Si false, sólo emite JSON-LD sin renderizar el byline visible */
  visible?:     boolean
}

export default function AuthorByline({
  headline,
  url,
  dateModified,
  datePublished,
  image,
  description,
  articleSection,
  locale = 'es',
  visible = true,
}: Props) {
  const schema: Record<string, unknown> = {
    '@context':     'https://schema.org',
    '@type':        'Article',
    headline,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    author:         AUTOR_PLAYAS_ESPANA,
    publisher:      AUTOR_PLAYAS_ESPANA,
    dateModified,
    datePublished:  datePublished ?? dateModified,
    inLanguage:     locale === 'es' ? 'es-ES' : 'en-GB',
    // Speakable: zonas relevantes para text-to-speech (Google Assistant /
    // Discover). Apuntan a h1 + .lead/p de descripción. Content Warehouse:
    // mejora la elegibilidad para Discover y resultados de voz.
    speakable: {
      '@type':    'SpeakableSpecification',
      cssSelector: ['h1', '[data-speakable]', '.lead'],
    },
  }
  if (image)         schema.image = image
  if (description)   schema.description = description
  if (articleSection) schema.articleSection = articleSection

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {visible && (
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '.5rem',
          fontSize:   '.78rem',
          color:      'var(--muted, #5a3d12)',
          margin:     '.25rem 0 1.25rem',
          flexWrap:   'wrap',
        }}>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
            {locale === 'es' ? 'Por' : 'By'}
          </span>
          <Link
            href={BYLINE_HREF}
            style={{
              color:          'var(--ink, #2a1a08)',
              textDecoration: 'none',
              fontWeight:     600,
              borderBottom:   '1px solid var(--line, #e8dcc8)',
            }}
          >
            {BYLINE_LABEL}
          </Link>
          <span style={{ color: 'var(--line, #e8dcc8)' }}>·</span>
          <time
            dateTime={dateModified}
            style={{
              fontFamily:    'var(--font-mono, monospace)',
              fontSize:      '.7rem',
              letterSpacing: '.05em',
            }}
          >
            {relativeTime(dateModified, locale)}
          </time>
        </div>
      )}
    </>
  )
}
