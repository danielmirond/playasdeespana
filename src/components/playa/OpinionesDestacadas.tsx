'use client'
// src/components/playa/OpinionesDestacadas.tsx
// Muestra 3 opiniones destacadas inline en la Fase 1 (decisión)
// para proporcionar prueba social antes de la decisión de baño

import { Star } from '@phosphor-icons/react'
import styles from './FichaBody.module.css'
import type { OpinionPublica } from '@/lib/opiniones'

interface Props {
  opiniones: OpinionPublica[]
  locale?: 'es' | 'en'
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={size}
          weight={n <= Math.round(value) ? 'fill' : 'regular'}
          color={n <= Math.round(value) ? '#f5a623' : '#e8dcc8'}
        />
      ))}
    </div>
  )
}

export default function OpinionesDestacadas({ opiniones, locale = 'es' }: Props) {
  if (!opiniones || opiniones.length === 0) return null

  const top3 = opiniones.slice(0, 3)
  const es = locale === 'es'

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>{es ? '💬 Opiniones de visitantes' : '💬 Visitor reviews'}</h2>
      </div>
      <div className={styles.cardBody}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {top3.map(op => (
            <div
              key={op.id}
              style={{
                padding: '0.85rem 1rem',
                background: 'var(--card-bg2, #f5ede0)',
                borderLeft: '3px solid var(--accent, #d48a1a)',
                borderRadius: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, fontSize: '.85rem', color: 'var(--ink)' }}>
                  {op.alias}
                </span>
                <Stars value={op.rating} size={13} />
              </div>
              {op.texto && (
                <p
                  style={{
                    fontSize: '.8rem',
                    color: 'var(--muted, #5a3d12)',
                    margin: 0,
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                  }}
                >
                  "{op.texto}"
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
