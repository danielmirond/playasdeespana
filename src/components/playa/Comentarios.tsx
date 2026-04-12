'use client'
// src/components/playa/Comentarios.tsx
// Lista + formulario de comentarios para una ficha de playa.
//
// Flujo anónimo:
//   1. Usuario abre la ficha. Si ya tiene perfil (localStorage) cargamos
//      nickname. Si no, muestra un input para elegir nickname al enviar.
//   2. Al enviar, generamos UUID si no existe, persistimos en localStorage
//      y enviamos el comentario al endpoint con el UUID como userId.
//   3. El servidor no valida la identidad — confía en el UUID, que es
//      suficiente para "mi cuenta en este dispositivo".
//
// Sin auth, sin email, sin contraseña.

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  leerPerfil, guardarPerfil, crearPerfil, actualizarNickname,
  avatarColor, avatarIniciales,
  type PerfilLocal,
} from '@/lib/perfilCliente'
import type { Comentario } from '@/lib/comentarios'

interface Props {
  playaSlug:   string
  playaNombre: string
  locale?:     'es' | 'en'
}

const MAX_LEN = 500
const MIN_LEN = 3

function tiempoRelativo(ts: number, locale: 'es' | 'en' = 'es'): string {
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  if (s < 60)    return locale === 'es' ? 'hace un momento' : 'just now'
  const m = Math.floor(s / 60)
  if (m < 60)    return locale === 'es' ? `hace ${m} min` : `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24)    return locale === 'es' ? `hace ${h} h` : `${h} h ago`
  const d = Math.floor(h / 24)
  if (d < 30)    return locale === 'es' ? `hace ${d} días` : `${d} days ago`
  const mo = Math.floor(d / 30)
  if (mo < 12)   return locale === 'es' ? `hace ${mo} meses` : `${mo} months ago`
  return new Date(ts).toLocaleDateString(locale === 'es' ? 'es' : 'en')
}

export default function Comentarios({ playaSlug, playaNombre, locale = 'es' }: Props) {
  const es = locale === 'es'
  const [perfil, setPerfil] = useState<PerfilLocal | null>(null)
  const [nickname, setNickname] = useState('')
  const [text, setText] = useState('')
  const [comentarios, setComentarios] = useState<Comentario[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar perfil + comentarios
  useEffect(() => {
    const p = leerPerfil()
    if (p) {
      setPerfil(p)
      setNickname(p.nickname)
    }
    fetch(`/api/comentarios?slug=${encodeURIComponent(playaSlug)}`)
      .then(r => (r.ok ? r.json() : { comentarios: [] }))
      .then(d => setComentarios(d.comentarios ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [playaSlug])

  const enviar = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanText = text.trim()
    const cleanNick = nickname.trim()
    if (cleanText.length < MIN_LEN) {
      setError(es ? `El comentario debe tener al menos ${MIN_LEN} caracteres.` : `Comment must be at least ${MIN_LEN} characters.`)
      return
    }
    if (cleanNick.length < 2) {
      setError(es ? 'Introduce un nickname válido.' : 'Please enter a valid nickname.')
      return
    }

    // Si no hay perfil, crearlo con el nickname del form.
    let p = perfil
    if (!p) {
      p = crearPerfil(cleanNick)
      setPerfil(p)
    } else if (p.nickname !== cleanNick) {
      const next = actualizarNickname(cleanNick)
      if (next) { setPerfil(next); p = next }
    }

    setSending(true)
    try {
      const res = await fetch('/api/comentarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug:        playaSlug,
          playaNombre,
          userId:      p.id,
          nickname:    p.nickname,
          avatarSeed:  p.avatarSeed,
          text:        cleanText,
          honeypot:    '', // el campo oculto del form
        }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.comentario) {
          setComentarios(prev => [data.comentario, ...prev])
          setText('')
        }
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? (es ? 'Error al publicar.' : 'Error posting.'))
      }
    } catch {
      setError(es ? 'Error de red. Inténtalo de nuevo.' : 'Network error. Try again.')
    } finally {
      setSending(false)
    }
  }, [text, nickname, perfil, playaSlug, playaNombre, es])

  const placeholder = es ? `¿Qué te pareció ${playaNombre}?` : `What did you think of ${playaNombre}?`

  return (
    <div style={{
      background: 'var(--card-bg,#faf6ef)',
      border: '1.5px solid var(--line,#e8dcc8)',
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: '.85rem',
    }}>
      <div style={{
        padding: '.85rem 1rem .5rem',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '.95rem', fontWeight: 700,
          color: 'var(--ink,#2a1a08)',
          margin: 0,
        }}>
          {es ? `Comentarios sobre ${playaNombre}` : `Comments about ${playaNombre}`}
        </h2>
        <div style={{ fontSize: '.72rem', color: 'var(--muted,#5a3d12)' }}>
          {loading
            ? (es ? 'Cargando…' : 'Loading…')
            : comentarios.length === 0
              ? (es ? 'Sé el primero en dejar tu opinión.' : 'Be the first to leave a comment.')
              : `${comentarios.length} ${comentarios.length === 1 ? (es ? 'comentario' : 'comment') : (es ? 'comentarios' : 'comments')}`}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={enviar} style={{ padding: '.6rem 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
        <label htmlFor="comentario-nick" style={{
          fontSize: '.72rem', fontWeight: 700, color: 'var(--muted,#5a3d12)',
          textTransform: 'uppercase', letterSpacing: '.06em',
        }}>
          {es ? 'Nickname' : 'Nickname'}
        </label>
        <input
          id="comentario-nick"
          type="text"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder={es ? 'Cómo quieres que te vean' : 'How you want to be seen'}
          maxLength={30}
          autoComplete="nickname"
          required
          aria-required="true"
          style={{
            border: '1.5px solid var(--line,#e8dcc8)',
            background: 'var(--metric-bg,#f5ede0)',
            borderRadius: 8, padding: '.55rem .75rem',
            fontSize: '.85rem', color: 'var(--ink,#2a1a08)',
            minHeight: 44,
            fontFamily: 'inherit',
          }}
        />

        <label htmlFor="comentario-text" style={{
          fontSize: '.72rem', fontWeight: 700, color: 'var(--muted,#5a3d12)',
          textTransform: 'uppercase', letterSpacing: '.06em',
        }}>
          {es ? 'Tu opinión' : 'Your comment'}
        </label>
        <textarea
          id="comentario-text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={placeholder}
          maxLength={MAX_LEN}
          required
          aria-required="true"
          aria-describedby="comentario-hint"
          style={{
            border: '1.5px solid var(--line,#e8dcc8)',
            background: 'var(--metric-bg,#f5ede0)',
            borderRadius: 8, padding: '.65rem .8rem',
            fontSize: '.88rem', color: 'var(--ink,#2a1a08)',
            fontFamily: 'inherit', lineHeight: 1.5,
            minHeight: 88, resize: 'vertical',
          }}
        />
        {/* Honeypot: campo oculto para bots. Un humano nunca lo rellena. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
          onChange={() => { /* honeypot — si se rellena, el POST llevará algo */ }}
        />
        <div id="comentario-hint" style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: '.7rem', color: 'var(--muted,#5a3d12)',
        }}>
          <span>
            {es
              ? 'Tu comentario es público. No pidas datos personales.'
              : 'Your comment is public. Do not request personal data.'}
          </span>
          <span>{text.length} / {MAX_LEN}</span>
        </div>

        {error && (
          <div role="alert" style={{
            background: 'rgba(239,68,68,.08)',
            border: '1.5px solid rgba(239,68,68,.4)',
            borderRadius: 8, padding: '.55rem .75rem',
            fontSize: '.78rem', color: '#b91c1c', fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={sending || text.trim().length < MIN_LEN || nickname.trim().length < 2}
          style={{
            alignSelf: 'flex-end',
            background: 'var(--accent,#6b400a)', color: '#fff',
            border: 'none', borderRadius: 10,
            padding: '.65rem 1.25rem', fontSize: '.85rem', fontWeight: 700,
            cursor: 'pointer', minHeight: 44,
            opacity: sending ? 0.6 : 1,
          }}
        >
          {sending ? (es ? 'Publicando…' : 'Posting…') : (es ? 'Publicar' : 'Post')}
        </button>
      </form>

      {/* Lista */}
      <div style={{ borderTop: '1px solid var(--line,#e8dcc8)' }}>
        {loading ? (
          <div role="status" aria-live="polite" style={{
            padding: '1.25rem', textAlign: 'center',
            fontSize: '.82rem', color: 'var(--muted,#5a3d12)',
          }}>
            {es ? 'Cargando comentarios…' : 'Loading comments…'}
          </div>
        ) : comentarios.length === 0 ? (
          <div style={{
            padding: '1.25rem', textAlign: 'center',
            fontSize: '.82rem', color: 'var(--muted,#5a3d12)',
          }}>
            {es ? 'Aún no hay comentarios.' : 'No comments yet.'}
          </div>
        ) : (
          <ul role="list" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {comentarios.map(c => (
              <li key={c.id} style={{
                display: 'flex', gap: '.75rem', alignItems: 'flex-start',
                padding: '.85rem 1rem',
                borderBottom: '1px solid var(--line,#e8dcc8)',
              }}>
                <Link
                  href={`/u/${c.userId}`}
                  aria-label={es ? `Perfil de ${c.nickname}` : `Profile of ${c.nickname}`}
                  style={{
                    flexShrink: 0, width: 38, height: 38, borderRadius: '50%',
                    background: avatarColor(c.avatarSeed),
                    color: '#fff', fontWeight: 800, fontSize: '.82rem',
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none',
                  }}
                >
                  {avatarIniciales(c.nickname)}
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <Link href={`/u/${c.userId}`} style={{
                      fontWeight: 700, fontSize: '.86rem', color: 'var(--ink,#2a1a08)',
                      textDecoration: 'none',
                    }}>
                      {c.nickname}
                    </Link>
                    <time dateTime={new Date(c.ts).toISOString()} style={{
                      fontSize: '.7rem', color: 'var(--muted,#5a3d12)',
                    }}>
                      {tiempoRelativo(c.ts, locale)}
                    </time>
                  </div>
                  <p style={{
                    margin: '.2rem 0 0',
                    fontSize: '.85rem', lineHeight: 1.5,
                    color: 'var(--ink,#2a1a08)',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {c.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
