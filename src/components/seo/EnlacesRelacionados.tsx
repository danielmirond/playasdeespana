// src/components/seo/EnlacesRelacionados.tsx
// Renderiza enlaces relacionados a un topic, agrupados por tipo de
// relación (similar / complementary / service / practical / geographic).
// Usado al final de cada topic page para SEO + UX (más rutas que el
// footer + relevantes al contenido).

import Link from 'next/link'
import { RELACIONES, KIND_LABELS, type EnlaceConfig } from '@/lib/enlazado'

interface Props {
  /** Slug del topic actual (clave en RELACIONES). Ej: 'aguas-cristalinas' */
  topic:    string
  /** Cuántos enlaces mostrar máximo. Default 8. */
  limit?:   number
  /** Si true, muestra como cards con desc; si false, chips compactos. */
  variant?: 'cards' | 'chips'
}

export default function EnlacesRelacionados({ topic, limit = 8, variant = 'cards' }: Props) {
  const enlaces = (RELACIONES[topic] ?? []).slice(0, limit)
  if (enlaces.length === 0) return null

  // Agrupar por kind
  const grupos = new Map<EnlaceConfig['kind'], EnlaceConfig[]>()
  for (const e of enlaces) {
    const list = grupos.get(e.kind) ?? []
    list.push(e)
    grupos.set(e.kind, list)
  }

  if (variant === 'chips') {
    return (
      <section aria-labelledby={`enl-${topic}`} style={{ marginTop: '2.5rem' }}>
        <h2 id={`enl-${topic}`} style={{
          fontSize: '1.1rem',
          fontWeight: 800,
          color: 'var(--ink, #2a1a08)',
          marginBottom: '.85rem',
        }}>
          Continúa por aquí
        </h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          {enlaces.map(e => (
            <Link key={e.href} href={e.href} style={{
              padding: '.5rem 1rem',
              borderRadius: 99,
              background: 'var(--card-bg, #faf6ef)',
              border: '1px solid var(--line, #e8dcc8)',
              color: 'var(--ink, #2a1a08)',
              fontSize: '.85rem',
              textDecoration: 'none',
            }}>
              {e.label}
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby={`enl-${topic}`} style={{ marginTop: '3rem', marginBottom: '1rem' }}>
      <h2 id={`enl-${topic}`} style={{
        fontFamily: 'var(--font-serif)',
        fontSize: '1.45rem',
        fontWeight: 700,
        color: 'var(--ink, #2a1a08)',
        marginBottom: '1.25rem',
        letterSpacing: '-.01em',
      }}>
        Continúa por aquí
      </h2>

      {Array.from(grupos.entries()).map(([kind, items]) => (
        <div key={kind} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '.7rem',
            fontWeight: 600,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color: 'var(--muted, #5a3d12)',
            marginBottom: '.65rem',
          }}>
            {KIND_LABELS[kind]}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '.55rem',
          }}>
            {items.map(e => (
              <Link key={e.href} href={e.href} style={{
                display: 'block',
                padding: '.85rem 1rem',
                background: 'var(--card-bg, #faf6ef)',
                border: '1px solid var(--line, #e8dcc8)',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'var(--ink, #2a1a08)',
                transition: 'border-color .15s, transform .15s',
              }}>
                <div style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '.95rem',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  marginBottom: e.desc ? '.25rem' : 0,
                }}>
                  {e.label}
                </div>
                {e.desc && (
                  <div style={{
                    fontSize: '.74rem',
                    color: 'var(--muted, #5a3d12)',
                    lineHeight: 1.4,
                  }}>
                    {e.desc}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  )
}
