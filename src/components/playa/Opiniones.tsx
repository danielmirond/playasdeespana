'use client'
// src/components/playa/Opiniones.tsx
// Sección "Opiniones" — rating + texto opcional. Reemplaza
// VotacionPlaya en el camino editorial principal de la ficha.
//
// Carga client-side desde /api/opiniones. La página tiene su propio
// agregado server-side via getOpiniones() para SSR + JSON-LD.

import { useEffect, useRef, useState } from 'react'
import { Star } from '@phosphor-icons/react'
import styles from './Opiniones.module.css'
import type { OpinionesAgregadas, OpinionPublica } from '@/lib/opiniones'

interface Props {
  slug:    string
  nombre:  string
  initial?: OpinionesAgregadas | null
  locale?:  'es' | 'en'
}

export default function Opiniones({ slug, nombre, initial, locale = 'es' }: Props) {
  const es = locale === 'es'
  const [data, setData]       = useState<OpinionesAgregadas | null>(initial ?? null)
  const [page, setPage]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [allItems, setAllItems] = useState<OpinionPublica[]>(initial?.items ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [alias, setAlias] = useState('')
  const [rating, setRating] = useState<number>(0)
  const [hover, setHover]   = useState<number>(0)
  const [texto, setTexto]   = useState('')

  // Fetch initial si no viene server-side
  useEffect(() => {
    if (initial) return
    setLoading(true)
    fetch(`/api/opiniones?slug=${encodeURIComponent(slug)}&page=1&perPage=10`)
      .then(r => r.ok ? r.json() : null)
      .then((d: OpinionesAgregadas | null) => {
        if (d) { setData(d); setAllItems(d.items) }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug, initial])

  // Recordar alias localmente
  useEffect(() => {
    try {
      const saved = localStorage.getItem('opiniones:alias')
      if (saved) setAlias(saved)
    } catch {}
  }, [])

  async function loadMore() {
    if (loading || !data) return
    const next = page + 1
    setLoading(true)
    try {
      const r = await fetch(`/api/opiniones?slug=${encodeURIComponent(slug)}&page=${next}&perPage=10`)
      if (r.ok) {
        const d: OpinionesAgregadas = await r.json()
        setAllItems(prev => [...prev, ...d.items])
        setPage(next)
      }
    } finally { setLoading(false) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setError(null); setSuccess(false)

    if (rating < 1 || rating > 5) { setError(es ? 'Elige 1-5 estrellas' : 'Pick 1-5 stars'); return }
    if (alias.trim().length < 2)  { setError(es ? 'Nombre demasiado corto' : 'Name too short'); return }
    const txTrim = texto.trim()
    if (txTrim && (txTrim.length < 20 || txTrim.length > 500)) {
      setError(es ? 'El texto debe tener entre 20 y 500 caracteres' : 'Text must be 20-500 characters')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/opiniones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, rating, texto: txTrim || undefined, alias: alias.trim() }),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        const map: Record<string, string> = es ? {
          alias: 'Nombre no válido',
          rating: 'Estrellas no válidas',
          texto: 'Texto no válido (20-500 caracteres, sin enlaces)',
          rate_limit: 'Demasiadas opiniones hoy desde esta IP',
        } : {
          alias: 'Invalid name',
          rating: 'Invalid stars',
          texto: 'Invalid text (20-500 chars, no links)',
          rate_limit: 'Too many submissions from this IP today',
        }
        setError(map[j.error] ?? (es ? 'Error al enviar' : 'Submission error'))
      } else {
        const d: OpinionesAgregadas = await res.json()
        try { localStorage.setItem('opiniones:alias', alias.trim()) } catch {}
        setData(d)
        setAllItems(d.items)
        setPage(1)
        setRating(0); setTexto('')
        setSuccess(true)
      }
    } catch {
      setError(es ? 'Error de red' : 'Network error')
    } finally { setSubmitting(false) }
  }

  const hasMore = data ? allItems.length < data.total : false

  return (
    <div className={styles.card} id="s-opiniones">
      <div className={styles.head}>
        <h2 className={styles.title}>
          {es ? <>Opiniones de <em>{nombre}</em></> : <>Reviews of <em>{nombre}</em></>}
        </h2>
        {data && data.total > 0 && (
          <span className={styles.kicker}>
            {data.total} {data.total === 1 ? (es ? 'valoración' : 'review') : (es ? 'valoraciones' : 'reviews')}
          </span>
        )}
      </div>

      {/* Header: media + histograma */}
      {data && data.total > 0 && (
        <div className={styles.summary}>
          <div className={styles.bigRate}>
            <span className={styles.bigNum}>{data.media.toFixed(1)}</span>
            <Stars value={data.media} size={18} />
          </div>
          <div className={styles.histogram}>
            {([5,4,3,2,1] as const).map(n => {
              const count = (data as any)[`d${n}`] as number
              const pct = data.total > 0 ? (count / data.total) * 100 : 0
              return (
                <div key={n} className={styles.barRow}>
                  <span className={styles.barLabel}>{n}</span>
                  <span className={styles.barTrack}><span className={styles.barFill} style={{ width: `${pct}%` }} /></span>
                  <span className={styles.barCount}>{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={submit} className={styles.form} aria-label={es ? 'Dejar una opinión' : 'Leave a review'}>
        <div className={styles.formHead}>
          <span className={styles.formLab}>{es ? 'Tu valoración' : 'Your review'}</span>
          <span className={styles.starInput} role="radiogroup" aria-label={es ? 'Estrellas' : 'Stars'}>
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={rating === n}
                aria-label={es ? `${n} ${n===1?'estrella':'estrellas'}` : `${n} ${n===1?'star':'stars'}`}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className={styles.starBtn}
              >
                <Star
                  size={22}
                  weight={(hover ? n <= hover : n <= rating) ? 'fill' : 'regular'}
                  color={(hover ? n <= hover : n <= rating) ? '#d4a900' : 'var(--muted, #5a3d12)'}
                  aria-hidden="true"
                />
              </button>
            ))}
          </span>
        </div>

        <div className={styles.formRow}>
          <input
            type="text"
            value={alias}
            onChange={e => setAlias(e.target.value)}
            placeholder={es ? 'Tu nombre' : 'Your name'}
            maxLength={30}
            className={styles.input}
            aria-label={es ? 'Tu nombre' : 'Your name'}
          />
          <textarea
            value={texto}
            onChange={e => setTexto(e.target.value)}
            placeholder={es ? 'Cuenta cómo te fue (opcional, 20-500 caracteres)' : 'Tell us how it went (optional, 20-500 chars)'}
            maxLength={500}
            rows={2}
            className={styles.textarea}
            aria-label={es ? 'Texto de la reseña' : 'Review text'}
          />
        </div>

        <div className={styles.formFoot}>
          {error && <span className={styles.error} role="alert">{error}</span>}
          {success && <span className={styles.success} role="status">{es ? '¡Gracias por tu opinión!' : 'Thanks for your review!'}</span>}
          <button
            type="submit"
            disabled={submitting || rating < 1 || alias.trim().length < 2}
            className={styles.submit}
          >
            {submitting ? (es ? 'Enviando…' : 'Sending…') : (es ? 'Publicar' : 'Publish')}
          </button>
        </div>
      </form>

      {/* Lista */}
      {allItems.length > 0 ? (
        <ul className={styles.list}>
          {allItems.map(o => (
            <Review key={o.id} op={o} locale={locale} />
          ))}
        </ul>
      ) : (
        !loading && (
          <p className={styles.empty}>
            {es ? 'Sé la primera persona en valorar esta playa.' : 'Be the first to review this beach.'}
          </p>
        )
      )}

      {hasMore && (
        <div className={styles.more}>
          <button type="button" onClick={loadMore} disabled={loading} className={styles.moreBtn}>
            {loading
              ? (es ? 'Cargando…' : 'Loading…')
              : (es ? `Ver más (${data!.total - allItems.length})` : `See more (${data!.total - allItems.length})`)}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Subcomponents ───────────────────────────────────────────────────
function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 1, color: '#d4a900' }} aria-hidden="true">
      {[1,2,3,4,5].map(n => (
        <Star key={n} size={size} weight={n <= Math.round(value) ? 'fill' : 'regular'} />
      ))}
    </span>
  )
}

function Review({ op, locale }: { op: OpinionPublica; locale: 'es' | 'en' }) {
  const date = new Date(op.ts).toLocaleDateString(locale === 'en' ? 'en-GB' : 'es-ES', {
    month: 'short', year: 'numeric',
  })
  const initial = op.alias.charAt(0).toUpperCase()
  return (
    <li className={styles.review}>
      <span className={styles.avatar} aria-hidden="true">{initial}</span>
      <div className={styles.revBody}>
        <div className={styles.revMeta}>
          <span className={styles.revName}>{op.alias}</span>
          <span className={styles.revDate}>· {date}</span>
          <span className={styles.revStars}><Stars value={op.rating} size={12} /></span>
        </div>
        {op.texto && <p className={styles.revTexto}>{op.texto}</p>}
      </div>
    </li>
  )
}
