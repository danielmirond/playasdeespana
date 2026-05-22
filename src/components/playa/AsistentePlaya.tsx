// src/components/playa/AsistentePlaya.tsx
//
// Componente server-side que renderiza el asistente "qué necesitas
// hoy para esta playa". Recibe las necesidades ya generadas por
// `getNecesidades()` (en page.tsx) para no hacer await aquí.
//
// Diseño:
//   - Lista limpia, 5 cards apiladas mobile, 2 columnas desktop.
//   - Cada card: icono + título + porQue + botón "Buscar".
//   - Botón link a amazon.es/dp/{ASIN} si tenemos ASIN, sino a
//     amazon.es/s?k={amazonQuery} (search).
//   - rel="sponsored noopener" en TODOS los enlaces (compliance Google
//     directrices afiliación 2019+).
//
// Cuando Amazon Creators API esté activa (PR #82), enriqueceremos
// con imagen + precio actual + rating. Mientras tanto, links limpios.

import type { Necesidad } from '@/lib/asistentePlaya'

interface Props {
  necesidades: Necesidad[]
  nombre:      string
  locale?:     'es' | 'en'
}

const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? 'nuus-21'

function urlAmazon(n: Necesidad): string {
  if (n.asin) {
    return `https://www.amazon.es/dp/${n.asin}?tag=${AMAZON_TAG}`
  }
  return `https://www.amazon.es/s?k=${encodeURIComponent(n.amazonQuery)}&tag=${AMAZON_TAG}`
}

const COLOR_PRIORIDAD: Record<Necesidad['prioridad'], string> = {
  critica: '#7a2818',
  alta:    '#c48a1e',
  media:   '#4a7a90',
  baja:    '#5a3d12',
}

const LABEL_PRIORIDAD: Record<Necesidad['prioridad'], { es: string; en: string }> = {
  critica: { es: 'Imprescindible',   en: 'Essential' },
  alta:    { es: 'Muy recomendado',  en: 'Highly recommended' },
  media:   { es: 'Recomendado',      en: 'Recommended' },
  baja:    { es: 'Si te apetece',    en: 'If you fancy' },
}

export default function AsistentePlaya({ necesidades, nombre, locale = 'es' }: Props) {
  if (necesidades.length === 0) return null
  const es = locale === 'es'

  return (
    <section
      aria-labelledby="asistente-titulo"
      style={{
        margin: '2rem 0',
        padding: '1.25rem 1.25rem 1.5rem',
        background: 'linear-gradient(135deg, #faf6ef 0%, #f0e6d0 100%)',
        border: '1px solid var(--line, #e8dcc8)',
        borderRadius: 10,
      }}
    >
      <div style={{
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '.7rem',
        fontWeight: 600,
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        color: 'var(--muted, #5a3d12)',
        marginBottom: '.4rem',
      }}>
        {es ? 'Asistente · condiciones de hoy' : 'Assistant · today\'s conditions'}
      </div>

      <h2
        id="asistente-titulo"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.3rem',
          fontWeight: 700,
          color: 'var(--ink, #2a1a08)',
          margin: '0 0 1.1rem',
          lineHeight: 1.2,
        }}
      >
        {es
          ? <>Qué necesitas para ir a <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{nombre}</em> hoy</>
          : <>What you need for <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{nombre}</em> today</>
        }
      </h2>

      <ol style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '.75rem',
      }}>
        {necesidades.map((n, idx) => (
          <li key={n.id} style={{
            background: '#fff',
            border: '1px solid var(--line, #e8dcc8)',
            borderLeft: `3px solid ${COLOR_PRIORIDAD[n.prioridad]}`,
            borderRadius: 6,
            padding: '.8rem .9rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '.5rem' }}>
              <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: '.4rem' }}>
                {n.icono && <span style={{ fontSize: '1.1rem' }} aria-hidden="true">{n.icono}</span>}
                <span style={{ fontWeight: 700, fontSize: '.95rem', color: 'var(--ink, #2a1a08)' }}>
                  {n.titulo}
                </span>
              </div>
              <span style={{
                fontSize: '.62rem',
                fontWeight: 700,
                padding: '.15rem .45rem',
                background: `${COLOR_PRIORIDAD[n.prioridad]}11`,
                color: COLOR_PRIORIDAD[n.prioridad],
                border: `1px solid ${COLOR_PRIORIDAD[n.prioridad]}33`,
                borderRadius: 100,
                letterSpacing: '.04em',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                {es ? LABEL_PRIORIDAD[n.prioridad].es : LABEL_PRIORIDAD[n.prioridad].en}
              </span>
            </div>

            <p style={{
              margin: 0,
              fontSize: '.82rem',
              color: 'var(--muted, #5a3d12)',
              lineHeight: 1.5,
            }}>
              {n.porQue}
            </p>

            <a
              href={urlAmazon(n)}
              target="_blank"
              rel="sponsored noopener noreferrer"
              data-asistente-id={n.id}
              data-asistente-pos={idx + 1}
              style={{
                marginTop: '.15rem',
                fontSize: '.78rem',
                fontWeight: 600,
                color: 'var(--accent)',
                textDecoration: 'none',
                alignSelf: 'flex-start',
              }}
            >
              {es ? 'Buscar en Amazon →' : 'Find on Amazon →'}
            </a>
          </li>
        ))}
      </ol>

      <p style={{
        margin: '1rem 0 0',
        fontSize: '.7rem',
        color: 'var(--muted, #5a3d12)',
        fontStyle: 'italic',
        lineHeight: 1.4,
      }}>
        {es
          ? 'Recomendaciones generadas a partir de las condiciones reales de hoy (oleaje, viento, bandera, medusas) y de las características de la playa. Algunos enlaces son afiliados — sin coste extra para ti.'
          : 'Recommendations generated from today\'s real conditions and beach characteristics. Some links are affiliate — no extra cost to you.'}
      </p>
    </section>
  )
}
