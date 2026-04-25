'use client'
import { useState, useEffect, useCallback } from 'react'
import { Star } from '@phosphor-icons/react'
import type { VotosPlaya } from '@/lib/votos'

interface Props {
  slug:   string
  locale?: 'es' | 'en'
}

const KEY = (slug: string) => `voto:${slug}`

export default function VotacionPlaya({ slug, locale = 'es' }: Props) {
  const [data, setData] = useState<VotosPlaya | null>(null)
  const [miVoto, setMiVoto] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [sending, setSending] = useState(false)

  // Cargar estado inicial
  useEffect(() => {
    const yaVoto = localStorage.getItem(KEY(slug))
    if (yaVoto) setMiVoto(parseInt(yaVoto, 10))

    fetch(`/api/votos?slug=${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setData(d) })
      .catch(() => {})
  }, [slug])

  const votar = useCallback(async (estrellas: number) => {
    if (miVoto !== null || sending) return
    setSending(true)

    // Optimistic UI
    localStorage.setItem(KEY(slug), String(estrellas))
    setMiVoto(estrellas)
    setData(prev => {
      if (!prev) return prev
      const next = { ...prev }
      next.suma += estrellas
      next.votos += 1
      next[`d${estrellas}` as 'd1'|'d2'|'d3'|'d4'|'d5'] += 1
      next.media = parseFloat((next.suma / next.votos).toFixed(1))
      return next
    })

    try {
      const res = await fetch('/api/votos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, estrellas }),
      })
      if (res.ok) {
        const server = await res.json()
        setData(server)
      }
    } catch {}
    setSending(false)
  }, [slug, miVoto, sending])

  const es = locale === 'es'
  const estrellaActiva = hover ?? miVoto ?? 0

  return (
    <div style={{
      background: 'var(--card-bg, #faf6ef)',
      border: '1px solid var(--line, #e8dcc8)',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '.55rem .9rem',
        borderBottom: '1px solid var(--line, #e8dcc8)',
        fontFamily: 'var(--font-sans)',
        fontSize: '.68rem',
        fontWeight: 500,
        letterSpacing: '.14em',
        textTransform: 'uppercase',
        color: 'var(--muted, #8a7560)',
      }}>
        {miVoto !== null
          ? (es ? 'Tu valoración' : 'Your rating')
          : (es ? 'Valora esta playa' : 'Rate this beach')
        }
      </div>

      {/* Estrellas */}
      <div style={{ padding: '.9rem .7rem .7rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem' }}>
        <div
          role="radiogroup"
          aria-label={es ? 'Valoración de la playa, de 1 a 5 estrellas' : 'Rate the beach, 1 to 5 stars'}
          style={{ display: 'flex', gap: 4 }}
          onMouseLeave={() => setHover(null)}
        >
          {[1, 2, 3, 4, 5].map(n => {
            const llena = n <= estrellaActiva
            const interactivo = miVoto === null
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={miVoto === n ? 'true' : 'false'}
                onClick={() => votar(n)}
                onMouseEnter={() => interactivo && setHover(n)}
                disabled={!interactivo || sending}
                aria-label={`${n} ${n === 1 ? (es ? 'estrella' : 'star') : (es ? 'estrellas' : 'stars')}`}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: interactivo ? 'pointer' : 'default',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'transform .1s',
                  transform: hover === n ? 'scale(1.15)' : 'scale(1)',
                }}
              >
                <Star
                  size={28}
                  weight={llena ? 'fill' : 'regular'}
                  color={llena ? '#f5a623' : '#8a7560'}
                  aria-hidden="true"
                />
              </button>
            )
          })}
        </div>

        {/* Resumen */}
        {data && data.votos > 0 ? (
          <div style={{
            fontSize: '.75rem',
            color: 'var(--muted, #8a7560)',
            textAlign: 'center',
            lineHeight: 1.3,
            fontVariantNumeric: 'tabular-nums',
          }}>
            <span style={{
              color: 'var(--ink, #2a1a08)', fontWeight: 700,
              fontFamily: 'var(--font-serif)', fontSize: '.9rem',
            }}>{data.media.toFixed(1)}</span>
            <span style={{ color: '#f5a623' }}> ★</span>
            {' · '}
            <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: '.7rem' }}>
              {data.votos}
            </span>{' '}
            {data.votos === 1
              ? (es ? 'valoración' : 'rating')
              : (es ? 'valoraciones' : 'ratings')}
          </div>
        ) : (
          <div style={{ fontSize: '.7rem', color: 'var(--muted, #8a7560)', textAlign: 'center' }}>
            {es ? 'Sé el primero en valorarla' : 'Be the first to rate it'}
          </div>
        )}

        {miVoto !== null && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            style={{
              fontSize: '.65rem',
              color: '#3d6b1f',
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            {es ? '✓ Gracias por tu voto' : '✓ Thanks for your vote'}
          </div>
        )}
      </div>
    </div>
  )
}
